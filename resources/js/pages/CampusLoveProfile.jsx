import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import CampusLoveMediaUpload from '../components/CampusLoveMediaUpload.jsx';
import { User, Heart, Camera, Settings, BarChart3 } from 'lucide-react';

const CampusLoveProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');

    const [formData, setFormData] = useState({
        display_name: '',
        tagline: '',
        bio: '',
        about_me: '',
        looking_for_description: '',
        fun_facts: '',
        birth_date: '',
        gender: '',
        looking_for: '',
        city: '',
        region: '',
        university: '',
        study_level: '',
        field_of_study: '',
        occupation: '',
        min_age: 18,
        max_age: 30,
        interests: [],
        hobbies: [],
        music_preferences: [],
        movie_preferences: [],
        sport_activities: [],
        travel_places: [],
        languages: [],
        social_style: '',
        party_style: '',
        communication_style: '',
        pets: '',
        kids_future: '',
        fitness_level: '',
        diet_type: '',
        ideal_date_description: '',
        weekend_activities: [],
        favorite_quote: '',
        deal_breakers: [],
        relationship_goals: [],
        relationship_type: 'both',
        height: '',
        smoking: '',
        drinking: '',
        religion: '',
        show_age: true,
        show_distance: true,
        show_university: true,
        show_occupation: true,
        show_hobbies: true,
        show_music_taste: true,
        show_travel_history: true,
        is_active: true
    });

    useEffect(() => {
        loadProfile();
        loadStats();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/campus-love/my-profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setProfile(data.data);
                setFormData({
                    ...formData,
                    ...data.data
                });
            } else {
                setError(data.message || 'Erreur lors du chargement du profil');
            }
        } catch (error) {
            console.error('Erreur chargement profil:', error);
            setError('Erreur lors du chargement du profil');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/campus-love/my-profile/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayChange = (name, values) => {
        setFormData(prev => ({
            ...prev,
            [name]: values
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/campus-love/my-profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setProfile(data.data);
                setSuccess('Profil mis à jour avec succès !');
                loadStats(); // Recharger les stats
            } else {
                setError(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setError('Erreur lors de la sauvegarde du profil');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotosChange = (updatedProfile) => {
        setProfile(updatedProfile);
        loadStats(); // Recharger les stats
    };

    if (loading) {
        return (
            <Container className="mt-5">
                <div className="text-center">
                    <Spinner animation="border" className="mb-3" />
                    <p>Chargement de votre profil CampusLove...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row>
                <Col lg={8} className="mx-auto">
                    {/* Header */}
                    <Card className="mb-4">
                        <Card.Body className="text-center">
                            <h2 className="mb-1">💕 Mon Profil CampusLove</h2>
                            <p className="text-muted">Créez votre profil parfait pour trouver l'amour</p>
                            
                            {stats && (
                                <Row className="mt-3">
                                    <Col md={3}>
                                        <Badge bg="primary" className="p-2">
                                            {stats.completion_percentage}% complété
                                        </Badge>
                                    </Col>
                                    <Col md={3}>
                                        <Badge bg="info" className="p-2">
                                            {stats.photos_count}/{stats.max_photos} photos
                                        </Badge>
                                    </Col>
                                    <Col md={3}>
                                        <Badge bg={stats.is_active ? 'success' : 'secondary'} className="p-2">
                                            {stats.is_active ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </Col>
                                    <Col md={3}>
                                        <Badge bg={stats.is_online ? 'success' : 'warning'} className="p-2">
                                            {stats.is_online ? 'En ligne' : 'Hors ligne'}
                                        </Badge>
                                    </Col>
                                </Row>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Messages d'erreur/succès */}
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    {/* Suggestions d'amélioration */}
                    {stats && stats.suggestions && stats.suggestions.length > 0 && (
                        <Alert variant="info">
                            <h6>💡 Suggestions pour améliorer votre profil :</h6>
                            <ul className="mb-0">
                                {stats.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    {/* Onglets */}
                    <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                        <Tab eventKey="basic" title={<><User size={16} className="me-1" /> Informations de base</>}>
                            <Card>
                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nom d'affichage *</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="display_name"
                                                        value={formData.display_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Comment voulez-vous apparaître ?"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Phrase d'accroche</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="tagline"
                                                        value={formData.tagline}
                                                        onChange={handleInputChange}
                                                        placeholder="Une phrase qui vous décrit..."
                                                        maxLength={100}
                                                    />
                                                    <Form.Text>{formData.tagline.length}/100</Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Date de naissance *</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="birth_date"
                                                        value={formData.birth_date ? formData.birth_date.split('T')[0] : ''}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Genre *</Form.Label>
                                                    <Form.Select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Choisir...</option>
                                                        <option value="male">Homme</option>
                                                        <option value="female">Femme</option>
                                                        <option value="other">Autre</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Je recherche *</Form.Label>
                                                    <Form.Select
                                                        name="looking_for"
                                                        value={formData.looking_for}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Choisir...</option>
                                                        <option value="male">Hommes</option>
                                                        <option value="female">Femmes</option>
                                                        <option value="both">Les deux</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Tranche d'âge</Form.Label>
                                                    <Row>
                                                        <Col>
                                                            <Form.Control
                                                                type="number"
                                                                name="min_age"
                                                                value={formData.min_age}
                                                                onChange={handleInputChange}
                                                                min="18"
                                                                max="100"
                                                                placeholder="Min"
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <Form.Control
                                                                type="number"
                                                                name="max_age"
                                                                value={formData.max_age}
                                                                onChange={handleInputChange}
                                                                min="18"
                                                                max="100"
                                                                placeholder="Max"
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Description courte</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                placeholder="Décrivez-vous en quelques mots..."
                                                maxLength={500}
                                            />
                                            <Form.Text>{formData.bio.length}/500</Form.Text>
                                        </Form.Group>

                                        <div className="text-end">
                                            <Button type="submit" variant="primary" disabled={saving}>
                                                {saving ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" />
                                                        Sauvegarde...
                                                    </>
                                                ) : (
                                                    'Sauvegarder'
                                                )}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="photos" title={<><Camera size={16} className="me-1" /> Photos</>}>
                            <CampusLoveMediaUpload
                                photos={profile?.photos || []}
                                onPhotosChange={handlePhotosChange}
                                maxPhotos={6}
                                profile={profile}
                            />
                        </Tab>

                        <Tab eventKey="detailed" title={<><Heart size={16} className="me-1" /> Détails</>}>
                            <Card>
                                <Card.Body>
                                    <p className="text-muted mb-4">
                                        Ces informations aideront à trouver des personnes compatibles avec vous.
                                    </p>
                                    
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>À propos de moi</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                name="about_me"
                                                value={formData.about_me}
                                                onChange={handleInputChange}
                                                placeholder="Parlez de vous plus en détail..."
                                                maxLength={1000}
                                            />
                                            <Form.Text>{formData.about_me.length}/1000</Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Ce que je recherche</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="looking_for_description"
                                                value={formData.looking_for_description}
                                                onChange={handleInputChange}
                                                placeholder="Décrivez le type de relation ou de personne que vous recherchez..."
                                                maxLength={500}
                                            />
                                            <Form.Text>{formData.looking_for_description.length}/500</Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Faits amusants</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="fun_facts"
                                                value={formData.fun_facts}
                                                onChange={handleInputChange}
                                                placeholder="Quelque chose d'amusant ou d'intéressant sur vous..."
                                                maxLength={300}
                                            />
                                            <Form.Text>{formData.fun_facts.length}/300</Form.Text>
                                        </Form.Group>

                                        <div className="text-end">
                                            <Button type="submit" variant="primary" disabled={saving}>
                                                {saving ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" />
                                                        Sauvegarde...
                                                    </>
                                                ) : (
                                                    'Sauvegarder'
                                                )}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>

                        <Tab eventKey="stats" title={<><BarChart3 size={16} className="me-1" /> Statistiques</>}>
                            <Card>
                                <Card.Body>
                                    {stats ? (
                                        <div>
                                            <h5>📊 Aperçu de votre profil</h5>
                                            
                                            <Row className="mt-3">
                                                <Col md={6}>
                                                    <div className="stat-card p-3 border rounded">
                                                        <h6>Completion du profil</h6>
                                                        <div className="d-flex align-items-center">
                                                            <div className="flex-grow-1">
                                                                <div className="progress">
                                                                    <div 
                                                                        className="progress-bar" 
                                                                        style={{ width: `${stats.completion_percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <span className="ms-2 fw-bold">{stats.completion_percentage}%</span>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="stat-card p-3 border rounded">
                                                        <h6>Photos</h6>
                                                        <p className="mb-0">
                                                            {stats.photos_count} sur {stats.max_photos} photos uploadées
                                                        </p>
                                                    </div>
                                                </Col>
                                            </Row>

                                            {stats.missing_fields && stats.missing_fields.length > 0 && (
                                                <div className="mt-3">
                                                    <h6>🎯 Champs manquants</h6>
                                                    <ul>
                                                        {stats.missing_fields.map((field, index) => (
                                                            <li key={index}>{field}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Spinner animation="border" />
                                            <p className="mt-2">Chargement des statistiques...</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </Container>
    );
};

export default CampusLoveProfile;