import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const EditAnnouncement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [announcement, setAnnouncement] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        type: 'sell',
        category_id: '',
        location: '',
        is_urgent: false,
        status: 'active'
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Récupérer l'annonce à modifier
    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements/${id}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    const ann = data.data;
                    
                    // Vérifier que l'utilisateur est le propriétaire
                    if (ann.user.id !== user.id) {
                        setErrorMessage('Vous n\'êtes pas autorisé à modifier cette annonce');
                        return;
                    }
                    
                    setAnnouncement(ann);
                    setFormData({
                        title: ann.title || '',
                        description: ann.description || '',
                        price: ann.price || '',
                        type: ann.type || 'sell',
                        category_id: ann.category?.id || '',
                        location: ann.location || '',
                        is_urgent: ann.is_urgent || false,
                        status: ann.status || 'active'
                    });
                } else {
                    setErrorMessage(data.message || 'Annonce non trouvée');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'annonce:', error);
                setErrorMessage('Erreur lors du chargement de l\'annonce');
            } finally {
                setLoading(false);
            }
        };

        if (id && user?.id) {
            fetchAnnouncement();
        }
    }, [id, user?.id]);

    // Récupérer les catégories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/categories', {
                    headers: { 'Accept': 'application/json' }
                });
                const data = await response.json();
                
                if (data.success) {
                    setCategories(data.data || []);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des catégories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Ajouter l'user_id pour la vérification de propriété
            const dataToSend = {
                ...formData,
                user_id: user.id
            };

            const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements/${id}/update-with-files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dataToSend)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSuccessMessage('Annonce mise à jour avec succès !');
                setTimeout(() => {
                    navigate('/my-announcements');
                }, 2000);
            } else {
                setErrorMessage(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setErrorMessage('Erreur lors de la mise à jour de l\'annonce');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements/${id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus, user_id: user.id })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setFormData(prev => ({ ...prev, status: newStatus }));
                setAnnouncement(prev => ({ ...prev, status: newStatus }));
                setSuccessMessage(`Statut changé vers "${newStatus}" avec succès !`);
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Erreur lors du changement de statut');
            }
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            setErrorMessage('Erreur lors du changement de statut');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge bg="success">✅ Active</Badge>;
            case 'paused':
                return <Badge bg="warning">⏸️ En pause</Badge>;
            case 'sold':
                return <Badge bg="secondary">✅ Vendue</Badge>;
            case 'expired':
                return <Badge bg="danger">⏰ Expirée</Badge>;
            case 'pending':
                return <Badge bg="info">🔄 En attente</Badge>;
            default:
                return <Badge bg="light">❓ Inconnue</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="text-muted mt-3">Chargement de l'annonce...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!announcement) {
        return (
            <div className="content-with-navbar">
                <Container className="py-4">
                    <Alert variant="danger">
                        Annonce non trouvée ou vous n'êtes pas autorisé à la modifier.
                    </Alert>
                </Container>
            </div>
        );
    }

    return (
        <div className="content-with-navbar">
            <Container className="py-4">
                {successMessage && (
                    <Alert variant="success" className="mb-4">
                        {successMessage}
                    </Alert>
                )}
                
                {errorMessage && (
                    <Alert variant="danger" className="mb-4">
                        {errorMessage}
                    </Alert>
                )}

                <Row>
                    <Col lg={8}>
                        <Card className="card-modern">
                            <Card.Header>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">✏️ Modifier l'annonce</h5>
                                    {getStatusBadge(formData.status)}
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={8}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Titre de l'annonce *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    required
                                                    maxLength={255}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Prix (FCFA) *</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            maxLength={1000}
                                        />
                                        <Form.Text className="text-muted">
                                            {formData.description.length}/1000 caractères
                                        </Form.Text>
                                    </Form.Group>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Type *</Form.Label>
                                                <Form.Select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="sell">💰 Je vends</option>
                                                    <option value="buy">🛒 Je cherche</option>
                                                    <option value="service">🛠️ Service</option>
                                                    <option value="exchange">🔄 Échange</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Catégorie *</Form.Label>
                                                <Form.Select
                                                    name="category_id"
                                                    value={formData.category_id}
                                                    onChange={handleInputChange}
                                                    required
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
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Localisation *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Ex: Yaoundé, Douala..."
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            name="is_urgent"
                                            checked={formData.is_urgent}
                                            onChange={handleInputChange}
                                            label="🚨 Annonce urgente"
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button 
                                            type="submit" 
                                            className="btn-modern btn-gradient"
                                            disabled={saving}
                                        >
                                            {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder les modifications'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="secondary"
                                            onClick={() => navigate('/my-announcements')}
                                            className="btn-modern"
                                        >
                                            ❌ Annuler
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        {/* Actions rapides */}
                        <Card className="card-modern mb-4">
                            <Card.Header>
                                <h6 className="fw-bold mb-0">⚡ Actions rapides</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-grid gap-2">
                                    {formData.status === 'active' && (
                                        <Button 
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleStatusChange('paused')}
                                            className="btn-modern"
                                        >
                                            ⏸️ Mettre en pause
                                        </Button>
                                    )}
                                    
                                    {formData.status === 'paused' && (
                                        <Button 
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleStatusChange('active')}
                                            className="btn-modern"
                                        >
                                            ▶️ Réactiver
                                        </Button>
                                    )}
                                    
                                    {(formData.status === 'active' || formData.status === 'paused') && (
                                        <Button 
                                            variant="outline-success"
                                            size="sm"
                                            onClick={() => handleStatusChange('sold')}
                                            className="btn-modern"
                                        >
                                            ✅ Marquer comme vendue
                                        </Button>
                                    )}
                                    
                                    {formData.status === 'sold' && (
                                        <Button 
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleStatusChange('active')}
                                            className="btn-modern"
                                        >
                                            🔄 Remettre en vente
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Statistiques */}
                        <Card className="card-modern">
                            <Card.Header>
                                <h6 className="fw-bold mb-0">📊 Statistiques</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Vues</span>
                                    <Badge bg="primary">{announcement.views || 0}</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Likes</span>
                                    <Badge bg="danger">{announcement.likes || 0}</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Créée le</span>
                                    <small className="text-muted">
                                        {new Date(announcement.created_at).toLocaleDateString('fr-FR')}
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EditAnnouncement;