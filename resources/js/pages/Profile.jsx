import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Alert, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userRatings, setUserRatings] = useState([]);
    const [userAnnouncements, setUserAnnouncements] = useState([]);

    // Récupérer les informations du profil
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    setUserProfile(data.data);
                    setEditForm(data.data);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du profil:', error);
                setErrorMessage('Erreur lors du chargement du profil');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchProfile();
        }
    }, [user?.id]);

    // Récupérer les notes reçues
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${user.id}/ratings`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    setUserRatings(data.data.ratings);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des notes:', error);
            }
        };

        if (user?.id) {
            fetchRatings();
        }
    }, [user?.id]);

    // Récupérer les annonces de l'utilisateur
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements?user_id=${user.id}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    setUserAnnouncements(data.data || []);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des annonces:', error);
            }
        };

        if (user?.id) {
            fetchAnnouncements();
        }
    }, [user?.id]);

    const handleSaveProfile = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: editForm.name,
                    email: editForm.email,
                    phone: editForm.phone,
                    university: editForm.university,
                    study_level: editForm.study_level,
                    field: editForm.field,
                    bio: editForm.bio,
                    location: editForm.location
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUserProfile(data.data);
                updateUser({ ...user, ...data.data });
                setEditing(false);
                setSuccessMessage('Profil mis à jour avec succès !');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setErrorMessage('Erreur lors de la mise à jour du profil');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="text-muted mt-3">Chargement du profil...</p>
                    </div>
                </div>
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
                    <Col lg={4}>
                        <Card className="card-modern mb-4">
                            <Card.Body className="text-center p-4">
                                <img 
                                    src={userProfile?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                                    alt="Profile"
                                    className="rounded-circle mb-3 cursor-pointer"
                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    onClick={() => setShowImageModal(true)}
                                />
                                
                                <h4 className="fw-bold mb-1">{userProfile?.name}</h4>
                                
                                {userProfile?.is_student && (
                                    <Badge bg="primary" className="mb-2">Étudiant</Badge>
                                )}
                                
                                {userProfile?.rating && (
                                    <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                                        <span className="text-warning fw-bold">
                                            ⭐ {parseFloat(userProfile.rating).toFixed(1)}
                                        </span>
                                        <small className="text-muted">
                                            ({userProfile.total_ratings || 0} avis)
                                        </small>
                                    </div>
                                )}
                                
                                <p className="text-muted mb-3">{userProfile?.bio || 'Aucune biographie'}</p>
                                
                                <div className="d-grid gap-2">
                                    <Button 
                                        variant={editing ? "success" : "primary"}
                                        onClick={editing ? handleSaveProfile : () => setEditing(true)}
                                        className="btn-modern"
                                    >
                                        {editing ? '💾 Sauvegarder' : '✏️ Modifier le profil'}
                                    </Button>
                                    
                                    {editing && (
                                        <Button 
                                            variant="secondary"
                                            onClick={() => {
                                                setEditing(false);
                                                setEditForm(userProfile);
                                            }}
                                            className="btn-modern"
                                        >
                                            ❌ Annuler
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
                                    <span>Annonces publiées</span>
                                    <Badge bg="primary">{userAnnouncements.length}</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Notes reçues</span>
                                    <Badge bg="warning">{userRatings.length}</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Membre depuis</span>
                                    <small className="text-muted">
                                        {userProfile?.created_at ? formatDate(userProfile.created_at) : 'N/A'}
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={8}>
                        <Card className="card-modern">
                            <Card.Header>
                                <h5 className="fw-bold mb-0">👤 Informations personnelles</h5>
                            </Card.Header>
                            <Card.Body>
                                <Tabs defaultActiveKey="info" className="mb-3">
                                    <Tab eventKey="info" title="📋 Informations">
                                        <Form>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Nom complet</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={editing ? editForm.name || '' : userProfile?.name || ''}
                                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                            disabled={!editing}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Email</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            value={editing ? editForm.email || '' : userProfile?.email || ''}
                                                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                                            disabled={!editing}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Téléphone</Form.Label>
                                                        <Form.Control
                                                            type="tel"
                                                            value={editing ? editForm.phone || '' : userProfile?.phone || ''}
                                                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                                            disabled={!editing}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Localisation</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={editing ? editForm.location || '' : userProfile?.location || ''}
                                                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                                            disabled={!editing}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            {userProfile?.is_student && (
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Université</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={editing ? editForm.university || '' : userProfile?.university || ''}
                                                                onChange={(e) => setEditForm({...editForm, university: e.target.value})}
                                                                disabled={!editing}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Niveau d'études</Form.Label>
                                                            <Form.Select
                                                                value={editing ? editForm.study_level || '' : userProfile?.study_level || ''}
                                                                onChange={(e) => setEditForm({...editForm, study_level: e.target.value})}
                                                                disabled={!editing}
                                                            >
                                                                <option value="">Sélectionner...</option>
                                                                <option value="licence1">Licence 1</option>
                                                                <option value="licence2">Licence 2</option>
                                                                <option value="licence3">Licence 3</option>
                                                                <option value="master1">Master 1</option>
                                                                <option value="master2">Master 2</option>
                                                                <option value="doctorat">Doctorat</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}

                                            <Form.Group className="mb-3">
                                                <Form.Label>Domaine d'études</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={editing ? editForm.field || '' : userProfile?.field || ''}
                                                    onChange={(e) => setEditForm({...editForm, field: e.target.value})}
                                                    disabled={!editing}
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Biographie</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    value={editing ? editForm.bio || '' : userProfile?.bio || ''}
                                                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                                    disabled={!editing}
                                                    maxLength={500}
                                                />
                                                {editing && (
                                                    <Form.Text className="text-muted">
                                                        {(editForm.bio || '').length}/500 caractères
                                                    </Form.Text>
                                                )}
                                            </Form.Group>
                                        </Form>
                                    </Tab>

                                    <Tab eventKey="ratings" title={`⭐ Notes reçues (${userRatings.length})`}>
                                        {userRatings.length === 0 ? (
                                            <div className="text-center py-4">
                                                <p className="text-muted">Aucune note reçue pour le moment</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {userRatings.map((rating, index) => (
                                                    <Card key={index} className="border-0 bg-light">
                                                        <Card.Body className="p-3">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <img 
                                                                        src={rating.rater?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face'}
                                                                        alt={rating.rater?.name}
                                                                        className="rounded-circle"
                                                                        style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                                    />
                                                                    <span className="fw-semibold">{rating.rater?.name}</span>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="text-warning fw-bold">
                                                                        {'⭐'.repeat(rating.rating)}
                                                                    </span>
                                                                    <Badge bg="secondary" style={{ fontSize: '10px' }}>
                                                                        {rating.transaction_type}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            {rating.comment && (
                                                                <p className="mb-2 text-muted" style={{ fontSize: '14px' }}>
                                                                    "{rating.comment}"
                                                                </p>
                                                            )}
                                                            <small className="text-muted">
                                                                {formatDate(rating.created_at)}
                                                            </small>
                                                        </Card.Body>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Modal pour changer l'image de profil */}
                <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Changer l'image de profil</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p className="text-muted">
                            Fonctionnalité de changement d'image de profil à implémenter.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowImageModal(false)}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Profile;