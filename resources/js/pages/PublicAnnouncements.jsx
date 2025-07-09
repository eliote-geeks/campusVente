import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const PublicAnnouncements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Données simulées d'annonces publiques
    const sampleAnnouncements = [
        {
            id: 1,
            title: 'MacBook Pro 2021 - Excellent état',
            description: 'MacBook Pro 13" M1, 8GB RAM, 256GB SSD. Utilisé pour mes études pendant 6 mois, excellent état. Vendu car je pars à l\'étranger. Livré avec chargeur original et housse de protection.',
            price: 1200,
            category: 'Électronique',
            type: 'sell',
            author: {
                name: 'Marie Dupont',
                university: 'Sorbonne Université',
                phone: '+33612345678',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                rating: 4.8,
                responseTime: '2h'
            },
            images: [
                'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop'
            ],
            createdAt: '2024-01-15T10:30:00Z',
            location: 'Paris 5ème',
            views: 156,
            likes: 12,
            isFavorite: false,
            isNegotiable: true,
            condition: 'Excellent'
        },
        {
            id: 2,
            title: 'Colocation proche campus - Chambre libre',
            description: 'Belle chambre de 12m² dans appartement 3 pièces situé à 5 minutes à pied du campus. Loyer 600€/mois charges comprises (eau, électricité, internet). Cuisine équipée, salle de bain récente. Ambiance studieuse et conviviale.',
            price: 600,
            category: 'Logement',
            type: 'housing',
            author: {
                name: 'Paul Martin',
                university: 'Université de Paris',
                phone: '+33687654321',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                rating: 4.6,
                responseTime: '1h'
            },
            images: [
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
            ],
            createdAt: '2024-01-14T15:45:00Z',
            location: 'Paris 14ème',
            views: 234,
            likes: 18,
            isFavorite: true,
            isNegotiable: false,
            condition: null
        },
        {
            id: 3,
            title: 'Cours particuliers de mathématiques',
            description: 'Professeur expérimenté (10 ans d\'expérience) propose cours particuliers de mathématiques pour tous niveaux (collège, lycée, prépa, université). Méthodes pédagogiques adaptées à chaque élève. Première séance gratuite pour évaluation.',
            price: 25,
            category: 'Services',
            type: 'service',
            author: {
                name: 'Sophie Legrand',
                university: null,
                phone: '+33645123789',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
                isStudent: false,
                rating: 4.9,
                responseTime: '30min'
            },
            images: [
                'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop'
            ],
            createdAt: '2024-01-13T09:20:00Z',
            location: 'Paris 6ème',
            views: 89,
            likes: 25,
            isFavorite: false,
            isNegotiable: true,
            condition: null
        },
        {
            id: 4,
            title: 'iPhone 14 Pro - Comme neuf',
            description: 'iPhone 14 Pro 256GB couleur Deep Purple, acheté il y a 3 mois. État impeccable, toujours utilisé avec coque et verre trempé. Encore sous garantie Apple. Vendu avec boîte, chargeur et accessoires d\'origine.',
            price: 950,
            category: 'Électronique',
            type: 'sell',
            author: {
                name: 'Julie Bernard',
                university: 'École Normale Supérieure',
                phone: '+33634567890',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                rating: 4.7,
                responseTime: '1h'
            },
            images: [
                'https://images.unsplash.com/photo-1592286638595-0df8be7d99ba?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop'
            ],
            createdAt: '2024-01-11T14:20:00Z',
            location: 'Paris 5ème',
            views: 345,
            likes: 28,
            isFavorite: false,
            isNegotiable: true,
            condition: 'Comme neuf'
        },
        {
            id: 5,
            title: 'Livres de droit constitutionnel',
            description: 'Collection complète de manuels de droit constitutionnel pour L1 à M2. Tous les ouvrages sont en parfait état, annotations utiles incluses. Idéal pour étudiants en droit. Possibilité de vente à l\'unité.',
            price: 120,
            category: 'Livres',
            type: 'sell',
            author: {
                name: 'Alexandre Petit',
                university: 'Sciences Po Paris',
                phone: '+33676543210',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                rating: 4.3,
                responseTime: '3h'
            },
            images: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
            ],
            createdAt: '2024-01-10T11:15:00Z',
            location: 'Paris 7ème',
            views: 67,
            likes: 8,
            isFavorite: false,
            isNegotiable: true,
            condition: 'Très bon'
        },
        {
            id: 6,
            title: 'Soirée étudiante - Fête de fin d\'examens',
            description: 'Grande soirée étudiante pour célébrer la fin des examens ! Musique, boissons, ambiance garantie. Ouvert à tous les étudiants parisiens. Entrée libre avec carte étudiant. Rendez-vous ce samedi 20h.',
            price: 0,
            category: 'Événements',
            type: 'event',
            author: {
                name: 'Tom Rousseau',
                university: 'Université Lyon 1',
                phone: '+33698765432',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                rating: 4.5,
                responseTime: '1h'
            },
            images: [
                'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop'
            ],
            createdAt: '2024-01-12T18:00:00Z',
            location: 'Paris 11ème',
            views: 456,
            likes: 89,
            isFavorite: true,
            isNegotiable: false,
            condition: null
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setAnnouncements(sampleAnnouncements);
            setFilteredAnnouncements(sampleAnnouncements);
            setLoading(false);
        }, 1000);
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
    }, [searchTerm, filterCategory, sortBy, announcements]);

    const handleWhatsAppContact = (author) => {
        const message = encodeURIComponent(`Salut ${author.name}! Je viens de voir ton annonce sur CampusVente et j'aimerais te contacter. 👋`);
        window.open(`https://wa.me/${author.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
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
                                <Button as={Link} to="/dashboard" className="btn-modern" variant="outline-primary">
                                    📊 Dashboard
                                </Button>
                                <Button className="btn-modern btn-gradient" onClick={() => setShowCreateModal(true)}>
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
                            <option value="Électronique">📱 Électronique</option>
                            <option value="Logement">🏠 Logement</option>
                            <option value="Services">🛠️ Services</option>
                            <option value="Livres">📚 Livres</option>
                            <option value="Événements">🎉 Événements</option>
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
                                        <img 
                                            src={announcement.images[0]} 
                                            alt={announcement.title}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                                            onClick={() => setSelectedAnnouncement(announcement)}
                                        />
                                        <div className="position-absolute top-0 start-0 m-2">
                                            <Badge bg="primary" className="me-1">
                                                {getTypeIcon(announcement.type)} {announcement.category}
                                            </Badge>
                                        </div>
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <Button 
                                                variant="outline-light" 
                                                size="sm"
                                                className="border-0 bg-white bg-opacity-75"
                                                onClick={() => toggleFavorite(announcement.id)}
                                            >
                                                {announcement.isFavorite ? '❤️' : '🤍'}
                                            </Button>
                                        </div>
                                        {announcement.price > 0 && (
                                            <div className="position-absolute bottom-0 end-0 m-2">
                                                <Badge className="price-badge" style={{background: 'var(--primary-gradient)'}}>
                                                    {announcement.price}€
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

                                        <h6 className="fw-bold mb-2" style={{ cursor: 'pointer' }} onClick={() => setSelectedAnnouncement(announcement)}>
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
                                                onClick={() => setSelectedAnnouncement(announcement)}
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
                                    <div className="mb-3">
                                        <img 
                                            src={selectedAnnouncement.images[0]} 
                                            alt={selectedAnnouncement.title}
                                            className="img-fluid rounded"
                                            style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    {selectedAnnouncement.images.length > 1 && (
                                        <div className="d-flex gap-2">
                                            {selectedAnnouncement.images.slice(1).map((img, index) => (
                                                <img 
                                                    key={index}
                                                    src={img} 
                                                    alt={`${selectedAnnouncement.title} ${index + 2}`}
                                                    className="rounded"
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <Badge bg="primary" className="mb-2">
                                            {selectedAnnouncement.category}
                                        </Badge>
                                        {selectedAnnouncement.price > 0 && (
                                            <h3 className="fw-bold text-primary">
                                                {selectedAnnouncement.price}€
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
                                            onClick={() => toggleFavorite(selectedAnnouncement.id)}
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
                                        <Form.Label>Prix (€)</Form.Label>
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

export default PublicAnnouncements;