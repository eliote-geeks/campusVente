import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';

const PaymentModal = ({ 
    show, 
    onHide, 
    amount, 
    type = 'promotional', 
    announcementId = null, 
    meetingId = null, 
    onPaymentSuccess = null 
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentData, setPaymentData] = useState({
        phone: '',
        email: '',
        notes: ''
    });

    const paymentMethods = {
        mobile_money: {
            mtn: 'MTN Mobile Money',
            orange: 'Orange Money',
            nextel: 'Nextel Possa',
            express_union: 'Express Union Mobile',
            yup: 'YUP'
        },
        bank: {
            visa: 'Visa',
            mastercard: 'Mastercard'
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            const paymentPayload = {
                amount,
                type,
                announcement_id: announcementId,
                meeting_id: meetingId,
                phone: paymentData.phone,
                email: paymentData.email,
                notes: paymentData.notes
            };

            const response = await fetch('http://127.0.0.1:8000/api/v1/payments/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(paymentPayload)
            });

            const data = await response.json();

            if (data.success) {
                // Rediriger vers la page de paiement Monetbil
                window.open(data.data.payment_url, '_blank');
                
                if (onPaymentSuccess) {
                    onPaymentSuccess(data.data);
                }
                
                onHide();
            } else {
                setError(data.message || 'Erreur lors de l\'initiation du paiement');
            }

        } catch (err) {
            console.error('Erreur paiement:', err);
            setError('Erreur lors du traitement du paiement: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
    };

    const getPaymentTypeLabel = (type) => {
        switch (type) {
            case 'promotional':
                return 'Promotion d\'annonce';
            case 'meeting':
                return 'Inscription à une réunion';
            case 'commission':
                return 'Commission';
            default:
                return 'Paiement';
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title>
                    💳 Paiement sécurisé avec Monetbil
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="mb-4">
                        <strong>Erreur:</strong> {error}
                    </Alert>
                )}

                {/* Résumé du paiement */}
                <div className="bg-light rounded p-4 mb-4">
                    <h6 className="fw-bold mb-3">📋 Résumé du paiement</h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Type:</span>
                        <Badge bg="primary">{getPaymentTypeLabel(type)}</Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Montant:</span>
                        <strong className="text-success">{formatAmount(amount)}</strong>
                    </div>
                    <small className="text-muted">
                        💡 Paiement sécurisé par Monetbil - Mobile Money et Cartes Bancaires acceptées
                    </small>
                </div>

                {/* Méthodes de paiement disponibles */}
                <div className="mb-4">
                    <h6 className="fw-bold mb-3">📱 Méthodes de paiement disponibles</h6>
                    
                    <div className="row">
                        <div className="col-md-6">
                            <h6 className="small text-muted mb-2">Mobile Money</h6>
                            {Object.entries(paymentMethods.mobile_money).map(([key, label]) => (
                                <div key={key} className="mb-1">
                                    <Badge variant="outline-primary" className="me-1">
                                        {label}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <div className="col-md-6">
                            <h6 className="small text-muted mb-2">Cartes Bancaires</h6>
                            {Object.entries(paymentMethods.bank).map(([key, label]) => (
                                <div key={key} className="mb-1">
                                    <Badge variant="outline-secondary" className="me-1">
                                        {label}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Formulaire */}
                <Form onSubmit={handlePayment}>
                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>📱 Numéro de téléphone *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={paymentData.phone}
                                    onChange={handleInputChange}
                                    placeholder="ex: +237 6XX XXX XXX"
                                    required
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted">
                                    Numéro pour Mobile Money
                                </Form.Text>
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>📧 Email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={paymentData.email}
                                    onChange={handleInputChange}
                                    placeholder="votre@email.com"
                                    required
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted">
                                    Pour la confirmation
                                </Form.Text>
                            </Form.Group>
                        </div>
                    </div>

                    <Form.Group className="mb-4">
                        <Form.Label>📝 Notes (optionnel)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="notes"
                            value={paymentData.notes}
                            onChange={handleInputChange}
                            placeholder="Informations supplémentaires..."
                            disabled={loading}
                        />
                    </Form.Group>

                    {/* Informations importantes */}
                    <div className="alert alert-info">
                        <h6 className="alert-heading mb-2">ℹ️ Informations importantes</h6>
                        <ul className="mb-0 small">
                            <li>Vous serez redirigé vers la page de paiement sécurisée Monetbil</li>
                            <li>Le paiement est traité en temps réel</li>
                            <li>Vous recevrez une confirmation par email</li>
                            <li>En cas de problème, contactez notre support</li>
                        </ul>
                    </div>
                </Form>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0">
                <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
                    Annuler
                </Button>
                <Button 
                    variant="success" 
                    onClick={handlePayment}
                    disabled={loading || !paymentData.phone || !paymentData.email}
                    className="d-flex align-items-center"
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Traitement...
                        </>
                    ) : (
                        <>
                            🚀 Payer {formatAmount(amount)}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PaymentModal;