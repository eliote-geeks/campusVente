import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs, Modal, Form } from 'react-bootstrap';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [studentAnnouncements, setStudentAnnouncements] = useState([]);
    const [studentReviews, setStudentReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('announcements');

    // Données simulées des étudiants
    const studentsData = {
        1: {
            id: 1,
            name: 'Marie Dubois',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop&crop=face',
            coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=300&fit=crop',
            university: 'Sorbonne Université',
            level: 'Master 2',
            field: 'Informatique',
            bio: 'Étudiante en Master 2 Intelligence Artificielle. Passionnée par le machine learning et les nouvelles technologies. J\'aime partager mes connaissances et aider les autres étudiants.',
            skills: ['Python', 'Machine Learning', 'React', 'Node.js', 'TensorFlow', 'Docker'],
            interests: ['Tech', 'IA', 'Startups', 'Recherche', 'Innovation'],
            location: 'Paris 5ème',
            phone: '+33612345678',
            email: 'marie.dubois@sorbonne-universite.fr',
            rating: 4.9,
            posts: 12,
            followers: 245,
            following: 89,
            verified: true,
            online: true,
            joinedDate: '2023-09-15',
            socialLinks: {
                linkedin: 'https://linkedin.com/in/marie-dubois',
                github: 'https://github.com/marie-dubois',
                instagram: '@marie.dubois'
            }
        },
        2: {
            id: 2,
            name: 'Pierre Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            coverImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=300&fit=crop',
            university: 'École Polytechnique',
            level: 'Master 1',
            field: 'Ingénierie',
            bio: 'Futur ingénieur en génie civil. Intéressé par l\'architecture durable et les projets innovants. Amateur de photographie et de voyages.',
            skills: ['AutoCAD', 'Revit', 'Gestion de projet', 'BIM', 'Matlab', 'SolidWorks'],
            interests: ['Architecture', 'Environnement', 'Innovation', 'Photographie', 'Voyage'],
            location: 'Palaiseau',
            phone: '+33698765432',
            email: 'pierre.martin@polytechnique.edu',
            rating: 4.7,
            posts: 8,
            followers: 156,
            following: 123,
            verified: true,
            online: false,
            joinedDate: '2023-08-20',
            socialLinks: {
                linkedin: 'https://linkedin.com/in/pierre-martin',
                instagram: '@pierre.martin.photo'
            }
        }
    };

    // Annonces par étudiant
    const announcementsData = {
        1: [
            {
                id: 1,
                title: 'MacBook Pro M2 comme neuf',
                description: 'MacBook Pro 13" M2 256GB, acheté il y a 6 mois. Parfait pour le développement et l\'IA. Encore sous garantie Apple.',
                price: 1850,
                category: 'Électronique',
                images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop'],
                createdAt: '2024-01-15T10:00:00Z',
                views: 89,
                likes: 23,
                status: 'active'
            },
            {
                id: 2,
                title: 'Cours particuliers Python/ML',
                description: 'Propose cours particuliers en Python et Machine Learning. Niveau débutant à intermédiaire. Première séance gratuite.',
                price: 35,
                category: 'Services',
                images: ['https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop'],
                createdAt: '2024-01-12T14:30:00Z',
                views: 156,
                likes: 45,
                status: 'active'
            },
            {
                id: 3,
                title: 'Livre "Hands-On ML" 2ème édition',
                description: 'Livre "Hands-On Machine Learning" d\'Aurélien Géron, 2ème édition. Excellent état avec quelques annotations utiles.',
                price: 45,
                category: 'Livres',
                images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'],
                createdAt: '2024-01-10T16:45:00Z',
                views: 67,
                likes: 12,
                status: 'sold'
            }
        ],
        2: [
            {
                id: 4,
                title: 'Appareil photo Canon EOS',
                description: 'Canon EOS 90D avec objectif 18-55mm. Parfait pour débuter en photographie. Vendu avec trépied et sac de transport.',
                price: 750,
                category: 'Électronique',
                images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop'],
                createdAt: '2024-01-14T11:20:00Z',
                views: 134,
                likes: 28,
                status: 'active'
            },
            {
                id: 5,
                title: 'Colocation Palaiseau',
                description: 'Chambre dans maison proche de l\'X. Jardin, parking, internet fibre. Ambiance studieuse et conviviale.',
                price: 580,
                category: 'Logement',
                images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
                createdAt: '2024-01-08T09:15:00Z',
                views: 78,
                likes: 19,
                status: 'active'
            }
        ]
    };

    // Avis par étudiant
    const reviewsData = {
        1: [
            {
                id: 1,
                author: {
                    name: 'Sophie Leroy',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
                    university: 'Sciences Po Paris'
                },
                rating: 5,
                comment: 'Excellente aide pour mon projet de machine learning ! Marie est très compétente et pédagogue. Je recommande vivement ses cours.',
                date: '2024-01-10T14:30:00Z',
                helpful: 12
            },
            {
                id: 2,
                author: {
                    name: 'Thomas Garnier',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
                    university: 'Université Lyon 1'
                },
                rating: 5,
                comment: 'MacBook reçu en parfait état, exactement comme décrit. Transaction rapide et professionnelle !',
                date: '2024-01-08T11:15:00Z',
                helpful: 8
            },
            {
                id: 3,
                author: {
                    name: 'Emma Laurent',
                    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face',
                    university: 'INSA Lyon'
                },
                rating: 4,
                comment: 'Très bonne communication, produit conforme. Petit bémol sur les délais de livraison mais sinon parfait.',
                date: '2024-01-05T16:45:00Z',
                helpful: 5
            }
        ],
        2: [
            {
                id: 4,
                author: {
                    name: 'Lucas Moreau',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
                    university: 'Université de Paris'
                },
                rating: 5,
                comment: 'Colocation parfaite ! Pierre est un colocataire respectueux et l\'ambiance est super. Recommandé !',
                date: '2024-01-12T09:20:00Z',
                helpful: 15
            },
            {
                id: 5,
                author: {
                    name: 'Marie Dubois',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face',
                    university: 'Sorbonne Université'
                },
                rating: 4,
                comment: 'Appareil photo de qualité, bien entretenu. Pierre connaît bien son matériel et donne de bons conseils.',
                date: '2024-01-07T13:10:00Z',
                helpful: 7
            }
        ]
    };


    useEffect(() => {
        const studentData = studentsData[parseInt(id)];
        const announcements = announcementsData[parseInt(id)] || [];
        const reviews = reviewsData[parseInt(id)] || [];
        
        if (studentData) {
            setStudent(studentData);
            setStudentAnnouncements(announcements);
            setStudentReviews(reviews);
        }
        setLoading(false);
    }, [id]);

    const handleWhatsAppContact = () => {
        const message = encodeURIComponent(`Salut ${student.name}! Je viens de voir ton profil sur CampusVente et j'aimerais te contacter. 👋`);
        window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    const handleWhatsAppReview = () => {
        const message = encodeURIComponent(`Salut ${student.name}! J'aimerais te laisser un commentaire sur ton profil CampusVente. 😊`);
        window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
    };



    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < rating ? '#ffc107' : '#e9ecef' }}>
                ⭐
            </span>
        ));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Électronique': return '📱';
            case 'Services': return '🛠️';
            case 'Livres': return '📚';
            case 'Logement': return '🏠';
            case 'Transport': return '🚗';
            default: return '📦';
        }
    };

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="text-muted mt-3">Chargement du profil...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="content-with-navbar">
                <div className="text-center py-5">
                    <h4>Profil introuvable</h4>
                    <p className="text-muted">Cet étudiant n'existe pas ou le profil n'est plus disponible.</p>
                    <Button onClick={() => navigate('/students')} className="btn-modern btn-gradient">
                        ← Retour aux étudiants
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="content-with-navbar">
            <div className="px-3">
                {/* Header avec image de couverture */}
                <div className="position-relative mb-4">
                    <div 
                        className="rounded"
                        style={{
                            height: '250px',
                            background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(${student.coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="position-absolute top-0 start-0 m-3">
                            <Button 
                                size="sm" 
                                variant="light" 
                                className="btn-modern"
                                onClick={() => navigate('/students')}
                            >
                                ← Retour
                            </Button>
                        </div>
                    </div>
                    
                    {/* Photo de profil */}
                    <div className="position-absolute" style={{ bottom: '-60px', left: '30px' }}>
                        <div className="position-relative">
                            <img 
                                src={student.avatar} 
                                alt={student.name}
                                className="rounded-circle border border-4 border-white"
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                            {student.online && (
                                <span 
                                    className="position-absolute bottom-0 end-0 badge bg-success rounded-pill"
                                    style={{ width: '20px', height: '20px' }}
                                >
                                    <span className="visually-hidden">En ligne</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Informations du profil */}
                <div className="row">
                    <div className="col-lg-4">
                        <Card className="card-modern mb-4">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h4 className="fw-bold mb-0">{student.name}</h4>
                                    {student.verified && (
                                        <Badge bg="primary" className="d-flex align-items-center">
                                            <span className="me-1">✓</span>
                                            Vérifié
                                        </Badge>
                                    )}
                                </div>
                                
                                <div className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="student-badge me-2">{student.level}</span>
                                        <span className="badge bg-light text-dark">{student.field}</span>
                                    </div>
                                    <p className="text-muted mb-2">🎓 {student.university}</p>
                                    <p className="text-muted mb-0">📍 {student.location}</p>
                                </div>

                                <p className="text-muted mb-3" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                    {student.bio}
                                </p>

                                <div className="d-flex justify-content-between text-center mb-3">
                                    <div>
                                        <div className="fw-bold">{student.posts}</div>
                                        <small className="text-muted">Annonces</small>
                                    </div>
                                    <div>
                                        <div className="fw-bold">{student.followers}</div>
                                        <small className="text-muted">Followers</small>
                                    </div>
                                    <div>
                                        <div className="fw-bold">⭐ {student.rating}</div>
                                        <small className="text-muted">Rating</small>
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    <Button 
                                        className="btn-modern"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                            border: 'none',
                                            color: 'white'
                                        }}
                                        onClick={handleWhatsAppContact}
                                    >
                                        💬 Contacter sur WhatsApp
                                    </Button>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <Button 
                                                variant={isFollowing ? "success" : "outline-primary"}
                                                className="btn-modern w-100"
                                                size="sm"
                                                onClick={handleFollow}
                                            >
                                                {isFollowing ? '✓ Suivi' : '👤 Suivre'}
                                            </Button>
                                        </div>
                                        <div className="col-6">
                                            <Button 
                                                variant="outline-success"
                                                className="btn-modern w-100"
                                                size="sm"
                                                onClick={handleWhatsAppReview}
                                            >
                                                ⭐ Avis
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Compétences */}
                        <Card className="card-modern mb-4">
                            <Card.Body className="p-3">
                                <h6 className="fw-bold mb-3">💡 Compétences</h6>
                                <div className="d-flex flex-wrap gap-1">
                                    {student.skills.map((skill, index) => (
                                        <span key={index} className="badge bg-light text-dark">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Centres d'intérêt */}
                        <Card className="card-modern mb-4">
                            <Card.Body className="p-3">
                                <h6 className="fw-bold mb-3">❤️ Centres d'intérêt</h6>
                                <div className="d-flex flex-wrap gap-1">
                                    {student.interests.map((interest, index) => (
                                        <span key={index} className="badge bg-light text-dark">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Informations supplémentaires */}
                        <Card className="card-modern">
                            <Card.Body className="p-3">
                                <h6 className="fw-bold mb-3">ℹ️ Informations</h6>
                                <div className="d-flex flex-column gap-2">
                                    <small className="text-muted">
                                        📅 Membre depuis {formatDate(student.joinedDate)}
                                    </small>
                                    <small className="text-muted">
                                        📧 {student.email}
                                    </small>
                                    {student.socialLinks && (
                                        <div className="d-flex gap-2 mt-2">
                                            {student.socialLinks.linkedin && (
                                                <Button size="sm" variant="outline-primary" href={student.socialLinks.linkedin} target="_blank">
                                                    LinkedIn
                                                </Button>
                                            )}
                                            {student.socialLinks.github && (
                                                <Button size="sm" variant="outline-dark" href={student.socialLinks.github} target="_blank">
                                                    GitHub
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Contenu principal */}
                    <div className="col-lg-8">
                        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
                            <Tab eventKey="announcements" title={`📢 Annonces (${studentAnnouncements.length})`}>
                                <div className="row g-3">
                                    {studentAnnouncements.map(announcement => (
                                        <div key={announcement.id} className="col-md-6">
                                            <div className="social-post h-100">
                                                {announcement.images && announcement.images.length > 0 && (
                                                    <div className="position-relative">
                                                        <img 
                                                            src={announcement.images[0]}
                                                            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                                                            alt={announcement.title}
                                                        />
                                                        {announcement.status === 'sold' && (
                                                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                                 style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '12px 12px 0 0' }}>
                                                                <span className="badge bg-danger fs-6">✅ VENDU</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <div className="p-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span className="badge bg-light text-dark">
                                                            {getCategoryIcon(announcement.category)} {announcement.category}
                                                        </span>
                                                        <small className="text-muted">
                                                            {formatDate(announcement.createdAt)}
                                                        </small>
                                                    </div>
                                                    
                                                    <h6 className="fw-bold mb-2">{announcement.title}</h6>
                                                    <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
                                                        {announcement.description}
                                                    </p>
                                                    
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="fw-bold" style={{ color: 'var(--primary-gradient)', fontSize: '18px' }}>
                                                                {announcement.price}€
                                                            </span>
                                                            <div>
                                                                <small className="text-muted">
                                                                    👁️ {announcement.views} • ❤️ {announcement.likes}
                                                                </small>
                                                            </div>
                                                        </div>
                                                        {announcement.status === 'active' && (
                                                            <Button 
                                                                size="sm"
                                                                className="btn-modern btn-gradient"
                                                                onClick={handleWhatsAppContact}
                                                            >
                                                                💬 Contacter
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {studentAnnouncements.length === 0 && (
                                    <div className="text-center py-5">
                                        <h6 className="text-muted">Aucune annonce pour le moment</h6>
                                        <p className="text-muted">Cet étudiant n'a pas encore publié d'annonces.</p>
                                    </div>
                                )}
                            </Tab>
                            
                            <Tab eventKey="reviews" title={`⭐ Avis (${studentReviews.length})`}>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0">Avis et commentaires</h5>
                                    <Button 
                                        size="sm" 
                                        className="btn-modern btn-gradient"
                                        onClick={handleWhatsAppReview}
                                    >
                                        ✏️ Laisser un avis
                                    </Button>
                                </div>

                                {studentReviews.map(review => (
                                    <div key={review.id} className="social-post mb-3">
                                        <div className="p-3">
                                            <div className="d-flex align-items-start">
                                                <img 
                                                    src={review.author.avatar} 
                                                    alt={review.author.name}
                                                    className="profile-avatar me-3"
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <h6 className="fw-bold mb-0">{review.author.name}</h6>
                                                            <small className="text-muted">{review.author.university}</small>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="mb-1">{renderStars(review.rating)}</div>
                                                            <small className="text-muted">{formatDate(review.date)}</small>
                                                        </div>
                                                    </div>
                                                    <p className="mb-2">{review.comment}</p>
                                                    <div className="d-flex align-items-center">
                                                        <Button size="sm" variant="outline-secondary" className="me-2">
                                                            👍 Utile ({review.helpful})
                                                        </Button>
                                                        <Button size="sm" variant="outline-secondary">
                                                            💬 Répondre
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {studentReviews.length === 0 && (
                                    <div className="text-center py-5">
                                        <h6 className="text-muted">Aucun avis pour le moment</h6>
                                        <p className="text-muted">Soyez le premier à laisser un avis sur ce profil !</p>
                                        <Button 
                                            className="btn-modern btn-gradient"
                                            onClick={handleWhatsAppReview}
                                        >
                                            ✏️ Laisser le premier avis
                                        </Button>
                                    </div>
                                )}
                            </Tab>

                        </Tabs>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default StudentProfile;