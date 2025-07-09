import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Home = () => {
    const { user } = useAuth();
    const [offers, setOffers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // Données simulées d'offres
    const sampleOffers = [
        {
            id: 1,
            author: {
                name: 'Marie Dupont',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                university: 'Sorbonne Université',
                phone: '+33612345678'
            },
            title: 'MacBook Pro 2021',
            description: 'MacBook Pro 13" M1, excellent état, utilisé pour mes études.',
            price: 1200,
            category: 'Électronique',
            image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
            createdAt: '2024-01-15T10:30:00Z',
            type: 'sell'
        },
        {
            id: 2,
            author: {
                name: 'Paul Martin',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                university: 'Université de Paris',
                phone: '+33687654321'
            },
            title: 'Colocation proche campus',
            description: 'Chambre dans appartement 2 pièces près du campus.',
            price: 600,
            category: 'Logement',
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
            createdAt: '2024-01-14T15:45:00Z',
            type: 'housing'
        },
        {
            id: 3,
            author: {
                name: 'Sophie Legrand',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
                isStudent: false,
                university: null,
                phone: '+33645123789'
            },
            title: 'Cours de mathématiques',
            description: 'Professeur expérimenté propose cours particuliers.',
            price: 25,
            category: 'Services',
            image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
            createdAt: '2024-01-13T09:20:00Z',
            type: 'service'
        },
        {
            id: 4,
            author: {
                name: 'Julie Bernard',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                university: 'École Normale Supérieure',
                phone: '+33634567890'
            },
            title: 'iPhone 14 Pro',
            description: 'iPhone 14 Pro 256GB, état impeccable, encore sous garantie.',
            price: 950,
            category: 'Électronique',
            image: 'https://images.unsplash.com/photo-1592286638595-0df8be7d99ba?w=400&h=300&fit=crop',
            createdAt: '2024-01-11T14:20:00Z',
            type: 'sell'
        },
        {
            id: 5,
            author: {
                name: 'Alexandre Petit',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                university: 'Sciences Po Paris',
                phone: '+33676543210'
            },
            title: 'Livres de droit',
            description: 'Collection complète de manuels de droit constitutionnel.',
            price: 120,
            category: 'Livres',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            createdAt: '2024-01-10T11:15:00Z',
            type: 'sell'
        },
        {
            id: 6,
            author: {
                name: 'Tom Rousseau',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
                isStudent: true,
                university: 'Université Lyon 1',
                phone: '+33698765432'
            },
            title: 'Soirée étudiante Lyon',
            description: 'Organisation d\'une soirée étudiante ce weekend.',
            category: 'Événements',
            image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
            createdAt: '2024-01-12T18:00:00Z',
            type: 'event'
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setOffers(sampleOffers);
            setLoading(false);
        }, 500);
    }, []);

    const filteredOffers = offers.filter(offer => {
        if (filter === 'all') return true;
        return offer.type === filter;
    });

    const handleWhatsAppContact = (author) => {
        const message = encodeURIComponent(`Salut ${author.name}! Je viens de voir ton annonce sur CampusVente et j'aimerais te contacter. 👋`);
        window.open(`https://wa.me/${author.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    return (
        <div className="content-with-navbar">
            <Container className="py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-1">🏠 Accueil - Offres du Campus</h2>
                                <p className="text-muted mb-0">
                                    {filteredOffers.length} offre{filteredOffers.length > 1 ? 's' : ''} disponible{filteredOffers.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button as={Link} to="/dashboard" className="btn-modern" variant="outline-primary">
                                    📊 Dashboard
                                </Button>
                                <Button as={Link} to="/announcements" className="btn-modern btn-gradient">
                                    ➕ Nouvelle offre
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Filtres */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex gap-2 flex-wrap">
                            <Button 
                                size="sm" 
                                className={`btn-modern ${filter === 'all' ? 'btn-gradient' : ''}`}
                                variant={filter === 'all' ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter('all')}
                            >
                                Toutes
                            </Button>
                            <Button 
                                size="sm" 
                                className={`btn-modern ${filter === 'sell' ? 'btn-gradient' : ''}`}
                                variant={filter === 'sell' ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter('sell')}
                            >
                                💰 Vente
                            </Button>
                            <Button 
                                size="sm" 
                                className={`btn-modern ${filter === 'housing' ? 'btn-gradient' : ''}`}
                                variant={filter === 'housing' ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter('housing')}
                            >
                                🏠 Logement
                            </Button>
                            <Button 
                                size="sm" 
                                className={`btn-modern ${filter === 'service' ? 'btn-gradient' : ''}`}
                                variant={filter === 'service' ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter('service')}
                            >
                                🛠️ Services
                            </Button>
                            <Button 
                                size="sm" 
                                className={`btn-modern ${filter === 'event' ? 'btn-gradient' : ''}`}
                                variant={filter === 'event' ? 'primary' : 'outline-primary'}
                                onClick={() => setFilter('event')}
                            >
                                🎉 Événements
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Grille des offres */}
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="text-muted mt-3">Chargement des offres...</p>
                        </div>
                    </div>
                ) : (
                    <Row className="g-4">
                        {filteredOffers.map(offer => (
                            <Col key={offer.id} md={6} lg={4} xl={3}>
                                <Card className="card-modern h-100">
                                    <div className="position-relative">
                                        <img 
                                            src={offer.image} 
                                            alt={offer.title}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <Badge bg="light" text="dark" className="me-1">
                                                {offer.category}
                                            </Badge>
                                            {offer.price && (
                                                <Badge style={{background: 'var(--primary-gradient)'}}>
                                                    {offer.price}€
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <img 
                                                src={offer.author.avatar} 
                                                alt={offer.author.name}
                                                className="rounded-circle me-2"
                                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                            />
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-1">
                                                    <small className="fw-bold">{offer.author.name}</small>
                                                    {offer.author.isStudent && (
                                                        <Badge className="student-badge" style={{ fontSize: '9px' }}>
                                                            Étudiant
                                                        </Badge>
                                                    )}
                                                </div>
                                                {offer.author.university && (
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>
                                                        {offer.author.university}
                                                    </small>
                                                )}
                                            </div>
                                        </div>

                                        <h6 className="fw-bold mb-2">{offer.title}</h6>
                                        <p className="text-muted mb-3" style={{ 
                                            fontSize: '13px', 
                                            lineHeight: '1.3',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {offer.description}
                                        </p>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                📞 {offer.author.phone}
                                            </small>
                                            <Button 
                                                size="sm" 
                                                className="btn-modern"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontSize: '11px',
                                                    padding: '4px 8px'
                                                }}
                                                onClick={() => handleWhatsAppContact(offer.author)}
                                            >
                                                💬 WhatsApp
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {filteredOffers.length === 0 && !loading && (
                    <div className="text-center py-5">
                        <h5 className="text-muted mb-3">Aucune offre trouvée</h5>
                        <p className="text-muted">Modifiez vos filtres ou créez une nouvelle offre</p>
                        <Button as={Link} to="/announcements" className="btn-modern btn-gradient">
                            ➕ Créer une offre
                        </Button>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default Home;