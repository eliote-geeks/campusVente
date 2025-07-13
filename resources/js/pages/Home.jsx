import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Home = () => {
    const { user } = useAuth();
    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [priceFilter, setPriceFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalOffers, setTotalOffers] = useState(0);

    // Enregistrer une vue
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

    // Fetch offers from API with pagination
    const fetchOffers = async (page = 1, reset = false) => {
        try {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);

            const response = await fetch(`http://127.0.0.1:8000/api/v1/announcements?status=active&page=${page}&per_page=10&with_interactions=true`);
            const data = await response.json();
            
            if (data.success) {
                // Transform API data to match component expectations
                const transformedOffers = data.data.map(announcement => ({
                    id: announcement.id,
                    author: {
                        name: announcement.user?.name || 'Utilisateur anonyme',
                        avatar: announcement.user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop&crop=face',
                        isStudent: announcement.user?.is_student || false,
                        university: announcement.user?.university || null,
                        phone: announcement.user?.phone || '+33000000000',
                        rating: parseFloat(announcement.user?.rating) || 0
                    },
                    title: announcement.title,
                    description: announcement.description,
                    price: parseFloat(announcement.price),
                    category: announcement.category?.name || 'Non classifié',
                    image: announcement.images && announcement.images.length > 0 
                        ? announcement.images[0] 
                        : 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
                    createdAt: announcement.created_at,
                    type: announcement.type,
                    views: announcement.views_count || announcement.views || 0,
                    likes: announcement.likes_count || Math.floor(Math.random() * 50),
                    location: announcement.location || 'Non spécifié',
                    isLiked: announcement.is_liked || false,
                    isFavorite: false
                }));
                
                if (reset || page === 1) {
                    setOffers(transformedOffers);
                    setFilteredOffers(transformedOffers);
                } else {
                    const newOffers = [...offers, ...transformedOffers];
                    setOffers(newOffers);
                    setFilteredOffers(newOffers);
                }

                setTotalOffers(data.meta?.total || transformedOffers.length);
                setHasMore(data.meta ? data.meta.current_page < data.meta.last_page : transformedOffers.length === 10);
                setCurrentPage(page);
            } else {
                console.error('Failed to fetch offers:', data.message);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchOffers(1, true);
    }, []);

    // Filtrage et recherche local
    useEffect(() => {
        let filtered = offers;

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(offer => 
                offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offer.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                offer.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par type
        if (filter !== 'all') {
            filtered = filtered.filter(offer => offer.type === filter);
        }

        // Filtre par prix
        if (priceFilter !== 'all') {
            if (priceFilter === 'free') {
                filtered = filtered.filter(offer => offer.price === 0);
            } else if (priceFilter === 'low') {
                filtered = filtered.filter(offer => offer.price > 0 && offer.price <= 50000);
            } else if (priceFilter === 'medium') {
                filtered = filtered.filter(offer => offer.price > 50000 && offer.price <= 200000);
            } else if (priceFilter === 'high') {
                filtered = filtered.filter(offer => offer.price > 200000);
            }
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
            case 'liked':
                filtered.sort((a, b) => b.likes - a.likes);
                break;
        }

        setFilteredOffers(filtered);
    }, [searchTerm, filter, priceFilter, sortBy, offers]);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loadingMore || !hasMore) return;
        fetchOffers(currentPage + 1);
    }, [currentPage, loadingMore, hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);


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
                setOffers(prev => 
                    prev.map(offer => 
                        offer.id === id ? { 
                            ...offer, 
                            isLiked: data.data.is_liked,
                            likes: data.data.likes_count
                        } : offer
                    )
                );
                setFilteredOffers(prev => 
                    prev.map(offer => 
                        offer.id === id ? { 
                            ...offer, 
                            isLiked: data.data.is_liked,
                            likes: data.data.likes_count
                        } : offer
                    )
                );
            } else {
                console.error('Erreur lors du like:', data.message);
                // Fallback vers comportement local si API échoue
                setOffers(prev => 
                    prev.map(offer => 
                        offer.id === id ? { 
                            ...offer, 
                            isLiked: !offer.isLiked,
                            likes: offer.isLiked ? offer.likes - 1 : offer.likes + 1
                        } : offer
                    )
                );
                setFilteredOffers(prev => 
                    prev.map(offer => 
                        offer.id === id ? { 
                            ...offer, 
                            isLiked: !offer.isLiked,
                            likes: offer.isLiked ? offer.likes - 1 : offer.likes + 1
                        } : offer
                    )
                );
            }
        } catch (error) {
            console.error('Erreur réseau lors du like:', error);
            // Fallback vers comportement local
            setOffers(prev => 
                prev.map(offer => 
                    offer.id === id ? { 
                        ...offer, 
                        isLiked: !offer.isLiked,
                        likes: offer.isLiked ? offer.likes - 1 : offer.likes + 1
                    } : offer
                )
            );
            setFilteredOffers(prev => 
                prev.map(offer => 
                    offer.id === id ? { 
                        ...offer, 
                        isLiked: !offer.isLiked,
                        likes: offer.isLiked ? offer.likes - 1 : offer.likes + 1
                    } : offer
                )
            );
        }
    };

    const toggleFavorite = (id) => {
        setOffers(prev => 
            prev.map(offer => 
                offer.id === id ? { ...offer, isFavorite: !offer.isFavorite } : offer
            )
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return date.toLocaleDateString('fr-FR');
    };

    const loadMorePosts = () => {
        if (!loadingMore && hasMore) {
            fetchOffers(currentPage + 1);
        }
    };

    return (
        <div className="content-with-navbar">
            <Container className="py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-1">🏠 Feed Campus</h2>
                                <p className="text-muted mb-0">
                                    {filteredOffers.length} offre{filteredOffers.length > 1 ? 's' : ''} trouvée{filteredOffers.length > 1 ? 's' : ''} sur {totalOffers} au total
                                </p>
                            </div>
                            <Button as={Link} to="/create-announcement" className="btn-modern btn-gradient">
                                ➕ Publier une offre
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Barre de recherche et filtres */}
                <Row className="mb-4">
                    <Col md={4}>
                        <InputGroup>
                            <InputGroup.Text>🔍</InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Rechercher une offre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={2}>
                        <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">Tous types</option>
                            <option value="sell">💰 Vente</option>
                            <option value="housing">🏠 Logement</option>
                            <option value="service">🛠️ Services</option>
                            <option value="event">🎉 Événements</option>
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <Form.Select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                            <option value="all">Tous prix</option>
                            <option value="free">Gratuit</option>
                            <option value="low">0 - 50k FCFA</option>
                            <option value="medium">50k - 200k FCFA</option>
                            <option value="high">200k+ FCFA</option>
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Plus récentes</option>
                            <option value="oldest">Plus anciennes</option>
                            <option value="price-low">Prix croissant</option>
                            <option value="price-high">Prix décroissant</option>
                            <option value="popular">Plus vues</option>
                            <option value="liked">Plus aimées</option>
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <Button 
                            variant="outline-secondary" 
                            className="w-100"
                            onClick={() => {
                                setSearchTerm('');
                                setFilter('all');
                                setPriceFilter('all');
                                setSortBy('newest');
                            }}
                        >
                            🔄 Reset
                        </Button>
                    </Col>
                </Row>

                {/* Grille style réseau social */}
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="text-muted mt-3">Chargement du feed...</p>
                        </div>
                    </div>
                ) : (
                    <Row className="g-4">
                        {filteredOffers.map(offer => (
                            <Col key={offer.id} md={6} lg={4}>
                                <Card className="card-modern h-100 shadow-sm">
                                    {/* Header du post - compact pour grille */}
                                    <Card.Body className="pb-2">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center">
                                                <img 
                                                    src={offer.author.avatar} 
                                                    alt={offer.author.name}
                                                    className="rounded-circle me-2"
                                                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <h6 className="fw-bold mb-0 small">{offer.author.name}</h6>
                                                        {offer.author.isStudent && (
                                                            <Badge className="student-badge" style={{ fontSize: '8px' }}>
                                                                Étudiant
                                                            </Badge>
                                                        )}
                                                        {offer.author.rating > 0 && (
                                                            <span className="text-warning" style={{ fontSize: '10px' }}>
                                                                {offer.author.rating}⭐
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="text-muted" style={{ fontSize: '10px' }}>
                                                        {formatDate(offer.createdAt)} • 📍 {offer.location}
                                                    </small>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline-secondary" 
                                                size="sm"
                                                className="border-0 p-1"
                                                onClick={() => toggleLike(offer.id)}
                                            >
                                                {offer.isLiked ? '❤️' : '🤍'}
                                            </Button>
                                        </div>

                                        {/* Badge catégorie et prix */}
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Badge bg="primary" className="small">{offer.category}</Badge>
                                            {offer.price > 0 && (
                                                <h6 className="text-primary fw-bold mb-0">
                                                    {offer.price.toLocaleString('fr-FR')} FCFA
                                                </h6>
                                            )}
                                        </div>

                                        {/* Titre */}
                                        <h6 className="fw-bold mb-2" style={{ lineHeight: '1.3' }}>
                                            {offer.title}
                                        </h6>
                                    </Card.Body>

                                    {/* Image */}
                                    <div className="position-relative">
                                        <img 
                                            src={offer.image} 
                                            alt={offer.title}
                                            className="w-100"
                                            style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                                            onClick={() => recordView(offer.id)}
                                        />
                                    </div>

                                    {/* Description et actions */}
                                    <Card.Body className="pt-3">
                                        <p className="text-muted small mb-3" style={{ 
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {offer.description}
                                        </p>

                                        {/* Stats et actions */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="d-flex gap-3">
                                                <Button 
                                                    variant="link" 
                                                    className="p-0 text-decoration-none d-flex align-items-center gap-1"
                                                    onClick={() => toggleLike(offer.id)}
                                                >
                                                    <span style={{ fontSize: '16px' }}>
                                                        {offer.isLiked ? '❤️' : '🤍'}
                                                    </span>
                                                    <small className="text-muted">{offer.likes}</small>
                                                </Button>
                                                <div className="d-flex align-items-center gap-1">
                                                    <span style={{ fontSize: '14px' }}>👁️</span>
                                                    <small className="text-muted">{offer.views}</small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bouton WhatsApp */}
                                        <Button 
                                            className="btn-modern w-100"
                                            size="sm"
                                            style={{ 
                                                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                border: 'none',
                                                color: 'white'
                                            }}
                                            onClick={() => handleWhatsAppContact(offer.author)}
                                        >
                                            💬 Contacter
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Bouton charger plus - centré */}
                {hasMore && !loading && filteredOffers.length > 0 && (
                    <Row className="mt-4">
                        <Col className="text-center">
                            <Button 
                                variant="outline-primary" 
                                onClick={loadMorePosts}
                                disabled={loadingMore}
                                className="btn-modern"
                            >
                                {loadingMore ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Chargement...
                                    </>
                                ) : (
                                    'Voir plus d\'offres'
                                )}
                            </Button>
                        </Col>
                    </Row>
                )}

                {/* Indicateur de scroll infini */}
                {loadingMore && (
                    <Row className="mt-3">
                        <Col className="text-center">
                            <Spinner size="sm" className="me-2" />
                            <small className="text-muted">Chargement de nouvelles offres...</small>
                        </Col>
                    </Row>
                )}

                {filteredOffers.length === 0 && !loading && (
                    <Row>
                        <Col md={8} className="mx-auto">
                            <div className="text-center py-5">
                                <h5 className="text-muted mb-3">Aucune offre trouvée</h5>
                                <p className="text-muted">Modifiez vos filtres ou créez une nouvelle offre</p>
                                <Button as={Link} to="/create-announcement" className="btn-modern btn-gradient">
                                    ➕ Créer une offre
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default Home;