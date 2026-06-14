<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEvent extends Model
{
    /** Append-only: only a creation timestamp, never updated_at. */
    public const UPDATED_AT = null;

    protected $fillable = [
        'event_id',
        'event_type',
        'aggregate_type',
        'aggregate_id',
        'group_id',
        'user_id',
        'payload',
        'canonical',
        'event_hash',
        'signature',
        'signer_address',
        'anchor_status',
        'anchor_tx_hash',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }
}
