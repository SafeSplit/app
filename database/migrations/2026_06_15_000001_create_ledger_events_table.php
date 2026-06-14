<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Append-only event journal (Event Sourcing).
     * Rows are never modified or deleted; the payload + event_hash are immutable.
     * (signature / anchor columns are metadata added by later blocs, not the hashed content.)
     */
    public function up(): void
    {
        Schema::create('ledger_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('event_id')->unique();
            $table->string('event_type');

            // What entity this event concerns (for querying).
            $table->string('aggregate_type')->nullable();   // group | member | expense | settlement
            $table->unsignedBigInteger('aggregate_id')->nullable();
            $table->foreignId('group_id')->nullable()->constrained('groups')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // concerned user

            // The full canonical event (structured) + the exact string that was hashed.
            $table->json('payload');
            $table->text('canonical');
            $table->char('event_hash', 64);

            // Filled later: 1.5 (signature) and 1.6 (anchoring).
            $table->text('signature')->nullable();
            $table->string('signer_address')->nullable();
            $table->string('anchor_status')->default('pending'); // pending | confirmed | failed
            $table->string('anchor_tx_hash')->nullable();

            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_events');
    }
};
