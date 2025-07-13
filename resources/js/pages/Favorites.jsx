import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Favorites = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Récupérer les annonces favorites (simulé pour l'instant)
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setLoading(true);
                // Pour l'instant, simulons avec des données locales
                // Plus tard, on ajoutera une table favorites dans la BD
                const savedFavorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
                
                if (savedFavorites.length > 0) {
                    // Récupérer les détails des annonces favorites
                    const favoritePromises = savedFavorites.map(async (announcementId) => {
                        try {
                            const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements/${announcementId}`, {
                                headers: {
                                    'Accept': 'application/json'
                                }
                            });
                            const data = await response.json();
                            return data.success ? data.data : null;
                        } catch {
                            return null;
                        }
                    });
                    
                    const favoriteAnnouncements = await Promise.all(favoritePromises);
                    setFavorites(favoriteAnnouncements.filter(Boolean));
                } else {
                    setFavorites([]);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des favoris:', error);
                setErrorMessage('Erreur lors du chargement des favoris');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchFavorites();
        }
    }, [user?.id]);

    const toggleFavorite = async (announcementId) => {
        try {
            const savedFavorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
            const isFavorite = savedFavorites.includes(announcementId);
            
            let newFavorites;
            if (isFavorite) {
                // Retirer des favoris
                newFavorites = savedFavorites.filter(id => id !== announcementId);
                setFavorites(prev => prev.filter(fav => fav.id !== announcementId));
                setSuccessMessage('Annonce retirée des favoris');
            } else {
                // Ajouter aux favoris
                newFavorites = [...savedFavorites, announcementId];
                setSuccessMessage('Annonce ajoutée aux favoris');
            }
            
            localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
            setTimeout(() => setSuccessMessage(''), 3000);
            
        } catch (error) {
            console.error('Erreur lors de la modification des favoris:', error);
            setErrorMessage('Erreur lors de la modification des favoris');
        }
    };

    const handleWhatsAppContact = (announcement) => {
        const message = encodeURIComponent(`Salut ! Je suis intéressé(e) par ton annonce "${announcement.title}" sur CampusVente. 🛒`);
        const phone = announcement.author?.phone || announcement.user?.phone;
        if (phone) {
            window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return date.toLocaleDateString('fr-FR');
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'sell': return '💰';
            case 'housing': return '🏠';
            case 'service': return '🛠️';
            case 'event': return '🎉';
            default: return '📢';
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
                        <p className="text-muted mt-3">Chargement de vos favoris...</p>
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
                                <h2 className="fw-bold mb-1">❤️ Mes Favoris</h2>
                                <p className="text-muted mb-0">
                                    {favorites.length} annonce{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button as={Link} to="/announcements" className="btn-modern btn-gradient">
                                    🔍 Découvrir plus d'annonces
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Liste des favoris */}
                {favorites.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="mb-4">
                            <span style={{ fontSize: '64px' }}>💔</span>
                        </div>
                        <h4 className="text-muted mb-3">Aucun favori sauvegardé</h4>
                        <p className="text-muted mb-4">
                            Parcourez les annonces et ajoutez celles qui vous intéressent à vos favoris
                        </p>
                        <Button as={Link} to="/announcements" className="btn-modern btn-gradient">
                            🚀 Explorer les annonces
                        </Button>
                    </div>
                ) : (
                    <Row className="g-4">
                        {favorites.map(announcement => (
                            <Col key={announcement.id} md={6} lg={4}>
                                <Card className="card-modern h-100 position-relative">
                                    <div className="position-relative">
                                        <img 
                                            src={announcement.images?.[0] || 'https://via.placeholder.com/300x200'}
                                            alt={announcement.title}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        
                                        {/* Bouton favori */}
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                                            style={{ width: '36px', height: '36px' }}
                                            onClick={() => toggleFavorite(announcement.id)}
                                        >
                                            ❤️
                                        </Button>
                                        
                                        <div className="position-absolute top-0 start-0 m-2">
                                            <Badge bg="primary">
                                                {getTypeIcon(announcement.type)} {announcement.category}
                                            </Badge>
                                        </div>
                                        
                                        {announcement.price > 0 && (
                                            <div className="position-absolute bottom-0 end-0 m-2">
                                                <Badge bg="success" style={{ fontSize: '12px' }}>
                                                    {announcement.price.toLocaleString('fr-FR')} FCFA
                                                </Badge>
                                            </div>
                                        )}
                                        
                                        {announcement.urgent && (
                                            <div className="position-absolute bottom-0 start-0 m-2">
                                                <Badge bg="danger" className="pulse">🚨 URGENT</Badge>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <img 
                                                src={announcement.author?.avatar || announcement.user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=25&h=25&fit=crop&crop=face'}
                                                alt="Author"
                                                className="rounded-circle"
                                                style={{ width: '25px', height: '25px', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <small className="fw-semibold">{announcement.author?.name || announcement.user?.name}</small>
                                                {(announcement.author?.isStudent || announcement.user?.is_student) && (
                                                    <Badge bg="primary" className="ms-1" style={{ fontSize: '8px' }}>Étudiant</Badge>
                                                )}
                                            </div>
                                        </div>
                                        
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
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="d-flex gap-3">
                                                <small className="text-muted">
                                                    👁️ {announcement.views || 0}
                                                </small>
                                                <small className="text-muted">
                                                    💚 {announcement.likes || 0}
                                                </small>
                                            </div>
                                            <small className="text-muted">
                                                {formatDate(announcement.created_at)}
                                            </small>
                                        </div>

                                        {/* Localisation */}
                                        {announcement.location && (
                                            <div className="mb-3">
                                                <small className="text-muted">
                                                    📍 {announcement.location}
                                                </small>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="d-flex gap-1">
                                            <Button 
                                                size="sm" 
                                                className="btn-modern flex-fill"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontSize: '11px'
                                                }}
                                                onClick={() => handleWhatsAppContact(announcement)}
                                            >
                                                💬 Contacter
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline-primary"
                                                className="btn-modern flex-fill"
                                                style={{ fontSize: '11px' }}
                                            >
                                                👁️ Voir détails
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline-danger"
                                                onClick={() => toggleFavorite(announcement.id)}
                                                style={{ fontSize: '11px' }}
                                            >
                                                💔
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default Favorites;