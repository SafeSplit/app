<?php

namespace App\Services;

use App\Models\LedgerEvent;
use Illuminate\Support\Facades\Http;
use kornrunner\Keccak;
use RuntimeException;

/**
 * Anchors event hashes on the local Hardhat chain via the HashStore contract.
 *
 * Uses JSON-RPC eth_sendTransaction with an unlocked Hardhat dev account
 * (the node signs), so no private key handling is needed in PHP.
 *
 * NOTE: this is the temporary DIRECT anchor (Phase 1). In Phase 2 the Go node
 * takes over this responsibility.
 */
class AnchorService
{
    private string $rpcUrl;
    private string $from;

    public function __construct()
    {
        $this->rpcUrl = config('safesplit.rpc_url');
        $this->from = config('safesplit.anchor_from');
    }

    /** Deployed HashStore address from the shared deployment file (D7), or null. */
    public function contractAddress(): ?string
    {
        $path = config('safesplit.deployment_path');
        if (! is_file($path)) {
            return null;
        }
        $data = json_decode((string) file_get_contents($path), true);

        return $data['address'] ?? null;
    }

    /** Anchor an event's hash on-chain. Returns the transaction hash. Throws on failure. */
    public function anchor(LedgerEvent $event): string
    {
        $contract = $this->contractAddress();
        if (! $contract) {
            throw new RuntimeException('Contract address not found — is the blockchain deployed?');
        }

        $eventId = '0x' . Keccak::hash($event->event_id, 256); // bytes32 from the uuid
        $hash = '0x' . $event->event_hash;                     // bytes32 digest
        $data = '0x' . $this->selector('record(bytes32,bytes32)') . substr($eventId, 2) . substr($hash, 2);

        $txHash = $this->rpc('eth_sendTransaction', [[
            'from' => $this->from,
            'to' => $contract,
            'data' => $data,
        ]]);

        $this->waitForReceipt($txHash);

        return $txHash;
    }

    /** Read the anchored hash for an event uuid (for verification). Returns 0x-prefixed hex. */
    public function anchoredHash(string $uuid): ?string
    {
        $contract = $this->contractAddress();
        if (! $contract) {
            return null;
        }

        $eventId = '0x' . Keccak::hash($uuid, 256);
        $data = '0x' . $this->selector('get(bytes32)') . substr($eventId, 2);

        return $this->rpc('eth_call', [['to' => $contract, 'data' => $data], 'latest']);
    }

    private function selector(string $signature): string
    {
        return substr(Keccak::hash($signature, 256), 0, 8);
    }

    private function waitForReceipt(string $txHash): void
    {
        for ($i = 0; $i < 10; $i++) {
            $receipt = $this->rpc('eth_getTransactionReceipt', [$txHash]);
            if ($receipt !== null) {
                if (($receipt['status'] ?? null) === '0x1') {
                    return;
                }
                throw new RuntimeException('Anchoring transaction reverted.');
            }
            usleep(300_000);
        }
        throw new RuntimeException('Timed out waiting for the anchoring receipt.');
    }

    private function rpc(string $method, array $params): mixed
    {
        $response = Http::timeout(5)->post($this->rpcUrl, [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => $method,
            'params' => $params,
        ]);

        $json = $response->json();
        if (isset($json['error'])) {
            throw new RuntimeException('RPC error: ' . ($json['error']['message'] ?? 'unknown'));
        }

        return $json['result'] ?? null;
    }
}
