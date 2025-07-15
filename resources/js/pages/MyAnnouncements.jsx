import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import MediaGallery from '../components/MediaGallery.jsx';

const MyAnnouncements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Récupérer les annonces de l'utilisateur
    useEffect(() => {
        const fetchMyAnnouncements = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setErrorMessage('Token d\'authentification manquant. Veuillez vous reconnecter.');
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://127.0.0.1:8000/api/v1/my-announcements', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        setErrorMessage('Session expirée. Veuillez vous reconnecter.');
                        localStorage.removeItem('token');
                        return;
                    }
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    setAnnouncements(data.data || []);
                    setErrorMessage(''); // Clear previous errors
                } else {
                    setErrorMessage(data.message || 'Erreur lors du chargement des annonces');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des annonces:', error);
                setErrorMessage('Erreur lors du chargement des annonces: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchMyAnnouncements();
        } else {
            setLoading(false);
            setErrorMessage('Utilisateur non connecté');
        }
    }, [user?.id]);

    const handleDeleteAnnouncement = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('Token d\'authentification manquant. Veuillez vous reconnecter.');
                return;
            }

            const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements/${announcementToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    setErrorMessage('Session expirée. Veuillez vous reconnecter.');
                    localStorage.removeItem('token');
                    return;
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setAnnouncements(prev => prev.filter(ann => ann.id !== announcementToDelete.id));
                setSuccessMessage('Annonce supprimée avec succès');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setErrorMessage('Erreur lors de la suppression de l\'annonce: ' + error.message);
        } finally {
            setShowDeleteModal(false);
            setAnnouncementToDelete(null);
        }
    };

    const handleUpdateStatus = async (announcementId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('Token d\'authentification manquant. Veuillez vous reconnecter.');
                return;
            }

            const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements/${announcementId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus, user_id: user?.id })
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    setErrorMessage('Session expirée. Veuillez vous reconnecter.');
                    localStorage.removeItem('token');
                    return;
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                setAnnouncements(prev => 
                    prev.map(ann => 
                        ann.id === announcementId 
                            ? { ...ann, status: newStatus }
                            : ann
                    )
                );
                setSuccessMessage('Statut mis à jour avec succès');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setErrorMessage('Erreur lors de la mise à jour du statut: ' + error.message);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge bg="success">Active</Badge>;
            case 'sold':
                return <Badge bg="secondary">Vendue</Badge>;
            case 'expired':
                return <Badge bg="warning">Expirée</Badge>;
            case 'paused':
                return <Badge bg="info">En pause</Badge>;
            default:
                return <Badge bg="light">Inconnue</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredAnnouncements = filterStatus === 'all' 
        ? announcements 
        : announcements.filter(ann => ann.status === filterStatus);

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="text-muted mt-3">Chargement de vos annonces...</p>
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

                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-1">📝 Mes Annonces</h2>
                                <p className="text-muted mb-0">
                                    {filteredAnnouncements.length} annonce{filteredAnnouncements.length > 1 ? 's' : ''} 
                                    {filterStatus !== 'all' && ` (${filterStatus})`}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Form.Select 
                                    value={filterStatus} 
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ width: 'auto' }}
                                >
                                    <option value="all">Toutes</option>
                                    <option value="active">Actives</option>
                                    <option value="sold">Vendues</option>
                                    <option value="paused">En pause</option>
                                    <option value="expired">Expirées</option>
                                </Form.Select>
                                <Button as={Link} to="/create-announcement" className="btn-modern btn-gradient">
                                    ➕ Nouvelle annonce
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Liste des annonces */}
                {filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-muted mb-3">
                            {filterStatus === 'all' 
                                ? 'Aucune annonce publiée' 
                                : `Aucune annonce ${filterStatus}`
                            }
                        </h4>
                        <p className="text-muted mb-4">
                            {filterStatus === 'all' 
                                ? 'Commencez par créer votre première annonce' 
                                : 'Modifiez le filtre pour voir d\'autres annonces'
                            }
                        </p>
                        {filterStatus === 'all' && (
                            <Button as={Link} to="/create-announcement" className="btn-modern btn-gradient">
                                🚀 Créer ma première annonce
                            </Button>
                        )}
                    </div>
                ) : (
                    <Row className="g-4">
                        {filteredAnnouncements.map(announcement => (
                            <Col key={announcement.id} md={6} lg={4}>
                                <Card className="card-modern h-100">
                                    <div className="position-relative">
                                        <div style={{ height: '200px' }}>
                                            <MediaGallery
                                                media={announcement.media || []}
                                                images={announcement.images || []}
                                                title={announcement.title}
                                            />
                                        </div>
                                        <div className="position-absolute top-0 start-0 m-2">
                                            {getStatusBadge(announcement.status)}
                                        </div>
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <Badge bg="primary" style={{ fontSize: '12px' }}>
                                                {typeof announcement.category === 'object' ? announcement.category?.name : announcement.category}
                                            </Badge>
                                        </div>
                                        {announcement.price > 0 && (
                                            <div className="position-absolute bottom-0 end-0 m-2">
                                                <Badge bg="success" style={{ fontSize: '12px' }}>
                                                    {announcement.price.toLocaleString('fr-FR')} FCFA
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Card.Body className="p-3">
                                        <h6 className="fw-bold mb-2" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {announcement.title}
                                        </h6>
                                        
                                        <p className="text-muted mb-3" style={{
                                            fontSize: '14px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {announcement.description}
                                        </p>

                                        {/* Statistiques */}
                                        <div className="d-flex justify-content-between align-items-center mb-3 text-center">
                                            <div>
                                                <div className="fw-bold text-primary">{announcement.views || 0}</div>
                                                <small className="text-muted">Vues</small>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-danger">{announcement.likes || 0}</div>
                                                <small className="text-muted">Likes</small>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-info">{formatDate(announcement.created_at)}</div>
                                                <small className="text-muted">Publié</small>
                                            </div>
                                        </div>

                                        {/* Actions rapides */}
                                        <div className="d-flex gap-1 mb-2">
                                            {announcement.status === 'active' && (
                                                <>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline-warning"
                                                        onClick={() => handleUpdateStatus(announcement.id, 'paused')}
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        ⏸️ Pause
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline-success"
                                                        onClick={() => handleUpdateStatus(announcement.id, 'sold')}
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        ✅ Vendu
                                                    </Button>
                                                </>
                                            )}
                                            
                                            {announcement.status === 'paused' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-success"
                                                    onClick={() => handleUpdateStatus(announcement.id, 'active')}
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    ▶️ Réactiver
                                                </Button>
                                            )}
                                            
                                            {announcement.status === 'sold' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-primary"
                                                    onClick={() => handleUpdateStatus(announcement.id, 'active')}
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    🔄 Remettre en vente
                                                </Button>
                                            )}
                                        </div>

                                        {/* Actions principales */}
                                        <div className="d-flex gap-1">
                                            <Button 
                                                as={Link}
                                                to={`/edit-announcement/${announcement.id}`}
                                                size="sm" 
                                                variant="outline-primary"
                                                className="flex-fill"
                                                style={{ fontSize: '11px' }}
                                            >
                                                ✏️ Modifier
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline-secondary"
                                                className="flex-fill"
                                                style={{ fontSize: '11px' }}
                                            >
                                                👁️ Voir
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline-danger"
                                                onClick={() => {
                                                    setAnnouncementToDelete(announcement);
                                                    setShowDeleteModal(true);
                                                }}
                                                style={{ fontSize: '11px' }}
                                            >
                                                🗑️
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Modal de confirmation de suppression */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmer la suppression</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Êtes-vous sûr de vouloir supprimer l'annonce :</p>
                        <strong>"{announcementToDelete?.title}"</strong>
                        <p className="text-muted mt-2">Cette action est irréversible.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Annuler
                        </Button>
                        <Button variant="danger" onClick={handleDeleteAnnouncement}>
                            🗑️ Supprimer définitivement
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default MyAnnouncements;