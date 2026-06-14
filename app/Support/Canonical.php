<?php

namespace App\Support;

/**
 * Canonical event serialization + hashing.
 *
 * The rules below are the cross-language contract (PHP now, Go + JS later):
 *   1. Object keys are sorted alphabetically (recursively).
 *   2. List (array) element order is preserved — producers must order lists deterministically.
 *   3. Compact JSON, no extra whitespace, slashes and unicode left unescaped.
 *   4. Decimal amounts are strings with exactly 2 decimals (e.g. "80.00").
 *   5. event_hash = SHA256(canonical bytes), lowercase hex.
 *
 * Any change here is a breaking protocol change and must be versioned.
 */
class Canonical
{
    public static function serialize(array $event): string
    {
        return json_encode(
            self::deepKsort($event),
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
        );
    }

    public static function hash(array $event): string
    {
        return hash('sha256', self::serialize($event));
    }

    /** Format a monetary value as a 2-decimal string ("80.00"). */
    public static function amount(int|float|string $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }

    private static function deepKsort(array $value): array
    {
        // Lists: keep order, recurse into elements.
        if (array_is_list($value)) {
            return array_map(
                fn ($v) => is_array($v) ? self::deepKsort($v) : $v,
                $value,
            );
        }

        // Objects: sort keys, recurse.
        ksort($value);
        foreach ($value as $k => $v) {
            if (is_array($v)) {
                $value[$k] = self::deepKsort($v);
            }
        }

        return $value;
    }
}
