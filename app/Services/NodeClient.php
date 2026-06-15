<?php

namespace App\Services;

use App\Models\LedgerEvent;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Client for the SafeSplit Go node. From BLOC 2.1 the node — not Laravel —
 * is responsible for anchoring. Laravel sends the signed event; the node
 * verifies the hash + signature (BLOC 2.2) and anchors it on Hardhat.
 */
class NodeClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('safesplit.node_url'), '/');
    }

    /** Submit a signed event to the node. Returns the anchoring tx hash. Throws on rejection. */
    public function anchor(LedgerEvent $event): string
    {
        $response = Http::timeout(25)->acceptJson()->post($this->baseUrl . '/events', [
            'event_id' => $event->event_id,
            'event_hash' => $event->event_hash,
            'canonical' => $event->canonical,
            'signature' => $event->signature,
            'public_key' => $event->signer_address,
        ]);

        $json = $response->json() ?? [];

        if (! $response->successful() || empty($json['anchored'])) {
            throw new RuntimeException('Node rejected the event: ' . ($json['error'] ?? $response->body()));
        }

        return $json['tx_hash'] ?? '';
    }
}
