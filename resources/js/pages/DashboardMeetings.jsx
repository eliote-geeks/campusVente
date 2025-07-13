import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
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
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);

    // Charger les données depuis l'API
    const fetchMeetings = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/meetings');
            const data = await response.json();
            if (data.success) {
                setMeetings(data.data);
            } else {
                setError('Erreur lors du chargement des rencontres');
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
            setError('Erreur lors du chargement des rencontres');
        }
    };
    
    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data.filter(cat => cat.is_active));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };


    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchMeetings(), fetchCategories()]);
            setLoading(false);
        };
        loadData();
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

    const getCategoryIcon = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.icon : '📅';
    };
    
    const getTypeIcon = (type) => {
        const icons = {
            study_group: '📚',
            networking: '🤝', 
            party: '🎉',
            sport: '⚽',
            cultural: '🎭',
            conference: '🎤',
            workshop: '🔧',
            other: '📅'
        };
        return icons[type] || '📅';
    };
    
    const getTypeLabel = (type) => {
        const labels = {
            study_group: 'Groupe d\'étude',
            networking: 'Networking',
            party: 'Soirée/Fête', 
            sport: 'Sport',
            cultural: 'Culturel',
            conference: 'Conférence',
            workshop: 'Atelier',
            other: 'Autre'
        };
        return labels[type] || type;
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

    const handleEditMeeting = (meeting) => {
        setSelectedMeeting(meeting);
        // TODO: Implement edit modal
        console.log('Edit meeting:', meeting);
    };

    const handleDeleteMeeting = async (meetingId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette rencontre ?')) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/meetings/${meetingId}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                if (data.success) {
                    // Recharger les données
                    await fetchMeetings();
                    alert('Rencontre supprimée avec succès');
                } else {
                    alert(data.message || 'Erreur lors de la suppression');
                }
            } catch (error) {
                console.error('Error deleting meeting:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                        <p className="text-muted mt-3">Chargement des rencontres...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="content-with-navbar">
                <Container className="mt-5">
                    <Alert variant="danger">
                        {error}
                    </Alert>
                </Container>
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
                                                        {getTypeIcon(meeting.type)}
                                                    </span>
                                                    <div>
                                                        <div className="fw-bold">{meeting.title}</div>
                                                        <small className="text-muted">{getTypeLabel(meeting.type)}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                                                        <span className="text-white fw-bold">{meeting.user?.name?.charAt(0) || 'U'}</span>
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{meeting.user?.name || 'Utilisateur inconnu'}</div>
                                                        <small className="text-muted">{meeting.user?.university || 'Université non spécifiée'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{meeting.formatted_date || formatDate(meeting.meeting_date)}</div>
                                                <small className="text-muted">{meeting.time_until_meeting || ''}</small>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-semibold">{meeting.location}</div>
                                                    {meeting.address && <small className="text-muted">{meeting.address}</small>}
                                                    {meeting.is_online && <span className="ms-2 badge bg-info">En ligne</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <Badge bg="info" pill className="me-2">{meeting.participants_count || 0}</Badge>
                                                    {meeting.max_participants && (
                                                        <small className="text-muted">/ {meeting.max_participants}</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={meeting.status_color || getStatusColor(meeting.status)} pill>
                                                    {meeting.status_label || getStatusText(meeting.status)}
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
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline-warning"
                                                        onClick={() => handleEditMeeting(meeting)}
                                                        title="Modifier"
                                                    >
                                                        ✏️
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline-danger"
                                                        onClick={() => handleDeleteMeeting(meeting.id)}
                                                        title="Supprimer"
                                                    >
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
                                {getTypeIcon(selectedMeeting.type)} {selectedMeeting.title}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={8}>
                                    <h5>Description</h5>
                                    <p className="mb-3">{selectedMeeting.description}</p>
                                    
                                    <h5>Détails</h5>
                                    <div className="mb-3">
                                        <strong>📅 Date:</strong> {selectedMeeting.formatted_date || formatDate(selectedMeeting.meeting_date)}<br/>
                                        <strong>📍 Lieu:</strong> {selectedMeeting.location}<br/>
                                        {selectedMeeting.address && (
                                            <><strong>📍 Adresse:</strong> {selectedMeeting.address}<br/></>
                                        )}
                                        <strong>🏷️ Type:</strong> {getTypeLabel(selectedMeeting.type)}<br/>
                                        <strong>💰 Prix:</strong> {selectedMeeting.formatted_price || (selectedMeeting.is_free ? 'Gratuit' : `${selectedMeeting.price} FCFA`)}<br/>
                                        {selectedMeeting.is_online && (
                                            <><strong>💻 En ligne:</strong> Oui<br/></>
                                        )}
                                        {selectedMeeting.requirements && (
                                            <><strong>📋 Prérequis:</strong> {selectedMeeting.requirements}<br/></>
                                        )}
                                        {selectedMeeting.contact_info && (
                                            <><strong>📞 Contact:</strong> {selectedMeeting.contact_info}<br/></>
                                        )}
                                    </div>
                                    
                                    <h5>Participants ({selectedMeeting.participants_count || 0}{selectedMeeting.max_participants ? `/${selectedMeeting.max_participants}` : ''})</h5>
                                    <div className="mb-3">
                                        <Badge bg="info" pill>{selectedMeeting.participants_count || 0} participants inscrits</Badge>
                                        {selectedMeeting.max_participants && (
                                            <Badge bg="secondary" pill className="ms-2">Max: {selectedMeeting.max_participants}</Badge>
                                        )}
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <h5>Organisateur</h5>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px' }}>
                                            <span className="text-white fw-bold fs-4">{selectedMeeting.user?.name?.charAt(0) || 'U'}</span>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{selectedMeeting.user?.name || 'Utilisateur inconnu'}</div>
                                            <small className="text-muted">{selectedMeeting.user?.university || 'Université non spécifiée'}</small>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <Badge bg={selectedMeeting.status_color || getStatusColor(selectedMeeting.status)} className="mb-2">
                                            {selectedMeeting.status_label || getStatusText(selectedMeeting.status)}
                                        </Badge>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <small className="text-muted">Créée le {new Date(selectedMeeting.created_at).toLocaleDateString('fr-FR')}</small>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <small className="text-muted">Vues: {selectedMeeting.views || 0}</small>
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

                {/* Modal création - Redirection vers le formulaire complet */}
                <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>➕ Créer une nouvelle rencontre</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center">
                            <p className="mb-3">Pour créer une rencontre complète, utilisez le formulaire avancé.</p>
                            <Button 
                                as={Link}
                                to="/create-meeting"
                                className="btn-modern btn-gradient"
                                onClick={() => setShowCreateModal(false)}
                            >
                                🚀 Aller au formulaire complet
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Annuler
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default DashboardMeetings;