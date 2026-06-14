<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    protected $fillable = ['name', 'description', 'created_by'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupMember::class);
    }

    /** Users in this group, with their pivot role. */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(Settlement::class);
    }

    /**
     * Net balance per user id within this group.
     *   > 0  → the user is owed money (others owe them)
     *   < 0  → the user owes money
     * Based on ACTIVE expenses and ACCEPTED settlements.
     */
    public function balances(): array
    {
        $this->loadMissing([
            'users:id',
            'expenses' => fn ($q) => $q->where('status', 'active')->with('splits'),
            'settlements',
        ]);

        $net = [];
        foreach ($this->users as $u) {
            $net[$u->id] = 0.0;
        }

        foreach ($this->expenses as $expense) {
            foreach ($expense->splits as $split) {
                if ($split->user_id === $expense->payer_id) {
                    continue; // the payer's own share is not a debt
                }
                $net[$split->user_id] = ($net[$split->user_id] ?? 0) - (float) $split->amount_owed;
                $net[$expense->payer_id] = ($net[$expense->payer_id] ?? 0) + (float) $split->amount_owed;
            }
        }

        foreach ($this->settlements as $settlement) {
            if ($settlement->status !== 'accepted') {
                continue;
            }
            // Debtor (from) paid creditor (to): debtor's balance rises toward 0.
            $net[$settlement->from_user_id] = ($net[$settlement->from_user_id] ?? 0) + (float) $settlement->amount;
            $net[$settlement->to_user_id] = ($net[$settlement->to_user_id] ?? 0) - (float) $settlement->amount;
        }

        // Round to cents.
        return array_map(fn ($v) => round($v, 2), $net);
    }
}
