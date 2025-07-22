import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Alert, Nav, Tab, Spinner } from 'react-bootstrap';
import { Heart, X, Star, MapPin, GraduationCap, User, Settings, Camera, Plus, Edit3, Book, Calendar, Phone, MessageCircle, BarChart3, TrendingUp, Users, Zap, Upload, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';
import '../../css/CampusLoveModern.css';

// Variables pour les vraies données
const initialProfiles = [];
const initialMatches = [];
const initialUserStats = {
    totalLikes: 0,
    totalMatches: 0,
    profileViews: 0,
    superLikes: 0,
    totalSwipes: 0,
    matchRate: 0,
    responseRate: 0,
    averageResponseTime: "0min",
    totalConversations: 0,
    activeDays: 0
};

const CampusLoveModern = () => {
    const [activeTab, setActiveTab] = useState('swipe');
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showProfile, setShowProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
    const [profiles, setProfiles] = useState(initialProfiles);
    const [matches, setMatches] = useState(initialMatches);
    const [likedProfiles, setLikedProfiles] = useState([]);
    const [passedProfiles, setPassedProfiles] = useState([]);
    const [userStats, setUserStats] = useState(initialUserStats);
    const [userProfile, setUserProfile] = useState({
        name: '',
        birth_date: '',
        gender: '',
        looking_for: '',
        university: '',
        study_level: '',
        field: '',
        bio_dating: '',
        whatsapp_number: '',
        interests: [],
        dating_photos: [],
        dating_active: true,
        max_distance: 50
    });
    const [swipeDirection, setSwipeDirection] = useState(null);

    const currentProfile = profiles[currentProfileIndex];

    // Charger les profils depuis l'API
    const loadProfiles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/campus-love/profiles');
            
            if (response.data.success) {
                const formattedProfiles = response.data.data.map(profile => ({
                    id: profile.id,
                    name: profile.name,
                    age: profile.age,
                    university: profile.university,
                    study_level: profile.study_level,
                    field_of_study: profile.field,
                    bio: profile.bio_dating || profile.bio,
                    images: (() => {
                        // Priorité : dating_photos, puis photos, puis placeholder
                        const photos = profile.dating_photos && profile.dating_photos.length > 0 
                            ? profile.dating_photos 
                            : profile.photos && profile.photos.length > 0 
                                ? profile.photos 
                                : null;
                        
                        return photos || ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face'];
                    })(),
                    distance: profile.distance ? `${profile.distance} km` : 'Distance inconnue',
                    interests: profile.interests || []
                }));
                setProfiles(formattedProfiles);
            } else {
                showAlert(response.data.message || 'Erreur lors du chargement des profils', 'danger');
            }
        } catch (error) {
            console.error('Erreur chargement profils:', error);
            showAlert('Erreur lors du chargement des profils', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Charger les matches depuis l'API
    const loadMatches = async () => {
        try {
            const response = await api.get('/campus-love/matches');
            
            if (response.data.success) {
                const formattedMatches = response.data.data.map(match => ({
                    id: match.id,
                    name: match.other_user.name,
                    age: match.other_user.age,
                    university: match.other_user.university,
                    image: (match.other_user.dating_photos && match.other_user.dating_photos.length > 0) ? 
                        match.other_user.dating_photos[0] : 
                        'https://via.placeholder.com/300x300/ff6b6b/white?text=?',
                    whatsapp: match.whatsapp_url,
                    matchDate: match.matched_at
                }));
                setMatches(formattedMatches);
                
                // Gérer les informations de limite premium
                if (response.data.matches_limit_reached) {
                    showAlert(
                        `Vous avez atteint la limite de 6 matches gratuits. Abonnez-vous pour ${response.data.premium_info.price} ${response.data.premium_info.currency} et débloquez des matches illimités !`,
                        'warning'
                    );
                }
            }
        } catch (error) {
            console.error('Erreur chargement matches:', error);
        }
    };

    // Charger les profils likés depuis l'API
    const loadLikedProfiles = async () => {
        try {
            const response = await api.get('/campus-love/liked-profiles');
            
            if (response.data.success) {
                const formattedLiked = response.data.data.map(like => ({
                    id: like.id,
                    profile: {
                        id: like.liked_user.id,
                        name: like.liked_user.name,
                        age: like.liked_user.age,
                        university: like.liked_user.university,
                        image: (like.liked_user.dating_photos && like.liked_user.dating_photos.length > 0) ? 
                            like.liked_user.dating_photos[0] : 
                            'https://via.placeholder.com/300x300/ff6b6b/white?text=?',
                        bio: like.liked_user.bio_dating || like.liked_user.bio
                    },
                    liked_at: like.created_at,
                    is_super_like: like.is_super_like
                }));
                setLikedProfiles(formattedLiked);
            }
        } catch (error) {
            console.error('Erreur chargement profils likés:', error);
        }
    };

    // Charger les profils refusés depuis l'API
    const loadPassedProfiles = async () => {
        try {
            const response = await api.get('/campus-love/passed-profiles');
            
            if (response.data.success) {
                const formattedPassed = response.data.data.map(pass => ({
                    id: pass.id,
                    profile: {
                        id: pass.passed_user.id,
                        name: pass.passed_user.name,
                        age: pass.passed_user.age,
                        university: pass.passed_user.university,
                        image: (pass.passed_user.dating_photos && pass.passed_user.dating_photos.length > 0) ? 
                            pass.passed_user.dating_photos[0] : 
                            'https://via.placeholder.com/300x300/adb5bd/white?text=?',
                        bio: pass.passed_user.bio_dating || pass.passed_user.bio
                    },
                    passed_at: pass.passed_at
                }));
                setPassedProfiles(formattedPassed);
            }
        } catch (error) {
            console.error('Erreur chargement profils refusés:', error);
        }
    };

    // Charger les statistiques depuis l'API
    const loadStats = async () => {
        try {
            const response = await api.get('/campus-love/stats');
            
            if (response.data.success) {
                const stats = response.data.data;
                setUserStats({
                    totalLikes: stats.total_likes_received || 0,
                    totalMatches: stats.total_matches || 0,
                    profileViews: stats.profile_views || 0,
                    superLikes: stats.super_likes_received || 0,
                    superLikesGiven: stats.super_likes_given || 0,
                    totalSwipes: stats.total_swipes || 0,
                    totalPasses: stats.total_passes || 0,
                    matchRate: stats.match_rate || 0,
                    likeRate: stats.like_rate || 0,
                    responseRate: stats.response_rate || 0,
                    averageResponseTime: "2h 15min", // TODO: Calculer le vrai temps
                    totalConversations: stats.conversations_started || 0,
                    activeDays: stats.active_days || 0,
                    isPopular: stats.is_popular || false,
                    profileComplete: stats.profile_complete || false,
                    datingActive: stats.dating_active || false
                });
            }
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    };

    const handleSwipe = async (direction) => {
        if (!currentProfile) return;
        
        setSwipeDirection(direction);
        
        try {
            if (direction === 'right' || direction === 'super') {
                const response = await api.post('/campus-love/like', {
                    target_user_id: currentProfile.id,
                    is_super_like: direction === 'super'
                });
                
                if (response.data.success && response.data.is_match) {
                    // C'est un match ! Ajouter à la liste des matches
                    const newMatch = {
                        id: response.data.match.id,
                        name: currentProfile.name,
                        age: currentProfile.age,
                        university: currentProfile.university,
                        image: currentProfile.images[0],
                        whatsapp: response.data.match.whatsapp_url,
                        matchDate: response.data.match.matched_at
                    };
                    setMatches(prev => [newMatch, ...prev]);
                    showAlert(`C'est un match avec ${currentProfile.name} ! 💕`, 'success');
                } else if (response.data.needs_premium) {
                    // Limite de matches atteinte
                    showAlert(
                        `Limite de 6 matches atteinte ! Abonnez-vous pour ${response.data.premium_info.price} ${response.data.premium_info.currency} et débloquez des matches illimités.`,
                        'warning'
                    );
                }
            } else if (direction === 'left') {
                await api.post('/campus-love/pass', {
                    target_user_id: currentProfile.id
                });
            }
        } catch (error) {
            console.error('Erreur lors du swipe:', error);
            
            // Gérer les différents types d'erreurs
            if (error.response?.status === 402) {
                // Payment Required - limite de matches atteinte
                const errorData = error.response.data;
                setShowPremiumModal(true);
                if (errorData.premium_info) {
                    showAlert(
                        `${errorData.message} Abonnez-vous pour ${errorData.premium_info.price} ${errorData.premium_info.currency} et débloquez des matches illimités !`,
                        'warning'
                    );
                } else {
                    showAlert('Limite de matches atteinte. Abonnement requis.', 'warning');
                }
            } else if (error.response?.status === 400) {
                // Bad Request
                const message = error.response.data?.message || 'Erreur lors de l\'action';
                showAlert(message, 'danger');
            } else {
                showAlert('Erreur lors de l\'action', 'danger');
            }
        }
        
        setTimeout(() => {
            setCurrentProfileIndex((prev) => 
                prev + 1 >= profiles.length ? 0 : prev + 1
            );
            setCurrentImageIndex(0);
            setSwipeDirection(null);
        }, 300);
    };

    const nextImage = () => {
        if (currentProfile && currentImageIndex < currentProfile.images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const addInterest = (interest) => {
        const currentInterests = userProfile.interests || [];
        if (!currentInterests.includes(interest)) {
            setUserProfile(prev => ({
                ...prev,
                interests: [...currentInterests, interest]
            }));
        }
    };

    const removeInterest = (interest) => {
        const currentInterests = userProfile.interests || [];
        setUserProfile(prev => ({
            ...prev,
            interests: currentInterests.filter(i => i !== interest)
        }));
    };

    const suggestedInterests = [
        "Musique", "Sport", "Voyage", "Cuisine", "Lecture", "Cinéma", 
        "Art", "Technologie", "Danse", "Photo", "Nature", "Gaming"
    ];

    // Fonctions pour gérer les photos
    const handlePhotoUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const currentPhotos = userProfile.dating_photos || [];
        if (currentPhotos.length + files.length > 6) {
            showAlert('Vous ne pouvez ajouter que 6 photos maximum', 'warning');
            return;
        }

        try {
            const uploadPromises = files.map(async (file) => {
                // Vérifier le type de fichier
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} n'est pas une image valide`);
                }

                // Vérifier la taille (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`${file.name} est trop volumineux (max 5MB)`);
                }

                // Pour l'instant, utiliser des URLs de placeholder plus courtes
                // Générer une URL de placeholder basée sur les dimensions de l'image
                const randomId = Math.floor(Math.random() * 1000);
                return Promise.resolve(`https://picsum.photos/400/600?random=${randomId}`);
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            
            setUserProfile(prev => ({
                ...prev,
                dating_photos: [...(prev.dating_photos || []), ...uploadedUrls]
            }));

            showAlert(`${uploadedUrls.length} photo(s) ajoutée(s) avec succès`, 'success');
        } catch (error) {
            console.error('Erreur upload photos:', error);
            showAlert(error.message || 'Erreur lors de l\'upload des photos', 'danger');
        }
    };

    const removePhoto = (index) => {
        setUserProfile(prev => ({
            ...prev,
            dating_photos: (prev.dating_photos || []).filter((_, i) => i !== index)
        }));
        showAlert('Photo supprimée', 'info');
    };

    // Fonction pour afficher les alertes
    const showAlert = (message, type = 'info') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
    };

    // Charger le profil de l'utilisateur
    const loadUserProfile = async () => {
        try {
            setProfileLoading(true);
            const response = await api.get('/campus-love/profile');
            
            if (response.data.success) {
                const profile = response.data.data;
                setUserProfile({
                    name: profile.name || '',
                    birth_date: profile.birth_date || '',
                    gender: profile.gender || '',
                    looking_for: profile.looking_for || '',
                    university: profile.university || '',
                    study_level: profile.study_level || '',
                    field: profile.field || '',
                    bio_dating: profile.bio_dating || '',
                    whatsapp_number: profile.whatsapp_number || '',
                    interests: profile.interests || [],
                    dating_photos: profile.dating_photos || [],
                    dating_active: profile.dating_active !== undefined ? profile.dating_active : true,
                    max_distance: profile.max_distance || 50
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
            showAlert('Erreur lors du chargement du profil', 'danger');
        } finally {
            setProfileLoading(false);
        }
    };

    // Sauvegarder le profil
    const saveUserProfile = async () => {
        try {
            setSaveLoading(true);
            
            // Validation côté client
            if (!userProfile.birth_date) {
                showAlert('La date de naissance est requise', 'warning');
                setSaveLoading(false);
                return;
            }
            
            if (!userProfile.gender) {
                showAlert('Le genre est requis', 'warning');
                setSaveLoading(false);
                return;
            }
            
            if (!userProfile.looking_for) {
                showAlert('Veuillez indiquer qui vous recherchez', 'warning');
                setSaveLoading(false);
                return;
            }
            
            if (!userProfile.whatsapp_number) {
                showAlert('Le numéro WhatsApp est requis', 'warning');
                setSaveLoading(false);
                return;
            }
            
            const profileData = {
                birth_date: userProfile.birth_date,
                gender: userProfile.gender,
                looking_for: userProfile.looking_for,
                bio_dating: userProfile.bio_dating,
                whatsapp_number: userProfile.whatsapp_number,
                interests: userProfile.interests,
                dating_photos: userProfile.dating_photos,
                dating_active: userProfile.dating_active,
                max_distance: userProfile.max_distance
            };

            const response = await api.put('/campus-love/profile', profileData);
            
            if (response.data.success) {
                showAlert('Profil mis à jour avec succès !', 'success');
                setShowProfile(false);
            } else {
                showAlert(response.data.message || 'Erreur lors de la sauvegarde', 'danger');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            let errorMessage = 'Erreur lors de la sauvegarde du profil';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            }
            
            showAlert(errorMessage, 'danger');
        } finally {
            setSaveLoading(false);
        }
    };

    // Charger toutes les données au montage du composant
    useEffect(() => {
        const loadAllData = async () => {
            await Promise.all([
                loadUserProfile(),
                loadProfiles(),
                loadMatches(),
                loadLikedProfiles(),
                loadPassedProfiles(),
                loadStats()
            ]);
        };
        
        loadAllData();
    }, []);

    // Fonction pour ouvrir WhatsApp
    const openWhatsApp = (match) => {
        if (match.whatsapp) {
            // Si whatsapp contient déjà l'URL complète
            if (match.whatsapp.startsWith('https://wa.me/')) {
                window.open(match.whatsapp, '_blank');
            } else {
                // Sinon construire l'URL
                const message = encodeURIComponent(`Salut ${match.name} ! Je t'ai vue sur CampusLove 😊`);
                const whatsappUrl = `https://wa.me/${match.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
                window.open(whatsappUrl, '_blank');
            }
        } else {
            showAlert('Numéro WhatsApp non disponible', 'warning');
        }
    };

    return (
        <Container fluid className="campus-love-modern">

            {/* Navigation Tabs */}
            <Row className="nav-tabs-row">
                <Col>
                    <div className="d-flex justify-content-center align-items-center mb-3">
                        <div className="logo">
                            <Heart className="logo-icon" />
                            <span>CampusLove</span>
                        </div>
                    </div>
                    <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab} className="modern-tabs">
                        <Nav.Item>
                            <Nav.Link eventKey="swipe" className="d-flex align-items-center gap-2">
                                <Zap size={16} />
                                <span>Découvrir</span>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="matches" className="d-flex align-items-center gap-2">
                                <Heart size={16} />
                                <span>Matches</span>
                                <Badge bg="danger" className="ms-1">{matches.length}</Badge>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="liked" className="d-flex align-items-center gap-2">
                                <Heart size={16} />
                                <span>Mes Likes</span>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="passed" className="d-flex align-items-center gap-2">
                                <X size={16} />
                                <span>Refusés</span>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="stats" className="d-flex align-items-center gap-2">
                                <BarChart3 size={16} />
                                <span>Stats</span>
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>

            {/* Alertes */}
            {alert.show && (
                <Row>
                    <Col lg={6} className="mx-auto">
                        <Alert 
                            variant={alert.type} 
                            className="text-center"
                            dismissible
                            onClose={() => setAlert({ show: false, message: '', type: 'info' })}
                        >
                            {alert.message}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Tab Content */}
            <Row className="main-content">
                <Col lg={10} className="mx-auto">
                    {/* Onglet Découvrir */}
                    {activeTab === 'swipe' && (
                        <div className="swipe-container">
                            {currentProfile ? (
                                <>
                                    <Card className={`profile-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}>
                                        {/* Images avec indicateurs */}
                                        <div className="image-container" onClick={nextImage}>
                                            <img 
                                                src={currentProfile.images[currentImageIndex]} 
                                                alt={currentProfile.name}
                                                className="profile-image"
                                            />
                                            <div className="image-indicators">
                                                {currentProfile.images.map((_, index) => (
                                                    <div 
                                                        key={index}
                                                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="image-nav">
                                                <div className="nav-left" onClick={(e) => { e.stopPropagation(); prevImage(); }} />
                                                <div className="nav-right" onClick={(e) => { e.stopPropagation(); nextImage(); }} />
                                            </div>
                                        </div>

                                        <Card.Body className="profile-body">
                                            <div className="profile-content-top">
                                                <div className="profile-header">
                                                    <div className="profile-name-container">
                                                        <h3 className="profile-name">
                                                            {currentProfile.name}, {currentProfile.age}
                                                        </h3>
                                                    </div>
                                                    <div className="distance">
                                                        <MapPin size={12} />
                                                        <span>{currentProfile.distance}</span>
                                                    </div>
                                                </div>

                                                <div className="profile-info">
                                                    <div className="info-item">
                                                        <GraduationCap size={14} />
                                                        <span>{currentProfile.university}</span>
                                                    </div>
                                                    {currentProfile.study_level && currentProfile.field_of_study && (
                                                        <div className="info-item">
                                                            <Book size={14} />
                                                            <span>{currentProfile.study_level} • {currentProfile.field_of_study}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {currentProfile.bio && (
                                                    <p className="profile-bio">{currentProfile.bio}</p>
                                                )}
                                            </div>

                                            <div className="profile-content-bottom">
                                                {currentProfile.interests && currentProfile.interests.length > 0 && (
                                                    <div className="interests">
                                                        {currentProfile.interests.slice(0, 4).map((interest, index) => (
                                                            <Badge key={index} className="interest-badge">
                                                                {interest}
                                                            </Badge>
                                                        ))}
                                                        {currentProfile.interests.length > 4 && (
                                                            <Badge className="interest-badge" style={{opacity: 0.7}}>
                                                                +{currentProfile.interests.length - 4}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    {/* Action Buttons */}
                                    <div className="action-buttons">
                                        <Button 
                                            variant="outline-danger" 
                                            size="lg" 
                                            className="action-btn pass-btn"
                                            onClick={() => handleSwipe('left')}
                                        >
                                            <X size={24} />
                                        </Button>
                                        <Button 
                                            variant="outline-warning" 
                                            size="lg" 
                                            className="action-btn super-btn"
                                            onClick={() => handleSwipe('super')}
                                        >
                                            <Star size={24} />
                                        </Button>
                                        <Button 
                                            variant="outline-success" 
                                            size="lg" 
                                            className="action-btn like-btn"
                                            onClick={() => handleSwipe('right')}
                                        >
                                            <Heart size={24} />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <Heart size={48} className="text-primary mb-3" />
                                    <h4>Plus de profils pour le moment</h4>
                                    <p className="text-muted">Revenez plus tard pour découvrir de nouveaux profils !</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onglet Matches */}
                    {activeTab === 'matches' && (
                        <div className="matches-container">
                            <div className="matches-header mb-4">
                                <h4 className="d-flex align-items-center gap-2">
                                    <Heart size={24} className="text-danger" />
                                    Vos Matches ({matches.length})
                                </h4>
                                <p className="text-muted">Cliquez sur un match pour ouvrir la conversation WhatsApp</p>
                            </div>

                            <Row>
                                {matches.map((match) => (
                                    <Col md={6} lg={4} key={match.id} className="mb-4">
                                        <Card className="match-card h-100">
                                            <div className="position-relative">
                                                <img 
                                                    src={match.image} 
                                                    alt={match.name}
                                                    className="match-image"
                                                />
                                                {match.isOnline && (
                                                    <Badge bg="success" className="online-badge">
                                                        En ligne
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="mb-1">{match.name}, {match.age}</h6>
                                                        <small className="text-muted d-flex align-items-center gap-1">
                                                            <GraduationCap size={12} />
                                                            {match.university}
                                                        </small>
                                                    </div>
                                                </div>
                                                
                                                <div className="last-message mb-3">
                                                    <small className="text-muted">Dernier message:</small>
                                                    <small className="text-muted">
                                                        {match.matchDate ? new Date(match.matchDate).toLocaleDateString() : 'Récemment'}
                                                    </small>
                                                </div>

                                                <Button 
                                                    variant="success" 
                                                    size="sm" 
                                                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                                                    onClick={() => openWhatsApp(match)}
                                                >
                                                    <MessageCircle size={16} />
                                                    Écrire sur WhatsApp
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {matches.length === 0 && (
                                <div className="text-center py-5">
                                    <Heart size={48} className="text-muted mb-3" />
                                    <h5>Aucun match pour le moment</h5>
                                    <p className="text-muted">Continuez à swiper pour trouver votre âme sœur !</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onglet Mes Likes */}
                    {activeTab === 'liked' && (
                        <div className="liked-container">
                            <div className="liked-header mb-4">
                                <h4 className="d-flex align-items-center gap-2">
                                    <Heart size={24} className="text-danger" />
                                    Profils que j'ai aimés ({likedProfiles.length})
                                </h4>
                                <p className="text-muted">Retrouvez tous les profils que vous avez likés</p>
                            </div>

                            <Row>
                                {likedProfiles.map((liked) => (
                                    <Col md={6} lg={4} key={liked.id} className="mb-4">
                                        <Card className="liked-card h-100">
                                            <div className="position-relative">
                                                <img 
                                                    src={liked.profile.image} 
                                                    alt={liked.profile.name}
                                                    className="liked-image"
                                                    style={{
                                                        width: '100%',
                                                        height: '250px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                {liked.is_super_like && (
                                                    <Badge bg="warning" className="super-like-badge" style={{
                                                        position: 'absolute',
                                                        top: '10px',
                                                        right: '10px'
                                                    }}>
                                                        <Star size={12} /> Super Like
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="mb-1">{liked.profile.name}, {liked.profile.age}</h6>
                                                        <small className="text-muted d-flex align-items-center gap-1">
                                                            <GraduationCap size={12} />
                                                            {liked.profile.university}
                                                        </small>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                                                    {liked.profile.bio?.substring(0, 100)}...
                                                </p>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        Liké le {new Date(liked.liked_at).toLocaleDateString()}
                                                    </small>
                                                    <Badge bg="light" text="dark">
                                                        En attente
                                                    </Badge>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {likedProfiles.length === 0 && (
                                <div className="text-center py-5">
                                    <Heart size={48} className="text-muted mb-3" />
                                    <h5>Aucun profil liké</h5>
                                    <p className="text-muted">Commencez à swiper pour trouver des profils qui vous plaisent !</p>
                                    <Button 
                                        variant="primary" 
                                        onClick={() => setActiveTab('swipe')}
                                    >
                                        Découvrir des profils
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onglet Profils refusés */}
                    {activeTab === 'passed' && (
                        <div className="passed-container">
                            <div className="passed-header mb-4">
                                <h4 className="d-flex align-items-center gap-2">
                                    <X size={24} className="text-secondary" />
                                    Profils refusés ({passedProfiles.length})
                                </h4>
                                <p className="text-muted">Ces profils ne vous seront plus proposés</p>
                            </div>

                            <Row>
                                {passedProfiles.map((passed) => (
                                    <Col md={6} lg={4} key={passed.id} className="mb-4">
                                        <Card className="passed-card h-100">
                                            <div className="position-relative">
                                                <img 
                                                    src={passed.profile.image} 
                                                    alt={passed.profile.name}
                                                    className="passed-image"
                                                    style={{
                                                        width: '100%',
                                                        height: '250px',
                                                        objectFit: 'cover',
                                                        filter: 'grayscale(50%)',
                                                        opacity: 0.7
                                                    }}
                                                />
                                                <Badge bg="secondary" className="position-absolute top-0 end-0 m-2">
                                                    <X size={12} /> Refusé
                                                </Badge>
                                            </div>
                                            
                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="mb-1 text-muted">{passed.profile.name}, {passed.profile.age}</h6>
                                                        <small className="text-muted d-flex align-items-center gap-1">
                                                            <GraduationCap size={12} />
                                                            {passed.profile.university}
                                                        </small>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                                                    {passed.profile.bio?.substring(0, 80)}...
                                                </p>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        Refusé le {new Date(passed.passed_at).toLocaleDateString()}
                                                    </small>
                                                    <Badge bg="light" text="dark">
                                                        Ignoré
                                                    </Badge>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {passedProfiles.length === 0 && (
                                <div className="text-center py-5">
                                    <X size={48} className="text-muted mb-3" />
                                    <h5>Aucun profil refusé</h5>
                                    <p className="text-muted">Les profils que vous refusez apparaîtront ici</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onglet Statistiques */}
                    {activeTab === 'stats' && (
                        <div className="stats-container">
                            <div className="stats-header mb-4">
                                <h4 className="d-flex align-items-center gap-2">
                                    <BarChart3 size={24} className="text-primary" />
                                    Vos Statistiques
                                </h4>
                                <p className="text-muted">Analysez vos performances sur CampusLove</p>
                            </div>

                            <Row>
                                {/* Statistiques principales */}
                                <Col md={6} lg={3} className="mb-4">
                                    <Card className="stat-card">
                                        <Card.Body className="text-center">
                                            <div className="stat-icon mb-2">
                                                <Heart size={32} className="text-danger" />
                                            </div>
                                            <h3 className="stat-number">{userStats.totalLikes}</h3>
                                            <p className="stat-label">Likes reçus</p>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} lg={3} className="mb-4">
                                    <Card className="stat-card">
                                        <Card.Body className="text-center">
                                            <div className="stat-icon mb-2">
                                                <Users size={32} className="text-success" />
                                            </div>
                                            <h3 className="stat-number">{userStats.totalMatches}</h3>
                                            <p className="stat-label">Matches</p>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} lg={3} className="mb-4">
                                    <Card className="stat-card">
                                        <Card.Body className="text-center">
                                            <div className="stat-icon mb-2">
                                                <TrendingUp size={32} className="text-info" />
                                            </div>
                                            <h3 className="stat-number">{userStats.profileViews}</h3>
                                            <p className="stat-label">Vues du profil</p>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6} lg={3} className="mb-4">
                                    <Card className="stat-card">
                                        <Card.Body className="text-center">
                                            <div className="stat-icon mb-2">
                                                <Star size={32} className="text-warning" />
                                            </div>
                                            <h3 className="stat-number">{userStats.superLikes}</h3>
                                            <p className="stat-label">Super Likes</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Statistiques détaillées */}
                            <Row>
                                <Col lg={6} className="mb-4">
                                    <Card>
                                        <Card.Header>
                                            <h6 className="mb-0">Taux de réussite</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small>Taux de match</small>
                                                    <small>{userStats.matchRate}%</small>
                                                </div>
                                                <div className="progress">
                                                    <div 
                                                        className="progress-bar bg-success" 
                                                        style={{width: `${userStats.matchRate}%`}}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <small>Taux de réponse</small>
                                                    <small>{userStats.responseRate}%</small>
                                                </div>
                                                <div className="progress">
                                                    <div 
                                                        className="progress-bar bg-info" 
                                                        style={{width: `${userStats.responseRate}%`}}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="stats-details">
                                                <div className="d-flex justify-content-between py-2 border-bottom">
                                                    <span>Total swipes</span>
                                                    <strong>{userStats.totalSwipes}</strong>
                                                </div>
                                                <div className="d-flex justify-content-between py-2 border-bottom">
                                                    <span>Conversations actives</span>
                                                    <strong>{userStats.totalConversations}</strong>
                                                </div>
                                                <div className="d-flex justify-content-between py-2">
                                                    <span>Temps de réponse moyen</span>
                                                    <strong>{userStats.averageResponseTime}</strong>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col lg={6} className="mb-4">
                                    <Card>
                                        <Card.Header>
                                            <h6 className="mb-0">Activité récente</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="activity-item">
                                                <div className="d-flex align-items-center gap-3 py-2">
                                                    <div className="activity-icon bg-success">
                                                        <Heart size={16} className="text-white" />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <small className="d-block">Nouveau match</small>
                                                        <small className="text-muted">Il y a 2 heures</small>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="activity-item">
                                                <div className="d-flex align-items-center gap-3 py-2">
                                                    <div className="activity-icon bg-info">
                                                        <TrendingUp size={16} className="text-white" />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <small className="d-block">Profil vu 15 fois</small>
                                                        <small className="text-muted">Aujourd'hui</small>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="activity-item">
                                                <div className="d-flex align-items-center gap-3 py-2">
                                                    <div className="activity-icon bg-warning">
                                                        <Star size={16} className="text-white" />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <small className="d-block">Super Like reçu</small>
                                                        <small className="text-muted">Hier</small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 p-3 bg-light rounded">
                                                <div className="text-center">
                                                    <h5 className="text-primary">{userStats.activeDays}</h5>
                                                    <small className="text-muted">Jours d'activité</small>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Modal Profil Utilisateur */}
            <Modal show={showProfile} onHide={() => setShowProfile(false)} size="lg" className="profile-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <User size={24} className="me-2" />
                        Mon Profil CampusLove
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {profileLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Chargement du profil...</p>
                        </div>
                    ) : (
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <User size={16} className="me-2" />
                                        Nom complet
                                    </Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={userProfile.name}
                                        readOnly
                                        className="bg-light"
                                        placeholder="Nom récupéré automatiquement"
                                    />
                                    <Form.Text className="text-muted">
                                        Le nom ne peut pas être modifié ici
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <Calendar size={16} className="me-2" />
                                        Date de naissance
                                    </Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={userProfile.birth_date}
                                        onChange={(e) => setUserProfile(prev => ({...prev, birth_date: e.target.value}))}
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    />
                                    <Form.Text className="text-muted">
                                        Vous devez avoir au moins 18 ans
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <User size={16} className="me-2" />
                                        Genre
                                    </Form.Label>
                                    <Form.Select 
                                        value={userProfile.gender}
                                        onChange={(e) => setUserProfile(prev => ({...prev, gender: e.target.value}))}
                                    >
                                        <option value="">Choisir votre genre</option>
                                        <option value="male">Homme</option>
                                        <option value="female">Femme</option>
                                        <option value="other">Autre</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <Heart size={16} className="me-2" />
                                        Je recherche
                                    </Form.Label>
                                    <Form.Select 
                                        value={userProfile.looking_for}
                                        onChange={(e) => setUserProfile(prev => ({...prev, looking_for: e.target.value}))}
                                    >
                                        <option value="">Qui recherchez-vous ?</option>
                                        <option value="male">Des hommes</option>
                                        <option value="female">Des femmes</option>
                                        <option value="both">Les deux</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <GraduationCap size={16} className="me-2" />
                                        Université
                                    </Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={userProfile.university}
                                        readOnly
                                        className="bg-light"
                                        placeholder="Université récupérée automatiquement"
                                    />
                                    <Form.Text className="text-muted">
                                        L'université ne peut pas être modifiée ici
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <Book size={16} className="me-2" />
                                        Niveau d'études
                                    </Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={userProfile.study_level}
                                        readOnly
                                        className="bg-light"
                                        placeholder="Niveau récupéré automatiquement"
                                    />
                                    <Form.Text className="text-muted">
                                        Le niveau ne peut pas être modifié ici
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <Edit3 size={16} className="me-2" />
                                        Domaine d'études
                                    </Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={userProfile.field}
                                        readOnly
                                        className="bg-light"
                                        placeholder="Domaine récupéré automatiquement"
                                    />
                                    <Form.Text className="text-muted">
                                        Le domaine ne peut pas être modifié ici
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <Phone size={16} className="me-2" />
                                        WhatsApp *
                                    </Form.Label>
                                    <Form.Control 
                                        type="tel" 
                                        value={userProfile.whatsapp_number}
                                        onChange={(e) => setUserProfile(prev => ({...prev, whatsapp_number: e.target.value}))}
                                        placeholder="+237 6XX XXX XXX"
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Numéro pour les conversations
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                <Edit3 size={16} className="me-2" />
                                Bio CampusLove
                            </Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                value={userProfile.bio_dating || ''}
                                onChange={(e) => setUserProfile(prev => ({...prev, bio_dating: e.target.value}))}
                                placeholder="Parlez-nous de vous en quelques mots..."
                                maxLength={500}
                            />
                            <Form.Text className="text-muted">
                                {(userProfile.bio_dating || '').length}/500 caractères
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Centres d'intérêt</Form.Label>
                            <div className="interests-selector">
                                <div className="selected-interests mb-2">
                                    {(userProfile.interests || []).map((interest, index) => (
                                        <Badge 
                                            key={index} 
                                            bg="primary" 
                                            className="interest-badge selected me-2 mb-2"
                                            onClick={() => removeInterest(interest)}
                                        >
                                            {interest} <X size={12} />
                                        </Badge>
                                    ))}
                                </div>
                                <div className="suggested-interests">
                                    {suggestedInterests.filter(interest => !(userProfile.interests || []).includes(interest)).map((interest, index) => (
                                        <Badge 
                                            key={index} 
                                            bg="outline-secondary" 
                                            className="interest-badge suggested me-2 mb-2"
                                            onClick={() => addInterest(interest)}
                                        >
                                            <Plus size={12} /> {interest}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                <Camera size={16} className="me-2" />
                                Photos CampusLove
                            </Form.Label>
                            <div className="photos-upload">
                                <div className="photos-grid">
                                    {/* Photos existantes */}
                                    {(userProfile.dating_photos || []).map((photo, index) => (
                                        <div key={index} className="photo-item">
                                            <img src={photo} alt={`Photo ${index + 1}`} className="uploaded-photo" />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="remove-photo-btn"
                                                onClick={() => removePhoto(index)}
                                            >
                                                <Trash2 size={12} />
                                            </Button>
                                        </div>
                                    ))}
                                    
                                    {/* Bouton d'ajout si moins de 6 photos */}
                                    {(userProfile.dating_photos || []).length < 6 && (
                                        <div className="add-photo-slot">
                                            <Form.Control
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                style={{ display: 'none' }}
                                                id="photo-upload"
                                            />
                                            <label htmlFor="photo-upload" className="upload-label">
                                                <Upload size={24} />
                                                <span>Ajouter</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <Form.Text className="text-muted">
                                    Ajoutez jusqu'à 6 photos pour votre profil CampusLove (max 5MB par photo)
                                </Form.Text>
                            </div>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <MapPin size={16} className="me-2" />
                                        Distance maximale
                                    </Form.Label>
                                    <Form.Range 
                                        min={1}
                                        max={100}
                                        value={userProfile.max_distance || 50}
                                        onChange={(e) => setUserProfile(prev => ({...prev, max_distance: parseInt(e.target.value)}))}
                                    />
                                    <Form.Text className="text-muted">
                                        {userProfile.max_distance || 50} km
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="switch"
                                        id="dating-active-switch"
                                        label="Profil actif sur CampusLove"
                                        checked={userProfile.dating_active || false}
                                        onChange={(e) => setUserProfile(prev => ({...prev, dating_active: e.target.checked}))}
                                    />
                                    <Form.Text className="text-muted">
                                        Votre profil sera visible aux autres utilisateurs
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowProfile(false)}>
                        Annuler
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={saveUserProfile}
                        disabled={saveLoading}
                    >
                        {saveLoading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Sauvegarde...
                            </>
                        ) : (
                            'Sauvegarder'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Paramètres */}
            <Modal show={showSettings} onHide={() => setShowSettings(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Settings size={24} className="me-2" />
                        Paramètres
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="settings-options">
                        <div className="setting-item">
                            <h6>Distance maximale</h6>
                            <Form.Range min="1" max="50" defaultValue="25" />
                            <small className="text-muted">25 km</small>
                        </div>
                        <div className="setting-item">
                            <h6>Tranche d'âge</h6>
                            <Row>
                                <Col>
                                    <Form.Control type="number" placeholder="Min" defaultValue="18" />
                                </Col>
                                <Col>
                                    <Form.Control type="number" placeholder="Max" defaultValue="30" />
                                </Col>
                            </Row>
                        </div>
                        <div className="setting-item">
                            <Form.Check 
                                type="switch"
                                label="Notifications push"
                                defaultChecked
                            />
                        </div>
                        <div className="setting-item">
                            <Form.Check 
                                type="switch"
                                label="Mode privé"
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowSettings(false)}>
                        Fermer
                    </Button>
                    <Button variant="primary">
                        Sauvegarder
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal d'abonnement Premium */}
            <Modal 
                show={showPremiumModal} 
                onHide={() => setShowPremiumModal(false)}
                size="lg"
                backdrop="static"
                centered
            >
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="d-flex align-items-center">
                        <Zap className="text-warning me-2" size={24} />
                        Abonnement Premium CampusLove
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <div className="display-4 text-primary mb-2">💎</div>
                        <h4>Limite de matches gratuits atteinte !</h4>
                        <p className="text-muted">
                            Vous avez utilisé vos 6 matches gratuits. Passez au Premium pour continuer à découvrir de nouvelles personnes.
                        </p>
                    </div>

                    <div className="premium-benefits mb-4">
                        <h5 className="mb-3">Avantages Premium :</h5>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="d-flex align-items-center mb-2">
                                    <Heart className="text-danger me-2" size={18} />
                                    <span>Matches illimités</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <Star className="text-warning me-2" size={18} />
                                    <span>Super likes illimités</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex align-items-center mb-2">
                                    <TrendingUp className="text-success me-2" size={18} />
                                    <span>Statistiques avancées</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <Users className="text-info me-2" size={18} />
                                    <span>Priorité dans les suggestions</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pricing-card bg-gradient-primary text-white p-4 rounded-4 text-center">
                        <div className="display-6 fw-bold">2 000 FCFA</div>
                        <div className="fs-5">Abonnement à vie</div>
                        <small className="opacity-75">Paiement unique • Pas d'abonnement récurrent</small>
                    </div>

                    <div className="payment-methods mt-4">
                        <h6>Moyens de paiement acceptés :</h6>
                        <div className="d-flex justify-content-center gap-3 mt-2">
                            <Badge bg="success">MTN Mobile Money</Badge>
                            <Badge bg="warning">Orange Money</Badge>
                            <Badge bg="primary">Express Union Mobile</Badge>
                            <Badge bg="info">Cartes bancaires</Badge>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" onClick={() => setShowPremiumModal(false)}>
                        Plus tard
                    </Button>
                    <Button 
                        variant="primary" 
                        size="lg"
                        onClick={() => {
                            setShowPremiumModal(false);
                            // Redirection vers le paiement
                            window.location.href = '/payment/campus-love-premium';
                        }}
                    >
                        <Zap className="me-2" size={18} />
                        Souscrire maintenant
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CampusLoveModern;