import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { notificationsAPI } from '../services/api.js';
import Avatar from '../components/Avatar.jsx';
import ProfileImageUpload from '../components/ProfileImageUpload.jsx';

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
    const [notifications, setNotifications] = useState([]);
    const [notificationStats, setNotificationStats] = useState({});

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
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('Token manquant pour récupérer les annonces');
                    return;
                }

                const response = await fetch(`http://127.0.0.1:8000/api/v1/my-announcements`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    setUserAnnouncements(data.data || []);
                } else {
                    console.error('Erreur API:', data.message);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des annonces:', error);
            }
        };

        if (user?.id) {
            fetchAnnouncements();
        }
    }, [user?.id]);

    // Récupérer les notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await notificationsAPI.getAll();
                // Note: axios interceptor returns response.data directly
                if (response.success) {
                    setNotifications(response.data.notifications.slice(0, 5)); // Dernières 5 notifications
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des notifications:', error);
            }
        };

        const fetchNotificationStats = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/notifications/stats`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setNotificationStats(data.data);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des statistiques de notifications:', error);
            }
        };

        if (user?.id) {
            fetchNotifications();
            fetchNotificationStats();
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

    const formatNotificationDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffHours < 24) {
            return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    };

    const getNotificationTypeColor = (type) => {
        switch (type) {
            case 'welcome': return 'success';
            case 'announcement': return 'primary';
            case 'message': return 'info';
            case 'system': return 'secondary';
            default: return 'secondary';
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
                                <Avatar
                                    src={userProfile?.avatar}
                                    name={userProfile?.name}
                                    size={120}
                                    className="mb-3 shadow"
                                    onClick={() => setShowImageModal(true)}
                                    style={{ cursor: 'pointer' }}
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

                                    <Tab eventKey="announcements" title={`📢 Mes Annonces (${userAnnouncements.length})`}>
                                        {userAnnouncements.length === 0 ? (
                                            <div className="text-center py-4">
                                                <div style={{ fontSize: '3rem' }}>📝</div>
                                                <p className="text-muted mt-2">Aucune annonce publiée</p>
                                                <Button variant="outline-primary" href="/create-announcement">
                                                    Créer ma première annonce
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="fw-bold mb-0">📋 Mes dernières annonces</h6>
                                                    <Button variant="outline-primary" size="sm" href="/my-announcements">
                                                        Voir toutes
                                                    </Button>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {userAnnouncements.slice(0, 5).map(announcement => (
                                                        <Card key={announcement.id} className="border-0 bg-light">
                                                            <Card.Body className="p-3">
                                                                <div className="d-flex align-items-start gap-3">
                                                                    <img 
                                                                        src={announcement.images?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=60&fit=crop'}
                                                                        alt={announcement.title}
                                                                        className="rounded"
                                                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                                        onError={(e) => {
                                                                            e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=60&fit=crop';
                                                                        }}
                                                                    />
                                                                    <div className="flex-grow-1">
                                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                                            <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>
                                                                                {announcement.title}
                                                                            </h6>
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <Badge bg={announcement.status === 'active' ? 'success' : announcement.status === 'sold' ? 'secondary' : 'warning'} style={{ fontSize: '8px' }}>
                                                                                    {announcement.status === 'active' ? 'ACTIVE' : announcement.status === 'sold' ? 'VENDUE' : announcement.status.toUpperCase()}
                                                                                </Badge>
                                                                                <small className="text-muted">
                                                                                    {formatDate(announcement.created_at)}
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-muted mb-2" style={{ fontSize: '13px' }}>
                                                                            {announcement.description?.substring(0, 100)}...
                                                                        </p>
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <span className="fw-bold text-primary" style={{ fontSize: '14px' }}>
                                                                                    {announcement.price > 0 ? `${announcement.price.toLocaleString('fr-FR')} FCFA` : 'Gratuit'}
                                                                                </span>
                                                                                <Badge bg="light" text="dark" style={{ fontSize: '10px' }}>
                                                                                    {typeof announcement.category === 'object' ? announcement.category?.name : announcement.category}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>
                                                                                    👁️ {announcement.views || 0}
                                                                                </span>
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>
                                                                                    ❤️ {announcement.likes || 0}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </Tab>

                                    <Tab eventKey="notifications" title={`🔔 Notifications (${notificationStats.unread_notifications || 0})`}>
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Card className="bg-light border-0">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="fw-bold mb-1">📊 Total notifications</h6>
                                                                <h4 className="text-primary mb-0">{notificationStats.total_notifications || 0}</h4>
                                                            </div>
                                                            <div className="text-primary" style={{ fontSize: '2rem' }}>📱</div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={6}>
                                                <Card className="bg-light border-0">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="fw-bold mb-1">🔴 Non lues</h6>
                                                                <h4 className="text-danger mb-0">{notificationStats.unread_notifications || 0}</h4>
                                                            </div>
                                                            <div className="text-danger" style={{ fontSize: '2rem' }}>🚨</div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {notifications.length === 0 ? (
                                            <div className="text-center py-4">
                                                <div style={{ fontSize: '3rem' }}>🔕</div>
                                                <p className="text-muted mt-2">Aucune notification récente</p>
                                                <Button variant="outline-primary" href="/notifications">
                                                    Voir toutes les notifications
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="fw-bold mb-0">📋 Notifications récentes</h6>
                                                    <Button variant="outline-primary" size="sm" href="/notifications">
                                                        Voir toutes
                                                    </Button>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {notifications.map(notification => (
                                                        <Card key={notification.id} className={`border-0 ${!notification.read ? 'bg-light' : 'bg-white'}`}>
                                                            <Card.Body className="p-3">
                                                                <div className="d-flex align-items-start gap-3">
                                                                    <div 
                                                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                                                        style={{ 
                                                                            width: '35px', 
                                                                            height: '35px', 
                                                                            backgroundColor: '#f8f9fa',
                                                                            border: '1px solid #dee2e6',
                                                                            fontSize: '16px'
                                                                        }}
                                                                    >
                                                                        {notification.icon || '🔔'}
                                                                    </div>
                                                                    <div className="flex-grow-1">
                                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                                            <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>
                                                                                {notification.title}
                                                                                {!notification.read && (
                                                                                    <Badge bg="primary" className="ms-2" style={{ fontSize: '8px' }}>
                                                                                        NOUVEAU
                                                                                    </Badge>
                                                                                )}
                                                                            </h6>
                                                                            <small className="text-muted">
                                                                                {formatNotificationDate(notification.created_at)}
                                                                            </small>
                                                                        </div>
                                                                        <p className="text-muted mb-1" style={{ fontSize: '13px' }}>
                                                                            {notification.message}
                                                                        </p>
                                                                        <Badge bg={getNotificationTypeColor(notification.type)} style={{ fontSize: '9px' }}>
                                                                            {notification.type.replace('_', ' ').toUpperCase()}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Modal pour changer l'image de profil */}
                <ProfileImageUpload
                    show={showImageModal}
                    onHide={() => setShowImageModal(false)}
                    currentImage={userProfile?.avatar}
                    userName={userProfile?.name}
                    onImageUpdate={(newAvatarUrl) => {
                        setUserProfile(prev => ({ ...prev, avatar: newAvatarUrl }));
                        updateUser({ ...user, avatar: newAvatarUrl });
                    }}
                />
            </Container>
        </div>
    );
};

export default Profile;