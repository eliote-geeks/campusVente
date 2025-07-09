import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Tab, Tabs } from 'react-bootstrap';

const Meetings = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('upcoming');

    const upcomingMeetings = [
        {
            id: 1,
            title: 'Soirée étudiante - Rentrée 2024',
            description: 'Grande soirée pour célébrer la rentrée universitaire ! Venez rencontrer d\'autres étudiants de votre université.',
            date: '2024-02-15T20:00:00Z',
            location: 'Bar Le Central, Paris 5ème',
            organizer: {
                name: 'Marie Dubois',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face',
                isStudent: true,
                university: 'Sorbonne Université',
                phone: '+33612345678'
            },
            participants: 28,
            maxParticipants: 50,
            category: 'party',
            price: 15,
            isParticipating: true
        },
        {
            id: 2,
            title: 'Groupe d\'étude - Mathématiques',
            description: 'Session de révision collective pour l\'examen de mathématiques avancées. Tous niveaux bienvenus.',
            date: '2024-02-10T14:00:00Z',
            location: 'Bibliothèque Sainte-Geneviève',
            organizer: {
                name: 'Pierre Martin',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
                isStudent: true,
                university: 'Université de Paris',
                phone: '+33687654321'
            },
            participants: 8,
            maxParticipants: 12,
            category: 'study',
            price: 0,
            isParticipating: false
        }
    ];

    const categories = [
        { key: 'party', label: 'Soirée', icon: '🎉' },
        { key: 'study', label: 'Études', icon: '📚' },
        { key: 'sport', label: 'Sport', icon: '⚽' },
        { key: 'workshop', label: 'Atelier', icon: '🛠️' },
        { key: 'cultural', label: 'Culture', icon: '🎭' },
        { key: 'networking', label: 'Networking', icon: '🤝' }
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.key === category);
        return cat ? cat.icon : '📅';
    };

    const getCategoryLabel = (category) => {
        const cat = categories.find(c => c.key === category);
        return cat ? cat.label : category;
    };

    const handleWhatsAppContact = (organizer, title) => {
        const message = encodeURIComponent(`Salut ${organizer.name}! Je suis intéressé(e) par ta rencontre "${title}" sur CampusVente. 👋`);
        window.open(`https://wa.me/${organizer.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    return (
        <div className="content-with-navbar">
            <div className="grid-container px-3">
                {/* Sidebar gauche */}
                <div className="sidebar-left d-none d-lg-block">
                    <Card className="card-modern mb-3">
                        <Card.Body className="p-3">
                            <h6 className="fw-bold mb-3">🎯 Filtres</h6>
                            <div className="d-flex flex-column gap-2">
                                <button className={`btn-social text-start ${activeTab === 'upcoming' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('upcoming')}>
                                    📅 À venir
                                </button>
                                <button className={`btn-social text-start ${activeTab === 'my-meetings' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('my-meetings')}>
                                    🗓️ Mes rencontres
                                </button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="card-modern">
                        <Card.Body className="p-3">
                            <h6 className="fw-bold mb-3">🚀 Actions</h6>
                            <Button 
                                className="btn-modern btn-gradient w-100"
                                size="sm"
                                onClick={() => setShowCreateModal(true)}
                            >
                                ➕ Organiser une rencontre
                            </Button>
                        </Card.Body>
                    </Card>
                </div>

                {/* Feed central */}
                <div className="feed-column">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h4 className="fw-bold mb-1">🤝 Rencontres étudiantes</h4>
                            <p className="text-muted mb-0">
                                Découvrez et organisez des rencontres avec d'autres étudiants
                            </p>
                        </div>
                        <Button 
                            className="btn-modern btn-gradient d-lg-none"
                            size="sm"
                            onClick={() => setShowCreateModal(true)}
                        >
                            ➕ Organiser
                        </Button>
                    </div>

                    {/* Contenu basé sur l'onglet actif */}
                    {activeTab === 'upcoming' && (
                        <div className="row g-3">
                            {upcomingMeetings.map(meeting => (
                                <div key={meeting.id} className="col-lg-6">
                                    <div className="social-post h-100">
                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <span className="badge bg-light text-dark">
                                                    {getCategoryIcon(meeting.category)} {getCategoryLabel(meeting.category)}
                                                </span>
                                                <div className="text-end">
                                                    {meeting.price > 0 && (
                                                        <span className="badge" style={{background: 'var(--primary-gradient)'}}>
                                                            {meeting.price}€
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h6 className="fw-bold mb-2">{meeting.title}</h6>
                                            <p className="text-muted mb-3" style={{ fontSize: '14px' }}>{meeting.description}</p>

                                            <div className="mb-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <span className="me-2">📅</span>
                                                    <span className="fw-semibold" style={{ fontSize: '14px' }}>{formatDate(meeting.date)}</span>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <span className="me-2">📍</span>
                                                    <span style={{ fontSize: '14px' }}>{meeting.location}</span>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center mb-3">
                                                <img 
                                                    src={meeting.organizer.avatar} 
                                                    alt={meeting.organizer.name}
                                                    className="profile-avatar me-2"
                                                />
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center gap-1 mb-1">
                                                        <small className="fw-semibold">{meeting.organizer.name}</small>
                                                        {meeting.organizer.isStudent && (
                                                            <span className="student-badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                                                Étudiant
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="text-muted d-block">{meeting.organizer.university}</small>
                                                    <small className="text-muted">
                                                        📞 {meeting.organizer.phone}
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                {meeting.isParticipating ? (
                                                    <Button 
                                                        variant="success" 
                                                        className="btn-modern flex-grow-1"
                                                        size="sm"
                                                        disabled
                                                    >
                                                        ✅ Inscrit
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        className="btn-modern btn-gradient flex-grow-1"
                                                        size="sm"
                                                    >
                                                        🎯 Participer
                                                    </Button>
                                                )}
                                                <Button 
                                                    className="btn-modern"
                                                    style={{ 
                                                        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                                        border: 'none',
                                                        color: 'white'
                                                    }}
                                                    size="sm"
                                                    onClick={() => handleWhatsAppContact(meeting.organizer, meeting.title)}
                                                >
                                                    📞
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'my-meetings' && (
                        <div className="text-center py-5">
                            <h5 className="text-muted">Aucune rencontre organisée</h5>
                            <p className="text-muted">
                                Organisez votre première rencontre avec d'autres étudiants
                            </p>
                            <Button 
                                className="btn-modern btn-gradient"
                                onClick={() => setShowCreateModal(true)}
                            >
                                🎉 Organiser une rencontre
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar droite */}
                <div className="sidebar-right d-none d-lg-block">
                    <Card className="card-modern mb-3">
                        <Card.Body className="p-3">
                            <h6 className="fw-bold mb-3">🎉 Populaires</h6>
                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Soirées étudiantes</span>
                                    <small className="text-muted">12 événements</small>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Groupes d'étude</span>
                                    <small className="text-muted">8 événements</small>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Sport</span>
                                    <small className="text-muted">5 événements</small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Modal de création de rencontre */}
            <Modal 
                show={showCreateModal} 
                onHide={() => setShowCreateModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">🎉 Organiser une rencontre</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Titre de la rencontre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Soirée étudiante, Groupe d'étude..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Catégorie</Form.Label>
                            <Form.Select>
                                {categories.map(category => (
                                    <option key={category.key} value={category.key}>
                                        {category.icon} {category.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Décrivez votre rencontre..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => setShowCreateModal(false)}
                    >
                        Annuler
                    </Button>
                    <Button 
                        className="btn-modern btn-gradient"
                        onClick={() => setShowCreateModal(false)}
                    >
                        🚀 Créer la rencontre
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Meetings;