import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const DashboardMeetings = () => {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const sampleMeetings = [
        {
            id: 1,
            title: 'Groupe d\'étude Mathématiques',
            description: 'Révision collective pour les examens de fin de semestre en mathématiques. Tous niveaux bienvenus.',
            organizer: {
                name: 'Marie Dupont',
                university: 'Sorbonne Université',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face'
            },
            participants: [
                { name: 'Paul Martin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face' },
                { name: 'Sophie Legrand', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face' },
                { name: 'Tom Rousseau', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face' }
            ],
            date: '2024-01-20',
            time: '14:00',
            location: 'Bibliothèque Sainte-Geneviève',
            maxParticipants: 8,
            currentParticipants: 4,
            status: 'upcoming',
            category: 'Étude',
            createdAt: '2024-01-15T10:30:00Z'
        },
        {
            id: 2,
            title: 'Soirée Networking Sciences Po',
            description: 'Rencontre informelle entre étudiants de Sciences Po pour échanger sur nos projets et créer des liens.',
            organizer: {
                name: 'Alexandre Petit',
                university: 'Sciences Po Paris',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face'
            },
            participants: [
                { name: 'Julie Bernard', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face' },
                { name: 'Lucas Moreau', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face' }
            ],
            date: '2024-01-22',
            time: '18:30',
            location: 'Café de Flore',
            maxParticipants: 12,
            currentParticipants: 3,
            status: 'upcoming',
            category: 'Social',
            createdAt: '2024-01-14T15:45:00Z'
        },
        {
            id: 3,
            title: 'Atelier Programmation Web',
            description: 'Session pratique de développement web avec React et Node.js. Niveau intermédiaire requis.',
            organizer: {
                name: 'Emma Roux',
                university: 'Sorbonne Université',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face'
            },
            participants: [
                { name: 'Paul Martin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face' },
                { name: 'Marie Dupont', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=30&h=30&fit=crop&crop=face' },
                { name: 'Tom Rousseau', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face' },
                { name: 'Sophie Legrand', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=30&h=30&fit=crop&crop=face' }
            ],
            date: '2024-01-18',
            time: '10:00',
            location: 'Salle informatique Campus Jussieu',
            maxParticipants: 15,
            currentParticipants: 5,
            status: 'completed',
            category: 'Formation',
            createdAt: '2024-01-12T18:00:00Z'
        },
        {
            id: 4,
            title: 'Tournoi de Football Universitaire',
            description: 'Compétition amicale entre différentes universités parisiennes. Inscription par équipe de 11 joueurs.',
            organizer: {
                name: 'Lucas Moreau',
                university: 'Université Lyon 1',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
            },
            participants: [
                { name: 'Alexandre Petit', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=30&h=30&fit=crop&crop=face' },
                { name: 'Julie Bernard', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=30&h=30&fit=crop&crop=face' }
            ],
            date: '2024-01-25',
            time: '15:00',
            location: 'Stade Charléty',
            maxParticipants: 50,
            currentParticipants: 23,
            status: 'upcoming',
            category: 'Sport',
            createdAt: '2024-01-10T11:15:00Z'
        },
        {
            id: 5,
            title: 'Conférence Intelligence Artificielle',
            description: 'Présentation des dernières avancées en IA par des experts du domaine. Suivi d\'un débat ouvert.',
            organizer: {
                name: 'Sophie Legrand',
                university: null,
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face'
            },
            participants: [
                { name: 'Marie Dupont', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=30&h=30&fit=crop&crop=face' },
                { name: 'Paul Martin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=30&h=30&fit=crop&crop=face' }
            ],
            date: '2024-01-15',
            time: '16:00',
            location: 'Amphithéâtre Richelieu',
            maxParticipants: 100,
            currentParticipants: 45,
            status: 'cancelled',
            category: 'Conférence',
            createdAt: '2024-01-08T09:15:00Z'
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setMeetings(sampleMeetings);
            setFilteredMeetings(sampleMeetings);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        let filtered = meetings;

        if (searchTerm) {
            filtered = filtered.filter(meeting => 
                meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meeting.organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                meeting.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(meeting => meeting.status === filterStatus);
        }

        setFilteredMeetings(filtered);
    }, [searchTerm, filterStatus, meetings]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming': return 'primary';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'upcoming': return 'À venir';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return 'Inconnue';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Étude': return '📚';
            case 'Social': return '🤝';
            case 'Formation': return '💻';
            case 'Sport': return '⚽';
            case 'Conférence': return '🎤';
            default: return '📅';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="text-muted mt-3">Chargement des rencontres...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-with-navbar">
            <Container fluid className="px-4 py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-1">🤝 Gestion des Rencontres</h2>
                                <p className="text-muted mb-0">
                                    {filteredMeetings.length} rencontre{filteredMeetings.length > 1 ? 's' : ''} • {meetings.filter(m => m.status === 'upcoming').length} à venir
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button as={Link} to="/dashboard" className="btn-modern" variant="outline-primary">
                                    📊 Dashboard
                                </Button>
                                <Button className="btn-modern btn-gradient" onClick={() => setShowCreateModal(true)}>
                                    ➕ Nouvelle rencontre
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Statistiques */}
                <Row className="g-4 mb-4">
                    <Col md={3}>
                        <Card className="card-modern text-center">
                            <Card.Body>
                                <div className="mb-2" style={{ fontSize: '2rem' }}>📅</div>
                                <h4 className="fw-bold mb-1">{meetings.length}</h4>
                                <p className="text-muted mb-0">Total rencontres</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-modern text-center">
                            <Card.Body>
                                <div className="mb-2" style={{ fontSize: '2rem' }}>🔄</div>
                                <h4 className="fw-bold mb-1">{meetings.filter(m => m.status === 'upcoming').length}</h4>
                                <p className="text-muted mb-0">À venir</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-modern text-center">
                            <Card.Body>
                                <div className="mb-2" style={{ fontSize: '2rem' }}>✅</div>
                                <h4 className="fw-bold mb-1">{meetings.filter(m => m.status === 'completed').length}</h4>
                                <p className="text-muted mb-0">Terminées</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="card-modern text-center">
                            <Card.Body>
                                <div className="mb-2" style={{ fontSize: '2rem' }}>👥</div>
                                <h4 className="fw-bold mb-1">{meetings.reduce((acc, m) => acc + m.currentParticipants, 0)}</h4>
                                <p className="text-muted mb-0">Participants total</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Filtres */}
                <Row className="mb-4">
                    <Col md={6}>
                        <InputGroup>
                            <InputGroup.Text>🔍</InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Rechercher une rencontre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">Tous les statuts</option>
                            <option value="upcoming">À venir</option>
                            <option value="completed">Terminées</option>
                            <option value="cancelled">Annulées</option>
                        </Form.Select>
                    </Col>
                </Row>

                {/* Liste des rencontres */}
                <Card className="card-modern">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table className="mb-0" hover>
                                <thead>
                                    <tr>
                                        <th>Rencontre</th>
                                        <th>Organisateur</th>
                                        <th>Date & Heure</th>
                                        <th>Lieu</th>
                                        <th>Participants</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMeetings.map(meeting => (
                                        <tr key={meeting.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-2" style={{ fontSize: '1.2rem' }}>
                                                        {getCategoryIcon(meeting.category)}
                                                    </span>
                                                    <div>
                                                        <div className="fw-bold">{meeting.title}</div>
                                                        <small className="text-muted">{meeting.category}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img 
                                                        src={meeting.organizer.avatar} 
                                                        alt={meeting.organizer.name}
                                                        className="rounded-circle me-2"
                                                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                    />
                                                    <div>
                                                        <div className="fw-semibold">{meeting.organizer.name}</div>
                                                        <small className="text-muted">{meeting.organizer.university || 'Externe'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{formatDate(meeting.date)}</div>
                                                <small className="text-muted">{meeting.time}</small>
                                            </td>
                                            <td>
                                                <small className="text-muted">📍 {meeting.location}</small>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2">
                                                        {meeting.participants.slice(0, 3).map((participant, index) => (
                                                            <img 
                                                                key={index}
                                                                src={participant.avatar} 
                                                                alt={participant.name}
                                                                className="rounded-circle border border-2 border-white"
                                                                style={{ 
                                                                    width: '24px', 
                                                                    height: '24px', 
                                                                    objectFit: 'cover',
                                                                    marginLeft: index > 0 ? '-8px' : '0'
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{meeting.currentParticipants}/{meeting.maxParticipants}</div>
                                                        <small className="text-muted">participants</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={getStatusColor(meeting.status)}>
                                                    {getStatusText(meeting.status)}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline-primary"
                                                        onClick={() => setSelectedMeeting(meeting)}
                                                    >
                                                        👁️
                                                    </Button>
                                                    <Button size="sm" variant="outline-warning">
                                                        ✏️
                                                    </Button>
                                                    <Button size="sm" variant="outline-danger">
                                                        🗑️
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Modal détails */}
                {selectedMeeting && (
                    <Modal show={!!selectedMeeting} onHide={() => setSelectedMeeting(null)} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {getCategoryIcon(selectedMeeting.category)} {selectedMeeting.title}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={8}>
                                    <h5>Description</h5>
                                    <p className="mb-3">{selectedMeeting.description}</p>
                                    
                                    <h5>Détails</h5>
                                    <div className="mb-3">
                                        <strong>📅 Date:</strong> {formatDate(selectedMeeting.date)}<br/>
                                        <strong>⏰ Heure:</strong> {selectedMeeting.time}<br/>
                                        <strong>📍 Lieu:</strong> {selectedMeeting.location}<br/>
                                        <strong>🏷️ Catégorie:</strong> {selectedMeeting.category}
                                    </div>
                                    
                                    <h5>Participants ({selectedMeeting.currentParticipants}/{selectedMeeting.maxParticipants})</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedMeeting.participants.map((participant, index) => (
                                            <div key={index} className="d-flex align-items-center bg-light rounded p-2">
                                                <img 
                                                    src={participant.avatar} 
                                                    alt={participant.name}
                                                    className="rounded-circle me-2"
                                                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                />
                                                <small className="fw-semibold">{participant.name}</small>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <h5>Organisateur</h5>
                                    <div className="d-flex align-items-center mb-3">
                                        <img 
                                            src={selectedMeeting.organizer.avatar} 
                                            alt={selectedMeeting.organizer.name}
                                            className="rounded-circle me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <div className="fw-bold">{selectedMeeting.organizer.name}</div>
                                            <small className="text-muted">{selectedMeeting.organizer.university || 'Externe'}</small>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <Badge bg={getStatusColor(selectedMeeting.status)} className="mb-2">
                                            {getStatusText(selectedMeeting.status)}
                                        </Badge>
                                    </div>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setSelectedMeeting(null)}>
                                Fermer
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}

                {/* Modal création */}
                <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>➕ Créer une nouvelle rencontre</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Titre</Form.Label>
                                <Form.Control type="text" placeholder="Titre de la rencontre" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" rows={3} placeholder="Description détaillée" />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Date</Form.Label>
                                        <Form.Control type="date" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Heure</Form.Label>
                                        <Form.Control type="time" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Lieu</Form.Label>
                                <Form.Control type="text" placeholder="Lieu de la rencontre" />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Catégorie</Form.Label>
                                        <Form.Select>
                                            <option>Étude</option>
                                            <option>Social</option>
                                            <option>Formation</option>
                                            <option>Sport</option>
                                            <option>Conférence</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre max de participants</Form.Label>
                                        <Form.Control type="number" placeholder="10" />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Annuler
                        </Button>
                        <Button className="btn-modern btn-gradient" onClick={() => setShowCreateModal(false)}>
                            Créer la rencontre
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default DashboardMeetings;