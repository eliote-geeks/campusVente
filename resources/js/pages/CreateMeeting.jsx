import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './CreateMeeting.css';

const CreateMeeting = () => {
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
        type: 'study_group',
        meeting_date: '',
        location: '',
        address: '',
        max_participants: '',
        price: '',
        is_free: true,
        is_online: false,
        online_link: '',
        requirements: '',
        contact_info: '',
        category_id: '',
        images: []
    });

    // Suggestions IA pour les types de rencontres
    const aiSuggestions = {
        study_group: [
            "Groupe d'étude Mathématiques - Préparation examen",
            "Session révision Physique - Mécanique quantique",
            "Groupe de travail Programmation - Projet de fin d'année",
            "Révision collective Droit constitutionnel"
        ],
        networking: [
            "Networking étudiants en informatique",
            "Rencontre professionnels du marketing digital",
            "Afterwork étudiants-entrepreneurs",
            "Meet-up développeurs web Yaoundé"
        ],
        party: [
            "Soirée de rentrée universitaire 2024",
            "Fête de fin d'examens - Célébration",
            "Soirée karaoké étudiants",
            "Pool party inter-universités"
        ],
        sport: [
            "Tournoi de football inter-facultés",
            "Match de basketball amical",
            "Course à pied matinale au campus",
            "Tournoi de tennis de table"
        ],
        cultural: [
            "Festival des cultures africaines",
            "Soirée poésie et musique",
            "Exposition d'art étudiant",
            "Concert de musique traditionnelle"
        ],
        conference: [
            "Conférence: IA et avenir technologique",
            "Séminaire entrepreneuriat étudiant",
            "Table ronde: Défis climatiques en Afrique",
            "Conférence carrières en ingénierie"
        ],
        workshop: [
            "Atelier création de CV professionnel",
            "Workshop développement personnel",
            "Formation premiers secours",
            "Atelier photographie pour débutants"
        ]
    };

    const quickFillExamples = {
        study_math: {
            title: "Groupe d'étude Mathématiques",
            description: "Session de révision intensive pour l'examen de mathématiques. Nous couvrirons les intégrales, dérivées et équations différentielles. Apportez vos calculatrices et exercices.",
            type: "study_group",
            meeting_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            location: "Bibliothèque universitaire",
            address: "Campus principal, Salle 205",
            max_participants: "15",
            price: "0",
            is_free: true,
            is_online: false,
            requirements: "Niveau L2 minimum en mathématiques"
        },
        party_welcome: {
            title: "Soirée de bienvenue étudiants",
            description: "Grande soirée pour accueillir les nouveaux étudiants et retrouver les anciens. Musique, boissons et ambiance garantie !",
            type: "party",
            meeting_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            location: "Bar Le Central",
            address: "Avenue Kennedy, Yaoundé",
            max_participants: "50",
            price: "5000",
            is_free: false,
            is_online: false,
            requirements: "Carte d'étudiant obligatoire"
        },
        workshop_cv: {
            title: "Atelier CV et entretien d'embauche",
            description: "Apprenez à créer un CV professionnel et à vous préparer pour vos entretiens d'embauche. Conseils pratiques et simulations incluses.",
            type: "workshop",
            meeting_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            location: "Centre de carrières ESSEC",
            address: "ESSEC Business School, Douala",
            max_participants: "25",
            price: "10000",
            is_free: false,
            is_online: false,
            requirements: "Apporter son CV actuel"
        },
        conference_ai: {
            title: "Conférence Intelligence Artificielle",
            description: "Découvrez les dernières avancées en IA et leur impact sur l'avenir professionnel. Conférence ouverte à tous avec session Q&A.",
            type: "conference",
            meeting_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            location: "Amphithéâtre 500",
            address: "École Polytechnique, Yaoundé",
            max_participants: "200",
            price: "0",
            is_free: true,
            is_online: true,
            online_link: "https://zoom.us/j/meeting",
            requirements: "Aucune"
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
        const requiredFields = ['title', 'description', 'type', 'meeting_date', 'location'];
        const completed = requiredFields.filter(field => formData[field] && formData[field].toString().trim() !== '').length;
        return Math.round((completed / requiredFields.length) * 100);
    };

    // Obtenir le statut de l'étape actuelle
    const getStepStatus = () => {
        const completion = getCompletionPercentage();
        if (completion < 40) return { step: 1, label: "Informations de base", color: "danger" };
        if (completion < 80) return { step: 2, label: "Détails", color: "warning" };
        return { step: 3, label: "Finalisation", color: "success" };
    };

    // Simulation d'IA pour génération automatique
    const generateAISuggestion = async () => {
        setAiSuggesting(true);
        
        setTimeout(() => {
            const suggestions = aiSuggestions[formData.type] || aiSuggestions.study_group;
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
                study_group: `Session d'étude collaborative pour ${formData.title.toLowerCase()}. Nous travaillerons ensemble sur les concepts difficiles et partagerons nos méthodes de révision. Apportez vos cours et questions !`,
                networking: `Rencontre networking pour ${formData.title.toLowerCase()}. Échangez avec des professionnels et étudiants de votre domaine. Opportunités de stage et d'emploi disponibles.`,
                party: `${formData.title} - Venez nombreux pour passer un excellent moment entre étudiants ! Ambiance détendue, musique et rafraîchissements au programme.`,
                sport: `Événement sportif: ${formData.title.toLowerCase()}. Ouvert à tous les niveaux. Matériel fourni. Inscription obligatoire pour des raisons d'assurance.`,
                cultural: `Événement culturel: ${formData.title.toLowerCase()}. Découvrez et célébrez la richesse de notre patrimoine culturel. Participation active encouragée.`,
                conference: `${formData.title} - Conférence enrichissante avec experts du domaine. Session de questions-réponses incluse. Certificat de participation disponible.`,
                workshop: `Atelier pratique: ${formData.title.toLowerCase()}. Formation hands-on avec exercices concrets. Matériel et supports fournis. Places limitées.`
            };
            
            setFormData(prev => ({
                ...prev,
                description: enhancements[prev.type] || enhancements.study_group
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
        
        // Auto-toggle is_free based on price
        if (name === 'price') {
            setFormData(prev => ({
                ...prev,
                price: value,
                is_free: !value || value === '0'
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation
        if (!formData.title || !formData.description || !formData.meeting_date || !formData.location) {
            setError('Tous les champs obligatoires doivent être remplis');
            setLoading(false);
            return;
        }

        // Validation de la date
        const meetingDate = new Date(formData.meeting_date);
        if (meetingDate <= new Date()) {
            setError('La date de la rencontre doit être dans le futur');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
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
                setSuccess('Rencontre créée avec succès ! Redirection en cours...');
                setTimeout(() => {
                    navigate('/meetings');
                }, 2000);
            } else {
                setError(data.message || 'Erreur lors de la création de la rencontre');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            setError('Erreur lors de la création de la rencontre');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'study_group',
            meeting_date: '',
            location: '',
            address: '',
            max_participants: '',
            price: '',
            is_free: true,
            is_online: false,
            online_link: '',
            requirements: '',
            contact_info: '',
            category_id: '',
            images: []
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
        <div className="create-meeting-container">
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        {/* Header avec progress */}
                        <div className="page-header animate-fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 className="page-title">🤝 Organiser une rencontre</h2>
                                    <p className="text-muted">Créez un événement pour rassembler la communauté étudiante</p>
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
                                        <h6 className="mb-1">🚀 Création rapide</h6>
                                        <small className="text-muted">Utilisez nos modèles pré-définis</small>
                                    </div>
                                    <div className="help-buttons">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            onClick={() => setShowQuickFill(!showQuickFill)}
                                            className="me-2"
                                        >
                                            ⚡ Modèles rapides
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
                                                    onClick={() => applyQuickFill('study_math')}
                                                >
                                                    📚 Groupe d'étude
                                                </Button>
                                                <Button 
                                                    variant="outline-info" 
                                                    size="sm" 
                                                    className="mb-2 w-100"
                                                    onClick={() => applyQuickFill('party_welcome')}
                                                >
                                                    🎉 Soirée étudiante
                                                </Button>
                                            </Col>
                                            <Col md={6}>
                                                <Button 
                                                    variant="outline-warning" 
                                                    size="sm" 
                                                    className="mb-2 w-100"
                                                    onClick={() => applyQuickFill('workshop_cv')}
                                                >
                                                    🔧 Atelier professionnel
                                                </Button>
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    className="mb-2 w-100"
                                                    onClick={() => applyQuickFill('conference_ai')}
                                                >
                                                    🎤 Conférence
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
                                                    Titre de la rencontre *
                                                    <OverlayTrigger
                                                        placement="right"
                                                        overlay={<Tooltip>Soyez descriptif et accrocheur</Tooltip>}
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
                                                        placeholder="Ex: Groupe d'étude Mathématiques - Préparation examen"
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
                                                <Form.Label className="form-label-enhanced">Type de rencontre *</Form.Label>
                                                <Form.Select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control-enhanced"
                                                >
                                                    <option value="study_group">📚 Groupe d'étude</option>
                                                    <option value="networking">🤝 Networking</option>
                                                    <option value="party">🎉 Soirée/Fête</option>
                                                    <option value="sport">⚽ Sport</option>
                                                    <option value="cultural">🎭 Culturel</option>
                                                    <option value="conference">🎤 Conférence</option>
                                                    <option value="workshop">🔧 Atelier</option>
                                                    <option value="other">📅 Autre</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">
                                                    Date et heure *
                                                    <OverlayTrigger
                                                        placement="right"
                                                        overlay={<Tooltip>La date doit être dans le futur</Tooltip>}
                                                    >
                                                        <span className="ms-2">📅</span>
                                                    </OverlayTrigger>
                                                </Form.Label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    name="meeting_date"
                                                    value={formData.meeting_date}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control-enhanced"
                                                    min={new Date().toISOString().slice(0, 16)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">Lieu *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="Ex: Bibliothèque universitaire"
                                                    required
                                                    className="form-control-enhanced"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">Adresse complète</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Ex: Campus principal, Salle 205"
                                                    className="form-control-enhanced"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">Catégorie</Form.Label>
                                                <Form.Select
                                                    name="category_id"
                                                    value={formData.category_id}
                                                    onChange={handleChange}
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
                                                <Form.Label className="form-label-enhanced">Participants maximum</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="max_participants"
                                                    value={formData.max_participants}
                                                    onChange={handleChange}
                                                    placeholder="Ex: 20 (laissez vide pour illimité)"
                                                    min="1"
                                                    className="form-control-enhanced"
                                                />
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
                                            placeholder="Décrivez votre rencontre en détail..."
                                            required
                                            className="form-control-enhanced"
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">Prix (FCFA)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="0 pour gratuit"
                                                    min="0"
                                                    className="form-control-enhanced"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3 form-group-enhanced">
                                                <Form.Label className="form-label-enhanced">Informations de contact</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="contact_info"
                                                    value={formData.contact_info}
                                                    onChange={handleChange}
                                                    placeholder="Ex: WhatsApp: +237 123 456 789"
                                                    className="form-control-enhanced"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="form-label-enhanced">Prérequis/Exigences</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="requirements"
                                            value={formData.requirements}
                                            onChange={handleChange}
                                            placeholder="Ex: Niveau L2 minimum, carte d'étudiant requise..."
                                            className="form-control-enhanced"
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="is_online"
                                                    checked={formData.is_online}
                                                    onChange={handleChange}
                                                    label="💻 Rencontre en ligne"
                                                    className="form-check-enhanced"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            {formData.is_online && (
                                                <Form.Group className="mb-3 form-group-enhanced">
                                                    <Form.Label className="form-label-enhanced">Lien de la rencontre</Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        name="online_link"
                                                        value={formData.online_link}
                                                        onChange={handleChange}
                                                        placeholder="https://zoom.us/j/..."
                                                        className="form-control-enhanced"
                                                    />
                                                </Form.Group>
                                            )}
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
                                            ) : (
                                                '🚀 Créer la rencontre'
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CreateMeeting;