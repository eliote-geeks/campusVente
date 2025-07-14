<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Traiter un paiement pour annonce promotionnelle
     */
    public function processPromotionalPayment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0',
                'currency' => 'required|string',
                'type' => 'required|string',
                'user_id' => 'required|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données de paiement invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $userId = $request->user_id;
            $amount = $request->amount;
            $currency = $request->currency;
            $type = $request->type;

            // Pour l'instant, on valide automatiquement tous les paiements
            $paymentSuccessful = true;

            if ($paymentSuccessful) {
                // Ici, vous pourriez sauvegarder la transaction en base de données
                $paymentRecord = [
                    'id' => uniqid('pay_'),
                    'user_id' => $userId,
                    'amount' => $amount,
                    'currency' => $currency,
                    'type' => $type,
                    'status' => 'completed',
                    'payment_method' => 'auto_validated',
                    'transaction_id' => 'txn_' . uniqid(),
                    'processed_at' => now(),
                    'created_at' => now()
                ];

                return response()->json([
                    'success' => true,
                    'message' => 'Paiement traité avec succès',
                    'data' => [
                        'payment' => $paymentRecord,
                        'status' => 'completed',
                        'validation_message' => 'Paiement validé automatiquement pour les tests'
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Échec du traitement du paiement',
                    'error' => 'Payment processing failed'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir l'historique des paiements d'un utilisateur
     */
    public function getUserPayments(Request $request, $userId = null)
    {
        try {
            $targetUserId = $userId ?? Auth::id();
            
            if (!$targetUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Pour l'instant, on retourne des données simulées
            $mockPayments = [
                [
                    'id' => 'pay_' . uniqid(),
                    'amount' => 500,
                    'currency' => 'FCFA',
                    'type' => 'promotional_announcement',
                    'status' => 'completed',
                    'payment_method' => 'auto_validated',
                    'created_at' => now()->subDays(2),
                    'description' => 'Promotion d\'annonce'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $mockPayments,
                'meta' => [
                    'total' => count($mockPayments),
                    'total_amount' => array_sum(array_column($mockPayments, 'amount'))
                ]
            ]);

        } catch (\Exception $e) {
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
            // Statistiques simulées
            $stats = [
                'total_payments' => 150,
                'total_revenue' => 75000, // en FCFA
                'promotional_payments' => 120,
                'promotional_revenue' => 60000,
                'average_payment' => 500,
                'monthly_growth' => 15.5, // en pourcentage
                'top_payment_methods' => [
                    ['method' => 'auto_validated', 'count' => 150, 'percentage' => 100]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
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
}