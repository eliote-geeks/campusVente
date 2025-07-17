import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import './Dating.css';

const Dating = () => {
    const [currentProfile, setCurrentProfile] = useState(0);
    const [profiles, setProfiles] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [matches, setMatches] = useState([]);
    const [showMatches, setShowMatches] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);
    const [filters, setFilters] = useState({
        ageMin: 18,
        ageMax: 30,
        university: '',
        interests: [],
        distance: 50
    });
    
    // États pour le système premium
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showProfileSetup, setShowProfileSetup] = useState(false);
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentData, setPaymentData] = useState({
        phone: '',
        email: ''
    });
    const [datingProfile, setDatingProfile] = useState({
        bio: '',
        interests: [],
        photos: [],
        lookingFor: '',
        lifestyle: '',
        education: '',
        height: '',
        relationshipStatus: 'single'
    });

    // Données d'exemple (à remplacer par API)
    const mockProfiles = [
        {
            id: 1,
            name: "Amélie Dubois",
            age: 22,
            university: "Université de Yaoundé I",
            faculty: "Sciences",
            bio: "Passionnée de biologie et de nature. J'aime les randonnées et la photographie. Recherche quelqu'un pour partager mes aventures 🌿📸",
            interests: ["Nature", "Photographie", "Sciences", "Voyages"],
            photos: [
                "https://images.unsplash.com/photo-1494790108755-2616b612b6af?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop&crop=face"
            ],
            distance: 2.5,
            online: true,
            year: "3ème année"
        },
        {
            id: 2,
            name: "Marc Nguyen",
            age: 24,
            university: "Université de Douala",
            faculty: "Informatique",
            bio: "Développeur passionné et gamer. Fan de tech et d'innovation. Toujours partant pour un bon café et une discussion sur l'avenir 💻☕",
            interests: ["Technologie", "Gaming", "Café", "Innovation"],
            photos: [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&crop=face"
            ],
            distance: 15.2,
            online: false,
            year: "Master 1"
        },
        {
            id: 3,
            name: "Sarah Mbala",
            age: 21,
            university: "Université de Yaoundé I",
            faculty: "Médecine",
            bio: "Future médecin avec un grand cœur. J'adore aider les autres et découvrir de nouvelles cultures. Amourense de musique et de danse 🩺💃",
            interests: ["Médecine", "Musique", "Danse", "Humanitaire"],
            photos: [
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=300&h=400&fit=crop&crop=face"
            ],
            distance: 5.8,
            online: true,
            year: "2ème année"
        },
        {
            id: 4,
            name: "Kevin Tchienko",
            age: 23,
            university: "ENSP Yaoundé",
            faculty: "Génie Civil",
            bio: "Futur ingénieur avec une passion pour l'architecture et le sport. Fan de basketball et de voyages. Recherche une complice pour explorer le monde 🏀🌍",
            interests: ["Sport", "Architecture", "Basketball", "Voyages"],
            photos: [
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop&crop=face"
            ],
            distance: 8.1,
            online: true,
            year: "4ème année"
        },
        {
            id: 5,
            name: "Laure Kamga",
            age: 20,
            university: "Université de Buea",
            faculty: "Lettres",
            bio: "Écrivaine en herbe et amoureuse des mots. Passionnée de littérature et de poésie. J'aime les discussions profondes et les couchers de soleil 📚🌅",
            interests: ["Littérature", "Écriture", "Poésie", "Art"],
            photos: [
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1485875437342-9b39470b3d95?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=300&h=400&fit=crop&crop=face"
            ],
            distance: 120.5,
            online: false,
            year: "1ère année"
        },
        {
            id: 6,
            name: "David Fouda",
            age: 25,
            university: "Université de Douala",
            faculty: "Commerce",
            bio: "Entrepreneur en devenir avec un esprit créatif. Passionné de business et de musique. Recherche une partenaire de vie ambitieuse 🎵💼",
            interests: ["Business", "Musique", "Entrepreneuriat", "Fitness"],
            photos: [
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=400&fit=crop&crop=face"
            ],
            distance: 12.3,
            online: true,
            year: "Master 2"
        },
        {
            id: 7,
            name: "Grace Nkomo",
            age: 19,
            university: "Université de Yaoundé II",
            faculty: "Droit",
            bio: "Future avocate avec une passion pour la justice. J'aime débattre, lire et découvrir de nouveaux endroits. Recherche quelqu'un d'intelligent et drôle ⚖️📖",
            interests: ["Droit", "Lecture", "Débats", "Voyages"],
            photos: [
                "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=400&fit=crop&crop=face"
            ],
            distance: 7.8,
            online: true,
            year: "1ère année"
        },
        {
            id: 8,
            name: "Christian Bile",
            age: 22,
            university: "ENSP Yaoundé",
            faculty: "Génie Électrique",
            bio: "Passionné de technologie et d'innovation. J'aime créer, inventer et repousser les limites. Fan de football et de cinéma 🔌⚡",
            interests: ["Technologie", "Football", "Cinéma", "Innovation"],
            photos: [
                "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=300&h=400&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300&h=400&fit=crop&crop=face"
            ],
            distance: 4.2,
            online: false,
            year: "3ème année"
        }
    ];

    const mockMatches = [
        {
            id: 1,
            name: "Julie Nkomo",
            university: "Université de Yaoundé I",
            photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
            matchDate: "2025-01-15",
            lastMessage: "Salut ! Comment ça va ?",
            online: true
        },
        {
            id: 2,
            name: "David Fouda",
            university: "ENSP Yaoundé",
            photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
            matchDate: "2025-01-14",
            lastMessage: "On se voit quand ?",
            online: false
        },
        {
            id: 3,
            name: "Vanessa Tchuente",
            university: "Université de Douala",
            photo: "https://images.unsplash.com/photo-1494790108755-2616b612b6af?w=100&h=100&fit=crop&crop=face",
            matchDate: "2025-01-13",
            lastMessage: "J'ai adoré notre conversation ! 😊",
            online: true
        }
    ];

    useEffect(() => {
        setProfiles(mockProfiles);
        setMatches(mockMatches);
    }, []);

    const handlePhotoUpload = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newPhotos = [...datingProfile.photos];
                newPhotos[index] = e.target.result;
                setDatingProfile({...datingProfile, photos: newPhotos});
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (index) => {
        const newPhotos = [...datingProfile.photos];
        newPhotos.splice(index, 1);
        setDatingProfile({...datingProfile, photos: newPhotos});
    };

    // Fonction pour traiter le paiement Premium
    const handlePremiumPayment = async () => {
        if (!paymentData.phone || !paymentData.email) {
            alert('Veuillez saisir votre numéro de téléphone et email');
            return;
        }

        setIsProcessingPayment(true);
        
        try {
            // Appel API pour initier le paiement
            const response = await fetch('/api/v1/payments/premium-dating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    phone: paymentData.phone,
                    email: paymentData.email,
                    user_id: 1 // TODO: Récupérer l'ID utilisateur connecté
                })
            });

            const result = await response.json();

            if (result.success) {
                // Initialiser le widget Monetbil
                const monetbilWidget = new MonetbilWidget();
                monetbilWidget.setAmount(result.data.amount);
                monetbilWidget.setCurrency(result.data.currency);
                monetbilWidget.setServiceKey(result.data.service_key);
                monetbilWidget.setPaymentReference(result.data.payment_ref);
                monetbilWidget.setReturnUrl(result.data.success_url);
                monetbilWidget.setCancelUrl(result.data.failed_url);
                monetbilWidget.setNotificationUrl(result.data.notify_url);
                monetbilWidget.setUser(result.data.user_info.email);
                monetbilWidget.setUserEmail(result.data.user_info.email);
                monetbilWidget.setUserPhone(result.data.user_info.phone);
                monetbilWidget.setUserName(result.data.user_info.name);
                monetbilWidget.setTitle('Abonnement Premium Dating');
                monetbilWidget.setDescription('Accès premium aux fonctionnalités de rencontres');
                
                // Fermer le modal et ouvrir le widget Monetbil
                setShowPremiumModal(false);
                monetbilWidget.open();

                // Écouter les événements du widget
                monetbilWidget.on('payment.success', (data) => {
                    setIsPremiumUser(true);
                    setShowProfileSetup(true);
                    alert('Paiement réussi ! Votre abonnement Premium est maintenant actif.');
                });

                monetbilWidget.on('payment.failed', (data) => {
                    alert('Paiement échoué. Veuillez réessayer.');
                });

                monetbilWidget.on('payment.cancelled', (data) => {
                    alert('Paiement annulé.');
                });

            } else {
                alert('Erreur lors de l\'initiation du paiement: ' + result.message);
            }
        } catch (error) {
            console.error('Erreur paiement:', error);
            alert('Erreur lors du traitement du paiement');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleLike = () => {
        if (isAnimating) return;
        
        if (currentProfile < profiles.length - 1) {
            setIsAnimating(true);
            setSwipeDirection('right');
            
            // Animation et passage au profil suivant
            setTimeout(() => {
                setCurrentProfile(prev => prev + 1);
                setSwipeDirection('');
                setIsAnimating(false);
                
                // Simulation d'un match (1 chance sur 3)
                if (Math.random() > 0.7) {
                    setTimeout(() => {
                        showMatchNotification(profiles[currentProfile].name);
                    }, 200);
                }
            }, 300);
        } else {
            alert("Plus de profils pour le moment ! Revenez plus tard 😊");
        }
    };

    const handlePass = () => {
        if (isAnimating) return;
        
        if (currentProfile < profiles.length - 1) {
            setIsAnimating(true);
            setSwipeDirection('left');
            
            setTimeout(() => {
                setCurrentProfile(prev => prev + 1);
                setSwipeDirection('');
                setIsAnimating(false);
            }, 300);
        } else {
            alert("Plus de profils pour le moment ! Revenez plus tard 😊");
        }
    };

    const handleSuperLike = () => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        setSwipeDirection('up');
        
        setTimeout(() => {
            alert(`💫 Super Like envoyé à ${profiles[currentProfile].name} !`);
            if (currentProfile < profiles.length - 1) {
                setCurrentProfile(prev => prev + 1);
            }
            setSwipeDirection('');
            setIsAnimating(false);
        }, 300);
    };

    const formatDistance = (distance) => {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        }
        return `${distance.toFixed(1)}km`;
    };

    const showMatchNotification = (name) => {
        // Créer une notification de match personnalisée
        const notification = document.createElement('div');
        notification.className = 'match-notification';
        notification.innerHTML = `
            <div class="match-content">
                <i class="fas fa-heart"></i>
                <h3>C'est un Match !</h3>
                <p>Vous et ${name} vous êtes likés mutuellement</p>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    // Gestion du drag pour mobile et desktop
    const handleDragStart = (e) => {
        if (isAnimating) return;
        
        setIsDragging(true);
        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        setDragStart({ x: clientX, y: clientY });
    };

    const handleDragMove = (e) => {
        if (!isDragging || isAnimating) return;
        
        e.preventDefault();
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;
        
        setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleDragEnd = () => {
        if (!isDragging || isAnimating) return;
        
        setIsDragging(false);
        
        const threshold = 100;
        const { x, y } = dragOffset;
        
        if (Math.abs(x) > threshold) {
            if (x > 0) {
                handleLike();
            } else {
                handlePass();
            }
        } else if (y < -threshold) {
            handleSuperLike();
        } else {
            // Retour à la position originale
            setDragOffset({ x: 0, y: 0 });
        }
    };

    // Ajouter les event listeners pour le drag
    useEffect(() => {
        if (cardRef.current) {
            const card = cardRef.current;
            
            // Mouse events
            const handleMouseMove = (e) => handleDragMove(e);
            const handleMouseUp = () => handleDragEnd();
            
            // Touch events
            const handleTouchMove = (e) => handleDragMove(e);
            const handleTouchEnd = () => handleDragEnd();
            
            if (isDragging) {
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
                document.addEventListener('touchend', handleTouchEnd);
            }
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, dragOffset, dragStart]);

    const currentUser = profiles[currentProfile];

    if (!currentUser) {
        return (
            <Container className="dating-container py-5">
                <div className="text-center">
                    <h2>Plus de profils disponibles</h2>
                    <p>Revenez plus tard pour découvrir de nouveaux étudiants !</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="dating-container py-4">
            {/* Header avec stats et actions */}
            <Row className="mb-4">
                <Col md={8}>
                    <div className="dating-header">
                        <h1 className="dating-title">
                            <i className="fas fa-heart text-danger me-2"></i>
                            CampusLove
                            <Badge bg="warning" className="ms-2 premium-badge">
                                <i className="fas fa-crown me-1"></i>
                                Premium
                            </Badge>
                        </h1>
                        <p className="dating-subtitle">
                            Trouvez l'amour sur votre campus ✨
                        </p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="dating-actions">
                        {isPremiumUser ? (
                            <>
                                <Button 
                                    variant="outline-primary" 
                                    onClick={() => setShowMatches(true)}
                                    className="me-2"
                                >
                                    <i className="fas fa-comments me-2"></i>
                                    Matches ({matches.length})
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => setShowFilters(true)}
                                    className="me-2"
                                >
                                    <i className="fas fa-filter me-2"></i>
                                    Filtres
                                </Button>
                                <Button 
                                    variant="gradient" 
                                    onClick={() => setShowProfileSetup(true)}
                                    className="premium-btn"
                                >
                                    <i className="fas fa-user-edit me-2"></i>
                                    Mon Profil
                                </Button>
                            </>
                        ) : (
                            <Button 
                                variant="warning" 
                                onClick={() => setShowPremiumModal(true)}
                                className="premium-unlock-btn"
                                size="lg"
                            >
                                <i className="fas fa-crown me-2"></i>
                                Débloquer Premium - 1000 FCFA
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Section premium ou contenu principal */}
            {!isPremiumUser ? (
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="premium-teaser-card shadow-lg">
                            <Card.Body className="text-center p-5">
                                <div className="premium-icon mb-4">
                                    <i className="fas fa-crown fa-4x text-warning"></i>
                                </div>
                                <h2 className="premium-title mb-3">
                                    Débloquez CampusLove Premium
                                </h2>
                                <p className="premium-description mb-4">
                                    Accédez à une expérience de rencontre exclusive avec des fonctionnalités avancées
                                </p>
                                
                                <Row className="premium-features mb-4">
                                    <Col md={6}>
                                        <div className="feature-item">
                                            <i className="fas fa-images text-primary me-3"></i>
                                            <span>Téléchargez jusqu'à 10 photos</span>
                                        </div>
                                        <div className="feature-item">
                                            <i className="fas fa-heart text-danger me-3"></i>
                                            <span>Likes illimités</span>
                                        </div>
                                        <div className="feature-item">
                                            <i className="fas fa-star text-warning me-3"></i>
                                            <span>5 Super Likes par jour</span>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="feature-item">
                                            <i className="fas fa-eye text-info me-3"></i>
                                            <span>Voir qui vous a liké</span>
                                        </div>
                                        <div className="feature-item">
                                            <i className="fas fa-filter text-success me-3"></i>
                                            <span>Filtres avancés</span>
                                        </div>
                                        <div className="feature-item">
                                            <i className="fas fa-bolt text-warning me-3"></i>
                                            <span>Profil mis en avant</span>
                                        </div>
                                    </Col>
                                </Row>
                                
                                <div className="premium-pricing mb-4">
                                    <div className="price-display">
                                        <span className="currency">FCFA</span>
                                        <span className="amount">1,000</span>
                                        <span className="period">/mois</span>
                                    </div>
                                    <small className="text-muted">Annulable à tout moment</small>
                                </div>
                                
                                <Button 
                                    variant="warning" 
                                    size="lg" 
                                    onClick={() => setShowPremiumModal(true)}
                                    className="premium-cta-btn"
                                >
                                    <i className="fas fa-crown me-2"></i>
                                    Devenir Premium Maintenant
                                </Button>
                                
                                <div className="premium-guarantee mt-3">
                                    <small className="text-muted">
                                        <i className="fas fa-shield-alt me-2"></i>
                                        Paiement sécurisé par Monetbil
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                    <div className="profile-card-container">
                        <Card 
                            ref={cardRef}
                            className={`profile-card shadow-lg ${
                                swipeDirection ? `swipe-${swipeDirection}` : ''
                            } ${isDragging ? 'dragging' : ''}`}
                            style={{
                                transform: isDragging 
                                    ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`
                                    : 'none',
                                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseDown={handleDragStart}
                            onTouchStart={handleDragStart}
                        >
                            {/* Photo principale */}
                            <div className="profile-image-container">
                                <img 
                                    src={currentUser.photos[0]} 
                                    alt={currentUser.name}
                                    className="profile-image"
                                />
                                <div className="profile-overlay">
                                    <div className="profile-info">
                                        <h3 className="profile-name">
                                            {currentUser.name}, {currentUser.age}
                                            {currentUser.online && (
                                                <span className="online-indicator">
                                                    <i className="fas fa-circle text-success"></i>
                                                </span>
                                            )}
                                        </h3>
                                        <p className="profile-university">
                                            <i className="fas fa-graduation-cap me-2"></i>
                                            {currentUser.university}
                                        </p>
                                        <p className="profile-faculty">
                                            <i className="fas fa-book me-2"></i>
                                            {currentUser.faculty} - {currentUser.year}
                                        </p>
                                        <p className="profile-distance">
                                            <i className="fas fa-map-marker-alt me-2"></i>
                                            À {formatDistance(currentUser.distance)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Card.Body>
                                {/* Bio */}
                                <div className="profile-bio mb-3">
                                    <p>{currentUser.bio}</p>
                                </div>

                                {/* Centres d'intérêt */}
                                <div className="profile-interests mb-3">
                                    <h6 className="mb-2">
                                        <i className="fas fa-star me-2"></i>
                                        Centres d'intérêt
                                    </h6>
                                    <div className="interests-tags">
                                        {currentUser.interests.map((interest, index) => (
                                            <Badge 
                                                key={index} 
                                                bg="light" 
                                                text="dark" 
                                                className="interest-tag me-1 mb-1"
                                            >
                                                {interest}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Photos supplémentaires */}
                                {currentUser.photos.length > 1 && (
                                    <div className="additional-photos">
                                        <h6 className="mb-2">
                                            <i className="fas fa-images me-2"></i>
                                            Plus de photos
                                        </h6>
                                        <div className="photos-grid">
                                            {currentUser.photos.slice(1).map((photo, index) => (
                                                <img 
                                                    key={index}
                                                    src={photo} 
                                                    alt={`${currentUser.name} ${index + 2}`}
                                                    className="additional-photo"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Boutons d'action */}
                        <div className="action-buttons">
                            <Button 
                                variant="outline-secondary" 
                                size="lg" 
                                className="action-btn pass-btn"
                                onClick={handlePass}
                                disabled={isAnimating}
                            >
                                <i className="fas fa-times"></i>
                            </Button>
                            
                            <Button 
                                variant="warning" 
                                size="lg" 
                                className="action-btn super-like-btn"
                                onClick={handleSuperLike}
                                disabled={isAnimating}
                            >
                                <i className="fas fa-star"></i>
                            </Button>
                            
                            <Button 
                                variant="danger" 
                                size="lg" 
                                className="action-btn like-btn"
                                onClick={handleLike}
                                disabled={isAnimating}
                            >
                                <i className="fas fa-heart"></i>
                            </Button>
                        </div>
                        
                        {/* Indicateurs de swipe */}
                        {isDragging && (
                            <>
                                <div className={`swipe-indicator like-indicator ${
                                    dragOffset.x > 50 ? 'visible' : ''
                                }`}>
                                    <i className="fas fa-heart"></i>
                                    <span>LIKE</span>
                                </div>
                                <div className={`swipe-indicator pass-indicator ${
                                    dragOffset.x < -50 ? 'visible' : ''
                                }`}>
                                    <i className="fas fa-times"></i>
                                    <span>PASS</span>
                                </div>
                                <div className={`swipe-indicator super-like-indicator ${
                                    dragOffset.y < -50 ? 'visible' : ''
                                }`}>
                                    <i className="fas fa-star"></i>
                                    <span>SUPER LIKE</span>
                                </div>
                            </>
                        )}
                    </div>
                </Col>

                {/* Sidebar avec conseils */}
                <Col md={6} lg={4}>
                    <Card className="tips-card mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <i className="fas fa-lightbulb me-2"></i>
                                Conseils pour réussir
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="tips-list">
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    Soyez authentique dans votre bio
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    Ajoutez plusieurs photos de qualité
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    Respectez toujours les autres
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    Rencontrez-vous en lieux publics
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className="stats-card">
                        <Card.Header>
                            <h5 className="mb-0">
                                <i className="fas fa-chart-bar me-2"></i>
                                Vos statistiques
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="stat-item">
                                <span className="stat-number">42</span>
                                <span className="stat-label">Profils vus</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">8</span>
                                <span className="stat-label">Likes donnés</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">3</span>
                                <span className="stat-label">Matches</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">1</span>
                                <span className="stat-label">Super Likes</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            )}

            {/* Modal des Matches */}
            <Modal show={showMatches} onHide={() => setShowMatches(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-heart text-danger me-2"></i>
                        Vos Matches
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {matches.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="fas fa-heart-broken fa-3x text-muted mb-3"></i>
                            <h5>Aucun match pour le moment</h5>
                            <p>Continuez à explorer pour trouver votre âme sœur !</p>
                        </div>
                    ) : (
                        <Row>
                            {matches.map(match => (
                                <Col md={6} key={match.id} className="mb-3">
                                    <Card className="match-card h-100">
                                        <Card.Body className="d-flex align-items-center">
                                            <div className="match-avatar me-3">
                                                <img 
                                                    src={match.photo} 
                                                    alt={match.name}
                                                    className="rounded-circle"
                                                    width="60"
                                                    height="60"
                                                />
                                                {match.online && (
                                                    <span className="online-dot"></span>
                                                )}
                                            </div>
                                            <div className="match-info flex-grow-1">
                                                <h6 className="mb-1">{match.name}</h6>
                                                <small className="text-muted">{match.university}</small>
                                                <p className="mb-0 text-truncate">
                                                    {match.lastMessage}
                                                </p>
                                            </div>
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => alert(`Conversation avec ${match.name}`)}
                                            >
                                                <i className="fas fa-comment"></i>
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Modal.Body>
            </Modal>

            {/* Modal des Filtres */}
            <Modal show={showFilters} onHide={() => setShowFilters(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-filter me-2"></i>
                        Filtres de recherche
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Âge minimum</Form.Label>
                                    <Form.Range
                                        min={18}
                                        max={35}
                                        value={filters.ageMin}
                                        onChange={(e) => setFilters({...filters, ageMin: e.target.value})}
                                    />
                                    <div className="text-center">{filters.ageMin} ans</div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Âge maximum</Form.Label>
                                    <Form.Range
                                        min={18}
                                        max={35}
                                        value={filters.ageMax}
                                        onChange={(e) => setFilters({...filters, ageMax: e.target.value})}
                                    />
                                    <div className="text-center">{filters.ageMax} ans</div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Université</Form.Label>
                            <Form.Select 
                                value={filters.university}
                                onChange={(e) => setFilters({...filters, university: e.target.value})}
                            >
                                <option value="">Toutes les universités</option>
                                <option value="uy1">Université de Yaoundé I</option>
                                <option value="uy2">Université de Yaoundé II</option>
                                <option value="ud">Université de Douala</option>
                                <option value="ub">Université de Buea</option>
                                <option value="ensp">ENSP Yaoundé</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Distance maximale</Form.Label>
                            <Form.Range
                                min={1}
                                max={100}
                                value={filters.distance}
                                onChange={(e) => setFilters({...filters, distance: e.target.value})}
                            />
                            <div className="text-center">{filters.distance} km</div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowFilters(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={() => setShowFilters(false)}>
                        Appliquer les filtres
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Modal Premium Subscription */}
            <Modal show={showPremiumModal} onHide={() => setShowPremiumModal(false)} size="lg" centered>
                <Modal.Header closeButton className="premium-modal-header">
                    <Modal.Title>
                        <i className="fas fa-crown text-warning me-2"></i>
                        Abonnement CampusLove Premium
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="premium-modal-body">
                    <div className="subscription-plan">
                        <div className="plan-header text-center mb-4">
                            <div className="plan-icon">
                                <i className="fas fa-crown fa-3x text-warning"></i>
                            </div>
                            <h3 className="plan-title">Premium Mensuel</h3>
                            <div className="plan-price">
                                <span className="price-amount">1,000</span>
                                <span className="price-currency">FCFA</span>
                                <span className="price-period">/mois</span>
                            </div>
                        </div>
                        
                        <div className="plan-features">
                            <h5 className="features-title">Fonctionnalités incluses :</h5>
                            <ul className="features-list">
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    <strong>Profil détaillé</strong> - Créez un profil complet avec bio personnalisée
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    <strong>10 photos maximum</strong> - Montrez votre personnalité
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    <strong>Likes illimités</strong> - Likez autant de profils que vous voulez
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    <strong>5 Super Likes/jour</strong> - Démarquez-vous des autres
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    <strong>Voir qui vous like</strong> - Découvrez vos admirateurs secrets
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    <strong>Filtres avancés</strong> - Trouvez exactement ce que vous cherchez
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    <strong>Profil mis en avant</strong> - Soyez vu 10x plus souvent
                                </li>
                                <li>
                                    <i className="fas fa-check text-success me-2"></i>
                                    <strong>Support prioritaire</strong> - Assistance dédiée
                                </li>
                            </ul>
                        </div>
                        
                        <div className="payment-info">
                            <Alert variant="info" className="mb-3">
                                <i className="fas fa-info-circle me-2"></i>
                                <strong>Paiement sécurisé</strong> via Monetbil (Mobile Money & Cartes)
                            </Alert>
                            
                            <Form className="mb-3">
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Numéro de téléphone</Form.Label>
                                            <Form.Control 
                                                type="tel" 
                                                placeholder="Ex: +237 6xx xxx xxx"
                                                value={paymentData.phone}
                                                onChange={(e) => setPaymentData({...paymentData, phone: e.target.value})}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                placeholder="votre@email.com"
                                                value={paymentData.email}
                                                onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                            
                            <div className="guarantee-badge">
                                <i className="fas fa-shield-alt text-primary me-2"></i>
                                <span>Garantie satisfait ou remboursé 7 jours</span>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="premium-modal-footer">
                    <Button variant="outline-secondary" onClick={() => setShowPremiumModal(false)}>
                        Peut-être plus tard
                    </Button>
                    <Button 
                        variant="warning" 
                        size="lg" 
                        onClick={handlePremiumPayment}
                        className="premium-subscribe-btn"
                        disabled={isProcessingPayment}
                    >
                        <i className={`fas ${isProcessingPayment ? 'fa-spinner fa-spin' : 'fa-crown'} me-2`}></i>
                        {isProcessingPayment ? 'Traitement...' : 'S\'abonner maintenant - 1,000 FCFA'}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Modal Setup Profile Premium */}
            <Modal show={showProfileSetup} onHide={() => setShowProfileSetup(false)} size="xl" centered>
                <Modal.Header closeButton className="profile-setup-header">
                    <Modal.Title>
                        <i className="fas fa-user-edit me-2"></i>
                        Configurez votre profil Premium
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="profile-setup-body">
                    <Row>
                        <Col md={4}>
                            <div className="photo-upload-section">
                                <h5 className="section-title">
                                    <i className="fas fa-images me-2"></i>
                                    Photos de profil
                                </h5>
                                <div className="photo-grid">
                                    {[...Array(10)].map((_, index) => (
                                        <div key={index} className="photo-slot">
                                            {datingProfile.photos[index] ? (
                                                <div className="photo-preview">
                                                    <img src={datingProfile.photos[index]} alt={`Photo ${index + 1}`} />
                                                    <button 
                                                        className="photo-remove-btn"
                                                        onClick={() => removePhoto(index)}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="photo-upload-placeholder">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={(e) => handlePhotoUpload(index, e)}
                                                        hidden
                                                    />
                                                    <i className="fas fa-plus"></i>
                                                    <span>Ajouter</span>
                                                </label>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <small className="text-muted">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Jusqu'à 10 photos. La première sera votre photo principale.
                                </small>
                            </div>
                        </Col>
                        <Col md={8}>
                            <div className="profile-form-section">
                                <h5 className="section-title">
                                    <i className="fas fa-user me-2"></i>
                                    Informations personnelles
                                </h5>
                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Que recherchez-vous ?</Form.Label>
                                                <Form.Select 
                                                    value={datingProfile.lookingFor}
                                                    onChange={(e) => setDatingProfile({...datingProfile, lookingFor: e.target.value})}
                                                >
                                                    <option value="">Sélectionnez...</option>
                                                    <option value="relationship">Relation sérieuse</option>
                                                    <option value="casual">Relation décontractée</option>
                                                    <option value="friendship">Amitié</option>
                                                    <option value="networking">Networking</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Taille</Form.Label>
                                                <Form.Select 
                                                    value={datingProfile.height}
                                                    onChange={(e) => setDatingProfile({...datingProfile, height: e.target.value})}
                                                >
                                                    <option value="">Sélectionnez...</option>
                                                    <option value="150-160">150-160 cm</option>
                                                    <option value="160-170">160-170 cm</option>
                                                    <option value="170-180">170-180 cm</option>
                                                    <option value="180-190">180-190 cm</option>
                                                    <option value="190+">190+ cm</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Bio personnalisée</Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={4}
                                            placeholder="Parlez-nous de vous, vos passions, ce que vous cherchez..."
                                            value={datingProfile.bio}
                                            onChange={(e) => setDatingProfile({...datingProfile, bio: e.target.value})}
                                            maxLength={500}
                                        />
                                        <small className="text-muted">
                                            {datingProfile.bio.length}/500 caractères
                                        </small>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Style de vie</Form.Label>
                                        <Form.Select 
                                            value={datingProfile.lifestyle}
                                            onChange={(e) => setDatingProfile({...datingProfile, lifestyle: e.target.value})}
                                        >
                                            <option value="">Sélectionnez...</option>
                                            <option value="active">Actif/Sportif</option>
                                            <option value="social">Social/Sortant</option>
                                            <option value="studious">Studieux/Calme</option>
                                            <option value="creative">Créatif/Artistique</option>
                                            <option value="adventurous">Aventureux</option>
                                        </Form.Select>
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-3">
                                        <Form.Label>Centres d'intérêt</Form.Label>
                                        <div className="interests-selector">
                                            {['Sport', 'Musique', 'Art', 'Voyage', 'Cuisine', 'Technologie', 'Lecture', 'Cinéma', 'Danse', 'Nature', 'Gaming', 'Mode'].map(interest => (
                                                <Button
                                                    key={interest}
                                                    variant={datingProfile.interests.includes(interest) ? 'primary' : 'outline-secondary'}
                                                    size="sm"
                                                    className="me-2 mb-2"
                                                    onClick={() => {
                                                        const newInterests = datingProfile.interests.includes(interest)
                                                            ? datingProfile.interests.filter(i => i !== interest)
                                                            : [...datingProfile.interests, interest];
                                                        setDatingProfile({...datingProfile, interests: newInterests});
                                                    }}
                                                >
                                                    {interest}
                                                </Button>
                                            ))}
                                        </div>
                                    </Form.Group>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="profile-setup-footer">
                    <Button variant="outline-secondary" onClick={() => setShowProfileSetup(false)}>
                        Sauvegarder pour plus tard
                    </Button>
                    <Button 
                        variant="success" 
                        size="lg" 
                        onClick={() => {
                            setShowProfileSetup(false);
                            alert('Profil sauvegardé avec succès!');
                        }}
                        className="complete-profile-btn"
                    >
                        <i className="fas fa-check me-2"></i>
                        Terminer mon profil
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Dating;