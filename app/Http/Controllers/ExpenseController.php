<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Group;
use App\Models\LedgerEvent;
use App\Services\LedgerService;
use App\Services\VerificationService;
use App\Support\Canonical;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    /** Declare an expense and its per-participant splits. */
    public function store(Request $request, Group $group, LedgerService $ledger): RedirectResponse
    {
        abort_unless($group->users()->whereKey($request->user()->id)->exists(), 403);

        $memberIds = $group->users()->pluck('users.id')->all();

        $validated = $request->validate([
            'payer_id' => ['required', 'integer', Rule::in($memberIds)],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'participants' => ['required', 'array', 'min:1'],
            'participants.*.user_id' => ['required', 'integer', Rule::in($memberIds)],
            'participants.*.amount_owed' => ['required', 'numeric', 'min:0'],
        ]);

        // The split must add up to the total.
        $sum = round(array_sum(array_column($validated['participants'], 'amount_owed')), 2);
        if ($sum !== round((float) $validated['amount'], 2)) {
            throw ValidationException::withMessages([
                'amount' => "Split (€{$sum}) must equal the total (€{$validated['amount']}).",
            ]);
        }

        // Reject duplicate participants.
        $userIds = array_column($validated['participants'], 'user_id');
        if (count($userIds) !== count(array_unique($userIds))) {
            throw ValidationException::withMessages([
                'participants' => 'A participant appears more than once.',
            ]);
        }

        // Business write + the one immutable event are a single atomic operation.
        $expense = DB::transaction(function () use ($group, $validated, $ledger) {
            $expense = $group->expenses()->create([
                'payer_id' => $validated['payer_id'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'currency' => 'EUR',
                'status' => 'active',
            ]);

            foreach ($validated['participants'] as $p) {
                $expense->splits()->create([
                    'user_id' => $p['user_id'],
                    'amount_owed' => $p['amount_owed'],
                    // The payer implicitly accepts their own share.
                    'status' => $p['user_id'] === $validated['payer_id'] ? 'accepted' : 'pending',
                ]);
            }

            // Deterministically ordered participants for a reproducible hash.
            $participants = collect($validated['participants'])
                ->sortBy('user_id')
                ->values()
                ->map(fn ($p) => [
                    'user_id' => $p['user_id'],
                    'amount_owed' => Canonical::amount($p['amount_owed']),
                ])
                ->all();

            $ledger->record('EXPENSE_CREATED', [
                'expense_id' => $expense->id,
                'group_id' => $group->id,
                'payer_id' => $expense->payer_id,
                'amount' => Canonical::amount($expense->amount),
                'currency' => $expense->currency,
                'participants' => $participants,
            ], [
                'aggregate_type' => 'expense',
                'aggregate_id' => $expense->id,
                'group_id' => $group->id,
                'user_id' => $expense->payer_id,
            ]);

            return $expense;
        });

        return redirect()->route('groups.show', $group);
    }

    /** Expense detail: payer, splits, each participant's accept/dispute status. */
    public function show(Request $request, Expense $expense, VerificationService $verifier): Response
    {
        $expense->load(['group', 'payer:id,name,email', 'splits.user:id,name,email']);

        abort_unless($expense->group->users()->whereKey($request->user()->id)->exists(), 403);

        $mySplit = $expense->splits->firstWhere('user_id', $request->user()->id);

        $events = LedgerEvent::where('aggregate_type', 'expense')
            ->where('aggregate_id', $expense->id)
            ->with('user:id,name')
            ->orderBy('created_at')
            ->get()
            ->map(fn (LedgerEvent $ev) => [
                'id' => $ev->id,
                'event_type' => $ev->event_type,
                'event_hash' => $ev->event_hash,
                'anchor_status' => $ev->anchor_status,
                'anchor_tx_hash' => $ev->anchor_tx_hash,
                'signed' => $ev->signature !== null,
                'signer_address' => $ev->signer_address,
                'can_sign' => $ev->user_id === $request->user()->id && $ev->signature === null,
                'user' => $ev->user?->only(['id', 'name']),
                'created_at' => $ev->created_at->toDateTimeString(),
            ]);

        return Inertia::render('expenses/show', [
            'events' => $events,
            'verification' => $verifier->verifyExpense($expense),
            'expense' => [
                'id' => $expense->id,
                'group_id' => $expense->group_id,
                'group_name' => $expense->group->name,
                'description' => $expense->description,
                'amount' => $expense->amount,
                'currency' => $expense->currency,
                'status' => $expense->status,
                'payer' => $expense->payer->only(['id', 'name', 'email']),
                'created_at' => $expense->created_at->toDateTimeString(),
                'splits' => $expense->splits->map(fn ($s) => [
                    'id' => $s->id,
                    'user' => $s->user->only(['id', 'name', 'email']),
                    'amount_owed' => $s->amount_owed,
                    'status' => $s->status,
                    'is_payer' => $s->user_id === $expense->payer_id,
                ]),
            ],
            'my_split' => $mySplit ? [
                'id' => $mySplit->id,
                'status' => $mySplit->status,
                'is_payer' => $mySplit->user_id === $expense->payer_id,
            ] : null,
        ]);
    }
}
