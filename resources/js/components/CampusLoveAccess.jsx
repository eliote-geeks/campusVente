import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Heart, MessageCircle, Camera, BarChart3 } from 'lucide-react';
import { api } from '../services/api.js';

const CampusLoveAccess = ({ show, onHide, onAccessGranted }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [accessInfo, setAccessInfo] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [error, setError] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('widget');
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

    // Validation du numéro de téléphone en temps réel
    const validatePhone = (phoneNumber) => {
        // Nettoyer le numéro
        const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
        
        // Vérifier le format camerounais
        const isValid = cleanPhone.length >= 9 && 
                       (cleanPhone.startsWith('6') || cleanPhone.startsWith('2')) &&
                       cleanPhone.length <= 9;
        
        setPhoneValid(isValid);
        return isValid;
    };

    // Validation de l'email en temps réel
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
                setTimeout(() => onAccessGranted(), 100); // Délai pour éviter conflits
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

    const initiatePayment = async () => {
        // Validation avant envoi
        if (!phone.trim()) {
            setError('Veuillez entrer votre numéro de téléphone');
            return;
        }

        if (!email.trim()) {
            setError('Veuillez entrer votre adresse email');
            return;
        }

        if (!phoneValid) {
            setError('Format de numéro de téléphone invalide. Utilisez un numéro camerounais valide.');
            return;
        }

        if (!emailValid) {
            setError('Format d\'adresse email invalide');
            return;
        }

        try {
            setPaymentLoading(true);
            setError('');

            const response = await api.post('/payment/campus-love', {
                phone: phone.trim(),
                email: email.trim(),
                payment_method: 'widget'
            });

            if (response.data.success) {
                // Widget de paiement - redirection
                window.open(response.data.data.payment_url, '_blank');
                onHide();
                
                // Vérifier l'accès toutes les 5 secondes pendant 2 minutes
                const checkInterval = setInterval(async () => {
                    try {
                        const accessResponse = await api.get('/campus-love/check-access');
                        if (accessResponse.data.has_access) {
                            clearInterval(checkInterval);
                            setHasAccess(true);
                            if (onAccessGranted) {
                                onAccessGranted();
                            }
                        }
                    } catch (error) {
                        console.error('Erreur vérification accès:', error);
                    }
                }, 5000);

                setTimeout(() => {
                    clearInterval(checkInterval);
                }, 120000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors du paiement');
            setPaymentLoading(false);
        }
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
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert 
                        variant={error.includes('✅') ? 'info' : 'danger'} 
                        dismissible 
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                <div className="text-center mb-4">
                    <h2 className="text-primary mb-2">
                        {accessInfo?.access_fee || 2000} {accessInfo?.currency || 'FCFA'}
                    </h2>
                    <p className="text-muted">{accessInfo?.description || 'Accès à vie à CampusLove'}</p>
                </div>

                <Row className="mb-4">
                    {accessInfo?.features?.map((feature, index) => (
                        <Col key={index} md={6} className="mb-3">
                            <div className="d-flex align-items-center">
                                {index === 0 && <Heart size={20} className="text-primary me-2" />}
                                {index === 1 && <CheckCircle size={20} className="text-success me-2" />}
                                {index === 2 && <MessageCircle size={20} className="text-info me-2" />}
                                {index === 3 && <Camera size={20} className="text-warning me-2" />}
                                {index === 4 && <Camera size={20} className="text-secondary me-2" />}
                                {index === 5 && <BarChart3 size={20} className="text-dark me-2" />}
                                <span style={{ fontSize: '0.9rem' }}>{feature}</span>
                            </div>
                        </Col>
                    ))}
                </Row>

                <Card className="border-primary mb-4">
                    <Card.Body>
                        <h6 className="text-primary mb-3">
                            💳 Méthodes de paiement acceptées
                        </h6>
                        <Row>
                            {accessInfo?.payment_methods?.map((method, index) => (
                                <Col key={index} sm={6} className="mb-2">
                                    <small className="text-muted">• {method}</small>
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-info mb-4">
                    <Card.Body>
                        <h6 className="text-info mb-3">
                            ℹ️ Processus de paiement
                        </h6>
                        <div className="small text-muted">
                            <ol className="mb-0">
                                <li>Saisissez vos informations de paiement</li>
                                <li>Redirection vers la page sécurisée Monetbil</li>
                                <li>Effectuez le paiement avec votre méthode préférée</li>
                                <li>Retour automatique et activation de l'accès</li>
                            </ol>
                        </div>
                    </Card.Body>
                </Card>


                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">
                            <strong>Numéro de téléphone *</strong>
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">📱</span>
                            <input
                                type="tel"
                                className={`form-control ${phoneValid ? 'is-valid' : phone ? 'is-invalid' : ''}`}
                                placeholder="+237 6XX XX XX XX"
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                style={{ fontSize: '1rem', padding: '12px' }}
                            />
                            {phoneValid && phone && (
                                <span className="input-group-text text-success">
                                    ✓
                                </span>
                            )}
                        </div>
                        <small className={`text-${phoneValid || !phone ? 'muted' : 'danger'}`}>
                            {!phoneValid && phone ? 
                                'Numéro invalide. Format attendu: 6XXXXXXXX ou 2XXXXXXXX' :
                                'Numéro pour le paiement mobile'
                            }
                        </small>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                        <label className="form-label">
                            <strong>Adresse email *</strong>
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">✉️</span>
                            <input
                                type="email"
                                className={`form-control ${emailValid ? 'is-valid' : email ? 'is-invalid' : ''}`}
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                style={{ fontSize: '1rem', padding: '12px' }}
                            />
                            {emailValid && email && (
                                <span className="input-group-text text-success">
                                    ✓
                                </span>
                            )}
                        </div>
                        <small className={`text-${emailValid || !email ? 'muted' : 'danger'}`}>
                            {!emailValid && email ? 
                                'Format email invalide' :
                                'Confirmation et reçu par email'
                            }
                        </small>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={onHide} disabled={paymentLoading}>
                    Annuler
                </Button>
                
                
                <Button 
                    variant="primary" 
                    onClick={initiatePayment}
                    disabled={paymentLoading || !phone.trim() || !email.trim() || !phoneValid || !emailValid}
                    style={{
                        background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                        border: 'none',
                        padding: '10px 20px'
                    }}
                >
                    {paymentLoading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Traitement...
                        </>
                    ) : (
                        <>
                            💻 Payer {accessInfo?.access_fee || 2000} {accessInfo?.currency || 'FCFA'}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CampusLoveAccess;