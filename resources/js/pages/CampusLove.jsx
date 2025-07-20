import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Tab, Tabs, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Heart, X, Star, MessageCircle, Settings, Eye, EyeSlash, Lock } from 'lucide-react';
import axios from 'axios';
import CampusLoveAccess from '../components/CampusLoveAccess.jsx';
import CampusLoveAccessGitHub from '../components/CampusLoveAccessGitHub.jsx';
import CampusLoveMediaUpload from '../components/CampusLoveMediaUpload.jsx';
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
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [hasAccess, setHasAccess] = useState(true); // Accès libre temporairement
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [showGitHubAccessModal, setShowGitHubAccessModal] = useState(false);
    const [accessLoading, setAccessLoading] = useState(false); // Pas de vérification pour l'instant

    // Données de test avec vraies images
    const [profiles, setProfiles] = useState([
        {
            id: 1,
            name: "Sophie Martin",
            age: 22,
            address: "Quartier Bastos, Yaoundé",
            study_level: "Master 1",
            field: "Médecine",
            bio: "Passionnée de médecine et de voyage. J'adore découvrir de nouveaux endroits et rencontrer des gens intéressants. À la recherche de quelqu'un avec qui partager de belles aventures !",
            interests: ["Médecine", "Voyage", "Photographie", "Cuisine"],
            photos: [
                "https://images.unsplash.com/photo-1494790108755-2616b169c54a?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face"
            ],
            location: "Yaoundé",
            distance: 5,
            isOnline: true
        },
        {
            id: 2,
            name: "Marie Dubois",
            age: 20,
            address: "Quartier Bonanjo, Douala",
            study_level: "Licence 3",
            field: "Informatique",
            bio: "Développeuse en herbe qui code avec passion. J'aime les défis technologiques et les soirées cinéma. Recherche quelqu'un qui partage ma passion pour l'innovation.",
            interests: ["Programmation", "Cinéma", "Gaming", "Musique"],
            photos: [
                "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&crop=face"
            ],
            location: "Douala",
            distance: 12,
            isOnline: false
        },
        {
            id: 3,
            name: "Aisha Koné",
            age: 21,
            address: "Mile 16, Buea",
            study_level: "Licence 2",
            field: "Architecture",
            bio: "Créative et ambitieuse, je dessine l'avenir une ligne à la fois. J'adore l'art, la danse et les longues discussions philosophiques.",
            interests: ["Architecture", "Art", "Danse", "Philosophie"],
            photos: [
                "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=600&fit=crop&crop=face"
            ],
            location: "Buea",
            distance: 8,
            isOnline: true
        },
        {
            id: 4,
            name: "Emma Laurent",
            age: 23,
            address: "Quartier Dang, Ngaoundéré",
            study_level: "Master 2",
            field: "Psychologie",
            bio: "Curieuse de nature, j'explore l'esprit humain et les relations interpersonnelles. J'aime les randonnées, la lecture et les conversations profondes.",
            interests: ["Psychologie", "Randonnée", "Lecture", "Yoga"],
            photos: [
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face"
            ],
            location: "Ngaoundéré",
            distance: 15,
            isOnline: false
        },
        {
            id: 5,
            name: "Chloe Mbang",
            age: 19,
            address: "Quartier Essos, Yaoundé",
            study_level: "Licence 1",
            field: "Commerce",
            bio: "Entrepreneure dans l'âme, je rêve de créer ma propre entreprise. J'aime le sport, la musique et les sorties entre amis. Toujours prête pour de nouvelles aventures !",
            interests: ["Entrepreneuriat", "Sport", "Musique", "Voyage"],
            photos: [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1494790108755-2616b169c54a?w=400&h=600&fit=crop&crop=face"
            ],
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
                address: "Quartier Bonanjo, Douala"
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
                address: "Mile 16, Buea"
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

    useEffect(() => {
        // checkAccess(); // Désactivé temporairement - accès libre
    }, []);

    const checkAccess = async () => {
        try {
            setAccessLoading(true);
            const response = await axios.get('/api/v1/campus-love/check-access');
            setHasAccess(response.data.has_access);
            
            if (!response.data.has_access) {
                setShowAccessModal(true);
            }
        } catch (error) {
            console.error('Erreur vérification accès:', error);
            setShowAccessModal(true);
        } finally {
            setAccessLoading(false);
        }
    };

    const showAlert = useCallback((message, type = 'info') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
    }, []);

    // Callbacks mémorisés pour éviter les re-renders infinis
    const handleAccessGranted = useCallback(() => {
        setHasAccess(true);
        setShowAccessModal(false);
        showAlert('Bienvenue sur CampusLove ! 💕', 'success');
    }, [showAlert]);

    const handleGitHubAccessGranted = useCallback(() => {
        setHasAccess(true);
        setShowGitHubAccessModal(false);
        showAlert('Bienvenue sur CampusLove ! (GitHub Style) 🔧', 'success');
    }, [showAlert]);

    const handleAccessModalHide = useCallback(() => {
        setShowAccessModal(false);
    }, []);

    const handleGitHubAccessModalHide = useCallback(() => {
        setShowGitHubAccessModal(false);
    }, []);

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
                        address: profile.address
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
        setCurrentPhotoIndex(0); // Reset photo index when changing profile
        setCurrentProfileIndex(prev => {
            if (prev + 1 >= profiles.length) {
                showAlert('Plus de profils disponibles ! Revenez plus tard.', 'info');
                return prev;
            }
            return prev + 1;
        });
    };

    const nextPhoto = () => {
        const profile = profiles[currentProfileIndex];
        if (profile && currentPhotoIndex < profile.photos.length - 1) {
            setCurrentPhotoIndex(prev => prev + 1);
        }
    };

    const prevPhoto = () => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(prev => prev - 1);
        }
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
                {/* Carte principale avec photos et infos de base */}
                <div className={`swipe-card main-card ${swipeAnimation} fade-in`}>
                    {profile.isOnline && <div className="online-indicator"></div>}
                    
                    <div className="photo-container">
                        {/* Photo indicators */}
                        <div className="photo-indicators">
                            {profile.photos.map((_, index) => (
                                <div 
                                    key={index} 
                                    className={`photo-indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                        
                        {/* Navigation areas */}
                        <button className="photo-nav prev" onClick={prevPhoto} />
                        <button className="photo-nav next" onClick={nextPhoto} />
                        
                        {/* Photos */}
                        {profile.photos.map((photo, index) => (
                            <img 
                                key={index}
                                src={photo} 
                                alt={`${profile.name} ${index + 1}`}
                                className="profile-image"
                                style={{ opacity: index === currentPhotoIndex ? 1 : 0 }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x600/ff6b6b/white?text=Photo';
                                }}
                            />
                        ))}
                    </div>
                    
                    <div className="profile-overlay">
                        <h2 className="profile-name">{profile.name}, {profile.age}</h2>
                        <p className="profile-info">📍 {profile.address}</p>
                        <p className="profile-info">🎓 {profile.study_level} - {profile.field}</p>
                        <p className="profile-distance">📍 {profile.location} • À {profile.distance} km</p>
                    </div>
                </div>

                {/* Carte de description détaillée */}
                <div className="swipe-card details-card fade-in">
                    <div className="details-header">
                        <h3 className="details-title">À propos de {profile.name}</h3>
                    </div>
                    
                    <div className="profile-details">
                        <div className="bio-section">
                            <h4 className="section-title">📝 Description</h4>
                            <p className="profile-bio">{profile.bio}</p>
                        </div>
                        
                        <div className="interests-section">
                            <h4 className="section-title">❤️ Centres d'intérêt</h4>
                            <div className="interests-container">
                                {profile.interests.map((interest, index) => (
                                    <span key={index} className="interest-tag">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="stats-section">
                            <h4 className="section-title">📊 Informations</h4>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Âge :</span>
                                    <span className="info-value">{profile.age} ans</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Études :</span>
                                    <span className="info-value">{profile.study_level}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Domaine :</span>
                                    <span className="info-value">{profile.field}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Distance :</span>
                                    <span className="info-value">{profile.distance} km</span>
                                </div>
                            </div>
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
                            <p className="match-details">📍 {match.other_user.address}</p>
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
                    <Col md={10} className="mx-auto">
                        <div className="text-center mb-4">
                            <h4 style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                                💕 Paramètres CampusLove
                            </h4>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                Créez votre profil de rencontre parfait ! Cliquez sur le bouton ci-dessous pour accéder au gestionnaire de profil complet.
                            </p>
                        </div>
                        
                        <div className="stat-card text-center">
                            <div className="mb-4">
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                    🎯
                                </div>
                                <h5 className="mb-3">Gestionnaire de Profil Avancé</h5>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                    Accédez au gestionnaire complet pour configurer votre profil CampusLove avec :
                                </p>
                                
                                <Row className="mb-4">
                                    <Col md={3} className="mb-3">
                                        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                                            <strong>Photos</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Upload avec drag & drop</div>
                                        </div>
                                    </Col>
                                    <Col md={3} className="mb-3">
                                        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                                            <strong>Descriptions</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Bio détaillée</div>
                                        </div>
                                    </Col>
                                    <Col md={3} className="mb-3">
                                        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
                                            <strong>Intérêts</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Centres d'intérêt</div>
                                        </div>
                                    </Col>
                                    <Col md={3} className="mb-3">
                                        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                                            <strong>Statistiques</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Analyse du profil</div>
                                        </div>
                                    </Col>
                                </Row>
                                
                                <Button 
                                    onClick={() => {
                                        // Rediriger vers la page de profil CampusLove
                                        window.location.href = '/campus-love-profile';
                                    }}
                                    style={{
                                        background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                        border: 'none',
                                        borderRadius: '15px',
                                        padding: '15px 30px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                                    }}
                                    size="lg"
                                >
                                    🚀 Ouvrir le Gestionnaire de Profil
                                </Button>
                                
                                <div className="mt-3">
                                    <small style={{ color: '#999', fontSize: '0.8rem' }}>
                                        Nouveau système avec sauvegarde automatique et interface avancée
                                    </small>
                                </div>
                            </div>
                        </div>
                        
                        {/* Section d'upload rapide pour les photos */}
                        <div className="stat-card mt-4">
                            <h6 className="mb-3" style={{ color: '#ff6b6b' }}>
                                📸 Upload rapide de photos
                            </h6>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                Vous pouvez aussi uploader vos photos directement ici (version rapide) :
                            </p>
                            <CampusLoveMediaUpload
                                photos={[]}
                                onPhotosChange={(updatedProfile) => {
                                    showAlert('Photos uploadées avec succès ! 📸', 'success');
                                }}
                                maxPhotos={6}
                                profile={null}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    };

    // Écran de chargement
    if (accessLoading) {
        return (
            <div className="campus-love-container">
                <div className="modern-header">
                    <Container>
                        <Row className="align-items-center">
                            <Col xs={12} className="text-center">
                                <h1 className="app-logo">💕 CampusLove</h1>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <Container className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                    <div className="text-center text-white">
                        <Spinner animation="border" variant="light" className="mb-3" />
                        <p>Vérification de l'accès...</p>
                    </div>
                </Container>
            </div>
        );
    }

    // Écran de verrouillage si pas d'accès
    if (!hasAccess) {
        return (
            <div className="campus-love-container">
                <div className="modern-header">
                    <Container>
                        <Row className="align-items-center">
                            <Col xs={12} className="text-center">
                                <h1 className="app-logo">💕 CampusLove</h1>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <Container className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                    <div className="text-center text-white">
                        <Lock size={64} className="mb-3" />
                        <h3 className="mb-3">Accès requis</h3>
                        <p className="mb-4">
                            CampusLove est un service premium qui nécessite un paiement unique de 2000 FCFA pour un accès à vie à toutes les fonctionnalités.
                        </p>
                        <div className="d-flex flex-column gap-3 align-items-center">
                            <Button 
                                onClick={() => setShowAccessModal(true)}
                                style={{
                                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                                    border: 'none',
                                    padding: '12px 30px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600'
                                }}
                            >
                                💳 Débloquer CampusLove (Standard)
                            </Button>
                            <Button 
                                onClick={() => setShowGitHubAccessModal(true)}
                                variant="outline-light"
                                style={{
                                    padding: '12px 30px',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                            >
                                🔧 Style GitHub (Référence)
                            </Button>
                        </div>
                    </div>
                </Container>
                
                <CampusLoveAccess
                    show={showAccessModal}
                    onHide={handleAccessModalHide}
                    onAccessGranted={handleAccessGranted}
                />

                <CampusLoveAccessGitHub
                    show={showGitHubAccessModal}
                    onHide={handleGitHubAccessModalHide}
                    onAccessGranted={handleGitHubAccessGranted}
                />
            </div>
        );
    }

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

            {/* Modal CampusLove Access */}
            <CampusLoveAccess
                show={showAccessModal}
                onHide={() => setShowAccessModal(false)}
                onAccessGranted={() => {
                    setHasAccess(true);
                    setShowAccessModal(false);
                    showAlert('Bienvenue sur CampusLove ! 💕', 'success');
                }}
            />
        </div>
    );
};

export default CampusLove;