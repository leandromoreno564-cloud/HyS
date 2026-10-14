<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Textos y medios editables de la portada pública (clave/valor).
 * Si una clave no existe en la base, se usa el valor por defecto de DEFAULTS.
 */
class PortalSetting extends Model
{
    protected $fillable = ['key', 'value'];

    /** Secciones movibles de la portada, en su orden original. */
    public const SECTION_KEYS = [
        'acerca', 'recursos', 'pasos', 'riesgos', 'normativa',
        'galeria', 'practicas', 'emergencia', 'videos', 'faq',
    ];

    public const DEFAULTS = [
        'brand_name' => 'HIGIENE Y SEGURIDAD',
        'section_order' => '',

        'hero_kicker' => 'Prevención · Protección · Concientización',
        'hero_title' => 'Seguridad que',
        'hero_highlight' => 'empieza con vos.',
        'hero_text' => "Información, recursos y buenas prácticas para construir ambientes de trabajo más seguros, saludables y responsables.\n\nPrevenir los riesgos, cuidar a las personas y cumplir con la normativa es una tarea de todos los días, y empieza por cada uno de nosotros.",
        'hero_cta' => 'Descubrí nuestros recursos',
        'hero_media' => '',
        'hero_media_type' => '',

        'acerca_eyebrow' => 'Quiénes somos',
        'acerca_title' => 'Cuidar a las personas es el primer objetivo',
        'acerca_text' => 'La Higiene y Seguridad en el trabajo es una disciplina que combina conocimiento técnico, normativa y compromiso cotidiano para que cada persona vuelva sana y salva a su casa.',

        'recursos_eyebrow' => 'Información esencial',
        'recursos_title' => 'La prevención es parte del trabajo',
        'recursos_text' => 'Conocé los principales aspectos de Higiene y Seguridad y mantenete informado sobre las buenas prácticas laborales.',

        'pasos_eyebrow' => 'Compromiso',
        'pasos_title' => 'Trabajar seguros es responsabilidad de todos',
        'pasos_text' => '',

        'riesgos_eyebrow' => 'Conocé los riesgos',
        'riesgos_title' => 'Los principales riesgos en el trabajo',
        'riesgos_text' => 'Reconocer a qué peligros estamos expuestos es el primer paso para prevenirlos. Estos son los grupos de riesgos más frecuentes en cualquier ambiente laboral.',

        'normativa_eyebrow' => 'Marco legal',
        'normativa_title' => 'Normativa que respalda la prevención',
        'normativa_text' => 'Estas son algunas de las principales normas argentinas en la materia. Consultá siempre la versión vigente y sus modificaciones.',

        'galeria_eyebrow' => 'Galería',
        'galeria_title' => 'Seguridad en acción',
        'galeria_text' => 'Imágenes que muestran cómo se vive una cultura preventiva en el día a día.',

        'practicas_eyebrow' => 'Buenas prácticas',
        'practicas_title' => 'Hábitos que salvan vidas',
        'practicas_text' => 'Pequeñas acciones diarias que marcan una gran diferencia en la seguridad de todo el equipo.',

        'emergencia_eyebrow' => 'Saber qué hacer',
        'emergencia_title' => 'Cómo actuar ante una emergencia',
        'emergencia_text' => 'En una situación crítica, actuar con orden salva vidas. Estos pasos sirven de guía general; cada establecimiento debe tener su propio plan de emergencia y evacuación.',

        'videos_eyebrow' => 'Videos',
        'videos_title' => 'Aprendé mirando',
        'videos_text' => 'Material audiovisual para reforzar las buenas prácticas.',

        'faq_eyebrow' => 'Preguntas frecuentes',
        'faq_title' => 'Resolvé tus dudas',
        'faq_text' => 'Respuestas rápidas a las consultas más comunes sobre prevención y sobre el uso de la plataforma.',

        'cta_title' => 'Sumate a una cultura de prevención',
        'cta_text' => 'Ingresá a la plataforma para gestionar inspecciones, relevamientos y el calendario de actividades de tu equipo, todo en un solo lugar.',

        'footer_left' => '© 2026 Higiene y Seguridad',
        'footer_right' => 'Prevención · Protección · Bienestar',
    ];

    /** Claves de texto editables desde el formulario (excluye el medio del hero). */
    public static function textKeys(): array
    {
        return array_keys(array_diff_key(self::DEFAULTS, ['hero_media' => 1, 'hero_media_type' => 1, 'section_order' => 1]));
    }

    public static function allWithDefaults(): array
    {
        return array_merge(self::DEFAULTS, static::pluck('value', 'key')->all());
    }

    public static function read(string $key): ?string
    {
        return static::where('key', $key)->value('value') ?? (self::DEFAULTS[$key] ?? null);
    }

    public static function put(string $key, ?string $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => (string) $value]);
    }
}
