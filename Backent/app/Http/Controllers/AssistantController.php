<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\AssistantMessage;
use App\Models\Company;
use App\Models\CorrectiveMeasure;
use App\Models\Inspection;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Asistente general del sistema (botón flotante en todas las pantallas).
 *
 * La inteligencia vive en n8n: Laravel arma el contexto del usuario (solo lo que ese usuario puede
 * ver), se lo manda al webhook y devuelve la respuesta. Qué hace este controlador:
 *
 *  - Historial persistente por usuario (tabla assistant_messages).
 *  - Contexto de la pantalla: si el usuario está dentro de una empresa, n8n recibe su detalle.
 *  - Streaming: si n8n responde en modo streaming se reenvía en vivo; si responde un JSON normal,
 *    se entrega completo y el navegador lo muestra con efecto de escritura.
 *  - Acciones con confirmación: n8n PROPONE (crear medida correctiva / recordatorio); Laravel valida y
 *    guarda la propuesta, y recién se ejecuta cuando el usuario toca "Confirmar".
 *
 * Variables de entorno: N8N_ASSISTANT_WEBHOOK_URL (o, si falta, N8N_CHECKLIST_CHAT_WEBHOOK_URL),
 * N8N_CHECKLIST_CHAT_SECRET.
 *
 * Respuesta esperada de n8n (JSON, modo no-streaming):
 *   {
 *     "reply": "texto",
 *     "links":   [ { "label": "Ver empresa", "url": "/companies/3" } ],
 *     "actions": [ { "type": "create_corrective_measure", "company_id": 3, "description": "...",
 *                    "priority": "Alta", "deadline": "2026-11-01", "responsible_person": "...",
 *                    "recommendations": "..." },
 *                  { "type": "create_reminder", "title": "...", "message": "...",
 *                    "remind_at": "2026-10-12 09:00", "company_id": 3 },
 *                  { "type": "update_measure_status", "measure_id": 12, "status": "Completada" } ]
 *   }
 * Modo streaming de n8n (líneas JSON begin / item / end): se reenvía el texto en vivo, pero en ese
 * modo no hay links ni acciones (solo texto).
 */
class AssistantController extends Controller
{
    private const PRIORITIES = ['Baja', 'Media', 'Alta', 'Crítica'];

    /** El servidor está en UTC; las fechas y horas que dicen las personas son de Argentina. */
    private const TZ = 'America/Argentina/Buenos_Aires';

    // ------------------------------------------------------------------ Historial

    public function history(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $scope = $this->resolveScope((string) $request->query('scope', 'general'), $user);

        $limit = min(max((int) $request->query('limit', 30), 1), 100);
        $before = (int) $request->query('before', 0);

        // Se pide uno de más para saber si quedan mensajes anteriores
        $rows = AssistantMessage::where('user_id', $user->id)
            ->where('scope', $scope)
            ->when($before > 0, fn ($q) => $q->where('id', '<', $before))
            ->orderByDesc('id')
            ->limit($limit + 1)
            ->get();

        $hasMore = $rows->count() > $limit;

        $messages = $rows->take($limit)
            ->reverse()
            ->values()
            ->map(fn (AssistantMessage $m) => $this->present($m));

        return response()->json(['messages' => $messages, 'has_more' => $hasMore]);
    }

    public function clearHistory(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $scope = $this->resolveScope((string) $request->query('scope', 'general'), $user);

        AssistantMessage::where('user_id', $user->id)->where('scope', $scope)->delete();

        return response()->json(['ok' => true]);
    }

    // ------------------------------------------------------------------ Chat

    public function chat(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['sometimes', 'array', 'max:20'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:2000'],
            'stream' => ['sometimes', 'boolean'],
            'page' => ['sometimes', 'array'],
            'page.component' => ['nullable', 'string', 'max:100'],
            'page.url' => ['nullable', 'string', 'max:255'],
            'page.company_id' => ['nullable', 'integer'],
        ]);

        $context = $this->buildContext($user);
        $currentCompanyId = $data['page']['company_id'] ?? null;

        $webhookUrl = config('services.n8n.assistant_chat_webhook_url')
            ?: config('services.n8n.checklist_chat_webhook_url');

        if (!$webhookUrl) {
            return response()->json([
                'reply' => 'El asistente todavía no está configurado. Falta definir N8N_ASSISTANT_WEBHOOK_URL en el servidor.',
            ], 503);
        }

