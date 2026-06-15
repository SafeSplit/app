<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\EventSignatureController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ExpenseSplitController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMemberController;
use App\Http\Controllers\NetworkController;
use App\Http\Controllers\SettlementController;
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

    // Live blockchain network map.
    Route::get('/network', [NetworkController::class, 'index'])->name('network');

    // Groups & members.
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/members', [GroupMemberController::class, 'store'])->name('groups.members.store');

    // Expenses & splits.
    Route::post('/groups/{group}/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show'])->name('expenses.show');
    Route::post('/expenses/{expense}/accept', [ExpenseSplitController::class, 'accept'])->name('expenses.accept');
    Route::post('/expenses/{expense}/reject', [ExpenseSplitController::class, 'reject'])->name('expenses.reject');

    // Settlements (reimbursements).
    Route::post('/groups/{group}/settlements', [SettlementController::class, 'store'])->name('settlements.store');
    Route::post('/settlements/{settlement}/accept', [SettlementController::class, 'accept'])->name('settlements.accept');

    // Two-phase event signing (browser returns only the signature — D6).
    Route::post('/events/{event}/sign', [EventSignatureController::class, 'store'])->name('events.sign');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Link / update the user's MetaMask Ethereum address.
    Route::post('/wallet', [WalletController::class, 'store'])->name('wallet.store');
});
