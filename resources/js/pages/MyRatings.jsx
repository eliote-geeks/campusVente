import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';

const MyRatings = () => {
    const { user } = useAuth();
    const [receivedRatings, setReceivedRatings] = useState([]);
    const [givenRatings, setGivenRatings] = useState([]);
    const [ratingStats, setRatingStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Récupérer les notes reçues
    useEffect(() => {
        const fetchReceivedRatings = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${user.id}/ratings`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    setReceivedRatings(data.data.ratings || []);
                    setRatingStats(data.data.stats || {});
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des notes reçues:', error);
                setErrorMessage('Erreur lors du chargement des notes reçues');
            }
        };

        if (user?.id) {
            fetchReceivedRatings();
        }
    }, [user?.id]);

    // Récupérer les notes données
    useEffect(() => {
        const fetchGivenRatings = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/my-given-ratings', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    setGivenRatings(data.data.ratings || []);
                }
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des notes données:', error);
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchGivenRatings();
        }
    }, [user?.id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionTypeLabel = (type) => {
        switch (type) {
            case 'announcement': return 'Annonce/Achat';
            case 'service': return 'Service';
            case 'general': return 'Général';
            default: return 'Autre';
        }
    };

    const getTransactionTypeColor = (type) => {
        switch (type) {
            case 'announcement': return 'primary';
            case 'service': return 'info';
            case 'general': return 'secondary';
            default: return 'light';
        }
    };

    const renderStarRating = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const renderRatingDistribution = () => {
        if (!ratingStats?.rating_distribution) return null;

        return (
            <Card className="mb-4">
                <Card.Header>
                    <h6 className="fw-bold mb-0">📊 Répartition des notes</h6>
                </Card.Header>
                <Card.Body>
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = ratingStats.rating_distribution[star] || 0;
                        const percentage = ratingStats.total_ratings > 0 ? (count / ratingStats.total_ratings) * 100 : 0;
                        
                        return (
                            <div key={star} className="d-flex align-items-center mb-2">
                                <span className="me-2" style={{ minWidth: '60px' }}>
                                    {star} ⭐
                                </span>
                                <ProgressBar 
                                    now={percentage} 
                                    className="flex-grow-1 me-2"
                                    style={{ height: '20px' }}
                                />
                                <span className="text-muted" style={{ minWidth: '40px' }}>
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </Card.Body>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="text-muted mt-3">Chargement de vos notes...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-with-navbar">
            <Container className="py-4">
                {errorMessage && (
                    <Alert variant="danger" className="mb-4">
                        {errorMessage}
                    </Alert>
                )}

                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <h2 className="fw-bold mb-1">⭐ Mes Notes et Évaluations</h2>
                        <p className="text-muted mb-0">
                            Gérez vos évaluations reçues et données
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col lg={4}>
                        {/* Statistiques générales */}
                        <Card className="card-modern mb-4">
                            <Card.Header>
                                <h6 className="fw-bold mb-0">📈 Mes Statistiques</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="text-center mb-3">
                                    <div className="display-4 fw-bold text-warning">
                                        {ratingStats?.average_rating ? parseFloat(ratingStats.average_rating).toFixed(1) : '0.0'}
                                    </div>
                                    <div className="text-muted">Note moyenne</div>
                                    <div className="mt-2">
                                        {ratingStats?.average_rating && renderStarRating(Math.round(ratingStats.average_rating))}
                                    </div>
                                </div>
                                
                                <hr />
                                
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Notes reçues</span>
                                    <Badge bg="warning">{ratingStats?.total_ratings || 0}</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Notes données</span>
                                    <Badge bg="info">{givenRatings.length}</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Taux de satisfaction</span>
                                    <span className="fw-bold text-success">
                                        {ratingStats?.average_rating ? Math.round((ratingStats.average_rating / 5) * 100) : 0}%
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Répartition des notes */}
                        {renderRatingDistribution()}
                    </Col>

                    <Col lg={8}>
                        <Card className="card-modern">
                            <Card.Body>
                                <Tabs defaultActiveKey="received" className="mb-3">
                                    <Tab eventKey="received" title={`📥 Reçues (${receivedRatings.length})`}>
                                        {receivedRatings.length === 0 ? (
                                            <div className="text-center py-5">
                                                <span style={{ fontSize: '48px' }}>⭐</span>
                                                <h5 className="text-muted mt-3">Aucune note reçue</h5>
                                                <p className="text-muted">
                                                    Commencez à vendre ou rendre des services pour recevoir vos premières évaluations !
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {receivedRatings.map((rating, index) => (
                                                    <Card key={index} className="border-0 bg-light mb-3">
                                                        <Card.Body className="p-3">
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Avatar
                                                                        src={rating.rater?.avatar}
                                                                        name={rating.rater?.name}
                                                                        size={40}
                                                                    />
                                                                    <div>
                                                                        <div className="fw-semibold">{rating.rater?.name}</div>
                                                                        <small className="text-muted">
                                                                            {formatDate(rating.created_at)}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <div className="text-warning fw-bold mb-1">
                                                                        {renderStarRating(rating.rating)}
                                                                    </div>
                                                                    <Badge bg={getTransactionTypeColor(rating.transaction_type)} style={{ fontSize: '10px' }}>
                                                                        {getTransactionTypeLabel(rating.transaction_type)}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            {rating.comment && (
                                                                <div className="bg-white p-3 rounded">
                                                                    <p className="mb-0 text-muted" style={{ fontSize: '14px' }}>
                                                                        "{rating.comment}"
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </Tab>

                                    <Tab eventKey="given" title={`📤 Données (${givenRatings.length})`}>
                                        {givenRatings.length === 0 ? (
                                            <div className="text-center py-5">
                                                <span style={{ fontSize: '48px' }}>📝</span>
                                                <h5 className="text-muted mt-3">Aucune note donnée</h5>
                                                <p className="text-muted">
                                                    Évaluez les vendeurs et prestataires après vos transactions !
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {givenRatings.map((rating, index) => (
                                                    <Card key={index} className="border-0 bg-light mb-3">
                                                        <Card.Body className="p-3">
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <Avatar
                                                                        src={rating.rated_user?.avatar}
                                                                        name={rating.rated_user?.name}
                                                                        size={40}
                                                                    />
                                                                    <div>
                                                                        <div className="fw-semibold">{rating.rated_user?.name}</div>
                                                                        <small className="text-muted">
                                                                            {formatDate(rating.created_at)}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <div className="text-warning fw-bold mb-1">
                                                                        {renderStarRating(rating.rating)}
                                                                    </div>
                                                                    <Badge bg={getTransactionTypeColor(rating.transaction_type)} style={{ fontSize: '10px' }}>
                                                                        {getTransactionTypeLabel(rating.transaction_type)}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            {rating.comment && (
                                                                <div className="bg-white p-3 rounded">
                                                                    <p className="mb-0 text-muted" style={{ fontSize: '14px' }}>
                                                                        "{rating.comment}"
                                                                    </p>
                                                                </div>
                                                            )}
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
            </Container>
        </div>
    );
};

export default MyRatings;