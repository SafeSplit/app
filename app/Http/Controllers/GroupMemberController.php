<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GroupMemberController extends Controller
{
    /** Add an existing (registered) user to the group by email. */
    public function store(Request $request, Group $group): RedirectResponse
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

        $group->members()->create([
            'user_id' => $user->id,
            'role' => 'member',
        ]);

        return back();
    }
}
