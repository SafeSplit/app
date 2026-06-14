<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ExpenseSplitController extends Controller
{
    /** Current user accepts their share of the expense. */
    public function accept(Request $request, Expense $expense): RedirectResponse
    {
        return $this->setStatus($request, $expense, 'accepted');
    }

    /** Current user disputes (rejects) their share. */
    public function reject(Request $request, Expense $expense): RedirectResponse
    {
        return $this->setStatus($request, $expense, 'rejected');
    }

    private function setStatus(Request $request, Expense $expense, string $status): RedirectResponse
    {
        $split = $expense->splits()->where('user_id', $request->user()->id)->first();

        abort_if($split === null, 403, 'You are not a participant in this expense.');

        $split->update(['status' => $status]);

        return back();
    }
}
