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
                // Utiliser le widget Monetbil v2
                if (typeof window.monetbil !== 'undefined') {
                    window.monetbil.launch({
                        amount: amount,
                        phone: paymentData.phone,
                        email: paymentData.email,
                        item_ref: data.data.payment_ref,
                        payment_ref: data.data.payment_ref,
                        user: data.data.user_id,
                        first_name: paymentData.first_name || '',
                        last_name: paymentData.last_name || '',
                        return_url: `${window.location.origin}/payment-success`,
                        notify_url: `${window.location.origin}/api/v1/payments/webhook`,
                        custom_data: JSON.stringify({
                            type: type,
                            announcement_id: announcementId,
                            meeting_id: meetingId
                        })
                    });
                } else {
                    // Fallback vers l'ancien système
                    window.open(data.data.payment_url, '_blank');
                }
                
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
                    <Alert variant="danger" className="payment-error animated fadeIn mb-3">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                )}

                <div className="payment-methods-summary mb-3">
                    <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                        <div className="payment-method-item">
                            <i className="fas fa-mobile-alt"></i>
                            <span>Mobile Money</span>
                        </div>
                        <div className="payment-method-item">
                            <i className="fas fa-credit-card"></i>
                            <span>Cartes</span>
                        </div>
                        <div className="security-badge">
                            <i className="fas fa-shield-alt"></i>
                            <span>Sécurisé</span>
                        </div>
                    </div>
                </div>
                        
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
                                <i className="fas fa-credit-card me-2"></i>
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