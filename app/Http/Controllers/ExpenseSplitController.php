<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Services\LedgerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseSplitController extends Controller
{
    /** Current user accepts their share of the expense. */
    public function accept(Request $request, Expense $expense, LedgerService $ledger): RedirectResponse
    {
        return $this->setStatus($request, $expense, $ledger, 'accepted', 'EXPENSE_ACCEPTED');
    }

    /** Current user disputes (rejects) their share. */
    public function reject(Request $request, Expense $expense, LedgerService $ledger): RedirectResponse
    {
        return $this->setStatus($request, $expense, $ledger, 'rejected', 'EXPENSE_REJECTED');
    }

    private function setStatus(
        Request $request,
        Expense $expense,
        LedgerService $ledger,
        string $status,
        string $eventType,
    ): RedirectResponse {
        $split = $expense->splits()->where('user_id', $request->user()->id)->first();

        abort_if($split === null, 403, 'You are not a participant in this expense.');

        DB::transaction(function () use ($split, $expense, $ledger, $status, $eventType, $request) {
            $split->update(['status' => $status]);

            $ledger->record($eventType, [
                'expense_id' => $expense->id,
                'group_id' => $expense->group_id,
                'user_id' => $request->user()->id,
            ], [
                'aggregate_type' => 'expense',
                'aggregate_id' => $expense->id,
                'group_id' => $expense->group_id,
                'user_id' => $request->user()->id,
            ]);
        });

        return back();
    }
}
