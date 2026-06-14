<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Settlement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SettlementController extends Controller
{
    /** Declare a reimbursement from the current user to another member. */
    public function store(Request $request, Group $group): RedirectResponse
    {
        abort_unless($group->users()->whereKey($request->user()->id)->exists(), 403);

        $memberIds = $group->users()->pluck('users.id')->all();

        $validated = $request->validate([
            'to_user_id' => [
                'required',
                'integer',
                'different:from',
                Rule::in($memberIds),
                Rule::notIn([$request->user()->id]),
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $group->settlements()->create([
            'from_user_id' => $request->user()->id,
            'to_user_id' => $validated['to_user_id'],
            'amount' => $validated['amount'],
            'currency' => 'EUR',
            'status' => 'declared',
        ]);

        return back();
    }

    /** The recipient (creditor) accepts the reimbursement. */
    public function accept(Request $request, Settlement $settlement): RedirectResponse
    {
        abort_unless($settlement->to_user_id === $request->user()->id, 403);

        $settlement->update(['status' => 'accepted']);

        return back();
    }
}
