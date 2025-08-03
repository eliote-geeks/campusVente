import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { notificationsAPI } from '../services/api.js';
import { createApiUrl } from '../config/api';
import Avatar from '../components/Avatar.jsx';
import ProfileImageUpload from '../components/ProfileImageUpload.jsx';
import MediaGallery from '../components/MediaGallery.jsx';
import { Upload, Trash2, Camera, Plus } from 'lucide-react';

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
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    // Récupérer les informations du profil
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(createApiUrl(`/users/${user.id}`), {
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
                const response = await fetch(createApiUrl(`/users/${user.id}/ratings`), {
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

                const response = await fetch(createApiUrl('/my-announcements'), {
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
                const response = await fetch(createApiUrl('/notifications/stats'), {
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
            // Validation CampusLove si activé
            if (editForm.dating_active) {
                if (!editForm.birth_date) {
                    setErrorMessage('La date de naissance est requise pour activer CampusLove');
                    return;
                }
                if (!editForm.gender) {
                    setErrorMessage('Le genre est requis pour activer CampusLove');
                    return;
                }
                if (!editForm.looking_for) {
                    setErrorMessage('Veuillez indiquer qui vous recherchez pour activer CampusLove');
                    return;
                }
                if (!editForm.whatsapp_number) {
                    setErrorMessage('Le numéro WhatsApp est requis pour activer CampusLove');
                    return;
                }
            }
            const response = await fetch(createApiUrl(`/users/${user.id}`), {
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
                    location: editForm.location,
                    // Champs CampusLove
                    birth_date: editForm.birth_date,
                    gender: editForm.gender,
                    looking_for: editForm.looking_for,
                    bio_dating: editForm.bio_dating,
                    whatsapp_number: editForm.whatsapp_number,
                    dating_active: editForm.dating_active || false,
                    max_distance: editForm.max_distance || 50,
                    dating_photos: editForm.dating_photos || []
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

    // Fonctions pour gérer les photos de dating
    const handlePhotosUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const currentPhotos = editForm.dating_photos || [];
        if (currentPhotos.length + files.length > 6) {
            setErrorMessage('Vous ne pouvez ajouter que 6 photos maximum pour CampusLove');
            return;
        }

        try {
            setUploadingPhotos(true);
            const uploadPromises = files.map(async (file) => {
                // Vérifier le type de fichier
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} n'est pas une image valide`);
                }

                // Vérifier la taille (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`${file.name} est trop volumineux (max 5MB)`);
                }

                // Créer FormData pour l'upload
                const formData = new FormData();
                formData.append('photo', file);
                
                // Upload vers le serveur
                const response = await fetch(createApiUrl('/upload-dating-photo'), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: formData
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Erreur lors de l\'upload');
                }

                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            
            setEditForm(prev => ({
                ...prev,
                dating_photos: [...(prev.dating_photos || []), ...uploadedUrls]
            }));

            setSuccessMessage(`${uploadedUrls.length} photo(s) ajoutée(s) avec succès`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erreur upload photos:', error);
            setErrorMessage(error.message || 'Erreur lors de l\'upload des photos');
        } finally {
            setUploadingPhotos(false);
        }
    };

    const removePhoto = (index) => {
        setEditForm(prev => ({
            ...prev,
            dating_photos: (prev.dating_photos || []).filter((_, i) => i !== index)
        }));
        setSuccessMessage('Photo supprimée');
        setTimeout(() => setSuccessMessage(''), 2000);
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
                                                                    <div style={{ width: '60px', height: '60px' }} className="rounded overflow-hidden">
                                                                        <MediaGallery
                                                                            media={announcement.media || []}
                                                                            images={announcement.images || []}
                                                                            title={announcement.title}
                                                                        />
                                                                    </div>
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

                                    <Tab eventKey="campuslove" title="💕 CampusLove">
                                        <div className="p-3">
                                            <div className="text-center mb-4">
                                                <div style={{ fontSize: '3rem' }}>💕</div>
                                                <h5 className="fw-bold">CampusLove</h5>
                                                <p className="text-muted">Trouvez votre âme sœur étudiante</p>
                                            </div>

                                            <Form>
                                                <div className="bg-light rounded p-3 mb-4">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <h6 className="fw-bold mb-1">Activer mon profil CampusLove</h6>
                                                            <small className="text-muted">Votre profil sera visible aux autres étudiants</small>
                                                        </div>
                                                        <Form.Check 
                                                            type="switch"
                                                            id="dating-active-switch"
                                                            checked={editing ? (editForm.dating_active || false) : (userProfile?.dating_active || false)}
                                                            onChange={(e) => setEditForm({...editForm, dating_active: e.target.checked})}
                                                            disabled={!editing}
                                                        />
                                                    </div>
                                                </div>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Date de naissance</Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                value={editing ? editForm.birth_date || '' : userProfile?.birth_date || ''}
                                                                onChange={(e) => setEditForm({...editForm, birth_date: e.target.value})}
                                                                disabled={!editing}
                                                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                                            />
                                                            <Form.Text className="text-muted">
                                                                Vous devez avoir au moins 18 ans
                                                            </Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Genre</Form.Label>
                                                            <Form.Select
                                                                value={editing ? editForm.gender || '' : userProfile?.gender || ''}
                                                                onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                                                disabled={!editing}
                                                            >
                                                                <option value="">Choisir votre genre</option>
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
                                                            <Form.Label>Je recherche</Form.Label>
                                                            <Form.Select
                                                                value={editing ? editForm.looking_for || '' : userProfile?.looking_for || ''}
                                                                onChange={(e) => setEditForm({...editForm, looking_for: e.target.value})}
                                                                disabled={!editing}
                                                            >
                                                                <option value="">Qui recherchez-vous ?</option>
                                                                <option value="male">Des hommes</option>
                                                                <option value="female">Des femmes</option>
                                                                <option value="both">Les deux</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Numéro WhatsApp</Form.Label>
                                                            <Form.Control
                                                                type="tel"
                                                                value={editing ? editForm.whatsapp_number || '' : userProfile?.whatsapp_number || ''}
                                                                onChange={(e) => setEditForm({...editForm, whatsapp_number: e.target.value})}
                                                                disabled={!editing}
                                                                placeholder="+237 6XX XXX XXX"
                                                            />
                                                            <Form.Text className="text-muted">
                                                                Numéro pour les conversations
                                                            </Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>Bio CampusLove</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={editing ? editForm.bio_dating || '' : userProfile?.bio_dating || ''}
                                                        onChange={(e) => setEditForm({...editForm, bio_dating: e.target.value})}
                                                        disabled={!editing}
                                                        placeholder="Parlez-nous de vous pour CampusLove..."
                                                        maxLength={500}
                                                    />
                                                    {editing && (
                                                        <Form.Text className="text-muted">
                                                            {(editForm.bio_dating || '').length}/500 caractères
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Distance maximale</Form.Label>
                                                            <Form.Range 
                                                                min={1}
                                                                max={100}
                                                                value={editing ? editForm.max_distance || 50 : userProfile?.max_distance || 50}
                                                                onChange={(e) => setEditForm({...editForm, max_distance: parseInt(e.target.value)})}
                                                                disabled={!editing}
                                                            />
                                                            <Form.Text className="text-muted">
                                                                {editing ? editForm.max_distance || 50 : userProfile?.max_distance || 50} km
                                                            </Form.Text>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mt-4">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="text-primary">💕</span>
                                                                <small className="text-muted">
                                                                    {(userProfile?.dating_active || false) ? 'Profil actif sur CampusLove' : 'Profil inactif sur CampusLove'}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        <Camera size={16} className="me-2" />
                                                        Photos CampusLove
                                                    </Form.Label>
                                                    <div className="dating-photos-section">
                                                        <div className="dating-photos-grid" style={{ 
                                                            display: 'grid', 
                                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                                                            gap: '15px',
                                                            marginBottom: '15px'
                                                        }}>
                                                            {/* Photos existantes */}
                                                            {((editing ? editForm.dating_photos : userProfile?.dating_photos) || []).map((photo, index) => (
                                                                <div key={index} className="dating-photo-item" style={{ position: 'relative' }}>
                                                                    <img 
                                                                        src={photo} 
                                                                        alt={`Photo ${index + 1}`} 
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '120px',
                                                                            objectFit: 'cover',
                                                                            borderRadius: '8px',
                                                                            border: '2px solid #e9ecef'
                                                                        }}
                                                                    />
                                                                    {editing && (
                                                                        <Button
                                                                            variant="danger"
                                                                            size="sm"
                                                                            onClick={() => removePhoto(index)}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: '5px',
                                                                                right: '5px',
                                                                                width: '24px',
                                                                                height: '24px',
                                                                                padding: '0',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                borderRadius: '50%'
                                                                            }}
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            
                                                            {/* Bouton d'ajout si moins de 6 photos et en mode édition */}
                                                            {editing && ((editForm.dating_photos || []).length < 6) && (
                                                                <div 
                                                                    className="add-photo-slot" 
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '120px',
                                                                        border: '2px dashed #dee2e6',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        backgroundColor: '#f8f9fa',
                                                                        transition: 'all 0.2s ease',
                                                                        position: 'relative'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (!uploadingPhotos) {
                                                                            e.target.style.borderColor = '#007bff';
                                                                            e.target.style.backgroundColor = '#e7f3ff';
                                                                        }
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (!uploadingPhotos) {
                                                                            e.target.style.borderColor = '#dee2e6';
                                                                            e.target.style.backgroundColor = '#f8f9fa';
                                                                        }
                                                                    }}
                                                                    onClick={() => document.getElementById('dating-photos-upload').click()}
                                                                >
                                                                    {uploadingPhotos ? (
                                                                        <>
                                                                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                                                <span className="visually-hidden">Upload...</span>
                                                                            </div>
                                                                            <small className="text-muted mt-1">Upload...</small>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Plus size={24} className="text-primary mb-1" />
                                                                            <small className="text-muted">Ajouter</small>
                                                                        </>
                                                                    )}
                                                                    <Form.Control
                                                                        id="dating-photos-upload"
                                                                        type="file"
                                                                        multiple
                                                                        accept="image/*"
                                                                        onChange={handlePhotosUpload}
                                                                        style={{ display: 'none' }}
                                                                        disabled={uploadingPhotos}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <Form.Text className="text-muted">
                                                            <Camera size={14} className="me-1" />
                                                            Ajoutez jusqu'à 6 photos pour votre profil CampusLove (max 5MB par photo)
                                                            {editing && (editForm.dating_photos || []).length > 0 && (
                                                                <span className="ms-2">
                                                                    • {(editForm.dating_photos || []).length}/6 photos
                                                                </span>
                                                            )}
                                                        </Form.Text>
                                                    </div>
                                                </Form.Group>

                                                {!editing && (userProfile?.dating_active || false) && (
                                                    <div className="bg-success bg-opacity-10 border border-success rounded p-3 mt-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <span style={{ fontSize: '1.2rem' }}>✅</span>
                                                            <span className="fw-bold text-success">Profil CampusLove actif</span>
                                                        </div>
                                                        <p className="text-success mb-0 small">
                                                            Votre profil est visible aux autres étudiants. Vous pouvez maintenant découvrir et matcher avec d'autres profils !
                                                        </p>
                                                    </div>
                                                )}

                                                {!editing && !(userProfile?.dating_active || false) && (
                                                    <div className="bg-warning bg-opacity-10 border border-warning rounded p-3 mt-3">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                                            <span className="fw-bold text-warning">Profil CampusLove inactif</span>
                                                        </div>
                                                        <p className="text-warning mb-0 small">
                                                            Activez votre profil CampusLove pour commencer à découvrir et matcher avec d'autres étudiants.
                                                        </p>
                                                    </div>
                                                )}
                                            </Form>
                                        </div>
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