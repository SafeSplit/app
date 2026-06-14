<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    /** Declare an expense and its per-participant splits. */
    public function store(Request $request, Group $group): RedirectResponse
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

        return redirect()->route('groups.show', $group);
    }

    /** Expense detail: payer, splits, each participant's accept/dispute status. */
    public function show(Request $request, Expense $expense): Response
    {
        $expense->load(['group', 'payer:id,name,email', 'splits.user:id,name,email']);

        abort_unless($expense->group->users()->whereKey($request->user()->id)->exists(), 403);

        $mySplit = $expense->splits->firstWhere('user_id', $request->user()->id);

        return Inertia::render('expenses/show', [
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
