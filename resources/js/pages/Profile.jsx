import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Tab, Tabs } from 'react-bootstrap';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '+237 6 12 34 56 78',
        bio: 'Étudiant en informatique passionné par les nouvelles technologies.',
        isStudent: true,
        university: 'Université de Yaoundé I',
        studyLevel: 'Master 2',
        fieldOfStudy: 'Informatique',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    });

    const [userPosts] = useState([
        {
            id: 1,
            title: 'MacBook Pro à vendre',
            category: 'Électronique',
            price: 1200,
            status: 'active',
            views: 45,
            likes: 12,
            createdAt: '2024-01-15'
        },
        {
            id: 2,
            title: 'Cours de mathématiques',
            category: 'Services',
            price: 25,
            status: 'active',
            views: 23,
            likes: 8,
            createdAt: '2024-01-10'
        },
        {
            id: 3,
            title: 'Livres de droit',
            category: 'Éducation',
            price: 50,
            status: 'sold',
            views: 67,
            likes: 15,
            createdAt: '2024-01-05'
        }
    ]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfileData({
            ...profileData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = () => {
        setEditMode(false);
        // Ici on enverrait les données au backend
        console.log('Profil sauvegardé:', profileData);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge bg="success">Active</Badge>;
            case 'sold':
                return <Badge bg="secondary">Vendue</Badge>;
            case 'expired':
                return <Badge bg="warning">Expirée</Badge>;
            default:
                return <Badge bg="light">Inconnue</Badge>;
        }
    };

    return (
        <div className="content-with-navbar">
            <div className="grid-container px-3">
                {/* Sidebar gauche - Profil */}
                <div className="sidebar-left d-none d-lg-block">
                    <Card className="card-modern">
                        <Card.Body className="text-center p-4">
                            <div className="position-relative mb-3">
                                <img 
                                    src={profileData.avatar} 
                                    alt="Profile"
                                    className="profile-avatar-large"
                                    style={{ width: '100px', height: '100px' }}
                                />
                                {editMode && (
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        className="position-absolute bottom-0 end-0 rounded-circle"
                                        style={{ width: '35px', height: '35px' }}
                                    >
                                        📷
                                    </Button>
                                )}
                            </div>
                            
                            <h4 className="fw-bold mb-1">
                                {profileData.firstName} {profileData.lastName}
                            </h4>
                            
                            {profileData.isStudent && (
                                <div className="mb-3">
                                    <Badge className="student-badge mb-2">
                                        Étudiant
                                    </Badge>
                                    <div className="d-flex flex-column gap-1">
                                        <span className="university-tag">
                                            {profileData.university}
                                        </span>
                                        <span className="university-tag">
                                            {profileData.studyLevel} - {profileData.fieldOfStudy}
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            <p className="text-muted">
                                {profileData.bio}
                            </p>
                            
                            <div className="d-grid gap-2">
                                <Button 
                                    className="btn-modern btn-gradient"
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? '✅ Sauvegarder' : '✏️ Modifier le profil'}
                                </Button>
                                <Button 
                                    variant="outline-primary"
                                    className="btn-modern"
                                >
                                    💬 Envoyer un message
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="card-modern mt-3">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">📊 Statistiques</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Annonces actives</span>
                                <span className="fw-bold">2</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Ventes réalisées</span>
                                <span className="fw-bold">1</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Note moyenne</span>
                                <span className="fw-bold">⭐ 4.8/5</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Membre depuis</span>
                                <span className="fw-bold">Janvier 2024</span>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Feed central */}
                <div className="feed-column">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h4 className="fw-bold mb-1">👤 Mon Profil</h4>
                            <p className="text-muted mb-0">Gérez vos informations personnelles et vos publications</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className={`btn-social ${activeTab === 'profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('profile')}>
                                👤 Profil
                            </button>
                            <button className={`btn-social ${activeTab === 'posts' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('posts')}>
                                📝 Annonces
                            </button>
                            <button className={`btn-social ${activeTab === 'meetings' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('meetings')}>
                                🤝 Rencontres
                            </button>
                        </div>
                    </div>

                    <div className="card-modern">
                        <div className="p-4">
                            {activeTab === 'profile' && (
                                <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">
                                                        Prénom
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="firstName"
                                                        value={profileData.firstName}
                                                        onChange={handleInputChange}
                                                        disabled={!editMode}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">
                                                        Nom
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="lastName"
                                                        value={profileData.lastName}
                                                        onChange={handleInputChange}
                                                        disabled={!editMode}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">
                                                        Email
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={profileData.email}
                                                        onChange={handleInputChange}
                                                        disabled={!editMode}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">
                                                        Téléphone
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={profileData.phone}
                                                        onChange={handleInputChange}
                                                        disabled={!editMode}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">
                                                Biographie
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name="bio"
                                                value={profileData.bio}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                name="isStudent"
                                                checked={profileData.isStudent}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                label="Je suis étudiant(e)"
                                                className="fw-semibold"
                                            />
                                        </Form.Group>

                                        {profileData.isStudent && (
                                            <div className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}>
                                                <h6 className="fw-bold mb-3">Informations étudiantes</h6>
                                                
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">
                                                        Université
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="university"
                                                        value={profileData.university}
                                                        onChange={handleInputChange}
                                                        disabled={!editMode}
                                                    />
                                                </Form.Group>

                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">
                                                                Niveau d'études
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="studyLevel"
                                                                value={profileData.studyLevel}
                                                                onChange={handleInputChange}
                                                                disabled={!editMode}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label className="fw-semibold">
                                                                Domaine d'études
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="fieldOfStudy"
                                                                value={profileData.fieldOfStudy}
                                                                onChange={handleInputChange}
                                                                disabled={!editMode}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </div>
                                        )}

                                        {editMode && (
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    className="btn-modern btn-gradient"
                                                    onClick={handleSave}
                                                >
                                                    Sauvegarder
                                                </Button>
                                                <Button 
                                                    variant="outline-secondary"
                                                    className="btn-modern"
                                                    onClick={() => setEditMode(false)}
                                                >
                                                    Annuler
                                                </Button>
                                            </div>
                                        )}
                                    </Form>
                            )}

                            {activeTab === 'posts' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold">Mes annonces</h5>
                                        <Button 
                                            className="btn-modern btn-gradient"
                                        >
                                            ➕ Nouvelle annonce
                                        </Button>
                                    </div>

                                    {userPosts.map(post => (
                                        <Card key={post.id} className="mb-3">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h6 className="fw-bold mb-1">{post.title}</h6>
                                                        <p className="text-muted mb-2">{post.category}</p>
                                                        <div className="d-flex gap-2 align-items-center">
                                                            {getStatusBadge(post.status)}
                                                            <span className="fw-bold text-primary">{post.price}€</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <small className="text-muted d-block">
                                                            {post.views} vues • {post.likes} likes
                                                        </small>
                                                        <small className="text-muted">
                                                            {post.createdAt}
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="mt-3 d-flex gap-2">
                                                    <Button variant="outline-primary" size="sm">
                                                        ✏️ Modifier
                                                    </Button>
                                                    <Button variant="outline-secondary" size="sm">
                                                        👁️ Voir
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm">
                                                        🗑️ Supprimer
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'meetings' && (
                                <div className="text-center py-5">
                                    <h5 className="text-muted">Aucune rencontre programmée</h5>
                                    <p className="text-muted">
                                        Organisez votre première rencontre avec d'autres étudiants
                                    </p>
                                    <Button className="btn-modern btn-gradient">
                                        🎉 Organiser une rencontre
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar droite */}
                <div className="sidebar-right d-none d-lg-block">
                    <Card className="card-modern">
                        <Card.Body className="p-3">
                            <h6 className="fw-bold mb-3">🎯 Activité</h6>
                            <div className="d-flex flex-column gap-2">
                                <small className="text-muted">📈 Profil vu 45 fois ce mois</small>
                                <small className="text-muted">💬 12 messages reçus</small>
                                <small className="text-muted">⭐ Note moyenne: 4.8/5</small>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;