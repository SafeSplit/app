<?php

namespace App\Services;

use App\Models\LedgerEvent;
use App\Support\Canonical;
use Illuminate\Support\Str;

class LedgerService
{
    /**
     * Append one immutable event to the journal.
     *
     * @param  string  $type  Event type (e.g. EXPENSE_CREATED)
     * @param  array   $data  Event-specific fields (amounts already formatted as "0.00")
     * @param  array   $meta  Persistence metadata: aggregate_type, aggregate_id, group_id, user_id
     */
    public function record(string $type, array $data, array $meta = []): LedgerEvent
    {
        // The hashed event includes its own id and timestamp (part of the signed payload).
        $event = array_merge(
            [
                'event_id' => (string) Str::uuid(),
                'event_type' => $type,
            ],
            $data,
            [
                'timestamp' => now()->utc()->format('Y-m-d\TH:i:s\Z'),
            ],
        );

        $canonical = Canonical::serialize($event);
        $hash = hash('sha256', $canonical);

        return LedgerEvent::create([
            'event_id' => $event['event_id'],
            'event_type' => $type,
            'aggregate_type' => $meta['aggregate_type'] ?? null,
            'aggregate_id' => $meta['aggregate_id'] ?? null,
            'group_id' => $meta['group_id'] ?? null,
            'user_id' => $meta['user_id'] ?? null,
            'payload' => $event,
            'canonical' => $canonical,
            'event_hash' => $hash,
        ]);
    }
}
