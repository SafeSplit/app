<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\LedgerEvent;
use App\Support\Canonical;
use App\Support\EthSignature;

/**
 * Integrity verification (fraud detection).
 *
 * For each event we run up to four independent checks:
 *   - journal   : the journal payload still hashes to its stored event_hash  (Case 2)
 *   - anchor    : the journal hash matches the immutable hash on Hardhat       (ground truth)
 *   - business  : the current business data still hashes to the anchored hash (Case 1)
 *   - signature : the stored signature recovers the recorded signer            (Case 3)
 */
class VerificationService
{
    public function __construct(private AnchorService $anchor) {}

    public function verifyEvent(LedgerEvent $event): array
    {
        $issues = [];

        // Immutable ground truth: the hash anchored on Hardhat (null if unanchored/unreachable).
        $anchoredHex = $this->anchoredHex($event->event_id);

        // Case 2 — journal integrity: payload still hashes to the stored event_hash.
        $payloadHash = Canonical::hash($event->payload);
        $journalOk = hash_equals(strtolower($event->event_hash), $payloadHash);
        if (! $journalOk) {
            $issues[] = 'Event journal falsified — the payload no longer matches its fingerprint.';
        }

        // Anchor match: the journal hash equals what's carved on-chain.
        $anchorOk = $anchoredHex === null
            ? null
            : hash_equals(strtolower($event->event_hash), $anchoredHex);
        if ($anchorOk === false) {
            $issues[] = 'Journal fingerprint differs from the hash anchored on Hardhat.';
        }

        // The reference we trust: the on-chain hash if available, else the journal hash.
        $reference = $anchoredHex ?? strtolower($event->event_hash);

        // Case 1 — business data still matches (only reconstructable types).
        $businessOk = null;
        if ($event->event_type === 'EXPENSE_CREATED') {
            $rebuilt = $this->rebuildExpenseCreated($event);
            if ($rebuilt === null) {
                $businessOk = false;
                $issues[] = 'Business record is missing (deleted).';
            } else {
                $businessOk = hash_equals($reference, strtolower($rebuilt));
                if (! $businessOk) {
                    $issues[] = 'Business database falsified — current data does not match the anchored record.';
                }
            }
        }

        // Case 3 — signature authenticity.
        $signatureOk = null;
        if ($event->signature !== null) {
            $signatureOk = EthSignature::verifyDigest(
                $event->event_hash,
                $event->signature,
                (string) $event->signer_address,
            );
            if (! $signatureOk) {
                $issues[] = 'Signature is invalid — it does not recover the recorded signer.';
            }
        }

        $tampered = ! $journalOk
            || $anchorOk === false
            || $businessOk === false
            || $signatureOk === false;

        return [
            'event_id' => $event->event_id,
            'event_type' => $event->event_type,
            'status' => $tampered ? 'tampered' : 'ok',
            'checks' => [
                'journal' => $journalOk,
                'anchor' => $anchorOk,
                'business' => $businessOk,
                'signature' => $signatureOk,
            ],
            'issues' => $issues,
        ];
    }

    /** Verify every event attached to an expense aggregate. */
    public function verifyExpense(Expense $expense): array
    {
        $events = LedgerEvent::where('aggregate_type', 'expense')
            ->where('aggregate_id', $expense->id)
            ->orderBy('created_at')
            ->get();

        $results = $events->map(fn (LedgerEvent $e) => $this->verifyEvent($e))->all();
        $tampered = collect($results)->contains(fn ($r) => $r['status'] === 'tampered');

        return [
            'overall' => $tampered ? 'tampered' : 'ok',
            'events' => $results,
        ];
    }

    /** On-chain hash as lowercase 64-hex (no 0x), or null if not anchored / unreachable. */
    private function anchoredHex(string $uuid): ?string
    {
        try {
            $onchain = $this->anchor->anchoredHash($uuid);
        } catch (\Throwable $e) {
            return null;
        }

        if (! $onchain || preg_match('/^0x0+$/', $onchain)) {
            return null;
        }

        return strtolower(substr($onchain, 2));
    }

    /** Recompute the EXPENSE_CREATED hash from CURRENT business data; null if the expense is gone. */
    private function rebuildExpenseCreated(LedgerEvent $event): ?string
    {
        $expense = Expense::with('splits')->find($event->aggregate_id);
        if ($expense === null) {
            return null;
        }

        $payload = $event->payload; // original event_id + timestamp (immutable parts)

        $rebuilt = [
            'event_id' => $payload['event_id'] ?? null,
            'event_type' => 'EXPENSE_CREATED',
            'expense_id' => $expense->id,
            'group_id' => $expense->group_id,
            'payer_id' => $expense->payer_id,
            'amount' => Canonical::amount($expense->amount),
            'currency' => $expense->currency,
            'participants' => $expense->splits
                ->sortBy('user_id')
                ->values()
                ->map(fn ($s) => [
                    'user_id' => $s->user_id,
                    'amount_owed' => Canonical::amount($s->amount_owed),
                ])
                ->all(),
            'timestamp' => $payload['timestamp'] ?? null,
        ];

        return Canonical::hash($rebuilt);
    }
}
