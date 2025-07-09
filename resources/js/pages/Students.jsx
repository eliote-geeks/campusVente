import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUniversity, setFilterUniversity] = useState('all');
    const [filterField, setFilterField] = useState('all');
    const [sortBy, setSortBy] = useState('name');

    // Données simulées d'étudiants avec leurs annonces
    const sampleStudents = [
        {
            id: 1,
            firstName: 'Marie',
            lastName: 'Dupont',
            email: 'marie.dupont@sorbonne.fr',
            phone: '+33612345678',
            university: 'Sorbonne Université',
            studyLevel: 'Master 2',
            field: 'Informatique',
            bio: 'Étudiante en informatique passionnée par le développement web. Toujours prête à aider et partager mes connaissances !',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
            rating: 4.8,
            responseTime: '2h',
            joinedAt: '2023-09-15',
            isVerified: true,
            announcements: [
                {
                    id: 1,
                    title: 'MacBook Pro 2021',
                    price: 1200,
                    category: 'Électronique',
                    type: 'sell',
                    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&h=150&fit=crop',
                    createdAt: '2024-01-15T10:30:00Z',
                    views: 156,
                    likes: 12
                },
                {
                    id: 2,
                    title: 'Cours de programmation Python',
                    price: 30,
                    category: 'Services',
                    type: 'service',
                    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&h=150&fit=crop',
                    createdAt: '2024-01-10T14:20:00Z',
                    views: 89,
                    likes: 15
                }
            ]
        },
        {
            id: 2,
            firstName: 'Paul',
            lastName: 'Martin',
            email: 'paul.martin@univ-paris.fr',
            phone: '+33687654321',
            university: 'Université de Paris',
            studyLevel: 'Licence 3',
            field: 'Économie',
            bio: 'Étudiant en économie, je cherche souvent des colocations et propose des services de relecture de mémoires.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            rating: 4.6,
            responseTime: '1h',
            joinedAt: '2023-10-01',
            isVerified: true,
            announcements: [
                {
                    id: 3,
                    title: 'Colocation proche campus',
                    price: 600,
                    category: 'Logement',
                    type: 'housing',
                    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=150&fit=crop',
                    createdAt: '2024-01-14T15:45:00Z',
                    views: 234,
                    likes: 18
                },
                {
                    id: 4,
                    title: 'Relecture de mémoires',
                    price: 20,
                    category: 'Services',
                    type: 'service',
                    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&h=150&fit=crop',
                    createdAt: '2024-01-08T09:15:00Z',
                    views: 67,
                    likes: 8
                }
            ]
        },
        {
            id: 3,
            firstName: 'Julie',
            lastName: 'Bernard',
            email: 'julie.bernard@ens.fr',
            phone: '+33634567890',
            university: 'École Normale Supérieure',
            studyLevel: 'Doctorat',
            field: 'Philosophie',
            bio: 'Doctorante en philosophie, je vends parfois mes affaires et organise des groupes de discussion.',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            rating: 4.7,
            responseTime: '1h',
            joinedAt: '2023-08-20',
            isVerified: true,
            announcements: [
                {
                    id: 5,
                    title: 'iPhone 14 Pro',
                    price: 950,
                    category: 'Électronique',
                    type: 'sell',
                    image: 'https://images.unsplash.com/photo-1592286638595-0df8be7d99ba?w=200&h=150&fit=crop',
                    createdAt: '2024-01-11T14:20:00Z',
                    views: 345,
                    likes: 28
                }
            ]
        },
        {
            id: 4,
            firstName: 'Alexandre',
            lastName: 'Petit',
            email: 'alex.petit@sciencespo.fr',
            phone: '+33676543210',
            university: 'Sciences Po Paris',
            studyLevel: 'Master 1',
            field: 'Sciences Politiques',
            bio: 'Étudiant en sciences politiques, passionné par le droit et l\'histoire. Vends mes anciens manuels.',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            rating: 4.3,
            responseTime: '3h',
            joinedAt: '2023-11-05',
            isVerified: true,
            announcements: [
                {
                    id: 6,
                    title: 'Livres de droit constitutionnel',
                    price: 120,
                    category: 'Livres',
                    type: 'sell',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop',
                    createdAt: '2024-01-10T11:15:00Z',
                    views: 67,
                    likes: 8
                }
            ]
        },
        {
            id: 5,
            firstName: 'Emma',
            lastName: 'Roux',
            email: 'emma.roux@sorbonne.fr',
            phone: '+33698765432',
            university: 'Sorbonne Université',
            studyLevel: 'Master 1',
            field: 'Médecine',
            bio: 'Étudiante en médecine, toujours en mouvement. J\'organise souvent des événements étudiants.',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
            rating: 4.9,
            responseTime: '30min',
            joinedAt: '2023-09-01',
            isVerified: true,
            announcements: [
                {
                    id: 7,
                    title: 'Soirée étudiante médecine',
                    price: 0,
                    category: 'Événements',
                    type: 'event',
                    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=150&fit=crop',
                    createdAt: '2024-01-12T18:00:00Z',
                    views: 456,
                    likes: 89
                }
            ]
        },
        {
            id: 6,
            firstName: 'Lucas',
            lastName: 'Moreau',
            email: 'lucas.moreau@univ-lyon.fr',
            phone: '+33612987654',
            university: 'Université Lyon 1',
            studyLevel: 'Licence 2',
            field: 'Mathématiques',
            bio: 'Étudiant en mathématiques, j\'aime partager mes connaissances et aider les autres étudiants.',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            rating: 4.4,
            responseTime: '2h',
            joinedAt: '2023-10-15',
            isVerified: false,
            announcements: [
                {
                    id: 8,
                    title: 'Cours de mathématiques',
                    price: 25,
                    category: 'Services',
                    type: 'service',
                    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&h=150&fit=crop',
                    createdAt: '2024-01-13T09:20:00Z',
                    views: 89,
                    likes: 25
                }
            ]
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setStudents(sampleStudents);
            setFilteredStudents(sampleStudents);
            setLoading(false);
        }, 1000);
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
                filtered.sort((a, b) => b.announcements.length - a.announcements.length);
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
                break;
        }

        setFilteredStudents(filtered);
    }, [searchTerm, filterUniversity, filterField, sortBy, students]);

    const handleWhatsAppContact = (student) => {
        const message = encodeURIComponent(`Salut ${student.firstName}! Je viens de voir ton profil sur CampusVente et j'aimerais te contacter. 👋`);
        window.open(`https://wa.me/${student.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
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
                                    {filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''} • {students.reduce((acc, s) => acc + s.announcements.length, 0)} annonces
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button as={Link} to="/dashboard" className="btn-modern" variant="outline-primary">
                                    📊 Dashboard
                                </Button>
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
                            <option value="name">Nom</option>
                            <option value="university">Université</option>
                            <option value="rating">Note</option>
                            <option value="announcements">Nb. annonces</option>
                            <option value="newest">Plus récents</option>
                        </Form.Select>
                    </Col>
                </Row>

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
                                            <img 
                                                src={student.avatar} 
                                                alt={`${student.firstName} ${student.lastName}`}
                                                className="rounded-circle mb-3"
                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
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
                                                <div className="fw-bold text-warning">{student.rating}⭐</div>
                                                <small className="text-muted">Note</small>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-primary">{student.announcements.length}</div>
                                                <small className="text-muted">Annonces</small>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-success">{student.responseTime}</div>
                                                <small className="text-muted">Répond en</small>
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
                                                                                {announcement.price}€
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
                                        <div className="d-flex gap-2">
                                            <Button 
                                                size="sm" 
                                                className="btn-modern flex-fill"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontSize: '12px'
                                                }}
                                                onClick={() => handleWhatsAppContact(student)}
                                            >
                                                💬 Contacter
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline-primary"
                                                className="btn-modern"
                                                onClick={() => setSelectedStudent(student)}
                                            >
                                                👁️ Voir profil
                                            </Button>
                                        </div>
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
                                    <img 
                                        src={selectedStudent.avatar} 
                                        alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                                        className="rounded-circle mb-3"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
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
                                                                        {announcement.price}€
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
            </Container>
        </div>
    );
};

export default Students;