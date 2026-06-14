<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Settlement;
use App\Services\LedgerService;
use App\Support\Canonical;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SettlementController extends Controller
{
    /** Declare a reimbursement from the current user to another member. */
    public function store(Request $request, Group $group, LedgerService $ledger): RedirectResponse
    {
        abort_unless($group->users()->whereKey($request->user()->id)->exists(), 403);

        $memberIds = $group->users()->pluck('users.id')->all();

        $validated = $request->validate([
            'to_user_id' => [
                'required',
                'integer',
                Rule::in($memberIds),
                Rule::notIn([$request->user()->id]),
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        DB::transaction(function () use ($group, $request, $validated, $ledger) {
            $settlement = $group->settlements()->create([
                'from_user_id' => $request->user()->id,
                'to_user_id' => $validated['to_user_id'],
                'amount' => $validated['amount'],
                'currency' => 'EUR',
                'status' => 'declared',
            ]);

            $ledger->record('SETTLEMENT_DECLARED', [
                'settlement_id' => $settlement->id,
                'group_id' => $group->id,
                'from_user_id' => $settlement->from_user_id,
                'to_user_id' => $settlement->to_user_id,
                'amount' => Canonical::amount($settlement->amount),
                'currency' => $settlement->currency,
            ], [
                'aggregate_type' => 'settlement',
                'aggregate_id' => $settlement->id,
                'group_id' => $group->id,
                'user_id' => $settlement->from_user_id,
            ]);
        });

        return back();
    }

    /** The recipient (creditor) accepts the reimbursement. */
    public function accept(Request $request, Settlement $settlement, LedgerService $ledger): RedirectResponse
    {
        abort_unless($settlement->to_user_id === $request->user()->id, 403);

        DB::transaction(function () use ($settlement, $request, $ledger) {
            $settlement->update(['status' => 'accepted']);

            $ledger->record('SETTLEMENT_ACCEPTED', [
                'settlement_id' => $settlement->id,
                'group_id' => $settlement->group_id,
                'user_id' => $request->user()->id,
            ], [
                'aggregate_type' => 'settlement',
                'aggregate_id' => $settlement->id,
                'group_id' => $settlement->group_id,
                'user_id' => $request->user()->id,
            ]);
        });

        return back();
    }
}
