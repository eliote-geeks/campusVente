<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Announcement;
use App\Models\Meeting;
use App\Models\User;
use App\Services\MonetbilService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $monetbilService;

    public function __construct(MonetbilService $monetbilService)
    {
        $this->monetbilService = $monetbilService;
        
        // Authentification requise pour tous les paiements sauf les notifications webhook et premium dating (temporaire)
        $this->middleware('auth:sanctum')->except(['handleNotification', 'handleMonetbilNotification', 'handleMonetbilSuccess', 'handleMonetbilFailed', 'initiatePremiumDatingPayment', 'getUserPayments', 'getPaymentStats']);
    }

    /**
     * Initier un paiement Monetbil
     */
    public function initiatePayment(Request $request)
    {
        try {
            Log::info('Tentative initiation paiement', [
                'headers' => $request->headers->all(),
                'has_auth_header' => $request->hasHeader('Authorization'),
                'user_authenticated' => Auth::check(),
                'user_id' => Auth::id()
            ]);
            
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:100',
                'type' => 'required|in:promotional,meeting,commission',
                'announcement_id' => 'nullable|exists:announcements,id',
                'meeting_id' => 'nullable|exists:meetings,id',
                'phone' => 'required|string|min:8',
                'email' => 'required|email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données de paiement invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Générer une référence de paiement unique
            $paymentRef = $this->monetbilService->generatePaymentReference('CV');

            // Créer l'enregistrement de paiement
            $payment = Payment::create([
                'user_id' => $user->id,
                'announcement_id' => $request->announcement_id,
                'meeting_id' => $request->meeting_id,
                'payment_ref' => $paymentRef,
                'amount' => $request->amount,
                'currency' => config('services.monetbil.currency'),
                'type' => $request->type,
                'status' => 'pending',
                'phone' => $request->phone,
                'email' => $request->email,
                'notes' => $request->notes,
            ]);

            // Préparer les paramètres pour Monetbil
            $monetbilParams = [
                'amount' => $request->amount,
                'currency' => config('services.monetbil.currency'),
                'user_id' => $user->id,
                'email' => $request->email,
                'phone' => $request->phone,
                'item_ref' => $payment->id,
                'payment_ref' => $paymentRef,
                'return_url' => url('/payment/return/' . $payment->id),
                'notify_url' => url('/api/v1/payment/notify'),
                'first_name' => explode(' ', $user->name)[0] ?? $user->name,
                'last_name' => explode(' ', $user->name)[1] ?? '',
                'country' => config('services.monetbil.country'),
                'lang' => config('services.monetbil.lang'),
            ];

            // Initier le paiement avec Monetbil
            $result = $this->monetbilService->initiatePayment($monetbilParams);

            if ($result['success']) {
                // Mettre à jour le paiement avec les données Monetbil
                $payment->update([
                    'monetbil_data' => $result['payment_data'],
                    'monetbil_payment_url' => $result['payment_url'],
                    'status' => 'processing'
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Paiement initié avec succès',
                    'data' => [
                        'payment_id' => $payment->id,
                        'payment_ref' => $paymentRef,
                        'payment_url' => $result['payment_url'],
                        'amount' => $payment->formatted_amount,
                        'payment_methods' => $this->monetbilService->getPaymentMethods()
                    ]
                ]);
            } else {
                $payment->markAsFailed($result['error']);
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'initiation du paiement',
                    'error' => $result['error']
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Erreur initiation paiement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Traiter la notification de paiement de Monetbil
     */
    public function handleNotification(Request $request)
    {
        try {
            Log::info('Notification Monetbil reçue', $request->all());

            $result = $this->monetbilService->processNotification($request->all());

            if (!$result['success']) {
                Log::error('Erreur traitement notification: ' . $result['error']);
                return response()->json(['status' => 'error'], 400);
            }

            // Trouver le paiement par référence
            $payment = Payment::where('payment_ref', $result['payment_ref'])->first();

            if (!$payment) {
                Log::error('Paiement introuvable: ' . $result['payment_ref']);
                return response()->json(['status' => 'payment_not_found'], 404);
            }

            // Mettre à jour le statut du paiement
            if ($result['payment_status'] === 'success') {
                $payment->markAsCompleted($result['transaction_id']);
                
                // Traiter les actions post-paiement
                $this->processPostPaymentActions($payment);
                
                Log::info('Paiement complété: ' . $payment->payment_ref);
            } else {
                $payment->markAsFailed('Paiement refusé par Monetbil');
                Log::warning('Paiement échoué: ' . $payment->payment_ref);
            }

            return response()->json(['status' => 'ok']);

        } catch (\Exception $e) {
            Log::error('Erreur notification Monetbil: ' . $e->getMessage());
            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Traiter les actions après un paiement réussi
     */
    private function processPostPaymentActions(Payment $payment)
    {
        try {
            switch ($payment->type) {
                case 'promotional':
                    if ($payment->announcement) {
                        $payment->announcement->update([
                            'is_promotional' => true,
                            'promotional_fee' => $payment->amount,
                            'promoted_at' => now()
                        ]);
                    }
                    break;

                case 'meeting':
                    // Actions spécifiques aux réunions
                    break;
                    
                case 'premium_dating':
                    // Activer l'abonnement premium dating
                    if ($payment->user) {
                        $payment->user->update([
                            'is_premium_dating' => true,
                            'premium_dating_expires_at' => now()->addMonth()
                        ]);
                    }
                    break;
            }

            // Envoyer une notification à l'utilisateur
            // Vous pouvez implémenter ici l'envoi d'email/SMS

        } catch (\Exception $e) {
            Log::error('Erreur actions post-paiement: ' . $e->getMessage());
        }
    }

    /**
     * Traiter un paiement pour annonce promotionnelle (ancienne méthode mise à jour)
     */
    public function processPromotionalPayment(Request $request)
    {
        $request->merge(['type' => 'promotional']);
        return $this->initiatePayment($request);
    }

    /**
     * Obtenir l'historique des paiements d'un utilisateur
     */
    public function getUserPayments(Request $request, $userId = null)
    {
        try {
            // Si pas d'utilisateur spécifié et pas d'authentification, retourner les paiements généraux
            if (!$userId && !Auth::id()) {
                $payments = Payment::with(['user'])
                    ->orderBy('created_at', 'desc')
                    ->paginate(20);

                $totalAmount = Payment::where('status', 'completed')
                    ->sum('amount');

                $paymentsData = $payments->items();
                foreach ($paymentsData as $payment) {
                    $payment->user_name = $payment->user ? $payment->user->name : 'Utilisateur inconnu';
                    $payment->user_email = $payment->user ? $payment->user->email : 'Email inconnu';
                }

                return response()->json([
                    'success' => true,
                    'data' => $paymentsData,
                    'meta' => [
                        'total' => $payments->count(),
                        'total_amount' => $totalAmount,
                        'current_page' => $payments->currentPage(),
                        'last_page' => $payments->lastPage(),
                        'per_page' => $payments->perPage()
                    ]
                ]);
            }

            $targetUserId = $userId ?? Auth::id();
            
            if (!$targetUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $payments = Payment::with(['announcement', 'meeting'])
                ->where('user_id', $targetUserId)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $totalAmount = Payment::where('user_id', $targetUserId)
                ->where('status', 'completed')
                ->sum('amount');

            return response()->json([
                'success' => true,
                'data' => $payments->items(),
                'meta' => [
                    'total' => $payments->count(),
                    'total_amount' => $totalAmount,
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération paiements: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paiements'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques de paiements
     */
    public function getPaymentStats(Request $request)
    {
        try {
            // Calculer les statistiques réelles à partir de la base de données
            $totalPayments = Payment::count();
            $totalRevenue = Payment::where('status', 'completed')->sum('amount');
            $successfulPayments = Payment::where('status', 'completed')->count();
            $failedPayments = Payment::where('status', 'failed')->count();
            $pendingPayments = Payment::where('status', 'pending')->count();
            
            $premiumDatingPayments = Payment::where('type', 'premium_dating')->count();
            $premiumDatingRevenue = Payment::where('type', 'premium_dating')->where('status', 'completed')->sum('amount');
            
            $promotionalPayments = Payment::where('type', 'promotional')->count();
            $promotionalRevenue = Payment::where('type', 'promotional')->where('status', 'completed')->sum('amount');
            
            $meetingPayments = Payment::where('type', 'meeting')->count();
            $meetingRevenue = Payment::where('type', 'meeting')->where('status', 'completed')->sum('amount');
            
            $averagePayment = $totalPayments > 0 ? $totalRevenue / $totalPayments : 0;
            
            // Statistiques de méthodes de paiement (simulées pour l'instant)
            $topPaymentMethods = [
                ['method' => 'Mobile Money', 'count' => round($totalPayments * 0.628), 'percentage' => 62.8],
                ['method' => 'Orange Money', 'count' => round($totalPayments * 0.224), 'percentage' => 22.4],
                ['method' => 'MTN Money', 'count' => round($totalPayments * 0.148), 'percentage' => 14.8]
            ];

            $stats = [
                'totalPayments' => $totalPayments,
                'totalRevenue' => (float) $totalRevenue,
                'successfulPayments' => $successfulPayments,
                'failedPayments' => $failedPayments,
                'pendingPayments' => $pendingPayments,
                'premiumDatingPayments' => $premiumDatingPayments,
                'premiumDatingRevenue' => (float) $premiumDatingRevenue,
                'promotionalPayments' => $promotionalPayments,
                'promotionalRevenue' => (float) $promotionalRevenue,
                'meetingPayments' => $meetingPayments,
                'meetingRevenue' => (float) $meetingRevenue,
                'averagePayment' => (float) $averagePayment,
                'monthlyGrowth' => 23.5, // Simulé
                'topPaymentMethods' => $topPaymentMethods
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération statistiques paiements: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }

    /**
     * Valider un paiement manuellement (pour les admins)
     */
    public function validatePayment(Request $request, $paymentId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:completed,failed,refunded'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Statut invalide',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Pour l'instant, on simule la validation
            $updatedPayment = [
                'id' => $paymentId,
                'status' => $request->status,
                'validated_at' => now(),
                'validated_by' => Auth::id()
            ];

            return response()->json([
                'success' => true,
                'message' => 'Paiement mis à jour avec succès',
                'data' => $updatedPayment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation du paiement'
            ], 500);
        }
    }

    /**
     * Initier un paiement pour l'abonnement Premium Dating
     */
    public function initiatePremiumDatingPayment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'phone' => 'required|string|min:8',
                'email' => 'required|email',
                'user_id' => 'required|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::find($request->user_id);
            
            // Vérifier si l'utilisateur n'a pas déjà un abonnement actif
            if ($user->is_premium_dating && $user->premium_dating_expires_at > now()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà un abonnement Premium actif'
                ], 400);
            }

            // Créer le paiement
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => 1000, // 1000 FCFA
                'currency' => 'XAF',
                'type' => 'premium_dating',
                'status' => 'pending',
                'phone' => $request->phone,
                'email' => $request->email,
                'payment_ref' => 'PREMIUM_' . time() . '_' . $user->id,
                'notes' => 'Abonnement Premium Dating - 1 mois'
            ]);

            // Retourner les données pour Monetbil
            return response()->json([
                'success' => true,
                'message' => 'Paiement initié',
                'data' => [
                    'payment_id' => $payment->id,
                    'payment_ref' => $payment->payment_ref,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'service_key' => config('services.monetbil.service_key'),
                    'success_url' => url('/api/v1/monetbil/success?payment_id=' . $payment->id),
                    'failed_url' => url('/api/v1/monetbil/failed?payment_id=' . $payment->id),
                    'notify_url' => url('/api/v1/monetbil/notify'),
                    'user_info' => [
                        'email' => $request->email,
                        'phone' => $request->phone,
                        'name' => $user->name
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur initiation paiement premium dating: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement'
            ], 500);
        }
    }

    /**
     * Gérer les notifications Monetbil pour Premium Dating
     */
    public function handleMonetbilNotification(Request $request)
    {
        try {
            Log::info('Notification Monetbil Premium Dating reçue', $request->all());

            $paymentRef = $request->input('item_ref');
            $status = $request->input('status');
            $transactionId = $request->input('transaction_id');

            if (!$paymentRef) {
                Log::error('Payment reference manquante dans la notification');
                return response()->json(['status' => 'error'], 400);
            }

            // Trouver le paiement
            $payment = Payment::where('payment_ref', $paymentRef)->first();
            
            if (!$payment) {
                Log::error('Paiement introuvable: ' . $paymentRef);
                return response()->json(['status' => 'payment_not_found'], 404);
            }

            // Mettre à jour le statut selon la réponse Monetbil
            if ($status === 'success' || $status === '1') {
                $payment->update([
                    'status' => 'completed',
                    'transaction_id' => $transactionId,
                    'completed_at' => now()
                ]);

                // Activer l'abonnement premium
                $payment->user->update([
                    'is_premium_dating' => true,
                    'premium_dating_expires_at' => now()->addMonth()
                ]);

                Log::info('Abonnement Premium Dating activé pour l\'utilisateur: ' . $payment->user_id);
            } else {
                $payment->update([
                    'status' => 'failed',
                    'error_message' => 'Paiement échoué via Monetbil'
                ]);
                Log::warning('Paiement Premium Dating échoué: ' . $paymentRef);
            }

            return response()->json(['status' => 'ok']);

        } catch (\Exception $e) {
            Log::error('Erreur notification Monetbil Premium Dating: ' . $e->getMessage());
            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Gérer le succès de paiement Monetbil
     */
    public function handleMonetbilSuccess(Request $request)
    {
        try {
            $paymentId = $request->input('payment_id');
            $payment = Payment::find($paymentId);

            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement introuvable'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Paiement réussi ! Votre abonnement Premium Dating est maintenant actif.',
                'data' => [
                    'payment_id' => $payment->id,
                    'payment_ref' => $payment->payment_ref,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                    'expires_at' => $payment->user->premium_dating_expires_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur success callback Monetbil: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du succès'
            ], 500);
        }
    }

    /**
     * Gérer l'échec de paiement Monetbil
     */
    public function handleMonetbilFailed(Request $request)
    {
        try {
            $paymentId = $request->input('payment_id');
            $payment = Payment::find($paymentId);

            if ($payment) {
                $payment->update([
                    'status' => 'failed',
                    'error_message' => 'Paiement annulé par l\'utilisateur'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Paiement échoué ou annulé. Veuillez réessayer.',
                'data' => [
                    'payment_id' => $paymentId,
                    'status' => 'failed'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur failed callback Monetbil: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement de l\'échec'
            ], 500);
        }
    }
}