import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { createApiUrl } from '../config/api';
import Avatar from '../components/Avatar.jsx';

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUniversity, setFilterUniversity] = useState('all');
    const [filterField, setFilterField] = useState('all');
    const [sortBy, setSortBy] = useState('recommendation');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [studentToRate, setStudentToRate] = useState(null);
    const [ratingData, setRatingData] = useState({ rating: 5, comment: '', transaction_type: 'general' });
    const [featuredStudents, setFeaturedStudents] = useState([]);

    // Fetch students from API
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await fetch(createApiUrl('/users?is_student=true'));
            const data = await response.json();
            
            if (data.success) {
                // Transform API data to match component expectations
                const transformedStudents = data.data.map(user => ({
                    id: user.id,
                    firstName: user.name.split(' ')[0] || user.name,
                    lastName: user.name.split(' ').slice(1).join(' ') || '',
                    email: user.email,
                    phone: user.phone || '+33000000000',
                    university: user.university || 'Université non spécifiée',
                    studyLevel: user.study_level || 'Non spécifié',
                    field: user.field || 'Non spécifié',
                    bio: user.bio || 'Aucune biographie disponible.',
                    avatar: user.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
                    rating: user.rating || 0,
                    totalRatings: user.total_ratings || 0,
                    recommendationScore: user.recommendation_score || 0,
                    responseTime: '2h', // Default response time
                    joinedAt: user.created_at,
                    isVerified: user.verified || false,
                    announcements: user.featured_announcements || [], // Articles phares
                    announcementsCount: user.announcements_count || 0
                }));
                
                setStudents(transformedStudents);
                setFilteredStudents(transformedStudents);
            } else {
                console.error('Failed to fetch students:', data.message);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch featured students (recommended)
    const fetchFeaturedStudents = async () => {
        try {
            const response = await fetch(createApiUrl('/users/recommended?limit=6'));
            const data = await response.json();
            
            if (data.success) {
                setFeaturedStudents(data.data);
            }
        } catch (error) {
            console.error('Error fetching featured students:', error);
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchFeaturedStudents();
    }, []);

    useEffect(() => {
        let filtered = students;

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(student => 
                student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.field.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par université
        if (filterUniversity !== 'all') {
            filtered = filtered.filter(student => student.university === filterUniversity);
        }

        // Filtre par domaine
        if (filterField !== 'all') {
            filtered = filtered.filter(student => student.field === filterField);
        }

        // Tri
        switch (sortBy) {
            case 'name':
                filtered.sort((a, b) => a.firstName.localeCompare(b.firstName));
                break;
            case 'university':
                filtered.sort((a, b) => a.university.localeCompare(b.university));
                break;
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'announcements':
                filtered.sort((a, b) => b.announcementsCount - a.announcementsCount);
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
                break;
            case 'recommendation':
                filtered.sort((a, b) => b.recommendationScore - a.recommendationScore);
                break;
        }

        setFilteredStudents(filtered);
    }, [searchTerm, filterUniversity, filterField, sortBy, students]);

    const handleWhatsAppContact = (student) => {
        const message = encodeURIComponent(`Salut ${student.firstName}! Je viens de voir ton profil sur CampusVente et j'aimerais te contacter. 👋`);
        window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    const handleRateStudent = (student) => {
        setStudentToRate(student);
        setShowRatingModal(true);
    };

    const submitRating = async () => {
        try {
            const response = await fetch(createApiUrl(`/users/${studentToRate.id}/rate`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(ratingData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Mettre à jour la note de l'étudiant localement
                setStudents(prev => 
                    prev.map(student => 
                        student.id === studentToRate.id 
                            ? { ...student, rating: data.data.new_average, totalRatings: data.data.total_ratings }
                            : student
                    )
                );
                
                setShowRatingModal(false);
                setRatingData({ rating: 5, comment: '', transaction_type: 'general' });
                alert('Note ajoutée avec succès !');
            } else {
                alert('Erreur : ' + data.message);
            }
        } catch (error) {
            console.error('Erreur lors de la notation:', error);
            alert('Erreur lors de l\'ajout de la note');
        }
    };

    const getUniqueUniversities = () => {
        const universities = students.map(student => student.university);
        return [...new Set(universities)];
    };

    const getUniqueFields = () => {
        const fields = students.map(student => student.field);
        return [...new Set(fields)];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return date.toLocaleDateString('fr-FR');
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'sell': return '💰';
            case 'housing': return '🏠';
            case 'service': return '🛠️';
            case 'event': return '🎉';
            default: return '📢';
        }
    };

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="text-muted mt-3">Chargement des étudiants...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-with-navbar">
            <Container className="py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-1">👥 Étudiants Campus</h2>
                                <p className="text-muted mb-0">
                                    {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''} trouvé{filteredStudents.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button as={Link} to="/announcements" className="btn-modern btn-gradient">
                                    📢 Voir les annonces
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Filtres et recherche */}
                <Row className="mb-4">
                    <Col md={3}>
                        <InputGroup>
                            <InputGroup.Text>🔍</InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Rechercher un étudiant..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <Form.Select value={filterUniversity} onChange={(e) => setFilterUniversity(e.target.value)}>
                            <option value="all">Toutes les universités</option>
                            {getUniqueUniversities().map(uni => (
                                <option key={uni} value={uni}>{uni}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <Form.Select value={filterField} onChange={(e) => setFilterField(e.target.value)}>
                            <option value="all">Tous les domaines</option>
                            {getUniqueFields().map(field => (
                                <option key={field} value={field}>{field}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={2}>
                        <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="recommendation">Recommandés</option>
                            <option value="rating">Note</option>
                            <option value="name">Nom</option>
                            <option value="university">Université</option>
                            <option value="announcements">Nb. annonces</option>
                            <option value="newest">Plus récents</option>
                        </Form.Select>
                    </Col>
                </Row>

                {/* Section étudiants recommandés */}
                {featuredStudents.length > 0 && (
                    <>
                        <Row className="mb-4">
                            <Col>
                                <h4 className="fw-bold text-primary mb-3">⭐ Étudiants Recommandés</h4>
                                <Row className="g-3">
                                    {featuredStudents.slice(0, 3).map(student => (
                                        <Col key={student.id} md={4}>
                                            <Card className="card-modern border-primary">
                                                <Card.Body className="text-center p-3">
                                                    <Avatar
                                                        src={student.avatar}
                                                        name={student.name}
                                                        size={50}
                                                        className="mb-2"
                                                    />
                                                    <h6 className="fw-bold mb-1">{student.name}</h6>
                                                    <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                                                        <span className="text-warning fw-bold">{parseFloat(student.rating || 0).toFixed(1)}⭐</span>
                                                        <small className="text-muted">({student.total_ratings || 0} avis)</small>
                                                    </div>
                                                    <small className="text-muted">{student.university || 'Université'}</small>
                                                    <div className="mt-2">
                                                        <Button size="sm" variant="outline-primary" 
                                                                onClick={() => setSelectedStudent({
                                                                    ...student,
                                                                    firstName: student.name.split(' ')[0],
                                                                    lastName: student.name.split(' ').slice(1).join(' '),
                                                                    announcements: student.featured_announcements || []
                                                                })}>
                                                            Voir profil
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Col>
                        </Row>
                        <hr className="my-4" />
                    </>
                )}

                {/* Grille des étudiants */}
                {filteredStudents.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-muted mb-3">Aucun étudiant trouvé</h4>
                        <p className="text-muted">Modifiez vos filtres de recherche</p>
                    </div>
                ) : (
                    <Row className="g-4">
                        {filteredStudents.map(student => (
                            <Col key={student.id} md={6} lg={4}>
                                <Card className="card-modern h-100">
                                    <Card.Body className="p-4">
                                        {/* Profil étudiant */}
                                        <div className="text-center mb-3">
                                            <Avatar
                                                src={student.avatar}
                                                name={`${student.firstName} ${student.lastName}`}
                                                size={80}
                                                className="mb-3"
                                            />
                                            <h5 className="fw-bold mb-1">
                                                {student.firstName} {student.lastName}
                                                {student.isVerified && (
                                                    <Badge bg="success" className="ms-2" style={{ fontSize: '10px' }}>
                                                        ✓ Vérifié
                                                    </Badge>
                                                )}
                                            </h5>
                                            <p className="text-muted mb-1">{student.studyLevel}</p>
                                            <p className="text-primary fw-semibold mb-1">{student.field}</p>
                                            <small className="text-muted">{student.university}</small>
                                        </div>

                                        {/* Bio */}
                                        <p className="text-muted mb-3" style={{ 
                                            fontSize: '13px', 
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {student.bio}
                                        </p>

                                        {/* Statistiques */}
                                        <div className="d-flex justify-content-between align-items-center mb-3 text-center">
                                            <div>
                                                <div className="fw-bold text-warning">{parseFloat(student.rating).toFixed(1)}⭐</div>
                                                <small className="text-muted">Note ({student.totalRatings})</small>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-primary">{student.announcementsCount}</div>
                                                <small className="text-muted">Annonces</small>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-info">{student.recommendationScore}</div>
                                                <small className="text-muted">Score</small>
                                            </div>
                                        </div>

                                        {/* Dernières annonces */}
                                        {student.announcements.length > 0 && (
                                            <div className="mb-3">
                                                <h6 className="fw-bold mb-2">Dernières annonces</h6>
                                                <div className="d-flex gap-2">
                                                    {student.announcements.slice(0, 2).map(announcement => (
                                                        <div key={announcement.id} className="flex-fill">
                                                            <Card className="border-0 bg-light">
                                                                <div className="position-relative">
                                                                    <img 
                                                                        src={announcement.image} 
                                                                        alt={announcement.title}
                                                                        className="card-img-top"
                                                                        style={{ height: '80px', objectFit: 'cover' }}
                                                                    />
                                                                    <div className="position-absolute top-0 start-0 m-1">
                                                                        <Badge bg="primary" style={{ fontSize: '8px' }}>
                                                                            {getTypeIcon(announcement.type)}
                                                                        </Badge>
                                                                    </div>
                                                                    {announcement.price > 0 && (
                                                                        <div className="position-absolute bottom-0 end-0 m-1">
                                                                            <Badge bg="success" style={{ fontSize: '8px' }}>
                                                                                {announcement.price.toLocaleString('fr-FR')} FCFA
                                                                            </Badge>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="p-2">
                                                                    <small className="fw-bold d-block" style={{ 
                                                                        fontSize: '11px',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 1,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        {announcement.title}
                                                                    </small>
                                                                    <small className="text-muted" style={{ fontSize: '10px' }}>
                                                                        {formatDate(announcement.createdAt)}
                                                                    </small>
                                                                </div>
                                                            </Card>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="d-flex gap-1 mb-2">
                                            <Button 
                                                size="sm" 
                                                className="btn-modern flex-fill"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontSize: '11px'
                                                }}
                                                onClick={() => handleWhatsAppContact(student)}
                                            >
                                                💬 Contacter
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline-primary"
                                                className="btn-modern flex-fill"
                                                style={{ fontSize: '11px' }}
                                                onClick={() => setSelectedStudent(student)}
                                            >
                                                👁️ Profil
                                            </Button>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="outline-warning"
                                            className="btn-modern w-100"
                                            style={{ fontSize: '11px' }}
                                            onClick={() => handleRateStudent(student)}
                                        >
                                            ⭐ Noter cet étudiant
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Modal profil détaillé */}
                {selectedStudent && (
                    <Modal show={!!selectedStudent} onHide={() => setSelectedStudent(null)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Profil de {selectedStudent.firstName} {selectedStudent.lastName}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={4} className="text-center">
                                    <Avatar
                                        src={selectedStudent.avatar}
                                        name={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                                        size={120}
                                        className="mb-3"
                                    />
                                    <h4 className="fw-bold">
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                        {selectedStudent.isVerified && (
                                            <Badge bg="success" className="ms-2">✓ Vérifié</Badge>
                                        )}
                                    </h4>
                                    <p className="text-muted">{selectedStudent.studyLevel}</p>
                                    <p className="text-primary fw-semibold">{selectedStudent.field}</p>
                                    <p className="text-muted">{selectedStudent.university}</p>
                                    
                                    <div className="d-flex justify-content-center gap-3 mb-3">
                                        <div className="text-center">
                                            <div className="fw-bold text-warning">{selectedStudent.rating}⭐</div>
                                            <small className="text-muted">Note</small>
                                        </div>
                                        <div className="text-center">
                                            <div className="fw-bold text-primary">{selectedStudent.announcements.length}</div>
                                            <small className="text-muted">Annonces</small>
                                        </div>
                                        <div className="text-center">
                                            <div className="fw-bold text-success">{selectedStudent.responseTime}</div>
                                            <small className="text-muted">Répond en</small>
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={8}>
                                    <h5>À propos</h5>
                                    <p className="mb-4">{selectedStudent.bio}</p>
                                    
                                    <h5>Ses annonces ({selectedStudent.announcements.length})</h5>
                                    {selectedStudent.announcements.length === 0 ? (
                                        <p className="text-muted">Aucune annonce publiée</p>
                                    ) : (
                                        <Row className="g-3">
                                            {selectedStudent.announcements.map(announcement => (
                                                <Col key={announcement.id} md={6}>
                                                    <Card className="border-0 bg-light">
                                                        <div className="position-relative">
                                                            <img 
                                                                src={announcement.image} 
                                                                alt={announcement.title}
                                                                className="card-img-top"
                                                                style={{ height: '120px', objectFit: 'cover' }}
                                                            />
                                                            <div className="position-absolute top-0 start-0 m-2">
                                                                <Badge bg="primary">
                                                                    {getTypeIcon(announcement.type)} {announcement.category}
                                                                </Badge>
                                                            </div>
                                                            {announcement.price > 0 && (
                                                                <div className="position-absolute bottom-0 end-0 m-2">
                                                                    <Badge bg="success">
                                                                        {announcement.price.toLocaleString('fr-FR')} FCFA
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Card.Body className="p-3">
                                                            <h6 className="fw-bold mb-1">{announcement.title}</h6>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <small className="text-muted">
                                                                    👁️ {announcement.views} • 💚 {announcement.likes}
                                                                </small>
                                                                <small className="text-muted">
                                                                    {formatDate(announcement.createdAt)}
                                                                </small>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button 
                                className="btn-modern"
                                style={{ 
                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                    border: 'none',
                                    color: 'white'
                                }}
                                onClick={() => handleWhatsAppContact(selectedStudent)}
                            >
                                💬 Contacter via WhatsApp
                            </Button>
                            <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                                Fermer
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}

                {/* Modal de notation */}
                {showRatingModal && studentToRate && (
                    <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Noter {studentToRate.firstName} {studentToRate.lastName}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Note (1 à 5 étoiles)</Form.Label>
                                    <div className="d-flex gap-2 align-items-center">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Button
                                                key={star}
                                                variant={star <= ratingData.rating ? "warning" : "outline-warning"}
                                                size="sm"
                                                onClick={() => setRatingData({...ratingData, rating: star})}
                                            >
                                                ⭐
                                            </Button>
                                        ))}
                                        <span className="ms-2">{ratingData.rating}/5</span>
                                    </div>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Type de transaction</Form.Label>
                                    <Form.Select 
                                        value={ratingData.transaction_type} 
                                        onChange={(e) => setRatingData({...ratingData, transaction_type: e.target.value})}
                                    >
                                        <option value="general">Évaluation générale</option>
                                        <option value="announcement">Annonce/Achat</option>
                                        <option value="service">Service rendu</option>
                                    </Form.Select>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Commentaire (optionnel)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Partagez votre expérience avec cet étudiant..."
                                        value={ratingData.comment}
                                        onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                                        maxLength={500}
                                    />
                                    <Form.Text className="text-muted">
                                        {ratingData.comment.length}/500 caractères
                                    </Form.Text>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowRatingModal(false)}>
                                Annuler
                            </Button>
                            <Button variant="warning" onClick={submitRating}>
                                ⭐ Publier la note
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </Container>
        </div>
    );
};

export default Students;