        $payload = [
            'mode' => 'general',
            'user' => ['id' => $user->id, 'name' => $user->name, 'role' => $user->role],
            'today' => Carbon::now(self::TZ)->toDateString(),
            'message' => $data['message'],
            'history' => $this->serverHistory($user) ?: ($data['history'] ?? []),
            'page' => [
                'component' => $data['page']['component'] ?? null,
                'url' => $data['page']['url'] ?? null,
            ],
            'current_company' => $currentCompanyId ? $this->buildCurrentCompany($user, (int) $currentCompanyId) : null,
            'context' => $context['summary'],
            'available_links' => $context['links'],
            // Acciones que n8n puede PROPONER (el usuario las confirma en pantalla)
            'allowed_actions' => [
                [
                    'type' => 'create_corrective_measure',
                    'params' => ['company_id', 'description', 'priority(Baja|Media|Alta|Crítica)', 'deadline(YYYY-MM-DD)', 'responsible_person', 'recommendations'],
                ],
                [
                    'type' => 'create_reminder',
                    'params' => ['title', 'message', 'remind_at(YYYY-MM-DD HH:MM, hora de Argentina)', 'company_id(opcional)'],
                ],
                [
                    'type' => 'update_measure_status',
                    'params' => ['measure_id', 'status(En Progreso|Completada|Cancelada)'],
                ],
            ],
        ];

        $headers = [];
        if ($secret = config('services.n8n.checklist_chat_secret')) {
            $headers['X-Webhook-Secret'] = $secret;
        }

        if ($request->boolean('stream')) {
            return $this->streamChat($user, $data['message'], $webhookUrl, $headers, $payload, $context['company_ids']);
        }

        try {
            $response = Http::withHeaders($headers)->timeout(30)->post($webhookUrl, $payload);

            if (!$response->successful()) {
                Log::warning('n8n assistant webhook failed', ['status' => $response->status(), 'body' => $response->body()]);
                $reply = $this->describeFailure($response->status());
                $this->recordFailure($user, $data['message'], $reply);

                return response()->json(['reply' => $reply], 502);
            }

            $result = $response->json();
        } catch (\Throwable $e) {
            Log::error('n8n assistant webhook error', ['message' => $e->getMessage()]);
            $reply = 'No se pudo contactar al asistente. Revisá que n8n esté corriendo.';
            $this->recordFailure($user, $data['message'], $reply);

            return response()->json(['reply' => $reply], 502);
        }

        [$reply, $links, $actions] = $this->parseResult(is_array($result) ? $result : [], $context['company_ids'], $user);

