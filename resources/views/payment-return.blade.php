<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Résultat du Paiement - CampusVente</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .payment-result {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .result-card {
            max-width: 500px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .success-icon {
            font-size: 4rem;
            color: #28a745;
        }
        .pending-icon {
            font-size: 4rem;
            color: #ffc107;
        }
        .error-icon {
            font-size: 4rem;
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="payment-result">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card result-card">
                        <div class="card-body text-center p-5">
                            @if(isset($payment))
                                @if($payment->status === 'completed')
                                    <div class="success-icon mb-4">
                                        ✅
                                    </div>
                                    <h2 class="text-success mb-3">Paiement Réussi!</h2>
                                    <p class="lead">Votre paiement de <strong>{{ $payment->formatted_amount }}</strong> a été traité avec succès.</p>
                                    <div class="bg-light rounded p-3 mb-4">
                                        <small class="text-muted">
                                            <strong>Référence:</strong> {{ $payment->payment_ref }}<br>
                                            @if($payment->transaction_id)
                                                <strong>Transaction ID:</strong> {{ $payment->transaction_id }}<br>
                                            @endif
                                            <strong>Date:</strong> {{ $payment->completed_at ? $payment->completed_at->format('d/m/Y H:i') : $payment->created_at->format('d/m/Y H:i') }}
                                        </small>
                                    </div>
                                    @if($payment->type === 'promotional' && $payment->announcement)
                                        <div class="alert alert-success">
                                            🎉 Votre annonce "<strong>{{ $payment->announcement->title }}</strong>" est maintenant promue!
                                        </div>
                                    @endif
                                @elseif($payment->status === 'pending' || $payment->status === 'processing')
                                    <div class="pending-icon mb-4">
                                        ⏳
                                    </div>
                                    <h2 class="text-warning mb-3">Paiement en Cours</h2>
                                    <p class="lead">Votre paiement est en cours de traitement. Vous recevrez une confirmation sous peu.</p>
                                    <div class="bg-light rounded p-3 mb-4">
                                        <small class="text-muted">
                                            <strong>Référence:</strong> {{ $payment->payment_ref }}<br>
                                            <strong>Montant:</strong> {{ $payment->formatted_amount }}<br>
                                            <strong>Statut:</strong> {{ ucfirst($payment->status) }}
                                        </small>
                                    </div>
                                @else
                                    <div class="error-icon mb-4">
                                        ❌
                                    </div>
                                    <h2 class="text-danger mb-3">Paiement Échoué</h2>
                                    <p class="lead">Votre paiement n'a pas pu être traité.</p>
                                    @if($payment->failure_reason)
                                        <div class="alert alert-danger">
                                            {{ $payment->failure_reason }}
                                        </div>
                                    @endif
                                    <div class="bg-light rounded p-3 mb-4">
                                        <small class="text-muted">
                                            <strong>Référence:</strong> {{ $payment->payment_ref }}<br>
                                            <strong>Montant:</strong> {{ $payment->formatted_amount }}
                                        </small>
                                    </div>
                                @endif
                            @else
                                <div class="error-icon mb-4">
                                    ❓
                                </div>
                                <h2 class="text-danger mb-3">Paiement Introuvable</h2>
                                <p class="lead">Impossible de trouver les informations de ce paiement.</p>
                            @endif
                            
                            <div class="mt-4">
                                <a href="{{ url('/') }}" class="btn btn-primary btn-lg">
                                    🏠 Retour à l'Accueil
                                </a>
                                @if(isset($payment) && $payment->user_id)
                                    <a href="{{ url('/my-payments') }}" class="btn btn-outline-secondary btn-lg ms-2">
                                        📊 Mes Paiements
                                    </a>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    @if(isset($payment) && $payment->status === 'pending')
        <script>
            // Recharger la page toutes les 10 secondes pour vérifier le statut
            setTimeout(() => {
                window.location.reload();
            }, 10000);
        </script>
    @endif
</body>
</html>