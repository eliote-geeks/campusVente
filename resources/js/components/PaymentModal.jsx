import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge, Card, Row, Col } from 'react-bootstrap';
import './PaymentModal.css';

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
        first_name: '',
        last_name: '',
        notes: ''
    });


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!paymentData.phone.trim() || !paymentData.email.trim()) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

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
                payment_method: 'widget',
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
                // Widget de paiement - redirection
                window.open(data.data.payment_url, '_blank');
                setLoading(false);
                
                // Afficher un message d'information
                setError('💻 Page de paiement ouverte. Veuillez finaliser votre paiement dans l\'onglet ouvert.');
                
                // Vérifier l'accès toutes les 15 secondes pendant 5 minutes
                const checkInterval = setInterval(async () => {
                    try {
                        const statusResponse = await fetch(`http://127.0.0.1:8000/api/v1/payment/${data.data.payment_id}/status`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json'
                            }
                        });
                        const statusData = await statusResponse.json();
                        
                        if (statusData.success && statusData.data.status === 'completed') {
                            clearInterval(checkInterval);
                            if (onPaymentSuccess) {
                                onPaymentSuccess(data.data);
                            }
                            onHide();
                        }
                    } catch (error) {
                        console.error('Erreur vérification paiement widget:', error);
                    }
                }, 15000);

                setTimeout(() => {
                    clearInterval(checkInterval);
                }, 300000);
            } else {
                setError(data.message || 'Erreur lors de l\'initiation du paiement');
                setLoading(false);
            }

        } catch (err) {
            console.error('Erreur paiement:', err);
            setError('Erreur lors du traitement du paiement: ' + err.message);
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
        <Modal 
            show={show} 
            onHide={onHide} 
            centered 
            className="payment-modal"
            backdrop="static"
        >
            <Modal.Header closeButton className="payment-header border-0">
                <Modal.Title className="payment-title text-center w-100">
                    <div className="payment-icon mx-auto mb-2">
                        <i className="fas fa-credit-card"></i>
                    </div>
                    <h5 className="mb-1">Paiement Sécurisé</h5>
                    <small className="text-muted d-block">{formatAmount(amount)} - {getPaymentTypeLabel(type)}</small>
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="payment-body">
                {error && (
                    <Alert 
                        variant={error.includes('✅') || error.includes('💻') ? 'info' : 'danger'} 
                        className="payment-error animated fadeIn mb-3"
                        dismissible 
                        onClose={() => setError('')}
                    >
                        <i className={`fas ${error.includes('✅') || error.includes('💻') ? 'fa-info-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                        {error}
                    </Alert>
                )}

                        
                <Form onSubmit={handlePayment} className="payment-form-simple">
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label-simple required">
                                    <i className="fas fa-mobile-alt me-2"></i>
                                    Téléphone
                                </Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={paymentData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Ex: 677123456"
                                    required
                                    disabled={loading}
                                    className="form-control-simple"
                                />
                                <Form.Text className="text-muted">
                                    Numéro pour le paiement mobile
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label-simple required">
                                    <i className="fas fa-envelope me-2"></i>
                                    Email
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={paymentData.email}
                                    onChange={handleInputChange}
                                    placeholder="votre@email.com"
                                    required
                                    disabled={loading}
                                    className="form-control-simple"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer className="payment-footer-simple border-0">
                <div className="d-flex gap-2 w-100">
                    <Button 
                        variant="outline-secondary" 
                        onClick={onHide} 
                        disabled={loading}
                        className="flex-fill"
                    >
                        Annuler
                    </Button>
                    
                    
                    <Button 
                        variant="primary" 
                        onClick={handlePayment}
                        disabled={loading || !paymentData.phone || !paymentData.email}
                        className="flex-fill pay-btn-simple"
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" animation="border" />
                                Traitement...
                            </>
                        ) : (
                            <>
                                💻 <i className="fas fa-credit-card me-2"></i>
                                Payer {formatAmount(amount)}
                            </>
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default PaymentModal;