        return response()->json($this->finalize($user, $data['message'], $reply, $links, $actions));
    }

    /**
     * Respuesta en NDJSON (una línea JSON por evento):
     *   {"t":"delta","text":"..."}                                  texto que llega en vivo
     *   {"t":"done","reply","links","actions","message_id"}         fin, con todo ya guardado
     *   {"t":"error","reply":"..."}
     */
    private function streamChat(User $user, string $userText, string $webhookUrl, array $headers, array $payload, array $companyIds)
    {
        return response()->stream(function () use ($user, $userText, $webhookUrl, $headers, $payload, $companyIds) {
            @set_time_limit(120);

            $emit = function (array $event) {
                echo json_encode($event, JSON_UNESCAPED_UNICODE) . "\n";
                if (ob_get_level() > 0) {
                    @ob_flush();
                }
                flush();
            };

            try {
                $response = Http::withHeaders($headers)
                    ->timeout(90)
                    ->withOptions(['stream' => true])
                    ->post($webhookUrl, $payload);

                if (!$response->successful()) {
                    Log::warning('n8n assistant stream failed', [
                        'status' => $response->status(),
                        'body' => mb_substr((string) $response->body(), 0, 500),
                    ]);
                    $failReply = $this->describeFailure($response->status());
                    $this->recordFailure($user, $userText, $failReply);
                    $emit(['t' => 'error', 'reply' => $failReply]);

                    return;
                }

                $body = $response->toPsrResponse()->getBody();
                $buffer = '';
                $raw = '';
                $streamedReply = '';
                $isN8nStream = false;

                while (!$body->eof()) {
                    $chunk = $body->read(1024);
                    if ($chunk === '') {
                        usleep(10000);
                        continue;
                    }

                    $raw .= $chunk;
                    $buffer .= $chunk;

                    while (($pos = strpos($buffer, "\n")) !== false) {
                        $line = trim(substr($buffer, 0, $pos));
                        $buffer = substr($buffer, $pos + 1);
                        if ($line === '') {
                            continue;
                        }

                        $event = json_decode($line, true);
                        if (is_array($event) && in_array($event['type'] ?? null, ['begin', 'item', 'end', 'error'], true)) {
                            $isN8nStream = true;
                            if (($event['type'] ?? null) === 'item' && is_string($event['content'] ?? null)) {
                                $streamedReply .= $event['content'];
                                $emit(['t' => 'delta', 'text' => $event['content']]);
                            }
                        }
                    }
                }

                if ($isN8nStream) {
                    $reply = trim($streamedReply) !== '' ? $streamedReply : 'Listo.';
                    $links = [];
                    $actions = [];
                } else {
                    // Respuesta JSON normal (no streaming): se interpreta completa
                    $result = json_decode($raw, true);
                    [$reply, $links, $actions] = $this->parseResult(is_array($result) ? $result : [], $companyIds, $user);
                }

                $emit(['t' => 'done'] + $this->finalize($user, $userText, $reply, $links, $actions));
            } catch (\Throwable $e) {
                Log::error('n8n assistant stream error', ['message' => $e->getMessage()]);
                $failReply = 'No se pudo contactar al asistente. Revisá que n8n esté corriendo.';
                $this->recordFailure($user, $userText, $failReply);
                $emit(['t' => 'error', 'reply' => $failReply]);
            }
        }, 200, [
            'Content-Type' => 'application/x-ndjson; charset=utf-8',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /** Últimos 20 mensajes válidos de la conversación general (los errores no se mandan como contexto). */
    private function serverHistory(User $user): array
    {
        return AssistantMessage::where('user_id', $user->id)
            ->where('scope', 'general')
            ->orderByDesc('id')
            ->limit(30)
            ->get()
            ->reverse()
            ->filter(fn (AssistantMessage $m) => empty(($m->meta ?? [])['error']))
            ->take(-20)
            ->map(fn (AssistantMessage $m) => ['role' => $m->role, 'content' => mb_substr($m->content, 0, 2000)])
            ->values()
            ->all();
    }

    /** Guarda el pedido y el motivo del fallo, para que la conversación quede completa al recargar. */
    private function recordFailure(User $user, string $userText, string $reply): void
    {
        try {
            AssistantMessage::record($user->id, 'general', 'user', $userText);
            AssistantMessage::record($user->id, 'general', 'assistant', $reply, ['error' => true]);
        } catch (\Throwable $e) {
            Log::warning('No se pudo guardar el intento fallido del asistente', ['message' => $e->getMessage()]);
        }
    }

    /** Mensaje claro según lo que respondió n8n, para que se sepa qué revisar. */
    private function describeFailure(int $status): string
    {
        return match (true) {
            $status === 404 => 'n8n respondió 404: el workflow del asistente no está publicado o la dirección del .env no coincide con la del nodo Webhook. Revisá que esté publicado y que use la Production URL.',
            in_array($status, [401, 403], true) => 'n8n rechazó el pedido (error ' . $status . '). Revisá la clave o el secreto configurados en el webhook.',
            $status === 429 => 'El modelo de IA alcanzó su límite de uso. Esperá un minuto y probá de nuevo.',
            $status >= 500 => 'n8n recibió el pedido pero falló al procesarlo (error ' . $status . '). Mirá la pestaña Executions del workflow para ver el nodo con error.',
            default => 'El asistente no pudo responder en este momento. Probá de nuevo en unos segundos.',
        };
    }

    // ------------------------------------------------------------------ Acciones con confirmación

    public function decideAction(Request $request, AssistantMessage $message, int $index, string $decision)
    {
        /** @var User $user */
        $user = Auth::user();
        abort_unless($message->user_id === $user->id, 403);

        $meta = $message->meta ?? [];
        $action = $meta['actions'][$index] ?? null;
        abort_unless(is_array($action), 404);

        if (($action['status'] ?? 'pending') !== 'pending') {
            return response()->json([
                'message' => 'Esta acción ya fue resuelta.',
                'status' => $action['status'],
            ], 409);
        }

        if ($decision === 'cancel') {
            $action['status'] = 'cancelled';
            $result = ['status' => 'cancelled', 'message' => 'Acción descartada.'];
        } else {
            try {
                [$text, $link] = $this->execute($user, $action);
            } catch (\DomainException $e) {
                return response()->json(['message' => $e->getMessage()], 422);
            }

            $action['status'] = 'done';
            $action['result'] = $text;
            $result = ['status' => 'done', 'message' => $text, 'link' => $link];
        }

        $meta['actions'][$index] = $action;
        $message->meta = $meta;
        $message->save();

        return response()->json($result);
    }

    /**
     * Ejecuta una acción ya validada y guardada. Se vuelve a verificar el acceso del usuario a la
     * empresa: nunca se confía en que la propuesta siga siendo válida.
     *
     * @return array{0:string,1:?string} [texto de resultado, enlace]
     */
    private function execute(User $user, array $action): array
    {
        $p = $action['params'] ?? [];

        if (($action['type'] ?? null) === 'create_corrective_measure') {
            $company = Company::accessibleBy($user)->find($p['company_id'] ?? 0);
            if (!$company) {
                throw new \DomainException('No tenés acceso a esa empresa.');
            }

            $inspection = Inspection::where('company_id', $company->id)
                ->orderByDesc('inspection_date')
                ->orderByDesc('id')
                ->first();

            if (!$inspection) {
                throw new \DomainException("«{$company->business_name}» todavía no tiene inspecciones. Registrá una inspección antes de crear medidas correctivas.");
            }

            CorrectiveMeasure::create([
                'inspection_id' => $inspection->id,
                'description' => $p['description'],
                'priority' => $p['priority'] ?? 'Media',
                'recommendations' => $p['recommendations'] ?? null,
                'deadline' => $p['deadline'] ?? null,
                'responsible_person' => $p['responsible_person'] ?? null,
                'status' => 'Pendiente',
            ]);

            return ["Medida correctiva creada para {$company->business_name}.", '/corrective-measures'];
        }

        if (($action['type'] ?? null) === 'create_reminder') {
            $link = null;
            if (!empty($p['company_id'])) {
                $company = Company::accessibleBy($user)->find($p['company_id']);
                $link = $company ? "/companies/{$company->id}" : null;
            }

            $remindAt = !empty($p['remind_at']) ? Carbon::parse($p['remind_at']) : null;

            AppNotification::create([
                'user_id' => $user->id,
                'title' => $p['title'],
                'message' => $p['message'] ?? $p['title'],
                'type' => 'info',
                'link' => $link,
                'is_read' => false,
                'remind_at' => $remindAt,
            ]);

            return [
                $remindAt
                    ? 'Recordatorio programado para el ' . $remindAt->copy()->setTimezone(self::TZ)->format('d/m/Y H:i') . '. Lo vas a ver en Notificaciones.'
                    : 'Recordatorio creado. Lo ves en Notificaciones.',
                '/notifications',
            ];
        }

        if (($action['type'] ?? null) === 'update_measure_status') {
            $measure = $this->accessibleMeasures($user)->find($p['measure_id'] ?? 0);
            if (!$measure) {
                throw new \DomainException('No encontré esa medida correctiva o no tenés acceso.');
            }

            $measure->status = $p['status'];
            if ($p['status'] === 'Completada') {
                $measure->verification_date = Carbon::today();
            }
            $measure->save();

            return ["Medida #{$measure->id} marcada como {$p['status']}.", '/corrective-measures'];
        }

        throw new \DomainException('Tipo de acción no soportado.');
    }

    // ------------------------------------------------------------------ Helpers

    private function resolveScope(string $scope, User $user): string
    {
        if ($scope === 'general') {
            return $scope;
        }

        if (preg_match('/^checklist:(\d+)$/', $scope, $m)
            && Company::accessibleBy($user)->whereKey((int) $m[1])->exists()) {
            return $scope;
        }

        abort(422, 'Ámbito de conversación inválido.');
    }

    private function present(AssistantMessage $m): array
    {
        $meta = $m->meta ?? [];

        return [
            'id' => $m->id,
            'role' => $m->role,
            'content' => $m->content,
            'links' => $meta['links'] ?? [],
            'actions' => $this->publicActions($meta['actions'] ?? []),
            'updated_count' => $meta['updated_count'] ?? 0,
            'is_error' => (bool) ($meta['error'] ?? false),
        ];
    }

    private function publicActions(array $actions): array
    {
        return array_map(fn ($a) => [
            'label' => $a['label'] ?? '',
            'status' => $a['status'] ?? 'pending',
            'result' => $a['result'] ?? null,
        ], array_values($actions));
    }

    /** Guarda el intercambio en el historial y devuelve lo que ve el navegador. */
    private function finalize(User $user, string $userText, string $reply, array $links, array $actions): array
    {
        AssistantMessage::record($user->id, 'general', 'user', $userText);
        $saved = AssistantMessage::record($user->id, 'general', 'assistant', $reply, [
            'links' => $links,
            'actions' => $actions,
        ]);

        return [
            'reply' => $reply,
            'links' => $links,
            'actions' => $this->publicActions($actions),
            'message_id' => $saved->id,
        ];
    }

    /** @return array{0:string,1:array,2:array} */
    private function parseResult(array $result, array $companyIds, User $user): array
    {
        $reply = is_string($result['reply'] ?? null) && trim($result['reply']) !== '' ? $result['reply'] : 'Listo.';

        return [
            $reply,
            $this->sanitizeLinks($result['links'] ?? [], $companyIds),
            $this->sanitizeActions($result['actions'] ?? [], $companyIds, $user),
        ];
    }

    /**
     * Valida las propuestas de n8n. El texto que ve el usuario (label) lo arma el servidor a partir de
     * los parámetros validados, no se toma de lo que mande n8n.
     */
    private function sanitizeActions(mixed $actions, array $companyIds, User $user): array
    {
        if (!is_array($actions)) {
            return [];
        }

        $names = Company::whereIn('id', $companyIds)->pluck('business_name', 'id');
        $clean = [];

        foreach (array_slice($actions, 0, 3) as $a) {
            if (!is_array($a)) {
                continue;
            }

            $type = $a['type'] ?? null;

            if ($type === 'create_corrective_measure') {
                $companyId = $a['company_id'] ?? null;
                $description = is_string($a['description'] ?? null) ? trim($a['description']) : '';

                if (!is_numeric($companyId) || !in_array((int) $companyId, $companyIds, true) || mb_strlen($description) < 5) {
                    continue;
                }

                $priority = in_array($a['priority'] ?? null, self::PRIORITIES, true) ? $a['priority'] : 'Media';
                $deadline = $this->parseDate($a['deadline'] ?? null);
                $responsible = is_string($a['responsible_person'] ?? null) ? mb_substr(trim($a['responsible_person']), 0, 255) : null;
                $recommendations = is_string($a['recommendations'] ?? null) ? mb_substr(trim($a['recommendations']), 0, 1000) : null;

                $clean[] = [
                    'type' => $type,
                    'label' => sprintf(
                        'Crear medida correctiva (%s) en %s: %s%s',
                        $priority,
                        $names[(int) $companyId] ?? 'la empresa',
                        mb_strimwidth($description, 0, 140, '…'),
                        $deadline ? ' · plazo ' . Carbon::parse($deadline)->format('d/m/Y') : ''
                    ),
                    'params' => [
                        'company_id' => (int) $companyId,
                        'description' => mb_substr($description, 0, 1000),
                        'priority' => $priority,
                        'deadline' => $deadline,
                        'responsible_person' => $responsible ?: null,
                        'recommendations' => $recommendations ?: null,
                    ],
                    'status' => 'pending',
                    'result' => null,
                ];
            } elseif ($type === 'update_measure_status') {
                $status = $a['status'] ?? null;
                if (!is_numeric($a['measure_id'] ?? null) || !in_array($status, ['En Progreso', 'Completada', 'Cancelada'], true)) {
                    continue;
                }

                $measure = $this->accessibleMeasures($user)->find((int) $a['measure_id']);
                if (!$measure) {
                    continue;
                }

                $clean[] = [
                    'type' => $type,
                    'label' => sprintf(
                        'Marcar la medida #%d («%s») como %s',
                        $measure->id,
                        mb_strimwidth((string) $measure->description, 0, 90, '…'),
                        $status
                    ),
                    'params' => ['measure_id' => $measure->id, 'status' => $status],
                    'status' => 'pending',
                    'result' => null,
                ];
            } elseif ($type === 'create_reminder') {
                $title = is_string($a['title'] ?? null) ? mb_substr(trim($a['title']), 0, 120) : '';
                if ($title === '') {
                    continue;
                }

                $message = is_string($a['message'] ?? null) ? mb_substr(trim($a['message']), 0, 500) : $title;

                $remindAt = null;
                if (!empty($a['remind_at']) && is_string($a['remind_at'])) {
                    try {
                        $parsed = Carbon::parse($a['remind_at'], self::TZ);
                        $remindAt = $parsed->isFuture() ? $parsed : null;
                    } catch (\Throwable $e) {
                        $remindAt = null;
                    }
                }

                $companyId = isset($a['company_id']) && is_numeric($a['company_id']) && in_array((int) $a['company_id'], $companyIds, true)
                    ? (int) $a['company_id']
                    : null;

                $clean[] = [
                    'type' => $type,
                    'label' => sprintf(
                        'Crear recordatorio «%s»%s',
                        $title,
                        $remindAt ? ' para el ' . $remindAt->format('d/m/Y H:i') : ' (de inmediato)'
                    ),
                    'params' => [
                        'title' => $title,
                        'message' => $message,
                        // Se guarda en la zona horaria del servidor (UTC) para que la notificación aparezca a la hora correcta
                        'remind_at' => $remindAt?->copy()->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s'),
                        'company_id' => $companyId,
                    ],
                    'status' => 'pending',
                    'result' => null,
                ];
            }
        }

        return $clean;
    }

    private function parseDate(mixed $value): ?string
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** Solo rutas internas conocidas; una empresa solo se enlaza si el usuario tiene acceso. */
    private function sanitizeLinks(mixed $links, array $companyIds): array
    {
        if (!is_array($links)) {
            return [];
        }

        $static = ['/dashboard', '/companies', '/companies/create', '/corrective-measures', '/notifications', '/profile'];
        $clean = [];

        foreach (array_slice($links, 0, 4) as $link) {
            if (!is_array($link) || !is_string($link['url'] ?? null) || !is_string($link['label'] ?? null)) {
                continue;
            }

            $url = trim($link['url']);
            $label = mb_substr(trim($link['label']), 0, 60);
            if ($label === '') {
                continue;
            }

            $allowed = in_array($url, $static, true);

            if (!$allowed && preg_match('#^/companies/(\d+)(/checklist|/edit)?$#', $url, $m)) {
                $allowed = in_array((int) $m[1], $companyIds, true);
            }

            if ($allowed) {
                $clean[$url] = ['label' => $label, 'url' => $url];
            }
        }

        return array_values($clean);
    }

    /** Medidas correctivas que el usuario puede ver (mismo criterio que la pantalla de Medidas). */
    private function accessibleMeasures(User $user)
    {
        return CorrectiveMeasure::query()->when(!$user->isAdmin(), function ($q) use ($user) {
            $q->whereHas('inspection', fn ($iq) => $iq->whereIn(
                'company_id',
                Company::accessibleBy($user)->select('companies.id')
            ));
        });
    }

    // ------------------------------------------------------------------ Contexto para n8n

    /** Resumen acotado a lo que el usuario puede ver (admin: todo; inspector: sus empresas). */
    private function buildContext(User $user): array
    {
        $companies = Company::accessibleBy($user)
            ->active()
            ->withCount([
                'inspections',
                'checklistItems',
                'checklistItems as checklist_answered_count' => fn ($q) => $q->whereNotNull('status'),
            ])
            ->orderBy('business_name')
            ->limit(50)
            ->get();

        $companyIds = Company::accessibleBy($user)->pluck('id')->all();

        $measuresQuery = CorrectiveMeasure::whereIn('status', ['Pendiente', 'En Progreso'])
            ->when(!$user->isAdmin(), fn ($q) => $q->whereHas(
                'inspection',
                fn ($iq) => $iq->whereIn('company_id', $companyIds)
            ));

        return [
            'company_ids' => $companyIds,
            'summary' => [
                'companies_total' => count($companyIds),
                'corrective_measures' => [
                    'pending_or_in_progress' => (clone $measuresQuery)->count(),
                    'overdue' => (clone $measuresQuery)->whereNotNull('deadline')->where('deadline', '<', Carbon::today())->count(),
                    'critical' => (clone $measuresQuery)->where('priority', 'Crítica')->count(),
                ],
                // Medidas abiertas más urgentes (con id, para que n8n pueda proponer cambiarles el estado)
                'open_measures' => (clone $measuresQuery)
                    ->with('inspection.company:id,business_name')
                    ->orderByRaw('deadline IS NULL')
                    ->orderBy('deadline')
                    ->limit(15)
                    ->get()
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'company' => optional(optional($m->inspection)->company)->business_name,
                        'description' => mb_strimwidth((string) $m->description, 0, 140, '…'),
                        'priority' => $m->priority,
                        'deadline' => optional($m->deadline)->toDateString(),
                        'status' => $m->status,
                    ])->values(),
                'companies' => $companies->map(fn (Company $c) => [
                    'id' => $c->id,
                    'business_name' => $c->business_name,
                    'industry_sector' => $c->industry_sector,
                    'address' => $c->address,
                    'has_gps_location' => $c->latitude !== null,
                    'inspections' => $c->inspections_count,
                    'checklist_items' => $c->checklist_items_count,
                    'checklist_answered' => $c->checklist_answered_count,
                    'url' => "/companies/{$c->id}",
                    'checklist_url' => "/companies/{$c->id}/checklist",
                ])->values(),
            ],
            'links' => [
                ['label' => 'Panel de control', 'url' => '/dashboard'],
                ['label' => 'Empresas', 'url' => '/companies'],
                ['label' => 'Registrar empresa', 'url' => '/companies/create'],
                ['label' => 'Medidas correctivas', 'url' => '/corrective-measures'],
                ['label' => 'Notificaciones', 'url' => '/notifications'],
            ],
        ];
    }

    /** Detalle de la empresa que el usuario tiene abierta en pantalla (null si no tiene acceso). */
    private function buildCurrentCompany(User $user, int $companyId): ?array
    {
        $company = Company::accessibleBy($user)->find($companyId);
        if (!$company) {
            return null;
        }

        $items = $company->checklistItems()->get(['item_number', 'question', 'status', 'description']);

        $inspections = Inspection::where('company_id', $company->id)
            ->orderByDesc('inspection_date')
            ->limit(5)
            ->get(['id', 'inspection_date', 'type', 'status', 'progress_percentage']);

        $measures = CorrectiveMeasure::whereHas('inspection', fn ($q) => $q->where('company_id', $company->id))
            ->whereIn('status', ['Pendiente', 'En Progreso'])
            ->orderBy('deadline')
            ->limit(10)
            ->get(['id', 'description', 'priority', 'deadline', 'status']);

        return [
            'id' => $company->id,
            'business_name' => $company->business_name,
            'tax_id' => $company->tax_id,
            'industry_sector' => $company->industry_sector,
            'address' => $company->address,
            'employee_count' => $company->employee_count,
            'contact_person' => $company->contact_person,
            'gps' => $company->latitude !== null
                ? ['latitude' => $company->latitude, 'longitude' => $company->longitude, 'accuracy_m' => $company->location_accuracy]
                : null,
            'checklist' => [
                'total' => $items->count(),
                'SI' => $items->where('status', 'SI')->count(),
                'NO' => $items->where('status', 'NO')->count(),
                'NO_APLICA' => $items->where('status', 'NO_APLICA')->count(),
                'sin_responder' => $items->whereNull('status')->count(),
                'items_con_NO' => $items->where('status', 'NO')->take(15)->map(fn ($it) => [
                    'item_number' => $it->item_number,
                    'question' => mb_strimwidth((string) $it->question, 0, 160, '…'),
                    'description' => mb_strimwidth((string) $it->description, 0, 200, '…'),
                ])->values(),
            ],
            'recent_inspections' => $inspections->map(fn ($i) => [
                'id' => $i->id,
                'date' => optional($i->inspection_date)->toDateString(),
                'type' => $i->type,
                'status' => $i->status,
                'progress' => $i->progress_percentage,
            ])->values(),
            'open_corrective_measures' => $measures->map(fn ($m) => [
                'id' => $m->id,
                'description' => mb_strimwidth((string) $m->description, 0, 160, '…'),
                'priority' => $m->priority,
                'deadline' => optional($m->deadline)->toDateString(),
                'status' => $m->status,
            ])->values(),
        ];
    }
}
