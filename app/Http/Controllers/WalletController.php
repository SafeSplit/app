<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WalletController extends Controller
{
    /**
     * Link (or update) the authenticated user's MetaMask Ethereum address.
     * The address is stored lowercased and must be a valid 0x + 40 hex chars.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'wallet_address' => [
                'required',
                'string',
                'regex:/^0x[0-9a-fA-F]{40}$/',
                Rule::unique('users', 'wallet_address')->ignore($request->user()->id),
            ],
        ]);

        $request->user()->update([
            'wallet_address' => strtolower($validated['wallet_address']),
        ]);

        return back();
    }
}
