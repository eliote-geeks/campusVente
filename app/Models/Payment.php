<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'announcement_id',
        'meeting_id',
        'payment_ref',
        'transaction_id',
        'amount',
        'currency',
        'type',
        'status',
        'payment_method',
        'phone',
        'email',
        'monetbil_data',
        'monetbil_payment_url',
        'payment_date',
        'completed_at',
        'notes',
        'failure_reason',
    ];

    protected $casts = [
        'monetbil_data' => 'array',
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $dates = [
        'payment_date',
        'completed_at',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec l'annonce
     */
    public function announcement(): BelongsTo
    {
        return $this->belongsTo(Announcement::class);
    }

    /**
     * Relation avec la réunion
     */
    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    /**
     * Scopes pour les requêtes fréquentes
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePromotional($query)
    {
        return $query->where('type', 'promotional');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Marquer le paiement comme terminé
     */
    public function markAsCompleted($transactionId = null)
    {
        $this->update([
            'status' => 'completed',
            'transaction_id' => $transactionId,
            'completed_at' => now(),
        ]);
    }

    /**
     * Marquer le paiement comme échoué
     */
    public function markAsFailed($reason = null)
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);
    }

    /**
     * Obtenir le montant formaté
     */
    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 0, ',', ' ') . ' ' . $this->currency;
    }

    /**
     * Vérifier si le paiement est terminé
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Vérifier si le paiement est en attente
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Vérifier si le paiement a échoué
     */
    public function hasFailed()
    {
        return $this->status === 'failed';
    }
}
