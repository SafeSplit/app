<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMemberController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Landing: send users where they belong.
Route::get('/', function () {
    return redirect()->route(Auth::check() ? 'dashboard' : 'login');
});

// Guest-only auth pages.
Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// Authenticated app.
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [GroupController::class, 'index'])->name('dashboard');

    // Groups & members.
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/members', [GroupMemberController::class, 'store'])->name('groups.members.store');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Link / update the user's MetaMask Ethereum address.
    Route::post('/wallet', [WalletController::class, 'store'])->name('wallet.store');
});
