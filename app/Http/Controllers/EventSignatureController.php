<?php

namespace App\Http\Controllers;

use App\Models\LedgerEvent;
use App\Services\AnchorService;
use App\Support\EthSignature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EventSignatureController extends Controller
{
    /**
     * Phase 2 of signing: the browser sends ONLY the signature.
     * The server re-derives the message from its own stored event_hash (never trusting
     * client data), recovers the signer address, and checks it matches the user's wallet.
     */
    public function store(Request $request, LedgerEvent $event, AnchorService $anchor): RedirectResponse
    {
        // Only the user the event concerns may sign it.
        abort_unless($event->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'signature' => ['required', 'string', 'regex:/^0x[0-9a-fA-F]{130}$/'],
        ]);

        $wallet = $request->user()->wallet_address;
        if (! $wallet) {
            throw ValidationException::withMessages([
                'signature' => 'Connect your MetaMask wallet before signing.',
            ]);
        }

        if ($event->signature !== null) {
            throw ValidationException::withMessages([
                'signature' => 'This event is already signed.',
            ]);
        }

        // The signer signs the digest (server's own event_hash). Client data is ignored.
        $recovered = EthSignature::recoverFromDigest($event->event_hash, $validated['signature']);

        if ($recovered === null || strtolower($recovered) !== strtolower($wallet)) {
            throw ValidationException::withMessages([
                'signature' => 'Signature does not match your wallet address.',
            ]);
        }

        $event->update([
            'signature' => $validated['signature'],
            'signer_address' => strtolower($recovered),
        ]);

        // Anchor the signed event's hash on-chain (Phase 1: Laravel anchors directly).
        // Resilient: a chain failure marks the event 'failed' but never breaks signing.
        try {
            $txHash = $anchor->anchor($event);
            $event->update(['anchor_status' => 'confirmed', 'anchor_tx_hash' => $txHash]);
        } catch (\Throwable $e) {
            $event->update(['anchor_status' => 'failed']);
            report($e);
        }

        return back();
    }
}
