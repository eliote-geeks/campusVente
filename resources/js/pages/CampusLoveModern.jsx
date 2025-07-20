import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Tab, Tabs, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
    Heart, X, Star, MessageCircle, Settings, Eye, EyeOff, Lock, 
    User, MapPin, Calendar, GraduationCap, Zap, Camera, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CampusLoveAccess from '../components/CampusLoveAccess.jsx';
import CampusLoveAccessGitHub from '../components/CampusLoveAccessGitHub.jsx';
import '../../css/CampusLove.css';

const CampusLoveModern = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('swipe');
    const [loading, setLoading] = useState(false);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchInfo, setMatchInfo] = useState(null);
    const [swipeAnimation, setSwipeAnimation] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [hasAccess, setHasAccess] = useState(true);
    const [showAccessModal, setShowAccessModal] = useState(false);

    // Données de test modernes
    const [profiles, setProfiles] = useState([
        {
            id: 1,
            name: "Sophie",
            age: 22,
            address: "Bastos, 2km",
            study_level: "M1",
            field: "Médecine",
            bio: "Passionnée de médecine et de voyage 🌍 Toujours prête pour une nouvelle aventure !",
            interests: ["Médecine", "Voyage", "Photo", "Cuisine"],
            photos: [
                "https://images.unsplash.com/photo-1494790108755-2616b169c54a?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face"
            ],
            isOnline: true
        },
        {
            id: 2,
            name: "Marie",
            age: 20,
            address: "Mfoundi, 5km",
            study_level: "L3",
            field: "Informatique",
            bio: "Dev front-end passionnée 💻 Fan de café et de code propre ☕",
            interests: ["Code", "Café", "Gaming", "Tech"],
            photos: [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"
            ],
            isOnline: false
        },
        {
            id: 3,
            name: "Amélie",
            age: 23,
            address: "Centre, 1km",
            study_level: "M2",
            field: "Marketing",
            bio: "Créative et ambitieuse 🎨 J'adore les soirées ciné et les balades",
            interests: ["Marketing", "Ciné", "Art", "Mode"],
            photos: [
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face"
            ],
            isOnline: true
        }
    ]);

    const [matches, setMatches] = useState([
        {
            id: 1,
            other_user: {
                name: "Emma",
                photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=160&h=140&fit=crop&crop=face",
                age: 21
            },
            last_message: "Salut ! Comment ça va ?",
            last_message_time: "2min",
            unread: true
        },
        {
            id: 2,
            other_user: {
                name: "Clara",
                photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=160&h=140&fit=crop&crop=face",
                age: 24
            },
            last_message: "On se voit ce soir ?",
            last_message_time: "1h",
            unread: false
        }
    ]);

    const currentProfile = profiles[currentProfileIndex];

    const handleSwipe = useCallback((direction) => {
        if (!currentProfile) return;
        
        setSwipeAnimation(direction === 'left' ? 'swipe-left' : 'swipe-right');
        
        setTimeout(() => {
            if (direction === 'right') {
                // Simuler un match parfois
                if (Math.random() > 0.7) {
                    setMatchInfo(currentProfile);
                    setShowMatchModal(true);
                }
                showAlert('Match potentiel ! 💕', 'success');
            } else {
                showAlert('Profil passé', 'info');
            }
            
            setCurrentProfileIndex(prev => (prev + 1) % profiles.length);
            setCurrentPhotoIndex(0);
            setSwipeAnimation('');
        }, 300);
    }, [currentProfile, profiles.length]);

    const showAlert = (message, type) => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 2000);
    };

    const nextPhoto = () => {
        if (currentProfile?.photos) {
            setCurrentPhotoIndex(prev => (prev + 1) % currentProfile.photos.length);
        }
    };

    const prevPhoto = () => {
        if (currentProfile?.photos) {
            setCurrentPhotoIndex(prev => 
                prev === 0 ? currentProfile.photos.length - 1 : prev - 1
            );
        }
    };

    const ProfileCard = () => {
        if (!currentProfile) {
            return (
                <div className="empty-state">
                    <Heart className="empty-state-icon" />
                    <div className="empty-state-title">Plus de profils</div>
                    <div className="empty-state-text">Revenez plus tard pour découvrir de nouveaux profils</div>
                </div>
            );
        }

        return (
            <div className={`profile-card fade-in ${swipeAnimation}`}>
                {/* Indicateurs de photos */}
                {currentProfile.photos.length > 1 && (
                    <div className="photo-indicators">
                        {currentProfile.photos.map((_, index) => (
                            <div 
                                key={index} 
                                className={`photo-indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                )}

                {/* Statut en ligne */}
                {currentProfile.isOnline && (
                    <div className="online-status">
                        <div className="online-dot"></div>
                        En ligne
                    </div>
                )}

                {/* Image avec navigation */}
                <div className="profile-image-container">
                    <img 
                        src={currentProfile.photos[currentPhotoIndex]} 
                        alt={currentProfile.name}
                        className="profile-image"
                        onError={(e) => {
                            e.target.src = '/api/placeholder/400/600?text=Photo&bg=ff6b6b&color=white';
                        }}
                        onClick={nextPhoto}
                    />
                    
                    {/* Zones de navigation invisibles */}
                    <div 
                        className="position-absolute start-0 top-0 w-50 h-100"
                        style={{ cursor: 'pointer', zIndex: 5 }}
                        onClick={prevPhoto}
                    ></div>
                    <div 
                        className="position-absolute end-0 top-0 w-50 h-100"
                        style={{ cursor: 'pointer', zIndex: 5 }}
                        onClick={nextPhoto}
                    ></div>
                </div>

                {/* Informations du profil */}
                <div className="profile-info">
                    <div className="profile-name">
                        {currentProfile.name}, {currentProfile.age}
                    </div>
                    
                    <div className="profile-details">
                        <div className="profile-detail-item">
                            <MapPin size={12} />
                            <span>{currentProfile.address}</span>
                        </div>
                        <div className="profile-detail-item">
                            <GraduationCap size={12} />
                            <span>{currentProfile.study_level} {currentProfile.field}</span>
                        </div>
                    </div>

                    <div className="profile-bio">
                        {currentProfile.bio}
                    </div>

                    <div className="interests-tags">
                        {currentProfile.interests.slice(0, 3).map((interest, index) => (
                            <span key={index} className="interest-tag">
                                {interest}
                            </span>
                        ))}
                        {currentProfile.interests.length > 3 && (
                            <span className="interest-tag">
                                +{currentProfile.interests.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const MatchesSection = () => (
        <div className="matches-section">
            <div className="matches-header">
                <div className="matches-title">
                    <Heart size={18} />
                    Matches
                    <span className="matches-count">{matches.length}</span>
                </div>
                <Button variant="link" size="sm" className="p-0 text-decoration-none">
                    <small>Voir tout</small>
                </Button>
            </div>
            
            <div className="matches-grid">
                {matches.map(match => (
                    <div key={match.id} className="match-item">
                        <div className="position-relative">
                            <img 
                                src={match.other_user.photo} 
                                alt={match.other_user.name}
                                className="match-photo"
                                onError={(e) => {
                                    e.target.src = '/api/placeholder/80/80?text=Photo&bg=ff6b6b&color=white';
                                }}
                            />
                            {match.other_user.isOnline && <div className="match-badge"></div>}
                        </div>
                        <div className="match-name">{match.other_user.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const MessagesSection = () => (
        <div className="messages-preview">
            {matches.map(match => (
                <div key={match.id} className="message-item">
                    <img 
                        src={match.other_user.photo} 
                        alt={match.other_user.name}
                        className="message-avatar"
                        onError={(e) => {
                            e.target.src = '/api/placeholder/40/40?text=Photo&bg=ff6b6b&color=white';
                        }}
                    />
                    <div className="message-content">
                        <div className="message-name">{match.other_user.name}</div>
                        <div className="message-text">{match.last_message}</div>
                    </div>
                    <div className="d-flex align-items-center">
                        <small className="message-time">{match.last_message_time}</small>
                        {match.unread && <div className="message-unread"></div>}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="campus-love-container">
            <Container fluid className="h-100">
                {/* Header moderne */}
                <div className="campus-love-header">
                    <Row className="align-items-center">
                        <Col>
                            <div className="campus-love-title">Campus Love</div>
                            <div className="campus-love-subtitle">Trouvez votre âme sœur étudiante</div>
                        </Col>
                        <Col xs="auto">
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="link" 
                                    className="settings-btn"
                                    onClick={() => setShowAccessModal(true)}
                                >
                                    <Filter size={16} />
                                </Button>
                                <Link to="/campus-love-profile" className="settings-btn text-decoration-none">
                                    <User size={16} />
                                </Link>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Navigation moderne */}
                <div className="modern-nav">
                    <Tabs 
                        activeKey={activeTab} 
                        onSelect={setActiveTab}
                        className="border-0"
                        fill
                    >
                        <Tab 
                            eventKey="swipe" 
                            title={
                                <span>
                                    <Zap size={14} />
                                    Découvrir
                                </span>
                            }
                        />
                        <Tab 
                            eventKey="matches" 
                            title={
                                <span>
                                    <Heart size={14} />
                                    Matches
                                </span>
                            }
                        />
                        <Tab 
                            eventKey="messages" 
                            title={
                                <span>
                                    <MessageCircle size={14} />
                                    Messages
                                </span>
                            }
                        />
                    </Tabs>
                </div>

                {/* Contenu principal */}
                <Row className="justify-content-center">
                    <Col lg={6} md={8}>
                        {/* Alertes */}
                        {alert.show && (
                            <Alert 
                                variant={alert.type === 'success' ? 'success' : 'info'} 
                                className="text-center border-0"
                                style={{ 
                                    background: alert.type === 'success' 
                                        ? 'linear-gradient(135deg, #ff6b6b, #ff8e8e)' 
                                        : undefined,
                                    color: alert.type === 'success' ? 'white' : undefined
                                }}
                            >
                                {alert.message}
                            </Alert>
                        )}

                        {/* Swipe Tab */}
                        {activeTab === 'swipe' && (
                            <>
                                <div className="swipe-container">
                                    <ProfileCard />
                                </div>
                                
                                {currentProfile && (
                                    <div className="action-buttons">
                                        <Button 
                                            className="action-btn reject"
                                            onClick={() => handleSwipe('left')}
                                        >
                                            <X size={20} />
                                        </Button>
                                        
                                        <Button 
                                            className="action-btn super-like"
                                            onClick={() => handleSwipe('super')}
                                        >
                                            <Star size={18} />
                                        </Button>
                                        
                                        <Button 
                                            className="action-btn like"
                                            onClick={() => handleSwipe('right')}
                                        >
                                            <Heart size={20} />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Matches Tab */}
                        {activeTab === 'matches' && <MatchesSection />}

                        {/* Messages Tab */}
                        {activeTab === 'messages' && <MessagesSection />}
                    </Col>
                </Row>

                {/* Modal Match */}
                <Modal 
                    show={showMatchModal} 
                    onHide={() => setShowMatchModal(false)} 
                    centered
                    className="match-modal"
                >
                    <Modal.Body className="text-center p-4">
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💕</div>
                        <h4 className="text-pink mb-3">C'est un Match !</h4>
                        <p className="text-muted">
                            Vous vous plaisez mutuellement avec <strong>{matchInfo?.name}</strong>
                        </p>
                        <div className="d-flex gap-2 mt-4">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowMatchModal(false)}
                                className="flex-fill"
                            >
                                Continuer
                            </Button>
                            <Button 
                                variant="primary" 
                                className="flex-fill"
                                style={{ background: 'var(--pink-gradient)', border: 'none' }}
                            >
                                Envoyer un message
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* Modal Access */}
                <CampusLoveAccess 
                    show={showAccessModal}
                    onHide={() => setShowAccessModal(false)}
                    onAccessGranted={() => {
                        setHasAccess(true);
                        setShowAccessModal(false);
                    }}
                />
            </Container>
        </div>
    );
};

export default CampusLoveModern;