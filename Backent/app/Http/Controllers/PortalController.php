<?php

namespace App\Http\Controllers;

use App\Models\PortalItem;
use App\Models\PortalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;


class PortalController extends Controller
{
    private const IMAGE_MIMES = 'jpeg,png,jpg,webp,gif';
    private const VIDEO_MIMETYPES = 'video/mp4,video/webm,video/quicktime';

    // ------------------------------------------------------------------ Vista

    public function index()
    {
        $isAdmin = Auth::check() && Auth::user()->isAdmin();

        $query = PortalItem::orderBy('sort_order')->orderBy('id');
        if (!$isAdmin) {
            $query->where('is_active', true);
        }
        $all = $query->get()->groupBy('section');

        $items = [];
        foreach (PortalItem::SECTIONS as $section) {
            $items[$section] = ($all[$section] ?? collect())->values();
        }

        // Diseño libre de la portada (posiciones de texto, fotos y fondo), guardado como JSON
        $settings = PortalSetting::allWithDefaults();
        $settings['layout'] = PortalSetting::read('layout') ?? '';

        return Inertia::render('Portal/Index', [
            'settings' => $settings,
            'items' => $items,
            'canEdit' => $isAdmin,
        ]);
    }

    // ------------------------------------------------------- Textos generales

    public function updateSettings(Request $request)
    {
        $textKeys = PortalSetting::textKeys();

        $rules = [
            'hero_media_file' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,' . self::VIDEO_MIMETYPES, 'max:51200'],
            'hero_media_url' => ['nullable', 'url', 'max:500'],
            'remove_hero_media' => ['nullable', 'boolean'],
            'layout' => ['nullable', 'string', 'max:5000'],
        ];
        foreach ($textKeys as $key) {
            $rules[$key] = ['nullable', 'string', 'max:600'];
        }
        $data = $request->validate($rules);

        foreach ($textKeys as $key) {
            if ($request->has($key)) {
                PortalSetting::put($key, $data[$key] ?? '');
            }
        }

        // Posiciones de la portada: solo se acepta un JSON válido
        if ($request->has('layout')) {
            $layout = (string) ($data['layout'] ?? '');
            if ($layout === '' || is_array(json_decode($layout, true))) {
                PortalSetting::put('layout', $layout);
            }
        }

        $current = PortalSetting::read('hero_media');

        if ($request->hasFile('hero_media_file')) {
            $file = $request->file('hero_media_file');
            $this->deleteLocal($current);
            PortalSetting::put('hero_media', $file->store('portal', 'public'));
            PortalSetting::put('hero_media_type', str_starts_with((string) $file->getMimeType(), 'video/') ? 'video' : 'image');
        } elseif ($request->filled('hero_media_url')) {
            $url = $request->input('hero_media_url');
            if ($url !== $current) {
                $this->deleteLocal($current);
                PortalSetting::put('hero_media', $url);
                PortalSetting::put('hero_media_type', preg_match('/\.(mp4|webm|mov)(\?.*)?$/i', $url) ? 'video' : 'image');
            }
        } elseif ($request->boolean('remove_hero_media')) {
            $this->deleteLocal($current);
            PortalSetting::put('hero_media', '');
            PortalSetting::put('hero_media_type', '');
        }

        return back()->with('success', 'Portada actualizada.');
    }

    // ------------------------------------------------------ Orden de secciones

    public function reorderSections(Request $request)
    {
        $data = $request->validate([
            'order' => ['required', 'array', 'max:30'],
            'order.*' => ['string', Rule::in(PortalSetting::SECTION_KEYS)],
        ]);

        $order = array_values(array_unique($data['order']));
        foreach (PortalSetting::SECTION_KEYS as $key) {
            if (!in_array($key, $order, true)) {
                $order[] = $key;
            }
        }
        PortalSetting::put('section_order', implode(',', $order));

        return back();
    }

    // --------------------------------------------------------------- Elementos

    public function storeItem(Request $request)
    {
        $section = $request->validate([
            'section' => ['required', Rule::in(PortalItem::SECTIONS)],
        ])['section'];

        $request->validate($this->itemRules($section));
        $this->assertMedia($request, $section, null);

        $item = new PortalItem([
            'section' => $section,
            'title' => $request->input('title'),
            'text' => $request->input('text'),
            'icon' => $request->input('icon'),
            'sort_order' => (int) PortalItem::where('section', $section)->max('sort_order') + 1,
            'is_active' => true,
        ]);
        $this->applyMedia($item, $request);
        $item->save();

        return back()->with('success', 'Elemento agregado.');
    }

