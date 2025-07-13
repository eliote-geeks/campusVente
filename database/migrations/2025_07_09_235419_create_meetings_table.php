<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['study_group', 'networking', 'party', 'sport', 'cultural', 'conference', 'workshop', 'other'])->default('study_group');
            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');
            $table->datetime('meeting_date');
            $table->string('location');
            $table->string('address')->nullable();
            $table->integer('max_participants')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_free')->default(true);
            $table->boolean('is_online')->default(false);
            $table->string('online_link')->nullable();
            $table->json('images')->nullable();
            $table->text('requirements')->nullable();
            $table->text('contact_info')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('views')->default(0);
            $table->integer('participants_count')->default(0);
            
            // Relations
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['meeting_date', 'status']);
            $table->index(['type', 'status']);
            $table->index(['location']);
            $table->index(['is_featured']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};