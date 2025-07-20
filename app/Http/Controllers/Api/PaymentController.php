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
        
        // Authentification requise pour tous les paiements sauf les notifications webhook
        $this->middleware('auth:sanctum')->except(['handleNotification', 'handleMonetbilSuccess', 'handleMonetbilFailed', 'getUserPayments', 'getPaymentStats']);
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
                'amount' => 'required|numeric|min:1',
                'type' => 'required|in:promotional,meeting,commission,campus_love',
                'announcement_id' => 'nullable|exists:announcements,id',
                'meeting_id' => 'nullable|exists:meetings,id',
                'phone' => 'required|string|min:8',
                'email' => 'required|email',
                'payment_method' => 'in:widget,direct'
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

            $paymentMethod = $request->input('payment_method', 'widget');

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

            // Initier le paiement selon la méthode choisie
            if ($paymentMethod === 'direct') {
                $result = $this->monetbilService->initiateDirectTransaction($monetbilParams);
            } else {
                $result = $this->monetbilService->initiatePayment($monetbilParams);
            }

            if ($result['success']) {
                // Mettre à jour le paiement avec les données Monetbil
                $updateData = [
                    'monetbil_data' => $result['payment_data'] ?? $result,
                    'status' => 'processing'
                ];

                if ($paymentMethod === 'direct') {
                    $updateData['transaction_id'] = $result['transaction_id'] ?? null;
                } else {
                    $updateData['monetbil_payment_url'] = $result['payment_url'];
                }

                $payment->update($updateData);

                $responseData = [
                    'payment_id' => $payment->id,
                    'payment_ref' => $paymentRef,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'type' => $payment->type,
                    'phone' => $request->phone,
                    'status' => $result['status'] ?? 'processing',
                    'payment_method' => $paymentMethod
                ];

                if ($paymentMethod === 'direct') {
                    $responseData['transaction_id'] = $result['transaction_id'] ?? null;
                    $responseData['message'] = $result['message'] ?? 'Transaction initiée';
                } else {
                    $responseData['payment_url'] = $result['payment_url'];
                    $responseData['payment_methods'] = $this->monetbilService->getPaymentMethods();
                }

                return response()->json([
                    'success' => true,
                    'message' => $paymentMethod === 'direct' ? 'Transaction SMS initiée' : 'Paiement initié avec succès',
                    'data' => $responseData
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
                        
                        // Envoyer notification à tous les utilisateurs
                        $this->sendPromotionalNotification($payment->announcement, $payment->user);
                    }
                    break;

                case 'meeting':
                    // Actions spécifiques aux réunions
                    break;

                case 'campus_love':
                    // Activer l'accès à CampusLove pour l'utilisateur
                    if ($payment->user) {
                        $payment->user->update([
                            'campus_love_access' => true,
                            'campus_love_activated_at' => now()
                        ]);
                        Log::info('Accès CampusLove activé pour utilisateur: ' . $payment->user->id);
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
     * Envoyer une notification pour une annonce promotionnelle
     */
    private function sendPromotionalNotification($announcement, $user)
    {
        try {
            $response = Http::post(url('/api/v1/notifications/broadcast'), [
                'title' => '🌟 Nouvelle annonce promotionnelle !',
                'message' => "{$user->name} a publié une nouvelle annonce promotionnelle : \"{$announcement->title}\"",
                'type' => 'promotional_announcement',
                'data' => [
                    'announcement_id' => $announcement->id,
                    'announcement_title' => $announcement->title,
                    'announcement_type' => $announcement->type,
                    'price' => $announcement->price,
                    'location' => $announcement->location,
                    'user_name' => $user->name
                ]
            ]);
            
            if ($response->successful()) {
                Log::info('Notification promotionnelle envoyée avec succès', [
                    'announcement_id' => $announcement->id,
                    'user_id' => $user->id
                ]);
            } else {
                Log::error('Erreur envoi notification promotionnelle', [
                    'response' => $response->body()
                ]);
            }
            
        } catch (\Exception $e) {
            Log::error('Erreur envoi notification promotionnelle: ' . $e->getMessage());
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
     * Initier un paiement pour l'accès à CampusLove (approche GitHub)
     */
    public function initiateCampusLovePaymentGitHub(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'phone' => 'required|string|min:8',
                'email' => 'required|email'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            
            // Vérifier si l'utilisateur a déjà accès à CampusLove
            if ($user && $user->campus_love_access) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà accès à CampusLove'
                ], 400);
            }

            // Utiliser la nouvelle méthode GitHub style
            $params = [
                'phone' => $request->phone,
                'email' => $request->email,
                'user_id' => $user->id,
                'first_name' => explode(' ', $user->name)[0] ?? $user->name,
                'last_name' => explode(' ', $user->name)[1] ?? '',
            ];

            $result = $this->monetbilService->initiateCampusLovePayment($params);

            if ($result['success']) {
                // Créer l'enregistrement de paiement
                $payment = Payment::create([
                    'user_id' => $user->id,
                    'payment_ref' => $result['payment_ref'],
                    'amount' => $result['amount'],
                    'currency' => $result['currency'],
                    'type' => 'campus_love',
                    'status' => 'pending',
                    'phone' => $result['phone'],
                    'email' => $request->email,
                    'notes' => 'Accès CampusLove - Style GitHub',
                    'monetbil_data' => $result
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Paiement initié selon l\'approche GitHub',
                    'data' => [
                        'payment_id' => $payment->id,
                        'payment_ref' => $result['payment_ref'],
                        'payment_url' => $result['payment_url'],
                        'amount' => $result['amount'],
                        'currency' => $result['currency'],
                        'phone' => $result['phone']
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'initiation du paiement',
                    'error' => $result['error']
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Erreur initiation paiement CampusLove GitHub: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement CampusLove'
            ], 500);
        }
    }

    /**
     * Initier un paiement pour l'accès à CampusLove
     */
    public function initiateCampusLovePayment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'phone' => 'required|string|min:8'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            
            // Vérifier si l'utilisateur a déjà accès à CampusLove
            if ($user && $user->campus_love_access) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà accès à CampusLove'
                ], 400);
            }

            // Définir le montant fixe pour CampusLove (méthode widget seulement)
            $request->merge([
                'type' => 'campus_love',
                'amount' => 2000, // 2000 FCFA
                'email' => $user->email ?? $request->email,
                'phone' => $request->phone,
            ]);

            return $this->initiatePayment($request);

        } catch (\Exception $e) {
            Log::error('Erreur initiation paiement CampusLove: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement CampusLove'
            ], 500);
        }
    }


    /**
     * Vérifier manuellement le statut d'un paiement
     */
    public function checkPaymentStatus(Request $request, $paymentId)
    {
        try {
            $payment = Payment::findOrFail($paymentId);
            
            // Vérifier que l'utilisateur est autorisé à voir ce paiement
            if (Auth::id() !== $payment->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé'
                ], 403);
            }

            // Si le paiement est déjà complété, retourner le statut actuel
            if ($payment->status === 'completed') {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'payment_id' => $payment->id,
                        'status' => $payment->status,
                        'message' => 'Paiement déjà validé'
                    ]
                ]);
            }

            // Vérifier le statut via l'API Monetbil
            $result = $this->monetbilService->checkPaymentStatus($payment->payment_ref);
            
            if ($result['success']) {
                $apiStatus = $result['status'];
                
                // Mettre à jour le statut local si nécessaire
                if ($apiStatus === 'success' || $apiStatus === '1' || $apiStatus === 1) {
                    $payment->markAsCompleted($result['transaction_id']);
                    $this->processPostPaymentActions($payment);
                    
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'payment_id' => $payment->id,
                            'status' => 'completed',
                            'message' => 'Paiement validé avec succès'
                        ]
                    ]);
                } elseif ($apiStatus === 'failed' || $apiStatus === 'cancelled') {
                    $payment->markAsFailed('Paiement échoué ou annulé');
                    
                    return response()->json([
                        'success' => false,
                        'data' => [
                            'payment_id' => $payment->id,
                            'status' => 'failed',
                            'message' => 'Paiement échoué ou annulé'
                        ]
                    ]);
                } else {
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'payment_id' => $payment->id,
                            'status' => 'pending',
                            'message' => 'Paiement en cours de traitement'
                        ]
                    ]);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de vérifier le statut du paiement',
                    'error' => $result['error']
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Erreur vérification paiement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification du paiement'
            ], 500);
        }
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
                'message' => 'Paiement réussi !',
                'data' => [
                    'payment_id' => $payment->id,
                    'payment_ref' => $payment->payment_ref,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
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