import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Tab, Tabs, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Heart, X, Star, MessageCircle, Settings, Eye, EyeSlash } from 'lucide-react';
import axios from 'axios';
import './CampusLove.css';

const CampusLove = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('swipe');
    const [loading, setLoading] = useState(false);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [matchInfo, setMatchInfo] = useState(null);
    const [swipeAnimation, setSwipeAnimation] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

    // Données de test avec vraies images
    const [profiles, setProfiles] = useState([
        {
            id: 1,
            name: "Sophie Martin",
            age: 22,
            university: "Université de Yaoundé I",
            study_level: "Master 1",
            field: "Médecine",
            bio: "Passionnée de médecine et de voyage. J'adore découvrir de nouveaux endroits et rencontrer des gens intéressants. À la recherche de quelqu'un avec qui partager de belles aventures !",
            interests: ["Médecine", "Voyage", "Photographie", "Cuisine"],
            photos: ["https://images.unsplash.com/photo-1494790108755-2616b169c54a?w=400&h=600&fit=crop&crop=face"],
            location: "Yaoundé",
            distance: 5,
            isOnline: true
        },
        {
            id: 2,
            name: "Marie Dubois",
            age: 20,
            university: "Université de Douala",
            study_level: "Licence 3",
            field: "Informatique",
            bio: "Développeuse en herbe qui code avec passion. J'aime les défis technologiques et les soirées cinéma. Recherche quelqu'un qui partage ma passion pour l'innovation.",
            interests: ["Programmation", "Cinéma", "Gaming", "Musique"],
            photos: ["https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&h=600&fit=crop&crop=face"],
            location: "Douala",
            distance: 12,
            isOnline: false
        },
        {
            id: 3,
            name: "Aisha Koné",
            age: 21,
            university: "Université de Buea",
            study_level: "Licence 2",
            field: "Architecture",
            bio: "Créative et ambitieuse, je dessine l'avenir une ligne à la fois. J'adore l'art, la danse et les longues discussions philosophiques.",
            interests: ["Architecture", "Art", "Danse", "Philosophie"],
            photos: ["https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=400&h=600&fit=crop&crop=face"],
            location: "Buea",
            distance: 8,
            isOnline: true
        },
        {
            id: 4,
            name: "Emma Laurent",
            age: 23,
            university: "Université de Ngaoundéré",
            study_level: "Master 2",
            field: "Psychologie",
            bio: "Curieuse de nature, j'explore l'esprit humain et les relations interpersonnelles. J'aime les randonnées, la lecture et les conversations profondes.",
            interests: ["Psychologie", "Randonnée", "Lecture", "Yoga"],
            photos: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face"],
            location: "Ngaoundéré",
            distance: 15,
            isOnline: false
        },
        {
            id: 5,
            name: "Chloe Mbang",
            age: 19,
            university: "Université de Yaoundé II",
            study_level: "Licence 1",
            field: "Commerce",
            bio: "Entrepreneure dans l'âme, je rêve de créer ma propre entreprise. J'aime le sport, la musique et les sorties entre amis. Toujours prête pour de nouvelles aventures !",
            interests: ["Entrepreneuriat", "Sport", "Musique", "Voyage"],
            photos: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"],
            location: "Yaoundé",
            distance: 3,
            isOnline: true
        }
    ]);

    const [matches, setMatches] = useState([
        {
            id: 1,
            other_user: {
                id: 2,
                name: "Marie Dubois",
                age: 20,
                photo: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&h=600&fit=crop&crop=face",
                university: "Université de Douala"
            },
            matched_at: "2024-01-15T10:30:00Z",
            conversation_started: false
        },
        {
            id: 2,
            other_user: {
                id: 3,
                name: "Aisha Koné",
                age: 21,
                photo: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=400&h=600&fit=crop&crop=face",
                university: "Université de Buea"
            },
            matched_at: "2024-01-14T16:45:00Z",
            conversation_started: true
        }
    ]);

    const [stats, setStats] = useState({
        total_likes_sent: 25,
        total_likes_received: 18,
        total_matches: 2,
        conversations_started: 1,
        profile_complete: true,
        dating_active: true
    });

    const [userProfile, setUserProfile] = useState({
        birth_date: '2001-05-15',
        gender: 'male',
        looking_for: 'female',
        bio_dating: 'Étudiant en informatique passionné de technologie et de sport.',
        interests: ['Informatique', 'Sport', 'Musique', 'Cinéma'],
        whatsapp_number: '+237123456789',
        dating_active: true,
        max_distance: 50,
        dating_photos: []
    });

    const showAlert = (message, type = 'info') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
    };

    const handleLike = async (isSuper = false) => {
        const profile = profiles[currentProfileIndex];
        if (!profile) return;

        setSwipeAnimation('swiped-right');
        
        setTimeout(() => {
            // Simulation d'un match (30% de chance)
            const isMatch = Math.random() < 0.3;
            
            if (isMatch) {
                const newMatch = {
                    id: matches.length + 1,
                    other_user: {
                        id: profile.id,
                        name: profile.name,
                        age: profile.age,
                        photo: profile.photos[0],
                        university: profile.university
                    },
                    matched_at: new Date().toISOString(),
                    conversation_started: false
                };
                
                setMatches([...matches, newMatch]);
                setMatchInfo(newMatch);
                setShowMatchModal(true);
                showAlert(`C'est un match avec ${profile.name} ! 💕`, 'success');
            } else {
                showAlert(isSuper ? 'Super like envoyé ! ⭐' : 'Like envoyé ! ❤️', 'info');
            }
            
            nextProfile();
        }, 300);
    };

    const handlePass = () => {
        setSwipeAnimation('swiped-left');
        setTimeout(() => {
            nextProfile();
        }, 300);
    };

    const nextProfile = () => {
        setSwipeAnimation('');
        setCurrentProfileIndex(prev => {
            if (prev + 1 >= profiles.length) {
                showAlert('Plus de profils disponibles ! Revenez plus tard.', 'info');
                return prev;
            }
            return prev + 1;
        });
    };

    const resetProfiles = () => {
        setCurrentProfileIndex(0);
        showAlert('Nouveaux profils chargés !', 'success');
    };

    const startConversation = (matchId) => {
        const match = matches.find(m => m.id === matchId);
        if (match) {
            const whatsappUrl = `https://wa.me/237123456789?text=Salut ${match.other_user.name} ! Nous avons matché sur CampusLove 💕`;
            window.open(whatsappUrl, '_blank');
            showAlert('Redirection vers WhatsApp...', 'success');
        }
    };

    const updateProfile = async () => {
        setLoading(true);
        setTimeout(() => {
            showAlert('Profil mis à jour avec succès !', 'success');
            setShowProfileModal(false);
            setLoading(false);
        }, 1000);
    };

    const renderSwipeCard = () => {
        const profile = profiles[currentProfileIndex];
        
        if (!profile) {
            return (
                <div className="empty-state">
                    <div className="fade-in">
                        <h3>Plus de profils</h3>
                        <p>Tous les profils ont été vus. Revenez plus tard pour en découvrir d'autres !</p>
                        <Button onClick={resetProfiles} className="refresh-btn">
                            🔄 Actualiser
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="swipe-container">
                <div className={`swipe-card ${swipeAnimation} fade-in`}>
                    {profile.isOnline && <div className="online-indicator"></div>}
                    
                    <img 
                        src={profile.photos[0]} 
                        alt={profile.name}
                        className="profile-image"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x600/ff6b6b/white?text=Photo';
                        }}
                    />
                    
                    <div className="profile-overlay">
                        <h2 className="profile-name">{profile.name}, {profile.age}</h2>
                        <p className="profile-info">{profile.university}</p>
                        <p className="profile-info">{profile.study_level} - {profile.field}</p>
                        <p className="profile-distance">📍 {profile.location} • À {profile.distance} km</p>
                    </div>
                    
                    <div className="profile-details">
                        <p className="profile-bio">{profile.bio}</p>
                        
                        <div className="interests-container">
                            {profile.interests.map((interest, index) => (
                                <span key={index} className="interest-tag">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button 
                        className="action-btn pass-btn"
                        onClick={handlePass}
                        aria-label="Passer"
                    >
                        <X size={20} />
                    </button>
                    
                    <button 
                        className="action-btn super-like-btn"
                        onClick={() => handleLike(true)}
                        aria-label="Super like"
                    >
                        <Star size={16} />
                    </button>
                    
                    <button 
                        className="action-btn like-btn"
                        onClick={() => handleLike(false)}
                        aria-label="Like"
                    >
                        <Heart size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const renderMatches = () => {
        if (matches.length === 0) {
            return (
                <div className="empty-state">
                    <div className="fade-in">
                        <h3>Aucun match</h3>
                        <p>Commencez à swiper pour trouver votre match parfait !</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="matches-grid">
                {matches.map(match => (
                    <div key={match.id} className="match-card slide-in">
                        <img 
                            src={match.other_user.photo} 
                            alt={match.other_user.name}
                            className="match-photo"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/160x140/ff6b6b/white?text=Photo';
                            }}
                        />
                        <div className="match-info">
                            <h6 className="match-name">{match.other_user.name}, {match.other_user.age}</h6>
                            <p className="match-details">{match.other_user.university}</p>
                            <p className="match-details">
                                {match.conversation_started ? 'Conversation démarrée' : 'Nouveau match !'}
                            </p>
                            <button 
                                className="match-btn"
                                onClick={() => startConversation(match.id)}
                            >
                                <MessageCircle size={14} style={{ marginRight: '6px' }} />
                                {match.conversation_started ? 'Continuer' : 'Dire bonjour'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderStats = () => {
        return (
            <div className="stats-grid">
                <div className="stat-card fade-in">
                    <h3 className="stat-number">{stats.total_likes_sent}</h3>
                    <p className="stat-label">Likes envoyés</p>
                </div>
                <div className="stat-card fade-in">
                    <h3 className="stat-number">{stats.total_likes_received}</h3>
                    <p className="stat-label">Likes reçus</p>
                </div>
                <div className="stat-card fade-in">
                    <h3 className="stat-number">{stats.total_matches}</h3>
                    <p className="stat-label">Matches</p>
                </div>
                <div className="stat-card fade-in">
                    <h3 className="stat-number">{stats.conversations_started}</h3>
                    <p className="stat-label">Conversations</p>
                </div>
            </div>
        );
    };

    const renderProfileSettings = () => {
        return (
            <Container>
                <Row>
                    <Col md={8} className="mx-auto">
                        <div className="stat-card">
                            <h5 className="mb-4">Paramètres du profil</h5>
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>Date de naissance</Form.Label>
                                            <Form.Control 
                                                type="date"
                                                value={userProfile.birth_date}
                                                onChange={(e) => setUserProfile({...userProfile, birth_date: e.target.value})}
                                                style={{ fontSize: '0.9rem' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>Genre</Form.Label>
                                            <Form.Select 
                                                value={userProfile.gender}
                                                onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
                                                style={{ fontSize: '0.9rem' }}
                                            >
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
                                            <Form.Label style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>Je recherche</Form.Label>
                                            <Form.Select 
                                                value={userProfile.looking_for}
                                                onChange={(e) => setUserProfile({...userProfile, looking_for: e.target.value})}
                                                style={{ fontSize: '0.9rem' }}
                                            >
                                                <option value="male">Des hommes</option>
                                                <option value="female">Des femmes</option>
                                                <option value="both">Peu importe</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>Numéro WhatsApp</Form.Label>
                                            <Form.Control 
                                                type="tel"
                                                value={userProfile.whatsapp_number}
                                                onChange={(e) => setUserProfile({...userProfile, whatsapp_number: e.target.value})}
                                                placeholder="+237 6XX XX XX XX"
                                                style={{ fontSize: '0.9rem' }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>Bio pour les rencontres</Form.Label>
                                    <Form.Control 
                                        as="textarea"
                                        rows={3}
                                        value={userProfile.bio_dating}
                                        onChange={(e) => setUserProfile({...userProfile, bio_dating: e.target.value})}
                                        placeholder="Parlez-nous de vous..."
                                        maxLength={500}
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                    <small style={{ color: '#999', fontSize: '0.8rem' }}>
                                        {userProfile.bio_dating.length}/500 caractères
                                    </small>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600' }}>
                                        Distance maximale: {userProfile.max_distance} km
                                    </Form.Label>
                                    <Form.Range 
                                        min={1}
                                        max={100}
                                        value={userProfile.max_distance}
                                        onChange={(e) => setUserProfile({...userProfile, max_distance: parseInt(e.target.value)})}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        label="Profil actif"
                                        checked={userProfile.dating_active}
                                        onChange={(e) => setUserProfile({...userProfile, dating_active: e.target.checked})}
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                </Form.Group>
                                
                                <Button 
                                    onClick={updateProfile}
                                    disabled={loading}
                                    style={{
                                        background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '10px 20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        width: '100%'
                                    }}
                                >
                                    {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    };

    return (
        <div className="campus-love-container">
            {/* Header moderne */}
            <div className="modern-header">
                <Container>
                    <Row className="align-items-center">
                        <Col xs={6}>
                            <h1 className="app-logo">💕 CampusLove</h1>
                        </Col>
                        <Col xs={6} className="text-end">
                            <div className="user-info">
                                <img 
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                                    alt="User"
                                    className="user-avatar"
                                />
                                <span>{user?.name?.split(' ')[0] || 'Utilisateur'}</span>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Alertes */}
            {alert.show && (
                <Container className="mt-3">
                    <Alert 
                        variant={alert.type} 
                        dismissible 
                        onClose={() => setAlert({...alert, show: false})}
                        style={{ 
                            borderRadius: '15px', 
                            fontSize: '0.9rem',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: 'none'
                        }}
                    >
                        {alert.message}
                    </Alert>
                </Container>
            )}
            
            {/* Navigation */}
            <Container className="mt-3">
                <Tabs 
                    activeKey={activeTab} 
                    onSelect={setActiveTab} 
                    className="nav-tabs"
                >
                    <Tab eventKey="swipe" title="Découvrir">
                        {renderSwipeCard()}
                    </Tab>
                    
                    <Tab eventKey="matches" title={`Matches (${matches.length})`}>
                        {renderMatches()}
                    </Tab>
                    
                    <Tab eventKey="stats" title="Statistiques">
                        {renderStats()}
                    </Tab>
                    
                    <Tab eventKey="settings" title="Paramètres">
                        {renderProfileSettings()}
                    </Tab>
                </Tabs>
            </Container>
            
            {/* Modal Match */}
            <Modal 
                show={showMatchModal} 
                onHide={() => setShowMatchModal(false)} 
                centered 
                className="match-modal"
            >
                <Modal.Body>
                    <div className="match-celebration">💕</div>
                    <h2 className="match-title">C'est un match !</h2>
                    <p className="match-subtitle">
                        Vous et {matchInfo?.other_user?.name} vous plaisez mutuellement !
                    </p>
                    
                    <div className="match-actions">
                        <button 
                            className="match-action-btn continue-btn"
                            onClick={() => setShowMatchModal(false)}
                        >
                            Continuer à swiper
                        </button>
                        <button 
                            className="match-action-btn message-btn"
                            onClick={() => {
                                setShowMatchModal(false);
                                startConversation(matchInfo?.id);
                            }}
                        >
                            💬 Dire bonjour
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CampusLove;