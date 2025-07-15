<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class MonetbilService
{
    private $serviceKey;
    private $serviceSecret;
    private $baseUrl = 'https://api.monetbil.com';
    
    public function __construct()
    {
        $this->serviceKey = config('services.monetbil.service_key');
        $this->serviceSecret = config('services.monetbil.service_secret');
    }
    
    /**
     * Initier un paiement
     */
    public function initiatePayment($params)
    {
        try {
            $paymentData = [
                'service_key' => $this->serviceKey,
                'service_secret' => $this->serviceSecret,
                'amount' => $params['amount'],
                'currency' => $params['currency'] ?? 'XAF',
                'user' => $params['user_id'],
                'email' => $params['email'],
                'phone' => $params['phone'],
                'item_ref' => $params['item_ref'],
                'payment_ref' => $params['payment_ref'],
                'return_url' => $params['return_url'],
                'notify_url' => $params['notify_url'],
                'widget_version' => 'v2.1',
                'first_name' => $params['first_name'] ?? '',
                'last_name' => $params['last_name'] ?? '',
                'country' => $params['country'] ?? 'CM',
                'lang' => $params['lang'] ?? 'fr',
            ];
            
            // Générer l'URL de paiement
            $paymentUrl = $this->generatePaymentUrl($paymentData);
            
            return [
                'success' => true,
                'payment_url' => $paymentUrl,
                'payment_data' => $paymentData
            ];
            
        } catch (Exception $e) {
            Log::error('Erreur initiation paiement Monetbil: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Générer l'URL de paiement
     */
    private function generatePaymentUrl($data)
    {
        $queryParams = http_build_query($data);
        return "https://www.monetbil.com/widget/v2.1/?" . $queryParams;
    }
    
    /**
     * Vérifier le statut d'un paiement
     */
    public function checkPaymentStatus($paymentRef)
    {
        try {
            $response = Http::post($this->baseUrl . '/payment/status', [
                'service_key' => $this->serviceKey,
                'service_secret' => $this->serviceSecret,
                'payment_ref' => $paymentRef
            ]);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }
            
            return [
                'success' => false,
                'error' => 'Erreur lors de la vérification du statut'
            ];
            
        } catch (Exception $e) {
            Log::error('Erreur vérification statut Monetbil: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Traiter la notification de paiement
     */
    public function processNotification($data)
    {
        try {
            // Vérifier la signature
            if (!$this->verifySignature($data)) {
                return [
                    'success' => false,
                    'error' => 'Signature invalide'
                ];
            }
            
            return [
                'success' => true,
                'payment_status' => $data['payment_status'] ?? 'unknown',
                'transaction_id' => $data['transaction_id'] ?? null,
                'payment_ref' => $data['payment_ref'] ?? null,
                'amount' => $data['amount'] ?? null,
                'currency' => $data['currency'] ?? 'XAF',
                'user_id' => $data['user'] ?? null,
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
            ];
            
        } catch (Exception $e) {
            Log::error('Erreur traitement notification Monetbil: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Vérifier la signature de la notification
     */
    private function verifySignature($data)
    {
        // Implémentation de la vérification de signature selon la doc Monetbil
        // Pour le moment, on retourne true (à implémenter selon la doc officielle)
        return true;
    }
    
    /**
     * Obtenir les méthodes de paiement disponibles
     */
    public function getPaymentMethods()
    {
        return [
            'mobile_money' => [
                'mtn' => 'MTN Mobile Money',
                'orange' => 'Orange Money',
                'nextel' => 'Nextel Possa',
                'express_union' => 'Express Union Mobile',
                'yup' => 'YUP'
            ],
            'bank' => [
                'visa' => 'Visa',
                'mastercard' => 'Mastercard'
            ]
        ];
    }
    
    /**
     * Formater le montant pour l'affichage
     */
    public function formatAmount($amount, $currency = 'XAF')
    {
        return number_format($amount, 0, ',', ' ') . ' ' . $currency;
    }
    
    /**
     * Générer une référence de paiement unique
     */
    public function generatePaymentReference($prefix = 'CV')
    {
        return $prefix . '_' . time() . '_' . rand(1000, 9999);
    }
}