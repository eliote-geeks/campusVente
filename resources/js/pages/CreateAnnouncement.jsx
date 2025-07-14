import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, ProgressBar, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import MediaUpload from '../components/MediaUpload.jsx';
import './CreateAnnouncement.css';

const CreateAnnouncement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [aiSuggesting, setAiSuggesting] = useState(false);
    const [showQuickFill, setShowQuickFill] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        type: 'sell',
        location: '',
        phone: '',
        category_id: '',
        is_urgent: false,
        is_promotional: false,
        images: [],
        media: []
    });

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Simulation d'IA pour suggestions
    const aiSuggestions = {
        sell: [
            "iPhone 13 Pro Max 256GB en excellent état, avec accessoires",
            "MacBook Pro 2021 M1 8GB RAM parfait pour étudiants",
            "Vélo de ville tout équipé pour déplacements campus",
            "Livres de médecine 2ème année très bon état"
        ],
        service: [
            "Cours particuliers de mathématiques tous niveaux",
            "Aide aux devoirs et préparation examens",
            "Traduction français-anglais documents",
            "Création de sites web pour étudiants"
        ],
        buy: [
            "Recherche colocation proche campus universitaire",
            "Achat urgent: livre de droit constitutionnel",
            "Cherche vélo d'occasion bon marché",
            "Recherche iPhone d'occasion bon état"
        ],
        exchange: [
            "Échange livre de chimie contre livre de physique",
            "Troc: cours d'anglais contre cours de maths",
            "Échange place parking contre aide informatique",
            "Échange vêtements taille M contre taille L"
        ]
    };

    const quickFillExamples = {
        sell_phone: {
            title: "iPhone 13 Pro Max 256GB",
            description: "iPhone 13 Pro Max 256GB en excellent état. Couleur bleu sierra. Aucune rayure, toujours sous protection. Vendu avec chargeur original, écouteurs et boîte.",
            price: "850000",
            type: "sell",
            location: "Yaoundé",
            phone: "+237 690 123 456",
            category_id: "1",
            is_urgent: false
        },
        sell_laptop: {
            title: "MacBook Pro 2021 M1",
            description: "MacBook Pro 2021 avec processeur M1. 8GB RAM, 256GB SSD. Parfait pour les étudiants en informatique. Très bon état, utilisé avec précaution.",
            price: "1200000",
            type: "sell",
            location: "Douala",
            phone: "+237 655 789 012",
            category_id: "1",
            is_urgent: false
        },
        service_tutoring: {
            title: "Cours particuliers de Mathématiques",
            description: "Professeur expérimenté donne cours particuliers de mathématiques pour tous niveaux. Préparation aux examens, aide aux devoirs. Méthodes adaptées à chaque élève.",
            price: "15000",
            type: "service",
            location: "Yaoundé",
            phone: "+237 612 456 789",
            category_id: "3",
            is_urgent: false
        },
        buy_housing: {
            title: "Recherche colocation",
            description: "Étudiant sérieux recherche colocation près du campus. Budget max 100000 FCFA/mois. Non-fumeur, calme et respectueux. Références disponibles.",
            price: "100000",
            type: "buy",
            location: "Yaoundé",
            phone: "+237 677 345 678",
            category_id: "2",
            is_urgent: true
        }
    };

    // Charger les catégories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/categories');
                const data = await response.json();
                if (data.success) {
                    setCategories(data.data.filter(cat => cat.is_active));
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Calculer le pourcentage de completion
    const getCompletionPercentage = () => {
        const fields = ['title', 'description', 'price', 'type', 'location', 'category_id'];
        const completed = fields.filter(field => formData[field] && formData[field].toString().trim() !== '').length;
        return Math.round((completed / fields.length) * 100);
    };

    // Obtenir le statut de l'étape actuelle
    const getStepStatus = () => {
        const completion = getCompletionPercentage();
        if (completion < 30) return { step: 1, label: "Informations de base", color: "danger" };
        if (completion < 70) return { step: 2, label: "Détails", color: "warning" };
        return { step: 3, label: "Finalisation", color: "success" };
    };

    // Simulation d'IA pour génération automatique
    const generateAISuggestion = async () => {
        setAiSuggesting(true);
        
        // Simulation d'appel API
        setTimeout(() => {
            const suggestions = aiSuggestions[formData.type] || aiSuggestions.sell;
            const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            
            setFormData(prev => ({
                ...prev,
                title: randomSuggestion
            }));
            
            setAiSuggesting(false);
        }, 1500);
    };

    // Améliorer la description avec l'IA
    const enhanceDescription = async () => {
        if (!formData.title) return;
        
        setAiSuggesting(true);
        
        setTimeout(() => {
            const enhancements = {
                sell: `${formData.title} en excellent état. Produit très bien entretenu et fonctionnel. Vendu pour cause de déménagement/upgrade. Possibilité de voir l'article avant achat. Prix négociable pour achat immédiat.`,
                service: `Service de ${formData.title.toLowerCase()}. Professionnel expérimenté avec de nombreuses références. Méthodes adaptées à chaque besoin. Disponibilité flexible selon vos horaires.`,
                buy: `Recherche ${formData.title.toLowerCase()}. Étudiant sérieux avec budget défini. Paiement immédiat possible. Merci de me contacter si vous avez ce que je recherche.`,
                exchange: `Proposition d'échange: ${formData.title.toLowerCase()}. Échange équitable entre étudiants. Possibilité de voir les articles avant l'échange. Contact par message privé.`
            };
            
            setFormData(prev => ({
                ...prev,
                description: enhancements[prev.type] || enhancements.sell
            }));
            
            setAiSuggesting(false);
        }, 2000);
    };

    const applyQuickFill = (example) => {
        setFormData(quickFillExamples[example]);
        setShowQuickFill(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation basique
        if (!formData.title || !formData.description || !formData.price || !formData.category_id || !formData.location || !formData.phone) {
            setError('Tous les champs obligatoires doivent être remplis');
            return;
        }

        // Si c'est une annonce promotionnelle, ouvrir le modal de paiement
        if (formData.is_promotional) {
            setShowPaymentModal(true);
            return;
        }

        // Sinon, créer l'annonce directement
        await createAnnouncement();
    };

    const createAnnouncement = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Préparer FormData pour l'upload de fichiers
            const formDataToSend = new FormData();
            
            // Ajouter les champs de base
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('category_id', formData.category_id);
            formDataToSend.append('is_urgent', formData.is_urgent ? '1' : '0');
            formDataToSend.append('is_promotional', formData.is_promotional ? '1' : '0');
            
            // Ajouter les fichiers médias
            if (formData.media && formData.media.length > 0) {
                formData.media.forEach((mediaItem, index) => {
                    if (mediaItem.file) {
                        formDataToSend.append('media_files[]', mediaItem.file);
                    }
                });
            }

            // Récupérer le token d'authentification
            const token = localStorage.getItem('token');
            const headers = {
                'Accept': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://127.0.0.1:8000/api/v1/announcements-create-with-files', {
                method: 'POST',
                headers: headers,
                body: formDataToSend
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                setError('Erreur serveur: La réponse n\'est pas au format JSON');
                setLoading(false);
                return;
            }

            const data = await response.json();
            
            if (response.ok && data.success) {
                if (formData.is_promotional) {
                    setSuccess('Annonce promotionnelle créée avec succès ! Une notification a été envoyée à tous les utilisateurs. Redirection en cours...');
                } else {
                    setSuccess('Annonce créée avec succès ! Redirection en cours...');
                }
                setTimeout(() => {
                    navigate('/announcements');
                }, 2000);
            } else {
                setError(data.message || 'Erreur lors de la création de l\'annonce');
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            setError('Erreur lors de la création de l\'annonce');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setProcessingPayment(true);
        
        try {
            // Simulation du paiement - pour l'instant on valide tout automatiquement
            const token = localStorage.getItem('token');
            const paymentHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            
            if (token) {
                paymentHeaders['Authorization'] = `Bearer ${token}`;
            }

            const paymentResponse = await fetch('http://127.0.0.1:8000/api/v1/payments/promotional', {
                method: 'POST',
                headers: paymentHeaders,
                body: JSON.stringify({
                    amount: 500,
                    currency: 'FCFA',
                    type: 'promotional_announcement',
                    user_id: user.id
                })
            });

            // Pour l'instant, on considère que le paiement réussit toujours
            if (true) { // paymentResponse.ok
                setShowPaymentModal(false);
                // Créer l'annonce après le paiement réussi
                await createAnnouncement();
                
                // Envoyer une notification à tous les utilisateurs
                await sendNotificationToAllUsers();
            }
        } catch (error) {
            console.error('Erreur lors du paiement:', error);
            setError('Erreur lors du traitement du paiement');
        } finally {
            setProcessingPayment(false);
        }
    };

    const sendNotificationToAllUsers = async () => {
        try {
            await fetch('http://127.0.0.1:8000/api/v1/notifications/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    title: '🌟 Nouvelle annonce promotionnelle !',
                    message: `${user.name} a publié une nouvelle annonce promotionnelle : "${formData.title}"`,
                    type: 'promotional_announcement',
                    data: {
                        announcement_title: formData.title,
                        announcement_type: formData.type,
                        price: formData.price,
                        location: formData.location
                    }
                })
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi des notifications:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            type: 'sell',
            location: '',
            phone: '',
            category_id: '',
            is_urgent: false,
            is_promotional: false,
            images: [],
            media: []
        });
        setError('');
        setSuccess('');
    };

    if (loadingCategories) {
        return (
            <Container className="mt-5">
                <div className="text-center">
                    <Spinner animation="border" role="status" className="loading-spinner">
                        <span className="visually-hidden">Chargement...</span>
                    </Spinner>
                    <p className="mt-3 text-muted">Chargement des catégories...</p>
                </div>
            </Container>
        );
    }

    const stepStatus = getStepStatus();
    const completionPercentage = getCompletionPercentage();

    return (
        <div className="create-announcement-container">
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        {/* Header avec progress */}
                        <div className="page-header animate-fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 className="page-title">📢 Créer une nouvelle annonce</h2>
                                    <p className="text-muted">Partagez vos annonces avec la communauté étudiante</p>
                                </div>
                                <div className="progress-info">
                                    <Badge bg={stepStatus.color} className="mb-2">
                                        Étape {stepStatus.step}: {stepStatus.label}
                                    </Badge>
                                    <ProgressBar 
                                        now={completionPercentage} 
                                        variant={stepStatus.color}
                                        className="progress-bar-custom"
                                        style={{ width: '150px' }}
                                    />
                                    <small className="text-muted">{completionPercentage}% complété</small>
                                </div>
                            </div>
                        </div>

                        {/* Boutons d'aide rapide */}
                        <Card className="mb-4 help-card animate-slide-up">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-1">🚀 Accélérez votre saisie</h6>
                                        <small className="text-muted">Utilisez nos outils intelligents</small>
                                    </div>
                                    <div className="help-buttons">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            onClick={() => setShowQuickFill(!showQuickFill)}
                                            className="me-2"
                                        >
                                            ⚡ Exemples rapides
                                        </Button>
                                        <Button 
                                            variant="outline-success" 
                                            size="sm" 
                                            onClick={generateAISuggestion}
                                            disabled={aiSuggesting}
                                        >
                                            {aiSuggesting ? (
                                                <><Spinner size="sm" className="me-1" /> IA...</>
                                            ) : (
                                                '🤖 Titre IA'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Exemples rapides */}
                                {showQuickFill && (
                                    <div className="quick-fill-examples mt-3 animate-expand">
                                        <Row>
                                            <Col md={6}>
                                                <Button 
                                                    variant="outline-info" 
                                                    size="sm" 
                                                    className="mb-2 w-100"
                                                    onClick={() => applyQuickFill('sell_phone')}
                                                >
                                                    📱 Vendre iPhone
                                                </Button>
                                                <Button 
                                                    variant="outline-info" 
                                                    size="sm" 
                                                    className="mb-2 w-100"
                                                    onClick={() => applyQuickFill('sell_laptop')}
                                                >
                                                    💻 Vendre MacBook
                                                </Button>
                                            </Col>
                                            <Col md={6}>
                                                <Button 
                                                    variant="outline-warning" 
                                                    size="sm" 
                                                    className="mb-2 w-100"
                                                    onClick={() => applyQuickFill('service_tutoring')}
                                                >
                                                    📚 Cours particuliers
                                                </Button>
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    className="mb-2 w-100"
                                                    onClick={() => applyQuickFill('buy_housing')}
                                                >
                                                    🏠 Recherche logement
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Formulaire principal */}
                        <Card className="shadow-sm main-form-card animate-slide-up">
                            <Card.Body>
                                {error && (
                                    <Alert variant="danger" dismissible onClose={() => setError('')} className="animate-shake">
                                        {error}
                                    </Alert>
                                )}
                                
                                {success && (
                                    <Alert variant="success" dismissible onClose={() => setSuccess('')} className="animate-bounce">
                                        {success}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">
                                                    Titre de l'annonce *
                                                    <OverlayTrigger
                                                        placement="right"
                                                        overlay={<Tooltip>Soyez précis et accrocheur</Tooltip>}
                                                    >
                                                        <span className="ms-2">ℹ️</span>
                                                    </OverlayTrigger>
                                                </Form.Label>
                                                <div className="input-with-ai">
                                                    <Form.Control
                                                        type="text"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        placeholder="Ex: iPhone 13 Pro Max en excellent état"
                                                        required
                                                        className="form-control-enhanced"
                                                    />
                                                    <Button 
                                                        variant="outline-success" 
                                                        size="sm" 
                                                        className="ai-button"
                                                        onClick={generateAISuggestion}
                                                        disabled={aiSuggesting}
                                                    >
                                                        🤖
                                                    </Button>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">Type d'annonce *</Form.Label>
                                                <Form.Select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control-enhanced"
                                                >
                                                    <option value="sell">🛒 Vendre</option>
                                                    <option value="buy">🔍 Acheter</option>
                                                    <option value="service">🛠️ Service</option>
                                                    <option value="exchange">🔄 Échange</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">
                                                    Prix (FCFA) *
                                                    <OverlayTrigger
                                                        placement="right"
                                                        overlay={<Tooltip>Indiquez un prix réaliste</Tooltip>}
                                                    >
                                                        <span className="ms-2">💰</span>
                                                    </OverlayTrigger>
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="Ex: 150000"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                    className="form-control-enhanced"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">Catégorie *</Form.Label>
                                                <Form.Select
                                                    name="category_id"
                                                    value={formData.category_id}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control-enhanced"
                                                >
                                                    <option value="">Choisir une catégorie</option>
                                                    {categories.map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.icon} {category.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">Localisation *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="Ex: Yaoundé, Douala..."
                                                    required
                                                    className="form-control-enhanced"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">
                                                    Numéro de téléphone *
                                                    <OverlayTrigger
                                                        placement="right"
                                                        overlay={<Tooltip>Numéro pour contact WhatsApp</Tooltip>}
                                                    >
                                                        <span className="ms-2">📱</span>
                                                    </OverlayTrigger>
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="Ex: +237 690 123 456"
                                                    required
                                                    className="form-control-enhanced"
                                                />
                                                <Form.Text className="text-muted">
                                                    Ce numéro sera utilisé pour les contacts WhatsApp
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-enhanced">
                                            Description *
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="ms-2"
                                                onClick={enhanceDescription}
                                                disabled={aiSuggesting || !formData.title}
                                            >
                                                {aiSuggesting ? (
                                                    <><Spinner size="sm" className="me-1" /> IA...</>
                                                ) : (
                                                    '✨ Améliorer avec IA'
                                                )}
                                            </Button>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Décrivez votre annonce en détail..."
                                            required
                                            className="form-control-enhanced"
                                        />
                                    </Form.Group>

                                    {/* Upload de médias */}
                                    <MediaUpload
                                        media={formData.media}
                                        onMediaChange={(newMedia) => setFormData(prev => ({ ...prev, media: newMedia }))}
                                        maxFiles={8}
                                    />

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="is_urgent"
                                                    checked={formData.is_urgent}
                                                    onChange={handleChange}
                                                    label="🚨 Annonce urgente"
                                                    className="form-check-enhanced"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="is_promotional"
                                                    checked={formData.is_promotional}
                                                    onChange={handleChange}
                                                    label="🌟 Annonce promotionnelle (+500 FCFA)"
                                                    className="form-check-enhanced"
                                                />
                                                <Form.Text className="text-muted">
                                                    Les annonces promotionnelles sont mises en avant et une notification est envoyée à tous les utilisateurs
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <div className="form-actions">
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={resetForm}
                                            disabled={loading}
                                            className="me-3"
                                        >
                                            🔄 Réinitialiser
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                            disabled={loading || completionPercentage < 100}
                                            className="submit-button"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Création...
                                                </>
                                            ) : formData.is_promotional ? (
                                                '💳 Payer et créer l\'annonce (500 FCFA)'
                                            ) : (
                                                '🚀 Créer l\'annonce'
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Modal de paiement pour annonce promotionnelle */}
                        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>💳 Paiement Annonce Promotionnelle</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="text-center">
                                    <div className="mb-4">
                                        <h4 className="text-primary">🌟 Annonce Promotionnelle</h4>
                                        <p className="text-muted">
                                            Votre annonce sera mise en avant et une notification sera envoyée à tous les utilisateurs de la plateforme.
                                        </p>
                                    </div>

                                    <Card className="border-primary mb-4">
                                        <Card.Body>
                                            <h6 className="fw-bold mb-3">Résumé de votre annonce :</h6>
                                            <div className="text-start">
                                                <p><strong>Titre :</strong> {formData.title}</p>
                                                <p><strong>Prix :</strong> {formData.price} FCFA</p>
                                                <p><strong>Localisation :</strong> {formData.location}</p>
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    <div className="payment-details">
                                        <Row className="align-items-center justify-content-center">
                                            <Col md={8}>
                                                <div className="d-flex justify-content-between border-top pt-3">
                                                    <span>Frais de promotion :</span>
                                                    <strong className="text-primary">500 FCFA</strong>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <Alert variant="info" className="mt-3">
                                        <small>
                                            <strong>📢 Avantages :</strong> Votre annonce apparaîtra en première position, 
                                            aura un badge spécial "Promotionnelle" et tous les utilisateurs recevront une notification.
                                        </small>
                                    </Alert>

                                    <Alert variant="success" className="mt-2">
                                        <small>
                                            <strong>✅ Paiement automatique :</strong> Pour le moment, tous les paiements sont validés automatiquement à des fins de test.
                                        </small>
                                    </Alert>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowPaymentModal(false)} disabled={processingPayment}>
                                    Annuler
                                </Button>
                                <Button 
                                    variant="primary" 
                                    onClick={handlePayment}
                                    disabled={processingPayment}
                                >
                                    {processingPayment ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Traitement...
                                        </>
                                    ) : (
                                        '💳 Confirmer le paiement (500 FCFA)'
                                    )}
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CreateAnnouncement;