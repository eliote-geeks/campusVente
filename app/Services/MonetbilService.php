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
     * Initier un paiement avec approche working basée sur les fichiers de référence
     */
    public function initiatePayment($params)
    {
        try {
            // Utiliser la configuration basée sur les fichiers qui fonctionnent
            $paymentData = [
                'amount' => $params['amount'],
                'phone' => $this->cleanPhoneNumber($params['phone']),
                'country' => $params['country'] ?? 'CM',
                'currency' => $params['currency'] ?? 'XAF',
                'item_ref' => $params['item_ref'],
                'payment_ref' => $params['payment_ref'],
                'user' => $params['user_id'],
                'first_name' => $params['first_name'] ?? '',
                'last_name' => $params['last_name'] ?? '',
                'email' => $params['email'],
                'return_url' => $params['return_url'],
                'notify_url' => $params['notify_url'],
                'lang' => $params['lang'] ?? 'fr'
            ];
            
            // Générer l'URL de paiement avec la méthode qui fonctionne
            $paymentUrl = $this->generateWorkingPaymentUrl($paymentData);
            
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
     * Nettoyer le numéro de téléphone pour Monetbil
     */
    private function cleanPhoneNumber($phone)
    {
        // Retirer tous les caractères non numériques
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        
        // Si le numéro commence par 237, le retirer
        if (substr($cleanPhone, 0, 3) === '237') {
            $cleanPhone = substr($cleanPhone, 3);
        }
        
        // Si le numéro commence par 0, le retirer
        if (substr($cleanPhone, 0, 1) === '0') {
            $cleanPhone = substr($cleanPhone, 1);
        }
        
        return $cleanPhone;
    }
    
    /**
     * Générer l'URL de paiement fonctionnelle basée sur les fichiers de référence
     */
    private function generateWorkingPaymentUrl($data)
    {
        // Utiliser l'approche qui fonctionne avec le service key simple
        $params = [
            'amount' => $data['amount'],
            'phone' => $data['phone'],
            'country' => $data['country'],
            'currency' => $data['currency'],
            'item_ref' => $data['item_ref'],
            'payment_ref' => $data['payment_ref'],
            'user' => $data['user'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'return_url' => $data['return_url'],
            'notify_url' => $data['notify_url'],
            'lang' => $data['lang']
        ];
        
        $queryString = http_build_query($params);
        return "https://www.monetbil.com/widget/v2.1/{$this->serviceKey}?" . $queryString;
    }
    
    /**
     * Générer l'URL de paiement (ancienne méthode)
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
     * Traiter la notification de paiement basée sur les fichiers de référence
     */
    public function processNotification($data)
    {
        try {
            Log::info('Données notification Monetbil reçues', $data);
            
            // Extraire les données essentielles selon les fichiers de référence
            $status = $data['status'] ?? $data['payment_status'] ?? 'unknown';
            $transactionId = $data['transaction_id'] ?? $data['transactionId'] ?? null;
            $paymentRef = $data['item_ref'] ?? $data['payment_ref'] ?? null;
            $amount = $data['amount'] ?? null;
            $phone = $data['phone'] ?? null;
            $email = $data['email'] ?? null;
            $user = $data['user'] ?? null;
            
            // Déterminer le statut du paiement
            $paymentStatus = 'failed';
            if ($status === 'success' || $status === '1' || $status === 1) {
                $paymentStatus = 'success';
            }
            
            return [
                'success' => true,
                'payment_status' => $paymentStatus,
                'transaction_id' => $transactionId,
                'payment_ref' => $paymentRef,
                'amount' => $amount,
                'currency' => $data['currency'] ?? 'XAF',
                'user_id' => $user,
                'phone' => $phone,
                'email' => $email,
                'raw_data' => $data
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