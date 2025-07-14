import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import MediaGallery from '../components/MediaGallery.jsx';

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch announcements from API
    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/api/v1/announcements?with_interactions=true');
            const data = await response.json();
            
            if (data.success) {
                // Debug: Afficher les données reçues
                console.log('Données API reçues (Announcements):', data.data);
                
                // Transform API data to match component expectations
                const transformedAnnouncements = data.data.map(announcement => {
                    console.log('Utilisateur de l\'annonce (Announcements):', announcement.user);
                    return {
                    id: announcement.id,
                    title: announcement.title,
                    description: announcement.description,
                    price: parseFloat(announcement.price),
                    category: announcement.category?.name || 'Non classifié',
                    type: announcement.type,
                    status: announcement.status,
                    author: {
                        name: announcement.user?.name || 'Utilisateur anonyme',
                        university: announcement.user?.university || null,
                        phone: announcement.user?.phone || '+33000000000',
                        avatar: announcement.user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop&crop=face',
                        isStudent: announcement.user?.is_student || false,
                        rating: parseFloat(announcement.user?.rating) || 0,
                        responseTime: '2h' // Default response time
                    },
                    images: announcement.images || [],
                    media: announcement.media || [],
                    createdAt: announcement.created_at,
                    location: announcement.location || 'Non spécifié',
                    views: announcement.views_count || announcement.views || 0,
                    likes: announcement.likes_count || announcement.likes || 0,
                    isFavorite: announcement.is_liked || false,
                    isNegotiable: true, // Default to negotiable
                    condition: null // Not in API yet
                    };
                });
                
                setAnnouncements(transformedAnnouncements);
                setFilteredAnnouncements(transformedAnnouncements);
            } else {
                console.error('Failed to fetch announcements:', data.message);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        let filtered = announcements;

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(ann => 
                ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ann.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ann.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ann.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par catégorie
        if (filterCategory !== 'all') {
            filtered = filtered.filter(ann => ann.category === filterCategory);
        }

        // Filtre par statut
        if (filterStatus !== 'all') {
            filtered = filtered.filter(ann => ann.status === filterStatus);
        }

        // Tri
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                filtered.sort((a, b) => b.views - a.views);
                break;
        }

        setFilteredAnnouncements(filtered);
    }, [searchTerm, filterCategory, filterStatus, sortBy, announcements]);

    const handleWhatsAppContact = (author) => {
        const message = encodeURIComponent(`Salut ${author.name}! Je viens de voir ton annonce sur CampusVente et j'aimerais te contacter. 👋`);
        window.open(`https://wa.me/${author.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    const toggleLike = async (id) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements/${id}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Si auth requise
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Mettre à jour les états
                setAnnouncements(prev => 
                    prev.map(ann => 
                        ann.id === id ? { 
                            ...ann, 
                            isFavorite: data.data.is_liked,
                            likes: data.data.likes_count
                        } : ann
                    )
                );
                setFilteredAnnouncements(prev => 
                    prev.map(ann => 
                        ann.id === id ? { 
                            ...ann, 
                            isFavorite: data.data.is_liked,
                            likes: data.data.likes_count
                        } : ann
                    )
                );
                
                // Synchroniser avec localStorage pour les favoris
                const savedFavorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || '[]');
                if (data.data.is_liked) {
                    if (!savedFavorites.includes(id)) {
                        savedFavorites.push(id);
                    }
                } else {
                    const index = savedFavorites.indexOf(id);
                    if (index > -1) {
                        savedFavorites.splice(index, 1);
                    }
                }
                localStorage.setItem(`favorites_${user.id}`, JSON.stringify(savedFavorites));
            } else {
                console.error('Erreur lors du like:', data.message);
                // Fallback vers comportement local si API échoue
                setAnnouncements(prev => 
                    prev.map(ann => 
                        ann.id === id ? { 
                            ...ann, 
                            isFavorite: !ann.isFavorite,
                            likes: ann.isFavorite ? ann.likes - 1 : ann.likes + 1
                        } : ann
                    )
                );
                setFilteredAnnouncements(prev => 
                    prev.map(ann => 
                        ann.id === id ? { 
                            ...ann, 
                            isFavorite: !ann.isFavorite,
                            likes: ann.isFavorite ? ann.likes - 1 : ann.likes + 1
                        } : ann
                    )
                );
            }
        } catch (error) {
            console.error('Erreur réseau lors du like:', error);
            // Fallback vers comportement local
            setAnnouncements(prev => 
                prev.map(ann => 
                    ann.id === id ? { 
                        ...ann, 
                        isFavorite: !ann.isFavorite,
                        likes: ann.isFavorite ? ann.likes - 1 : ann.likes + 1
                    } : ann
                )
            );
            setFilteredAnnouncements(prev => 
                prev.map(ann => 
                    ann.id === id ? { 
                        ...ann, 
                        isFavorite: !ann.isFavorite,
                        likes: ann.isFavorite ? ann.likes - 1 : ann.likes + 1
                    } : ann
                )
            );
        }
    };

    const recordView = async (announcementId) => {
        try {
            await fetch(`http://127.0.0.1:8000/api/v1/announcements/${announcementId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la vue:', error);
        }
    };

    const toggleFavorite = (id) => {
        setAnnouncements(prev => 
            prev.map(ann => 
                ann.id === id ? { ...ann, isFavorite: !ann.isFavorite } : ann
            )
        );
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
                        <p className="text-muted mt-3">Chargement des annonces...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-with-navbar">
            <Container className="py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-1">📢 Annonces Campus</h2>
                                <p className="text-muted mb-0">
                                    {filteredAnnouncements.length} annonce{filteredAnnouncements.length > 1 ? 's' : ''} disponible{filteredAnnouncements.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button as={Link} to="/create-announcement" className="btn-modern btn-gradient">
                                    ➕ Publier une annonce
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Filtres et recherche */}
                <Row className="mb-4">
                    <Col md={4}>
                        <InputGroup>
                            <InputGroup.Text>🔍</InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Rechercher une annonce..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="all">Toutes les catégories</option>
                            {[...new Set(announcements.map(ann => ann.category))].map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actives</option>
                            <option value="paused">En pause</option>
                            <option value="sold">Vendues</option>
                            <option value="expired">Expirées</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Plus récentes</option>
                            <option value="oldest">Plus anciennes</option>
                            <option value="price-low">Prix croissant</option>
                            <option value="price-high">Prix décroissant</option>
                            <option value="popular">Plus populaires</option>
                        </Form.Select>
                    </Col>
                </Row>

                {/* Grille des annonces */}
                {filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-muted mb-3">Aucune annonce trouvée</h4>
                        <p className="text-muted">Modifiez vos filtres ou publiez la première annonce</p>
                        <Button className="btn-modern btn-gradient" onClick={() => setShowCreateModal(true)}>
                            ➕ Publier une annonce
                        </Button>
                    </div>
                ) : (
                    <Row className="g-4">
                        {filteredAnnouncements.map(announcement => (
                            <Col key={announcement.id} md={6} lg={4}>
                                <Card className="card-modern h-100 announcement-card">
                                    <div className="position-relative">
                                        <div style={{ height: '200px' }}>
                                            <MediaGallery
                                                media={announcement.media}
                                                images={announcement.images}
                                                title={announcement.title}
                                                onImageClick={() => { setSelectedAnnouncement(announcement); recordView(announcement.id); }}
                                            />
                                        </div>
                                        <div className="position-absolute top-0 start-0 m-2">
                                            <Badge bg="primary" className="me-1">
                                                {getTypeIcon(announcement.type)} {announcement.category}
                                            </Badge>
                                            {announcement.status !== 'active' && (
                                                <Badge bg={announcement.status === 'sold' ? 'secondary' : announcement.status === 'paused' ? 'warning' : 'danger'}>
                                                    {announcement.status === 'sold' ? '✅ Vendue' : 
                                                     announcement.status === 'paused' ? '⏸️ En pause' : 
                                                     announcement.status === 'expired' ? '⏰ Expirée' : announcement.status}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <Button 
                                                variant="outline-light" 
                                                size="sm"
                                                className="border-0 bg-white bg-opacity-75"
                                                onClick={() => toggleLike(announcement.id)}
                                            >
                                                {announcement.isFavorite ? '❤️' : '🤍'}
                                            </Button>
                                        </div>
                                        {announcement.price > 0 && (
                                            <div className="position-absolute bottom-0 end-0 m-2">
                                                <Badge className="price-badge" style={{background: 'var(--primary-gradient)'}}>
                                                    {announcement.price.toLocaleString('fr-FR')} FCFA
                                                    {announcement.isNegotiable && <small> (négociable)</small>}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <img 
                                                src={announcement.author.avatar} 
                                                alt={announcement.author.name}
                                                className="rounded-circle me-2"
                                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                            />
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-1">
                                                    <small className="fw-bold">{announcement.author.name}</small>
                                                    {announcement.author.isStudent && (
                                                        <Badge className="student-badge" style={{ fontSize: '8px' }}>
                                                            Étudiant
                                                        </Badge>
                                                    )}
                                                    {announcement.author.rating > 0 && (
                                                        <small className="text-warning">
                                                            {announcement.author.rating}⭐
                                                        </small>
                                                    )}
                                                </div>
                                                <div className="d-flex align-items-center gap-1">
                                                    <small className="text-muted" style={{ fontSize: '10px' }}>
                                                        📍 {announcement.location}
                                                    </small>
                                                    <small className="text-muted" style={{ fontSize: '10px' }}>
                                                        • ⏱️ {announcement.author.responseTime}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        <h6 className="fw-bold mb-2" style={{ cursor: 'pointer' }} onClick={() => { setSelectedAnnouncement(announcement); recordView(announcement.id); }}>
                                            {announcement.title}
                                        </h6>
                                        <p className="text-muted mb-3" style={{ 
                                            fontSize: '13px', 
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {announcement.description}
                                        </p>

                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <small className="text-muted">
                                                    👁️ {announcement.views}
                                                </small>
                                                <small className="text-muted">
                                                    💚 {announcement.likes}
                                                </small>
                                            </div>
                                            <small className="text-muted">
                                                {formatDate(announcement.createdAt)}
                                            </small>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <Button 
                                                size="sm" 
                                                className="btn-modern flex-fill"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontSize: '12px'
                                                }}
                                                onClick={() => handleWhatsAppContact(announcement.author)}
                                            >
                                                💬 Contacter
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline-primary"
                                                className="btn-modern"
                                                onClick={() => { setSelectedAnnouncement(announcement); recordView(announcement.id); }}
                                            >
                                                👁️ Voir
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Modal détails */}
                {selectedAnnouncement && (
                    <Modal show={!!selectedAnnouncement} onHide={() => setSelectedAnnouncement(null)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {getTypeIcon(selectedAnnouncement.type)} {selectedAnnouncement.title}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={6}>
                                    <div className="mb-3" style={{ height: '300px' }}>
                                        <MediaGallery
                                            media={selectedAnnouncement.media}
                                            images={selectedAnnouncement.images}
                                            title={selectedAnnouncement.title}
                                        />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <Badge bg="primary" className="mb-2">
                                            {selectedAnnouncement.category}
                                        </Badge>
                                        {selectedAnnouncement.price > 0 && (
                                            <h3 className="fw-bold text-primary">
                                                {selectedAnnouncement.price.toLocaleString('fr-FR')} FCFA
                                                {selectedAnnouncement.isNegotiable && (
                                                    <small className="text-muted"> (négociable)</small>
                                                )}
                                            </h3>
                                        )}
                                    </div>
                                    
                                    <p className="mb-3">{selectedAnnouncement.description}</p>
                                    
                                    <div className="mb-3">
                                        <strong>📍 Localisation:</strong> {selectedAnnouncement.location}
                                    </div>
                                    
                                    {selectedAnnouncement.condition && (
                                        <div className="mb-3">
                                            <strong>📋 État:</strong> {selectedAnnouncement.condition}
                                        </div>
                                    )}
                                    
                                    <div className="mb-3">
                                        <strong>👁️ Vues:</strong> {selectedAnnouncement.views} • 
                                        <strong> 💚 Likes:</strong> {selectedAnnouncement.likes}
                                    </div>
                                    
                                    <hr />
                                    
                                    <div className="d-flex align-items-center mb-3">
                                        <img 
                                            src={selectedAnnouncement.author.avatar} 
                                            alt={selectedAnnouncement.author.name}
                                            className="rounded-circle me-3"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <div className="fw-bold">{selectedAnnouncement.author.name}</div>
                                            <div className="text-muted">
                                                {selectedAnnouncement.author.university || 'Utilisateur'}
                                            </div>
                                            <div className="d-flex align-items-center gap-1">
                                                <small className="text-warning">
                                                    {selectedAnnouncement.author.rating}⭐
                                                </small>
                                                <small className="text-muted">
                                                    • Répond en {selectedAnnouncement.author.responseTime}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex gap-2">
                                        <Button 
                                            className="btn-modern flex-fill"
                                            style={{ 
                                                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                border: 'none',
                                                color: 'white'
                                            }}
                                            onClick={() => handleWhatsAppContact(selectedAnnouncement.author)}
                                        >
                                            💬 Contacter via WhatsApp
                                        </Button>
                                        <Button 
                                            variant="outline-primary"
                                            className="btn-modern"
                                            onClick={() => toggleLike(selectedAnnouncement.id)}
                                        >
                                            {selectedAnnouncement.isFavorite ? '❤️' : '🤍'}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Modal.Body>
                    </Modal>
                )}

                {/* Modal création d'annonce */}
                <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>➕ Publier une nouvelle annonce</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Titre de l'annonce</Form.Label>
                                        <Form.Control type="text" placeholder="Ex: MacBook Pro 2021..." />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Catégorie</Form.Label>
                                        <Form.Select>
                                            <option>Électronique</option>
                                            <option>Logement</option>
                                            <option>Services</option>
                                            <option>Livres</option>
                                            <option>Événements</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows={4} placeholder="Décrivez votre annonce..." />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Prix (FCFA)</Form.Label>
                                        <Form.Control type="number" placeholder="0" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Localisation</Form.Label>
                                        <Form.Control type="text" placeholder="Ex: Paris 5ème" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Check 
                                    type="checkbox" 
                                    label="Prix négociable" 
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Annuler
                        </Button>
                        <Button className="btn-modern btn-gradient" onClick={() => setShowCreateModal(false)}>
                            Publier l'annonce
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Announcements;