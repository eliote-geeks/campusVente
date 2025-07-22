import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Heart, X, Star, MessageCircle, MapPin, GraduationCap, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import '../../css/CampusLove.css';

const CampusLove = () => {
    const { user } = useAuth();
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchedProfile, setMatchedProfile] = useState(null);
    const [likedProfiles, setLikedProfiles] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        fetchUserProfile();
        fetchProfiles();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/campus-love/profile/me');
            if (response.data.success) {
                setUserProfile(response.data.data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
        }
    };

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/campus-love/profiles');
            if (response.data.success) {
                setProfiles(response.data.data);
            } else {
                setError(response.data.message || 'Erreur lors du chargement des profils');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des profils:', error);
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const currentProfile = profiles[currentProfileIndex];

    const handleLike = async () => {
        if (!currentProfile) return;
        
        try {
            const response = await api.post('/campus-love/like', {
                target_user_id: currentProfile.user_id
            });
            
            if (response.data.success) {
                if (response.data.is_match) {
                    setMatchedProfile(currentProfile);
                    setShowMatchModal(true);
                    setLikedProfiles([...likedProfiles, currentProfile]);
                }
                nextProfile();
            }
        } catch (error) {
            console.error('Erreur lors du like:', error);
            nextProfile(); // Continuer même en cas d'erreur
        }
    };

    const handlePass = async () => {
        if (!currentProfile) return;
        
        try {
            await api.post('/campus-love/pass', {
                target_user_id: currentProfile.user_id
            });
        } catch (error) {
            console.error('Erreur lors du pass:', error);
        }
        
        nextProfile();
    };

    const nextProfile = () => {
        if (currentProfileIndex < profiles.length - 1) {
            setCurrentProfileIndex(currentProfileIndex + 1);
        }
    };

    const startWhatsAppConversation = (whatsappNumber, name) => {
        if (!whatsappNumber) {
            alert('Numéro WhatsApp non disponible');
            return;
        }
        const message = encodeURIComponent(`Salut ${name} ! Nous avons matché sur CampusLove 💕`);
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="campus-love-container">
                <Container>
                    <div className="text-center" style={{ padding: '3rem' }}>
                        <Spinner animation="border" style={{ color: '#ff6b6b' }} />
                        <p style={{ color: '#666', marginTop: '1rem' }}>Chargement des profils...</p>
                    </div>
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div className="campus-love-container">
                <Container>
                    <Alert variant="danger" className="text-center">
                        <h5>Erreur</h5>
                        <p>{error}</p>
                        <Button 
                            onClick={() => {
                                setError('');
                                fetchProfiles();
                            }}
                            style={{ 
                                background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                border: 'none'
                            }}
                        >
                            Réessayer
                        </Button>
                    </Alert>
                </Container>
            </div>
        );
    }

    if (!currentProfile) {
        return (
            <div className="campus-love-container">
                <Container>
                    <div className="text-center" style={{ padding: '3rem' }}>
                        <Heart size={64} style={{ color: '#ff6b6b', marginBottom: '1rem' }} />
                        <h2 style={{ color: '#ff6b6b' }}>Plus de profils disponibles</h2>
                        <p style={{ color: '#666' }}>Revenez plus tard pour découvrir de nouveaux profils</p>
                        <Button 
                            onClick={() => setCurrentProfileIndex(0)}
                            style={{ 
                                background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                border: 'none',
                                borderRadius: '25px',
                                padding: '10px 25px'
                            }}
                        >
                            Recommencer
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="campus-love-container">
            {/* Header */}
            <div style={{ 
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                color: 'white',
                padding: '1rem 0',
                marginBottom: '1rem'
            }}>
                <Container>
                    <Row className="align-items-center">
                        <Col>
                            <h2 style={{ margin: 0, fontWeight: 'bold' }}>💕 CampusLove</h2>
                            <small>Trouvez votre âme sœur étudiante</small>
                        </Col>
                        <Col xs="auto" className="d-flex align-items-center gap-2">
                            <Link 
                                to="/campus-love-profile"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    textDecoration: 'none'
                                }}
                                title="Mon profil"
                            >
                                <User size={18} />
                            </Link>
                            <Badge 
                                bg="light" 
                                text="dark"
                                style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                            >
                                {currentProfileIndex + 1} / {profiles.length}
                            </Badge>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container>
                <Row className="justify-content-center">
                    <Col lg={6} md={8}>
                        {/* Carte de profil */}
                        <div style={{
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)',
                            overflow: 'hidden',
                            marginBottom: '2rem'
                        }}>
                            {/* Photo principale */}
                            <div style={{ position: 'relative', height: '500px' }}>
                                <img 
                                    src={currentProfile.profile_photo || currentProfile.photos?.[0] || 'https://via.placeholder.com/400x600/ff6b6b/white?text=Pas+de+photo'}
                                    alt={currentProfile.display_name || currentProfile.user?.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x600/ff6b6b/white?text=Pas+de+photo';
                                    }}
                                />
                                
                                {/* Overlay avec infos de base */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                    color: 'white',
                                    padding: '2rem 1.5rem 1.5rem'
                                }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
                                        {currentProfile.display_name || currentProfile.user?.name}
                                        {currentProfile.birth_date && (
                                            <span>, {new Date().getFullYear() - new Date(currentProfile.birth_date).getFullYear()}</span>
                                        )}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <MapPin size={14} />
                                            {currentProfile.city || 'Localisation non spécifiée'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <GraduationCap size={14} />
                                            {currentProfile.field_of_study || 'Domaine non spécifié'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Informations détaillées */}
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h5 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>À propos</h5>
                                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                        {currentProfile.bio || currentProfile.about_me || 'Aucune description disponible'}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h6 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>Université</h6>
                                    <p style={{ color: '#666', margin: 0 }}>
                                        {currentProfile.university || 'Université non spécifiée'}
                                    </p>
                                </div>

                                <div>
                                    <h6 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>Centres d'intérêt</h6>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {(currentProfile.interests || []).map((interest, index) => (
                                            <Badge 
                                                key={index}
                                                style={{ 
                                                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '15px'
                                                }}
                                            >
                                                {interest}
                                            </Badge>
                                        ))}
                                        {(!currentProfile.interests || currentProfile.interests.length === 0) && (
                                            <span style={{ color: '#999', fontStyle: 'italic' }}>
                                                Aucun centre d'intérêt spécifié
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            <Button 
                                onClick={handlePass}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: '2px solid #ddd',
                                    color: '#666',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={24} />
                            </Button>

                            <Button 
                                onClick={handleLike}
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                    border: 'none',
                                    color: 'white',
                                    boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Heart size={28} />
                            </Button>
                        </div>

                        {/* Section matches */}
                        {likedProfiles.length > 0 && (
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '1.5rem',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}>
                                <h5 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                                    Vos matches ({likedProfiles.length})
                                </h5>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {likedProfiles.map((profile) => (
                                        <div 
                                            key={profile.id}
                                            onClick={() => startWhatsAppConversation(profile.whatsapp_number || profile.user?.phone, profile.display_name || profile.user?.name)}
                                            style={{
                                                width: '80px',
                                                textAlign: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <img 
                                                src={profile.profile_photo || profile.photos?.[0] || 'https://via.placeholder.com/60x60/ff6b6b/white?text=?'}
                                                alt={profile.display_name || profile.user?.name}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '3px solid #ff6b6b',
                                                    marginBottom: '0.5rem'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/60x60/ff6b6b/white?text=?';
                                                }}
                                            />
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {(profile.display_name || profile.user?.name || 'Inconnu').split(' ')[0]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* Modal Match */}
            <Modal 
                show={showMatchModal} 
                onHide={() => setShowMatchModal(false)} 
                centered
                size="sm"
            >
                <Modal.Body className="text-center p-4">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💕</div>
                    <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>C'est un Match !</h4>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                        Vous et <strong>{matchedProfile?.display_name || matchedProfile?.user?.name}</strong> vous plaisez mutuellement !
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button 
                            variant="outline-secondary"
                            onClick={() => setShowMatchModal(false)}
                            style={{ flex: 1 }}
                        >
                            Continuer
                        </Button>
                        <Button 
                            onClick={() => {
                                setShowMatchModal(false);
                                startWhatsAppConversation(matchedProfile?.whatsapp_number || matchedProfile?.user?.phone, matchedProfile?.display_name || matchedProfile?.user?.name);
                            }}
                            style={{ 
                                flex: 1,
                                background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                border: 'none'
                            }}
                        >
                            <MessageCircle size={16} style={{ marginRight: '0.5rem' }} />
                            WhatsApp
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CampusLove;