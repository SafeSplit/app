<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    /** Dashboard: the groups the current user belongs to. */
    public function index(Request $request): Response
    {
        $groups = $request->user()->groups()
            ->withCount('users as members_count')
            ->latest('groups.created_at')
            ->get()
            ->map(fn (Group $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'description' => $g->description,
                'members_count' => $g->members_count,
                'role' => $g->pivot->role,
            ]);

        return Inertia::render('dashboard', ['groups' => $groups]);
    }

    /** Create a group; the creator becomes its owner-member. */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $group = Group::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        $group->members()->create([
            'user_id' => $request->user()->id,
            'role' => 'owner',
        ]);

        return redirect()->route('groups.show', $group);
    }

    /** Group detail: members + metadata. Only members may view. */
    public function show(Request $request, Group $group): Response
    {
        abort_unless($this->isMember($group, $request->user()->id), 403);

        $group->load(['creator:id,name,email', 'users:id,name,email,wallet_address']);

        return Inertia::render('groups/show', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'creator' => $group->creator?->only(['id', 'name', 'email']),
                'is_owner' => $group->created_by === $request->user()->id,
                'members' => $group->users->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'wallet_address' => $u->wallet_address,
                    'role' => $u->pivot->role,
                ]),
            ],
        ]);
    }

    private function isMember(Group $group, int $userId): bool
    {
        return $group->users()->whereKey($userId)->exists();
    }
}
