<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use App\Services\LedgerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GroupMemberController extends Controller
{
    /** Add an existing (registered) user to the group by email. */
    public function store(Request $request, Group $group, LedgerService $ledger): RedirectResponse
    {
        abort_unless($group->users()->whereKey($request->user()->id)->exists(), 403);

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();

        if ($group->users()->whereKey($user->id)->exists()) {
            throw ValidationException::withMessages([
                'email' => 'This user is already a member of the group.',
            ]);
        }

        DB::transaction(function () use ($group, $user, $request, $ledger) {
            $group->members()->create([
                'user_id' => $user->id,
                'role' => 'member',
            ]);

            $ledger->record('MEMBER_ADDED', [
                'group_id' => $group->id,
                'member_id' => $user->id,
                'added_by' => $request->user()->id,
                'role' => 'member',
            ], [
                'aggregate_type' => 'group',
                'aggregate_id' => $group->id,
                'group_id' => $group->id,
                'user_id' => $user->id,
            ]);
        });

        return back();
    }
}
