import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Alert, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Heart, MessageCircle, Camera, BarChart3 } from 'lucide-react';
import { api } from '../services/api.js';

const CampusLoveAccessGitHub = ({ show, onHide, onAccessGranted }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [accessInfo, setAccessInfo] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [error, setError] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneValid, setPhoneValid] = useState(true);
    const [emailValid, setEmailValid] = useState(true);
    const [accessChecked, setAccessChecked] = useState(false);

    useEffect(() => {
        if (show && !accessChecked) {
            checkAccess();
            getAccessInfo();
            setAccessChecked(true);
        }
    }, [show, accessChecked]);

    // Effet séparé pour l'auto-complétion de l'email
    useEffect(() => {
        if (show && user?.email && !email) {
            setEmail(user.email);
            setEmailValid(true);
        }
    }, [show, user?.email, email]);

    // Reset de l'état quand le modal se ferme
    useEffect(() => {
        if (!show) {
            setAccessChecked(false);
            setError('');
            setPaymentLoading(false);
        }
    }, [show]);

    // Validation du numéro de téléphone
    const validatePhone = (phoneNumber) => {
        const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        const isValid = cleanPhone.length >= 9 && 
                       (cleanPhone.startsWith('6') || cleanPhone.startsWith('2')) &&
                       cleanPhone.length <= 9;
        setPhoneValid(isValid);
        return isValid;
    };

    // Validation de l'email
    const validateEmail = (emailAddress) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(emailAddress);
        setEmailValid(isValid);
        return isValid;
    };

    const handlePhoneChange = (value) => {
        setPhone(value);
        validatePhone(value);
    };

    const handleEmailChange = (value) => {
        setEmail(value);
        validateEmail(value);
    };

    const checkAccess = async () => {
        try {
            setLoading(true);
            const response = await api.get('/campus-love/check-access');
            const newHasAccess = response.data.has_access;
            
            setHasAccess(newHasAccess);
            
            // Appeler onAccessGranted seulement si l'accès vient d'être accordé
            if (newHasAccess && !hasAccess && onAccessGranted) {
                setTimeout(() => onAccessGranted(), 100);
            }
        } catch (error) {
            console.error('Erreur vérification accès:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAccessInfo = async () => {
        try {
            const response = await api.get('/campus-love/access-info');
            setAccessInfo(response.data.data);
        } catch (error) {
            console.error('Erreur récupération info accès:', error);
        }
    };

    const initiateGitHubPayment = async () => {
        if (!phone.trim() || !email.trim()) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!phoneValid) {
            setError('Format de numéro de téléphone invalide');
            return;
        }

        if (!emailValid) {
            setError('Format d\'adresse email invalide');
            return;
        }

        try {
            setPaymentLoading(true);
            setError('');

            const response = await api.post('/payment/campus-love-github', {
                phone: phone.trim(),
                email: email.trim()
            });

            if (response.data.success) {
                // Ouvrir la page de paiement Monetbil selon l'approche GitHub
                window.open(response.data.data.payment_url, '_blank');
                setError('💻 Page de paiement ouverte. Finalisez votre paiement dans l\'onglet ouvert.');
                
                // Démarrer la vérification du statut
                startPaymentStatusCheck(response.data.data.payment_id);
            } else {
                setError(response.data.message || 'Erreur lors de l\'initiation du paiement');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors du paiement');
        } finally {
            setPaymentLoading(false);
        }
    };

    const startPaymentStatusCheck = (paymentId) => {
        // Vérifier le statut toutes les 15 secondes pendant 5 minutes
        const checkInterval = setInterval(async () => {
            try {
                const response = await api.get(`/payment/${paymentId}/status`);
                
                if (response.data.success && response.data.data.status === 'completed') {
                    clearInterval(checkInterval);
                    setPaymentLoading(false);
                    setHasAccess(true);
                    
                    if (onAccessGranted) {
                        onAccessGranted();
                    }
                    
                    // Afficher un message de succès
                    setError('✅ Paiement validé ! Accès à CampusLove activé.');
                    
                    // Fermer le modal après 2 secondes
                    setTimeout(() => {
                        onHide();
                    }, 2000);
                } else if (response.data.success === false && response.data.data?.status === 'failed') {
                    clearInterval(checkInterval);
                    setPaymentLoading(false);
                    setError('❌ Paiement échoué. Veuillez réessayer.');
                }
            } catch (error) {
                console.error('Erreur vérification paiement:', error);
            }
        }, 15000);

        // Arrêter la vérification après 5 minutes
        setTimeout(() => {
            clearInterval(checkInterval);
            setPaymentLoading(false);
        }, 300000);
    };

    if (loading) {
        return (
            <Modal show={show} onHide={onHide} centered size="lg">
                <Modal.Body className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Vérification de l'accès...</p>
                </Modal.Body>
            </Modal>
        );
    }

    if (hasAccess) {
        return (
            <Modal show={show} onHide={onHide} centered>
                <Modal.Body className="text-center p-4">
                    <CheckCircle size={64} className="text-success mb-3" />
                    <h4>Accès accordé !</h4>
                    <p>Vous avez déjà accès à CampusLove.</p>
                    <Button variant="success" onClick={onHide}>
                        Continuer
                    </Button>
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="w-100 text-center">
                    <span style={{ fontSize: '1.5rem' }}>💕 Accès à CampusLove</span>
                    <small className="d-block text-muted mt-1">Intégration GitHub Style</small>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert 
                        variant={error.includes('✅') || error.includes('💻') ? 'info' : 'danger'} 
                        dismissible 
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                <div className="text-center mb-4">
                    <h2 className="text-primary mb-2">
                        2000 FCFA
                    </h2>
                    <p className="text-muted">Accès à vie à CampusLove</p>
                </div>

                <Row className="mb-4">
                    <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                            <Heart size={20} className="text-primary me-2" />
                            <span style={{ fontSize: '0.9rem' }}>Profils illimités</span>
                        </div>
                    </Col>
                    <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                            <CheckCircle size={20} className="text-success me-2" />
                            <span style={{ fontSize: '0.9rem' }}>Matches garantis</span>
                        </div>
                    </Col>
                    <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                            <MessageCircle size={20} className="text-info me-2" />
                            <span style={{ fontSize: '0.9rem' }}>Chat privé</span>
                        </div>
                    </Col>
                    <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                            <Camera size={20} className="text-warning me-2" />
                            <span style={{ fontSize: '0.9rem' }}>Photos premium</span>
                        </div>
                    </Col>
                </Row>

                <Card className="border-info mb-4">
                    <Card.Body>
                        <h6 className="text-info mb-3">
                            🔧 Intégration selon les fichiers GitHub
                        </h6>
                        <Row>
                            <Col sm={6} className="mb-2">
                                <small className="text-muted">• API Monetbil v2.1</small>
                            </Col>
                            <Col sm={6} className="mb-2">
                                <small className="text-muted">• Mobile Money</small>
                            </Col>
                            <Col sm={6} className="mb-2">
                                <small className="text-muted">• Orange Money</small>
                            </Col>
                            <Col sm={6} className="mb-2">
                                <small className="text-muted">• MTN Money</small>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row>
                    <Col md={6} className="mb-3">
                        <Form.Label>
                            <strong>Numéro de téléphone *</strong>
                        </Form.Label>
                        <div className="input-group">
                            <span className="input-group-text">📱</span>
                            <Form.Control
                                type="tel"
                                className={phoneValid ? 'is-valid' : phone ? 'is-invalid' : ''}
                                placeholder="+237 6XX XX XX XX"
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                style={{ fontSize: '1rem', padding: '12px' }}
                            />
                            {phoneValid && phone && (
                                <span className="input-group-text text-success">✓</span>
                            )}
                        </div>
                        <Form.Text className={`text-${phoneValid || !phone ? 'muted' : 'danger'}`}>
                            {!phoneValid && phone ? 
                                'Format invalide (ex: 677123456)' :
                                'Numéro pour le paiement mobile'
                            }
                        </Form.Text>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Label>
                            <strong>Email *</strong>
                        </Form.Label>
                        <div className="input-group">
                            <span className="input-group-text">✉️</span>
                            <Form.Control
                                type="email"
                                className={emailValid ? 'is-valid' : email ? 'is-invalid' : ''}
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                style={{ fontSize: '1rem', padding: '12px' }}
                            />
                            {emailValid && email && (
                                <span className="input-group-text text-success">✓</span>
                            )}
                        </div>
                        <Form.Text className={`text-${emailValid || !email ? 'muted' : 'danger'}`}>
                            {!emailValid && email ? 
                                'Format email invalide' :
                                'Confirmation par email'
                            }
                        </Form.Text>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={onHide} disabled={paymentLoading}>
                    Annuler
                </Button>
                <Button 
                    variant="primary" 
                    onClick={initiateGitHubPayment}
                    disabled={paymentLoading || !phone.trim() || !email.trim() || !phoneValid || !emailValid}
                    style={{
                        background: 'linear-gradient(45deg, #28a745, #20c997)',
                        border: 'none',
                        padding: '10px 20px'
                    }}
                >
                    {paymentLoading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Vérification...
                        </>
                    ) : (
                        <>
                            🔧 Payer 2000 FCFA (GitHub Style)
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CampusLoveAccessGitHub;