    public function updateItem(Request $request, PortalItem $item)
    {
        $request->validate($this->itemRules($item->section));
        $this->assertMedia($request, $item->section, $item);

        $item->title = $request->input('title');
        $item->text = $request->input('text');
        $item->icon = $request->input('icon');
        $this->applyMedia($item, $request);
        $item->save();

        return back()->with('success', 'Elemento actualizado.');
    }

    public function toggleItem(PortalItem $item)
    {
        $item->update(['is_active' => !$item->is_active]);

        return back()->with('success', $item->is_active ? 'Elemento visible.' : 'Elemento oculto para los visitantes.');
    }

    public function moveItem(Request $request, PortalItem $item)
    {
        $direction = $request->validate([
            'direction' => ['required', Rule::in(['up', 'down'])],
        ])['direction'];

        $siblings = PortalItem::where('section', $item->section)
            ->orderBy('sort_order')->orderBy('id')->get()->values()->all();

        $i = null;
        foreach ($siblings as $idx => $s) {
            if ($s->id === $item->id) {
                $i = $idx;
                break;
            }
        }
        if ($i === null) {
            return back();
        }

        $j = $direction === 'up' ? $i - 1 : $i + 1;
        if ($j < 0 || $j >= count($siblings)) {
            return back();
        }

        [$siblings[$i], $siblings[$j]] = [$siblings[$j], $siblings[$i]];
        foreach ($siblings as $n => $s) {
            if ($s->sort_order !== $n) {
                $s->update(['sort_order' => $n]);
            }
        }

        return back();
    }

    public function destroyItem(PortalItem $item)
    {
        $this->deleteLocal($item->image);
        $this->deleteLocal($item->video);
        $item->delete();

        return back()->with('success', 'Elemento eliminado.');
    }

    // ----------------------------------------------------------------- Helpers

    private function itemRules(string $section): array
    {
        $titleRequired = $section !== 'galeria';

        return [
            'title' => [$titleRequired ? 'required' : 'nullable', 'string', 'max:150'],
            'text' => ['nullable', 'string', 'max:3000'],
            'icon' => ['nullable', Rule::in(PortalItem::ICONS)],
            'image_file' => ['nullable', 'file', 'mimes:' . self::IMAGE_MIMES, 'max:8192'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'remove_image' => ['nullable', 'boolean'],
            'video_file' => ['nullable', 'file', 'mimetypes:' . self::VIDEO_MIMETYPES, 'max:51200'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'remove_video' => ['nullable', 'boolean'],
        ];
    }

    /** Fotos y videos no pueden quedar vacíos en sus secciones. */
    private function assertMedia(Request $request, string $section, ?PortalItem $item): void
    {
        if ($section === 'galeria') {
            $has = $request->hasFile('image_file') || $request->filled('image_url')
                || ($item && $item->image && !$request->boolean('remove_image'));
            if (!$has) {
                throw ValidationException::withMessages(['image_file' => 'Subí una foto o pegá un enlace de imagen.']);
            }
        }

        if ($section === 'videos') {
            $has = $request->hasFile('video_file') || $request->filled('video_url')
                || ($item && $item->video && !$request->boolean('remove_video'));
            if (!$has) {
                throw ValidationException::withMessages(['video_file' => 'Subí un video o pegá un enlace (YouTube o archivo mp4).']);
            }
        }
    }

    private function applyMedia(PortalItem $item, Request $request): void
    {
        $this->applyField($item, 'image', $request, 'image_file', 'image_url', 'remove_image');
        $this->applyField($item, 'video', $request, 'video_file', 'video_url', 'remove_video');
    }

    private function applyField(PortalItem $item, string $field, Request $request, string $fileKey, string $urlKey, string $removeKey): void
    {
        $old = $item->{$field};

        if ($request->hasFile($fileKey)) {
            $this->deleteLocal($old);
            $item->{$field} = $request->file($fileKey)->store('portal', 'public');
        } elseif ($request->filled($urlKey)) {
            $url = $request->input($urlKey);
            if ($url !== $old) {
                $this->deleteLocal($old);
                $item->{$field} = $url;
            }
        } elseif ($request->boolean($removeKey)) {
            $this->deleteLocal($old);
            $item->{$field} = null;
        }
    }

    /** Borra el archivo solo si es local (las URL externas no se tocan). */
    private function deleteLocal(?string $path): void
    {
        if ($path && !preg_match('#^https?://#i', $path)) {
            Storage::disk('public')->delete($path);
        }
    }
}