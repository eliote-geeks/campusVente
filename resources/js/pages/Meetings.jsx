import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Meetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        free: false,
        online: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // Toast notifications
    const [toasts, setToasts] = useState([]);
    
    // Form state for creating meetings
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'study_group',
        meeting_date: '',
        location: '',
        address: '',
        max_participants: '',
        price: '',
        is_free: true,
        is_online: false,
        online_link: '',
        requirements: '',
        contact_info: ''
    });

    // Add toast notification
    const addToast = (message, type = 'success') => {
        const id = Date.now();
        const newToast = { id, message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 4000);
    };

    // Load data on component mount
    useEffect(() => {
        fetchMeetings();
        fetchCategories();
    }, []);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/api/v1/meetings');
            const data = await response.json();
            
            if (data.success) {
                setMeetings(data.data);
            } else {
                setError('Erreur lors du chargement des rencontres');
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
            setError('Erreur lors du chargement des rencontres');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data.filter(cat => cat.is_active));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        setCreating(true);
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/meetings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                addToast(`✨ Rencontre "${formData.title}" créée avec succès !`, 'success');
                setShowCreateModal(false);
                setFormData({
                    title: '',
                    description: '',
                    type: 'study_group',
                    meeting_date: '',
                    location: '',
                    address: '',
                    max_participants: '',
                    price: '',
                    is_free: true,
                    is_online: false,
                    online_link: '',
                    requirements: '',
                    contact_info: ''
                });
                fetchMeetings();
            } else {
                addToast(`❌ Erreur lors de la création : ${data.message || 'Erreur inconnue'}`, 'danger');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            addToast('❌ Erreur lors de la création de la rencontre', 'danger');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinMeeting = async (meeting) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/meetings/${meeting.id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ message: 'Intéressé par cette rencontre !' })
            });
            
            const data = await response.json();
            if (data.success) {
                addToast(`🎉 Vous avez rejoint "${meeting.title}" avec succès !`, 'success');
                fetchMeetings();
            } else {
                addToast(`⚠️ ${data.message || 'Erreur lors de l\'inscription'}`, 'warning');
            }
        } catch (error) {
            console.error('Error joining meeting:', error);
            addToast('❌ Erreur lors de l\'inscription', 'danger');
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            study_group: '📚',
            networking: '🤝',
            party: '🎉',
            sport: '⚽',
            cultural: '🎭',
            conference: '🎤',
            workshop: '🔧',
            other: '📅'
        };
        return icons[type] || '📅';
    };

    const getTypeLabel = (type) => {
        const labels = {
            study_group: 'Groupe d\'étude',
            networking: 'Networking',
            party: 'Soirée/Fête',
            sport: 'Sport',
            cultural: 'Culturel',
            conference: 'Conférence',
            workshop: 'Atelier',
            other: 'Autre'
        };
        return labels[type] || type;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeUntil = (dateString) => {
        const now = new Date();
        const meetingDate = new Date(dateString);
        const diff = meetingDate - now;
        
        if (diff < 0) return 'Passé';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Dans ${hours}h`;
        return 'Bientôt';
    };

    const filteredMeetings = meetings.filter(meeting => {
        if (filters.type && meeting.type !== filters.type) return false;
        if (filters.free && !meeting.is_free) return false;
        if (filters.online && !meeting.is_online) return false;
        if (searchTerm && !meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !meeting.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="text-center text-white">
                    <div className="spinner-border mb-4" style={{ width: '4rem', height: '4rem', borderWidth: '0.5rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4>Chargement des rencontres...</h4>
                    <p className="opacity-75">Découvrez des opportunités de connexion extraordinaires</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="text-center text-white">
                    <div className="mb-4" style={{ fontSize: '4rem' }}>😕</div>
                    <h4 className="mb-3">Une erreur est survenue</h4>
                    <p className="mb-4 opacity-75">{error}</p>
                    <Button 
                        onClick={() => window.location.reload()}
                        variant="light"
                        size="lg"
                        style={{ borderRadius: '25px', padding: '12px 30px' }}
                    >
                        🔄 Recharger la page
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            paddingTop: '80px',
            position: 'relative'
        }}>
            {/* Decorative Elements */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(50px)',
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '10%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                pointerEvents: 'none'
            }}></div>

            {/* Header Section */}
            <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                padding: '80px 0',
                marginBottom: '50px'
            }}>
                <Container>
                    <Row className="text-center text-white">
                        <Col lg={8} className="mx-auto">
                            <div className="mb-4" style={{ fontSize: '3rem', opacity: '0.9' }}>🌟</div>
                            <h1 className="display-3 fw-bold mb-4" style={{ letterSpacing: '-1px' }}>
                                Rencontres Étudiantes
                            </h1>
                            <p className="lead mb-5" style={{ fontSize: '1.2rem', opacity: '0.9' }}>
                                Créez des connexions authentiques avec des étudiants passionnés.<br/>
                                Partagez vos connaissances, découvrez de nouvelles opportunités et construisez votre réseau.
                            </p>
                            <Button 
                                size="lg"
                                onClick={() => setShowCreateModal(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                    border: 'none',
                                    color: 'white',
                                    borderRadius: '30px',
                                    padding: '18px 45px',
                                    fontWeight: '700',
                                    fontSize: '18px',
                                    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 107, 107, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 107, 0.4)';
                                }}
                            >
                                ✨ Créer une rencontre
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container>
                {/* Search and Filters */}
                <Row className="mb-5">
                    <Col lg={6} className="mb-4">
                        <div style={{ position: 'relative' }}>
                            <Form.Control
                                type="text"
                                placeholder="Rechercher une rencontre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    borderRadius: '25px',
                                    padding: '18px 60px 18px 20px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.95)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                    fontSize: '16px',
                                    backdropFilter: 'blur(10px)'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '20px',
                                color: '#666'
                            }}>
                                🔍
                            </div>
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div className="d-flex gap-3 flex-wrap">
                            <Form.Select 
                                value={filters.type} 
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                                style={{
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.95)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                    padding: '12px 16px',
                                    minWidth: '200px'
                                }}
                            >
                                <option value="">Tous les types</option>
                                <option value="study_group">📚 Groupe d'étude</option>
                                <option value="networking">🤝 Networking</option>
                                <option value="party">🎉 Soirée/Fête</option>
                                <option value="sport">⚽ Sport</option>
                                <option value="cultural">🎭 Culturel</option>
                                <option value="conference">🎤 Conférence</option>
                                <option value="workshop">🔧 Atelier</option>
                            </Form.Select>
                            <Button 
                                variant={filters.free ? 'success' : 'outline-light'}
                                onClick={() => setFilters({...filters, free: !filters.free})}
                                style={{ 
                                    borderRadius: '20px', 
                                    padding: '12px 20px',
                                    fontWeight: '600',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                💸 Gratuit
                            </Button>
                            <Button 
                                variant={filters.online ? 'info' : 'outline-light'}
                                onClick={() => setFilters({...filters, online: !filters.online})}
                                style={{ 
                                    borderRadius: '20px', 
                                    padding: '12px 20px',
                                    fontWeight: '600',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                💻 En ligne
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Stats */}
                <Row className="mb-5">
                    <Col md={3} sm={6} className="mb-4">
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            padding: '30px',
                            textAlign: 'center',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{filteredMeetings.length}</div>
                            <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>Rencontres</div>
                        </div>
                    </Col>
                    <Col md={3} sm={6} className="mb-4">
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            padding: '30px',
                            textAlign: 'center',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{meetings.filter(m => m.is_free).length}</div>
                            <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>Gratuites</div>
                        </div>
                    </Col>
                    <Col md={3} sm={6} className="mb-4">
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            padding: '30px',
                            textAlign: 'center',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{meetings.filter(m => m.is_online).length}</div>
                            <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>En ligne</div>
                        </div>
                    </Col>
                    <Col md={3} sm={6} className="mb-4">
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            padding: '30px',
                            textAlign: 'center',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{meetings.reduce((acc, m) => acc + (m.participants_count || 0), 0)}</div>
                            <div style={{ fontSize: '1.1rem', opacity: '0.9' }}>Participants</div>
                        </div>
                    </Col>
                </Row>

                {/* Meetings Grid */}
                <Row className="g-4">
                    {filteredMeetings.map(meeting => (
                        <Col key={meeting.id} lg={4} md={6}>
                            <Card 
                                style={{
                                    borderRadius: '24px',
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                                }}
                                onClick={() => {
                                    setSelectedMeeting(meeting);
                                    setShowDetailModal(true);
                                }}
                            >
                                {/* Status Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '15px',
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#666',
                                    zIndex: 2
                                }}>
                                    {getTimeUntil(meeting.meeting_date)}
                                </div>

                                {/* Card Header */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '30px 25px',
                                    position: 'relative'
                                }}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                                                {getTypeIcon(meeting.type)}
                                            </div>
                                            <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '500' }}>
                                                {getTypeLabel(meeting.type)}
                                            </div>
                                        </div>
                                        <Badge 
                                            bg={meeting.is_free ? 'success' : 'warning'} 
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {meeting.is_free ? 'Gratuit' : `${meeting.price} FCFA`}
                                        </Badge>
                                    </div>
                                </div>

                                <Card.Body style={{ padding: '30px' }}>
                                    <h5 style={{ 
                                        fontWeight: '700', 
                                        marginBottom: '15px',
                                        color: '#2d3748',
                                        fontSize: '1.3rem',
                                        lineHeight: '1.3'
                                    }}>
                                        {meeting.title}
                                    </h5>
                                    <p style={{ 
                                        color: '#718096', 
                                        fontSize: '14px', 
                                        lineHeight: '1.6',
                                        marginBottom: '25px'
                                    }}>
                                        {meeting.description.substring(0, 120)}
                                        {meeting.description.length > 120 && '...'}
                                    </p>

                                    <div style={{ marginBottom: '25px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '12px',
                                            padding: '10px',
                                            background: 'rgba(102, 126, 234, 0.08)',
                                            borderRadius: '12px'
                                        }}>
                                            <span style={{ fontSize: '16px', marginRight: '12px' }}>📅</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                                                {formatDate(meeting.meeting_date)}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '10px',
                                            background: 'rgba(102, 126, 234, 0.08)',
                                            borderRadius: '12px'
                                        }}>
                                            <span style={{ fontSize: '16px', marginRight: '12px' }}>📍</span>
                                            <span style={{ fontSize: '13px', color: '#4a5568', flex: 1 }}>
                                                {meeting.location}
                                            </span>
                                            {meeting.is_online && (
                                                <Badge bg="info" style={{ fontSize: '10px', marginLeft: '8px' }}>
                                                    En ligne
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '25px',
                                        padding: '15px',
                                        background: 'rgba(0,0,0,0.03)',
                                        borderRadius: '15px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748' }}>
                                                {meeting.participants_count || 0}
                                                {meeting.max_participants && (
                                                    <span style={{ fontSize: '14px', color: '#718096', fontWeight: '500' }}>
                                                        /{meeting.max_participants}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#718096' }}>Participants</div>
                                        </div>
                                        <Badge 
                                            bg="light" 
                                            text="dark"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {meeting.user?.name || 'Organisateur'}
                                        </Badge>
                                    </div>

                                    <div className="d-grid">
                                        <Button 
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                borderRadius: '15px',
                                                padding: '14px',
                                                fontWeight: '600',
                                                fontSize: '15px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJoinMeeting(meeting);
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            🚀 Participer
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Empty State */}
                {filteredMeetings.length === 0 && (
                    <div className="text-center py-5">
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '30px',
                            padding: '80px 40px',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{ fontSize: '5rem', marginBottom: '30px' }}>🌟</div>
                            <h3 style={{ fontWeight: '700', marginBottom: '20px' }}>Aucune rencontre trouvée</h3>
                            <p style={{ fontSize: '1.1rem', opacity: '0.9', marginBottom: '30px' }}>
                                Créez la première rencontre correspondant à ces critères et<br/>
                                inspirez d'autres étudiants à vous rejoindre !
                            </p>
                            <Button 
                                size="lg"
                                onClick={() => setShowCreateModal(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                    border: 'none',
                                    borderRadius: '25px',
                                    padding: '15px 40px',
                                    fontWeight: '600',
                                    fontSize: '16px'
                                }}
                            >
                                ✨ Créer une rencontre
                            </Button>
                        </div>
                    </div>
                )}
            </Container>

            {/* Meeting Detail Modal */}
            {selectedMeeting && (
                <Modal 
                    show={showDetailModal} 
                    onHide={() => setShowDetailModal(false)}
                    size="lg"
                    centered
                >
                    <Modal.Header closeButton style={{ border: 'none', padding: '30px 30px 0' }}>
                        <Modal.Title style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            {getTypeIcon(selectedMeeting.type)} {selectedMeeting.title}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '25px' }}>
                            <h6 style={{ fontWeight: '600', marginBottom: '15px', color: '#2d3748' }}>Description</h6>
                            <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{selectedMeeting.description}</p>
                        </div>

                        <Row>
                            <Col md={6} style={{ marginBottom: '20px' }}>
                                <h6 style={{ fontWeight: '600', marginBottom: '15px', color: '#2d3748' }}>Détails</h6>
                                <div style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.8' }}>
                                    <div><strong>📅 Date:</strong> {formatDate(selectedMeeting.meeting_date)}</div>
                                    <div><strong>📍 Lieu:</strong> {selectedMeeting.location}</div>
                                    {selectedMeeting.address && <div><strong>📍 Adresse:</strong> {selectedMeeting.address}</div>}
                                    <div><strong>🏷️ Type:</strong> {getTypeLabel(selectedMeeting.type)}</div>
                                    <div><strong>💰 Prix:</strong> {selectedMeeting.is_free ? 'Gratuit' : `${selectedMeeting.price} FCFA`}</div>
                                </div>
                            </Col>
                            <Col md={6} style={{ marginBottom: '20px' }}>
                                <h6 style={{ fontWeight: '600', marginBottom: '15px', color: '#2d3748' }}>Organisateur</h6>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '15px',
                                    background: 'rgba(102, 126, 234, 0.08)',
                                    borderRadius: '15px'
                                }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '18px',
                                        marginRight: '15px'
                                    }}>
                                        {selectedMeeting.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                            {selectedMeeting.user?.name || 'Organisateur'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#718096' }}>
                                            {selectedMeeting.user?.university || 'Université non spécifiée'}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginBottom: '25px' }}>
                            <h6 style={{ fontWeight: '600', marginBottom: '15px', color: '#2d3748' }}>
                                Participants ({selectedMeeting.participants_count || 0}
                                {selectedMeeting.max_participants && `/${selectedMeeting.max_participants}`})
                            </h6>
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap'
                            }}>
                                <Badge bg="info" style={{ padding: '8px 12px', borderRadius: '12px' }}>
                                    {selectedMeeting.participants_count || 0} inscrits
                                </Badge>
                                {selectedMeeting.max_participants && (
                                    <Badge bg="secondary" style={{ padding: '8px 12px', borderRadius: '12px' }}>
                                        Max: {selectedMeeting.max_participants}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ border: 'none', padding: '0 30px 30px' }}>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowDetailModal(false)}
                            style={{ borderRadius: '12px', padding: '10px 20px' }}
                        >
                            Fermer
                        </Button>
                        <Button 
                            onClick={() => {
                                handleJoinMeeting(selectedMeeting);
                                setShowDetailModal(false);
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '10px 20px',
                                fontWeight: '600'
                            }}
                        >
                            🚀 Participer
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Create Meeting Modal */}
            <Modal 
                show={showCreateModal} 
                onHide={() => setShowCreateModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton style={{ border: 'none', padding: '30px 30px 0' }}>
                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        ✨ Créer une nouvelle rencontre
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px' }}>
                    <Form onSubmit={handleCreateMeeting}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                        Titre de la rencontre
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="Ex: Groupe d'étude Math..."
                                        style={{ 
                                            borderRadius: '12px', 
                                            padding: '12px 16px',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '14px'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                        Type de rencontre
                                    </Form.Label>
                                    <Form.Select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        style={{ 
                                            borderRadius: '12px', 
                                            padding: '12px 16px',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="study_group">📚 Groupe d'étude</option>
                                        <option value="networking">🤝 Networking</option>
                                        <option value="party">🎉 Soirée/Fête</option>
                                        <option value="sport">⚽ Sport</option>
                                        <option value="cultural">🎭 Culturel</option>
                                        <option value="conference">🎤 Conférence</option>
                                        <option value="workshop">🔧 Atelier</option>
                                        <option value="other">📅 Autre</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                Description
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Décrivez votre rencontre..."
                                style={{ 
                                    borderRadius: '12px', 
                                    padding: '12px 16px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                        Date et heure
                                    </Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        required
                                        value={formData.meeting_date}
                                        onChange={(e) => setFormData({...formData, meeting_date: e.target.value})}
                                        style={{ 
                                            borderRadius: '12px', 
                                            padding: '12px 16px',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '14px'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                        Lieu
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="Ex: Bibliothèque universitaire..."
                                        style={{ 
                                            borderRadius: '12px', 
                                            padding: '12px 16px',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '14px'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                Adresse complète
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Adresse détaillée..."
                                style={{ 
                                    borderRadius: '12px', 
                                    padding: '12px 16px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '14px'
                                }}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                        Nombre max de participants
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={formData.max_participants}
                                        onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                                        placeholder="Ex: 20"
                                        style={{ 
                                            borderRadius: '12px', 
                                            padding: '12px 16px',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '14px'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                        Prix (FCFA)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        disabled={formData.is_free}
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        placeholder="0"
                                        style={{ 
                                            borderRadius: '12px', 
                                            padding: '12px 16px',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '14px'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Check
                                    type="switch"
                                    id="is_free"
                                    label="💸 Gratuit"
                                    checked={formData.is_free}
                                    onChange={(e) => setFormData({...formData, is_free: e.target.checked})}
                                    className="mb-3"
                                    style={{ fontSize: '14px', fontWeight: '600' }}
                                />
                            </Col>
                            <Col md={6}>
                                <Form.Check
                                    type="switch"
                                    id="is_online"
                                    label="💻 En ligne"
                                    checked={formData.is_online}
                                    onChange={(e) => setFormData({...formData, is_online: e.target.checked})}
                                    className="mb-3"
                                    style={{ fontSize: '14px', fontWeight: '600' }}
                                />
                            </Col>
                        </Row>

                        {formData.is_online && (
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                    Lien de la rencontre en ligne
                                </Form.Label>
                                <Form.Control
                                    type="url"
                                    value={formData.online_link}
                                    onChange={(e) => setFormData({...formData, online_link: e.target.value})}
                                    placeholder="https://..."
                                    style={{ 
                                        borderRadius: '12px', 
                                        padding: '12px 16px',
                                        border: '2px solid #e2e8f0',
                                        fontSize: '14px'
                                    }}
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                Prérequis (optionnel)
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.requirements}
                                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                                placeholder="Ex: Niveau intermédiaire requis..."
                                style={{ 
                                    borderRadius: '12px', 
                                    padding: '12px 16px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '14px'
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label style={{ fontWeight: '600', color: '#2d3748' }}>
                                Contact
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.contact_info}
                                onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                                placeholder="Email, téléphone, etc..."
                                style={{ 
                                    borderRadius: '12px', 
                                    padding: '12px 16px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '14px'
                                }}
                            />
                        </Form.Group>

                        <div className="d-grid">
                            <Button 
                                type="submit"
                                size="lg"
                                disabled={creating}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '15px',
                                    padding: '15px',
                                    fontWeight: '600',
                                    fontSize: '16px'
                                }}
                            >
                                {creating ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Création en cours...
                                    </>
                                ) : (
                                    '🚀 Créer la rencontre'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Floating Action Button */}
            <Button
                onClick={() => setShowCreateModal(true)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
                    fontSize: '28px',
                    zIndex: 1000,
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 107, 107, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 107, 0.4)';
                }}
            >
                ➕
            </Button>

            {/* Toast Notifications */}
            <ToastContainer 
                position="top-end" 
                className="p-3"
                style={{ zIndex: 9999 }}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        bg={toast.type}
                        show={true}
                        onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        delay={4000}
                        autohide
                        style={{
                            borderRadius: '15px',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            backdropFilter: 'blur(10px)',
                            border: 'none'
                        }}
                    >
                        <Toast.Header style={{ border: 'none', padding: '15px 20px 10px' }}>
                            <strong className="me-auto" style={{ fontSize: '14px' }}>
                                {toast.type === 'success' ? '✅ Succès' : 
                                 toast.type === 'danger' ? '❌ Erreur' : 
                                 toast.type === 'warning' ? '⚠️ Attention' : 'ℹ️ Info'}
                            </strong>
                        </Toast.Header>
                        <Toast.Body style={{ padding: '0 20px 15px', fontSize: '14px' }}>
                            {toast.message}
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </div>
    );
};

export default Meetings;