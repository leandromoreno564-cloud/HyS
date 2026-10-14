<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;
use Illuminate\Http\UploadedFile;
use RuntimeException;

/**
 * Extrae el texto de un archivo subido: PDF, Word (.docx), OpenDocument (.odt) o texto plano.
 *
 * En Word/ODT se conserva la estructura: los títulos salen como "## Título", las viñetas como
 * "• ...", las casillas de verificación como "☐ ..." y cada celda de una tabla en su propia línea.
 */
class DocumentText
{
    private const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    private const TEXT = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0';

    /** Textos de ayuda que Word deja en los campos sin completar */
    private const PLACEHOLDERS = '/\b(?:Elija un elemento|Haga clic(?: o pulse)? aqu[ií] para escribir(?: una fecha| texto)?)\.?/ui';

    public static function fromUpload(UploadedFile $file): string
    {
        $ext = strtolower((string) $file->getClientOriginalExtension());
        $path = $file->getRealPath();

        switch ($ext) {
            case 'docx':
                return self::docx($path);
            case 'odt':
                return self::odt($path);
            case 'txt':
                return self::plain($path);
            case 'doc':
                throw new RuntimeException('El formato .doc (Word antiguo) no se puede leer. Guardalo como .docx o PDF y volvé a subirlo.');
            default:
                return self::pdf($path);
        }
    }

    public static function isPdf(UploadedFile $file): bool
    {
        return !in_array(strtolower((string) $file->getClientOriginalExtension()), ['docx', 'odt', 'txt', 'doc'], true);
    }

    // ------------------------------------------------------------------ PDF / TXT

    private static function pdf(string $path): string
    {
        $parser = new \Smalot\PdfParser\Parser();

        return $parser->parseFile($path)->getText();
    }

    private static function plain(string $path): string
    {
        $raw = (string) file_get_contents($path);
        $enc = mb_detect_encoding($raw, ['UTF-8', 'Windows-1252', 'ISO-8859-1'], true) ?: 'UTF-8';

        return $enc === 'UTF-8' ? $raw : mb_convert_encoding($raw, 'UTF-8', $enc);
    }

    // ----------------------------------------------------------------------- ZIP

    private static function zipXml(string $path, string $entry): DOMDocument
    {
        if (!class_exists(\ZipArchive::class)) {
            throw new RuntimeException('El servidor no tiene habilitada la extensión zip de PHP, necesaria para leer archivos Word.');
        }

        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            throw new RuntimeException('El archivo está dañado o no es un documento válido.');
        }
        $xml = $zip->getFromName($entry);
        $zip->close();

        if ($xml === false) {
            throw new RuntimeException('No se encontró el contenido del documento.');
        }

        $dom = new DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $ok = $dom->loadXML($xml, LIBXML_NONET | LIBXML_COMPACT | LIBXML_PARSEHUGE);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        if (!$ok) {
            throw new RuntimeException('No se pudo interpretar el contenido del documento.');
        }

        return $dom;
    }

    // ---------------------------------------------------------------------- DOCX

    private static function docx(string $path): string
    {
        $dom = self::zipXml($path, 'word/document.xml');
        $xp = new DOMXPath($dom);
        $xp->registerNamespace('w', self::W);

        $lines = [];
        $body = $xp->query('/w:document/w:body')->item(0);
        if ($body) {
            self::walk($body, $xp, $lines, false);
        }

        return implode("\n", $lines);
    }

    private static function walk(DOMNode $parent, DOMXPath $xp, array &$lines, bool $inTable): void
    {
        foreach ($parent->childNodes as $node) {
            if (!$node instanceof DOMElement || $node->namespaceURI !== self::W) {
                continue;
            }

            switch ($node->localName) {
                case 'p':
                    $line = self::paragraph($node, $xp, $inTable);
                    if ($line !== '') {
                        $lines[] = $line;
                    }
                    break;

                case 'tbl':
                    // Cada celda con contenido sale en su propia línea (en orden de lectura)
                    foreach ($xp->query('w:tr/w:tc', $node) as $cell) {
                        self::walk($cell, $xp, $lines, true);
                    }
                    break;

                case 'sdt':
                    foreach ($xp->query('w:sdtContent', $node) as $content) {
                        self::walk($content, $xp, $lines, $inTable);
                    }
                    break;
            }
        }
    }

    private static function paragraph(DOMElement $p, DOMXPath $xp, bool $inTable): string
    {
        $text = '';
        $hasText = false;
        $allBold = true;

        foreach ($xp->query('.//w:t | .//w:tab | .//w:br | .//w:cr | .//w:checkBox', $p) as $n) {
            switch ($n->localName) {
                case 't':
                    $t = $n->textContent;
                    if ($t === '') {
                        break;
                    }
                    $text .= $t;
                    if (trim($t) !== '') {
                        $hasText = true;
                        if (!self::isBold($n, $xp)) {
                            $allBold = false;
                        }
                    }
                    break;
                case 'checkBox':
                    $text .= '☐ ';
                    break;
                default: // tab, br, cr
                    $text .= ' ';
            }
        }

        $text = preg_replace(self::PLACEHOLDERS, '', $text);
        $text = trim(preg_replace('/[ \t\x{00A0}]+/u', ' ', $text));
        if ($text === '' || !preg_match('/[\p{L}\p{N}]/u', $text)) {
            return '';
        }

        $style = (string) $xp->evaluate('string(w:pPr/w:pStyle/@w:val)', $p);
        $isList = $xp->evaluate('count(w:pPr/w:numPr/w:numId[@w:val != "0"])', $p) > 0;

        if (!$inTable) {
            $short = mb_strlen($text) <= 90 && !preg_match('/[:?¿]/u', $text);
            $isHeading = ($short && preg_match('/^(T.{0,2}tulo|Heading|Title|Subt)/ui', $style))
                || ($short && $hasText && $allBold && !$isList && mb_strlen($text) <= 70);
            if ($isHeading) {
                return '## ' . $text;
            }
        }

        return ($isList ? '• ' : '') . $text;
    }

    private static function isBold(DOMNode $t, DOMXPath $xp): bool
    {
        $run = $t->parentNode;
        if (!$run) {
            return false;
        }
        $b = $xp->query('w:rPr/w:b', $run)->item(0);
        if (!$b instanceof DOMElement) {
            return false;
        }
        $val = strtolower($b->getAttributeNS(self::W, 'val'));

        return !in_array($val, ['0', 'false', 'off'], true);
    }

    // ----------------------------------------------------------------------- ODT

    private static function odt(string $path): string
    {
        $dom = self::zipXml($path, 'content.xml');
        $xp = new DOMXPath($dom);
        $xp->registerNamespace('text', self::TEXT);

        $lines = [];
        foreach ($xp->query('//text:h | //text:p') as $n) {
            $t = trim(preg_replace('/\s+/u', ' ', preg_replace(self::PLACEHOLDERS, '', $n->textContent)));
            if ($t === '' || !preg_match('/[\p{L}\p{N}]/u', $t)) {
                continue;
            }
            if ($n->localName === 'h') {
                $lines[] = '## ' . $t;
            } else {
                $isList = $xp->query('ancestor::text:list-item', $n)->length > 0;
                $lines[] = ($isList ? '• ' : '') . $t;
            }
        }

        return implode("\n", $lines);
    }
}
