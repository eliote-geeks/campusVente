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
            size="lg" 
            centered 
            className="payment-modal"
            backdrop="static"
        >
            <Modal.Header closeButton className="payment-header border-0">
                <Modal.Title className="payment-title d-flex align-items-center">
                    <div className="payment-icon me-3">
                        <i className="fas fa-credit-card"></i>
                    </div>
                    <div>
                        <h4 className="mb-1">Paiement Sécurisé</h4>
                        <small className="text-muted">Propulsé par Monetbil</small>
                    </div>
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="payment-body">
                {error && (
                    <Alert variant="danger" className="payment-error animated fadeIn">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Erreur:</strong> {error}
                    </Alert>
                )}

                {/* Résumé du paiement */}
                <Card className="payment-summary mb-4 shadow-sm">
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                            <i className="fas fa-file-invoice-dollar payment-summary-icon me-3"></i>
                            <h6 className="fw-bold mb-0">Résumé du paiement</h6>
                        </div>
                        
                        <div className="payment-summary-item">
                            <span className="summary-label">Type de paiement</span>
                            <Badge bg="primary" className="summary-badge">{getPaymentTypeLabel(type)}</Badge>
                        </div>
                        
                        <div className="payment-summary-item">
                            <span className="summary-label">Montant à payer</span>
                            <div className="amount-display">
                                <span className="amount-value">{formatAmount(amount)}</span>
                            </div>
                        </div>
                        
                        <div className="security-notice">
                            <i className="fas fa-shield-alt me-2"></i>
                            <span>Paiement 100% sécurisé par Monetbil</span>
                        </div>
                    </Card.Body>
                </Card>

                {/* Méthodes de paiement disponibles */}
                <Card className="payment-methods mb-4 shadow-sm">
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                            <i className="fas fa-mobile-alt payment-methods-icon me-3"></i>
                            <h6 className="fw-bold mb-0">Méthodes de paiement acceptées</h6>
                        </div>
                        
                        <Row>
                            <Col md={6}>
                                <div className="payment-category">
                                    <h6 className="category-title">Mobile Money</h6>
                                    <div className="payment-options">
                                        {Object.entries(paymentMethods.mobile_money).map(([key, label]) => (
                                            <div key={key} className="payment-option">
                                                <i className="fas fa-mobile-alt me-2"></i>
                                                <span>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="payment-category">
                                    <h6 className="category-title">Cartes Bancaires</h6>
                                    <div className="payment-options">
                                        {Object.entries(paymentMethods.bank).map(([key, label]) => (
                                            <div key={key} className="payment-option">
                                                <i className="fas fa-credit-card me-2"></i>
                                                <span>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Formulaire */}
                <Card className="payment-form shadow-sm">
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-4">
                            <i className="fas fa-user-edit payment-form-icon me-3"></i>
                            <h6 className="fw-bold mb-0">Informations de paiement</h6>
                        </div>
                        
                        <Form onSubmit={handlePayment}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-custom">
                                            <i className="fas fa-user me-2"></i>
                                            Prénom
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="first_name"
                                            value={paymentData.first_name}
                                            onChange={handleInputChange}
                                            placeholder="Votre prénom"
                                            disabled={loading}
                                            className="form-control-custom"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-custom">
                                            <i className="fas fa-user me-2"></i>
                                            Nom
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="last_name"
                                            value={paymentData.last_name}
                                            onChange={handleInputChange}
                                            placeholder="Votre nom"
                                            disabled={loading}
                                            className="form-control-custom"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                    
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-custom required">
                                            <i className="fas fa-mobile-alt me-2"></i>
                                            Numéro de téléphone
                                        </Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={paymentData.phone}
                                            onChange={handleInputChange}
                                            placeholder="ex: +237 6XX XXX XXX"
                                            required
                                            disabled={loading}
                                            className="form-control-custom"
                                        />
                                        <Form.Text className="form-text-custom">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Numéro pour Mobile Money
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-custom required">
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
                                            className="form-control-custom"
                                        />
                                        <Form.Text className="form-text-custom">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Pour la confirmation
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label className="form-label-custom">
                                    <i className="fas fa-sticky-note me-2"></i>
                                    Notes (optionnel)
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="notes"
                                    value={paymentData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Informations supplémentaires..."
                                    disabled={loading}
                                    className="form-control-custom"
                                />
                            </Form.Group>

                            {/* Informations importantes */}
                            <div className="payment-info-notice">
                                <div className="info-header">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <span>Informations importantes</span>
                                </div>
                                <ul className="info-list">
                                    <li>
                                        <i className="fas fa-external-link-alt me-2"></i>
                                        Redirection vers la page sécurisée Monetbil
                                    </li>
                                    <li>
                                        <i className="fas fa-bolt me-2"></i>
                                        Traitement en temps réel
                                    </li>
                                    <li>
                                        <i className="fas fa-envelope-check me-2"></i>
                                        Confirmation par email
                                    </li>
                                    <li>
                                        <i className="fas fa-headset me-2"></i>
                                        Support disponible 24/7
                                    </li>
                                </ul>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Modal.Body>

            <Modal.Footer className="payment-footer border-0">
                <div className="footer-actions w-100">
                    <Button 
                        variant="outline-secondary" 
                        onClick={onHide} 
                        disabled={loading}
                        className="cancel-btn"
                    >
                        <i className="fas fa-times me-2"></i>
                        Annuler
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={handlePayment}
                        disabled={loading || !paymentData.phone || !paymentData.email}
                        className="pay-btn"
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" animation="border" />
                                <span>Traitement en cours...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-credit-card me-2"></i>
                                <span>Payer {formatAmount(amount)}</span>
                            </>
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default PaymentModal;