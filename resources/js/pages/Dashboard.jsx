import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, InputGroup, Nav, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // States pour les données
    const [stats, setStats] = useState({});
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    
    // States pour les modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [showUniversityModal, setShowUniversityModal] = useState(false);
    
    // States pour les formulaires
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    
    const [categoryForm, setCategoryForm] = useState({
        name: '', icon: '', description: '', is_active: true, sort_order: 0
    });
    
    const [userForm, setUserForm] = useState({
        name: '', email: '', university: '', is_student: true, is_active: true
    });
    
    const [announcementForm, setAnnouncementForm] = useState({
        title: '', description: '', category: '', price: '', type: 'sell', status: 'active'
    });
    
    const [universityForm, setUniversityForm] = useState({
        name: '', acronym: '', city: '', region: '', type: 'public', founded: '', website: '', description: '', active: true
    });

    // Données simulées
    const mockData = {
        stats: {
            totalUsers: 1247,
            totalAnnouncements: 358,
            totalMeetings: 89,
            totalUniversities: 12,
            totalCategories: 15,
            activeUsers: 342,
            todaySignups: 15,
            todayPosts: 23,
            todayMeetings: 8,
            pendingApprovals: 5
        },
        recentActivity: [
            { id: 1, type: 'user', action: 'Nouvel utilisateur inscrit', user: 'Marie Dupont', details: 'Sorbonne Université', time: '2 min', status: 'success' },
            { id: 2, type: 'announcement', action: 'Nouvelle annonce publiée', user: 'Paul Martin', details: 'MacBook Pro 2021', time: '5 min', status: 'info' },
            { id: 3, type: 'meeting', action: 'Nouvelle rencontre organisée', user: 'Sophie Legrand', details: 'Groupe d\'étude Maths', time: '12 min', status: 'warning' },
            { id: 4, type: 'university', action: 'Université mise à jour', user: 'Admin', details: 'Université de Lyon', time: '1h', status: 'secondary' }
        ],
        users: [
            { id: 1, name: 'Marie Dupont', email: 'marie@example.com', university: 'Sorbonne', is_student: true, is_active: true, created_at: '2024-01-15' },
            { id: 2, name: 'Paul Martin', email: 'paul@example.com', university: 'Lyon 1', is_student: true, is_active: true, created_at: '2024-01-14' },
            { id: 3, name: 'Sophie Legrand', email: 'sophie@example.com', university: 'Montpellier', is_student: false, is_active: true, created_at: '2024-01-13' }
        ],
        announcements: [
            { id: 1, title: 'MacBook Pro 2021', description: 'Excellent état', category: 'Électronique', price: 1200, type: 'sell', status: 'active', author: 'Marie Dupont', created_at: '2024-01-15' },
            { id: 2, title: 'Cours de Maths', description: 'Cours particuliers', category: 'Services', price: 25, type: 'service', status: 'active', author: 'Paul Martin', created_at: '2024-01-14' },
            { id: 3, title: 'Vélo de course', description: 'Vélo en bon état', category: 'Sport', price: 300, type: 'sell', status: 'pending', author: 'Sophie Legrand', created_at: '2024-01-13' }
        ],
        universities: [
            { id: 1, name: 'Sorbonne Université', city: 'Paris', website: 'sorbonne-universite.fr', is_active: true, students_count: 245 },
            { id: 2, name: 'Université Lyon 1', city: 'Lyon', website: 'univ-lyon1.fr', is_active: true, students_count: 189 },
            { id: 3, name: 'Université de Montpellier', city: 'Montpellier', website: 'umontpellier.fr', is_active: true, students_count: 156 }
        ]
    };

    // Chargement initial
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            
            // Simulation du chargement
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Charger les données mockées
            setStats(mockData.stats);
            setRecentActivity(mockData.recentActivity);
            setUsers(mockData.users);
            setAnnouncements(mockData.announcements);
            setUniversities(mockData.universities);
            
            // Charger les catégories et universités depuis l'API
            await fetchCategories();
            await fetchUniversities();
            
            setLoading(false);
        };
        
        loadData();
    }, []);

    // Fonctions API
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/v1/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchUniversities = async () => {
        try {
            const response = await fetch('/api/v1/universities');
            const data = await response.json();
            if (data.success) {
                setUniversities(data.data);
            }
        } catch (error) {
            console.error('Error fetching universities:', error);
        }
    };

    // Fonctions utilitaires
    const getActivityIcon = (type) => {
        const icons = {
            user: '👤', announcement: '📢', meeting: '🤝', university: '🎓', category: '🏷️'
        };
        return icons[type] || '📊';
    };

    const getStatusColor = (status) => {
        const colors = {
            success: 'success', info: 'info', warning: 'warning', 
            danger: 'danger', active: 'success', pending: 'warning', inactive: 'secondary'
        };
        return colors[status] || 'secondary';
    };

    const getTypeColor = (type) => {
        const colors = {
            sell: 'primary', buy: 'success', service: 'info', housing: 'warning', event: 'danger'
        };
        return colors[type] || 'secondary';
    };

    // Fonctions de gestion des catégories
    const handleCategoryFormChange = (field, value) => {
        setCategoryForm(prev => ({ ...prev, [field]: value }));
    };

    const resetCategoryForm = () => {
        setCategoryForm({ name: '', icon: '', description: '', is_active: true, sort_order: 0 });
        setSelectedCategory(null);
    };

    const openCategoryModal = (category = null) => {
        if (category) {
            setSelectedCategory(category);
            setCategoryForm({
                name: category.name,
                icon: category.icon || '',
                description: category.description || '',
                is_active: category.is_active,
                sort_order: category.sort_order
            });
        } else {
            resetCategoryForm();
        }
        setShowCategoryModal(true);
    };

    const handleCreateCategory = async () => {
        try {
            const response = await fetch('/api/v1/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(categoryForm)
            });

            const data = await response.json();
            if (data.success) {
                await fetchCategories();
                resetCategoryForm();
                setShowCategoryModal(false);
                alert('Catégorie créée avec succès !');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Erreur lors de la création de la catégorie');
        }
    };

    const handleUpdateCategory = async () => {
        try {
            const response = await fetch(`/api/v1/categories/${selectedCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(categoryForm)
            });

            const data = await response.json();
            if (data.success) {
                await fetchCategories();
                resetCategoryForm();
                setShowCategoryModal(false);
                alert('Catégorie mise à jour avec succès !');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Erreur lors de la mise à jour de la catégorie');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        try {
            const response = await fetch(`/api/v1/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });

            const data = await response.json();
            if (data.success) {
                await fetchCategories();
                alert('Catégorie supprimée avec succès !');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Erreur lors de la suppression de la catégorie');
        }
    };

    const handleToggleCategoryStatus = async (categoryId) => {
        try {
            const response = await fetch(`/api/v1/categories/${categoryId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });

            const data = await response.json();
            if (data.success) {
                await fetchCategories();
                alert(data.message || 'Statut mis à jour avec succès !');
            }
        } catch (error) {
            console.error('Error toggling category status:', error);
            alert('Erreur lors du changement de statut');
        }
    };

    // Fonctions de gestion des utilisateurs
    const handleUserFormChange = (field, value) => {
        setUserForm(prev => ({ ...prev, [field]: value }));
    };

    const resetUserForm = () => {
        setUserForm({ name: '', email: '', university: '', is_student: true, is_active: true });
        setSelectedUser(null);
    };

    const openUserModal = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setUserForm({
                name: user.name,
                email: user.email,
                university: user.university,
                is_student: user.is_student,
                is_active: user.is_active
            });
        } else {
            resetUserForm();
        }
        setShowUserModal(true);
    };

    const handleDeleteUser = (userId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
        setUsers(prev => prev.filter(user => user.id !== userId));
        alert('Utilisateur supprimé avec succès !');
    };

    // Fonctions de gestion des annonces
    const handleAnnouncementFormChange = (field, value) => {
        setAnnouncementForm(prev => ({ ...prev, [field]: value }));
    };

    const resetAnnouncementForm = () => {
        setAnnouncementForm({ title: '', description: '', category: '', price: '', type: 'sell', status: 'active' });
        setSelectedAnnouncement(null);
    };

    const openAnnouncementModal = (announcement = null) => {
        if (announcement) {
            setSelectedAnnouncement(announcement);
            setAnnouncementForm({
                title: announcement.title,
                description: announcement.description,
                category: announcement.category,
                price: announcement.price,
                type: announcement.type,
                status: announcement.status
            });
        } else {
            resetAnnouncementForm();
        }
        setShowAnnouncementModal(true);
    };

    const handleDeleteAnnouncement = (announcementId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
        setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
        alert('Annonce supprimée avec succès !');
    };

    // Fonctions de gestion des universités
    const handleUniversityFormChange = (field, value) => {
        setUniversityForm(prev => ({ ...prev, [field]: value }));
    };

    const resetUniversityForm = () => {
        setUniversityForm({ name: '', acronym: '', city: '', region: '', type: 'public', founded: '', website: '', description: '', active: true });
        setSelectedUniversity(null);
    };

    const openUniversityModal = (university = null) => {
        if (university) {
            setSelectedUniversity(university);
            setUniversityForm({
                name: university.name,
                acronym: university.acronym || '',
                city: university.city,
                region: university.region,
                type: university.type,
                founded: university.founded || '',
                website: university.website || '',
                description: university.description || '',
                active: university.active
            });
        } else {
            resetUniversityForm();
        }
        setShowUniversityModal(true);
    };

    const handleCreateUniversity = async () => {
        try {
            const response = await fetch('/api/v1/universities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(universityForm)
            });

            const data = await response.json();
            if (data.success) {
                await fetchUniversities();
                resetUniversityForm();
                setShowUniversityModal(false);
                alert('Université créée avec succès !');
            } else {
                alert('Erreur lors de la création de l\'université');
            }
        } catch (error) {
            console.error('Error creating university:', error);
            alert('Erreur lors de la création de l\'université');
        }
    };

    const handleUpdateUniversity = async () => {
        try {
            const response = await fetch(`/api/v1/universities/${selectedUniversity.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(universityForm)
            });

            const data = await response.json();
            if (data.success) {
                await fetchUniversities();
                resetUniversityForm();
                setShowUniversityModal(false);
                alert('Université mise à jour avec succès !');
            } else {
                alert('Erreur lors de la mise à jour de l\'université');
            }
        } catch (error) {
            console.error('Error updating university:', error);
            alert('Erreur lors de la mise à jour de l\'université');
        }
    };

    const handleDeleteUniversity = async (universityId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette université ?')) return;

        try {
            const response = await fetch(`/api/v1/universities/${universityId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });

            const data = await response.json();
            if (data.success) {
                await fetchUniversities();
                alert('Université supprimée avec succès !');
            } else {
                alert(data.message || 'Erreur lors de la suppression de l\'université');
            }
        } catch (error) {
            console.error('Error deleting university:', error);
            alert('Erreur lors de la suppression de l\'université');
        }
    };

    const handleToggleUniversityStatus = async (universityId) => {
        try {
            const response = await fetch(`/api/v1/universities/${universityId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });

            const data = await response.json();
            if (data.success) {
                await fetchUniversities();
                alert(data.message || 'Statut mis à jour avec succès !');
            }
        } catch (error) {
            console.error('Error toggling university status:', error);
            alert('Erreur lors du changement de statut');
        }
    };

    // Rendu du loading
    if (loading) {
        return (
            <Container fluid className="content-with-navbar">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                            <div className="text-center">
                                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                                <p className="text-muted mt-3">Chargement du dashboard...</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Rendu de la vue d'ensemble
    const renderOverview = () => (
        <Container fluid>
            {/* Statistiques principales */}
            <Row className="g-4 mb-4">
                <Col sm={6} lg={3}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="display-4 text-primary mb-2">👥</div>
                            <h3 className="fw-bold text-primary">{stats.totalUsers}</h3>
                            <p className="text-muted mb-1">Utilisateurs totaux</p>
                            <small className="text-success fw-bold">+{stats.todaySignups} aujourd'hui</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={6} lg={3}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="display-4 text-info mb-2">📢</div>
                            <h3 className="fw-bold text-info">{stats.totalAnnouncements}</h3>
                            <p className="text-muted mb-1">Annonces publiées</p>
                            <small className="text-success fw-bold">+{stats.todayPosts} aujourd'hui</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={6} lg={3}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="display-4 text-warning mb-2">🤝</div>
                            <h3 className="fw-bold text-warning">{stats.totalMeetings}</h3>
                            <p className="text-muted mb-1">Rencontres organisées</p>
                            <small className="text-success fw-bold">+{stats.todayMeetings} aujourd'hui</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col sm={6} lg={3}>
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="display-4 text-secondary mb-2">🎓</div>
                            <h3 className="fw-bold text-secondary">{stats.totalUniversities}</h3>
                            <p className="text-muted mb-1">Universités inscrites</p>
                            <small className="text-info fw-bold">{stats.activeUsers} actifs</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Activité récente et stats rapides */}
            <Row className="g-4">
                <Col lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">⚡ Activité récente</h5>
                                <Button variant="outline-primary" size="sm">Voir tout</Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table className="mb-0" hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Action</th>
                                            <th>Utilisateur</th>
                                            <th>Détails</th>
                                            <th>Temps</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentActivity.map(activity => (
                                            <tr key={activity.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2 fs-5">{getActivityIcon(activity.type)}</span>
                                                        <span className="fw-bold">{activity.action}</span>
                                                    </div>
                                                </td>
                                                <td className="fw-bold">{activity.user}</td>
                                                <td className="text-muted">{activity.details}</td>
                                                <td className="text-muted">{activity.time}</td>
                                                <td>
                                                    <Badge bg={getStatusColor(activity.status)} pill>
                                                        {activity.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0 fw-bold">📊 Statistiques rapides</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Utilisateurs actifs</span>
                                <Badge bg="success" pill className="fs-6">{stats.activeUsers}</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Nouvelles inscriptions</span>
                                <Badge bg="primary" pill className="fs-6">{stats.todaySignups}</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Annonces publiées</span>
                                <Badge bg="info" pill className="fs-6">{stats.todayPosts}</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Rencontres organisées</span>
                                <Badge bg="warning" pill className="fs-6">{stats.todayMeetings}</Badge>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>En attente d'approbation</span>
                                <Badge bg="danger" pill className="fs-6">{stats.pendingApprovals}</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );

    // Rendu de la gestion des catégories
    const renderCategoriesManagement = () => {
        // Filtrer les catégories
        const filteredCategories = categories.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Pagination
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

        return (
            <Container fluid>
                <Row>
                    <Col>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">🏷️ Gestion des catégories</h5>
                                    <Button variant="primary" onClick={() => openCategoryModal()}>
                                        ➕ Ajouter une catégorie
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <InputGroup>
                                            <InputGroup.Text>🔍</InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Rechercher une catégorie..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={6}>
                                        <div className="text-end">
                                            <small className="text-muted">
                                                {filteredCategories.length} catégorie(s) trouvée(s)
                                            </small>
                                        </div>
                                    </Col>
                                </Row>
                                <div className="table-responsive">
                                    <Table hover className="table-striped">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Catégorie</th>
                                                <th>Description</th>
                                                <th>Ordre</th>
                                                <th>Statut</th>
                                                <th style={{ width: '120px' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map(category => (
                                                <tr key={category.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2 fs-4">{category.icon || '🏷️'}</span>
                                                            <div>
                                                                <div className="fw-bold">{category.name}</div>
                                                                <small className="text-muted">{category.slug}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ maxWidth: '200px' }}>
                                                            {category.description || <em className="text-muted">Aucune description</em>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg="secondary" pill>{category.sort_order}</Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg={category.is_active ? 'success' : 'danger'} pill>
                                                            {category.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-primary"
                                                                onClick={() => openCategoryModal(category)}
                                                                title="Modifier"
                                                            >
                                                                ✏️
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant={category.is_active ? 'outline-warning' : 'outline-success'}
                                                                onClick={() => handleToggleCategoryStatus(category.id)}
                                                                title={category.is_active ? 'Désactiver' : 'Activer'}
                                                            >
                                                                {category.is_active ? '⏸️' : '▶️'}
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-danger"
                                                                onClick={() => handleDeleteCategory(category.id)}
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
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Row className="mt-3">
                                        <Col>
                                            <nav className="d-flex justify-content-center">
                                                <ul className="pagination">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button 
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Précédent
                                                        </button>
                                                    </li>
                                                    {[...Array(totalPages)].map((_, index) => (
                                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                            <button 
                                                                className="page-link"
                                                                onClick={() => setCurrentPage(index + 1)}
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button 
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(currentPage + 1)}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Suivant
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </Col>
                                    </Row>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    };

    // Rendu de la gestion des utilisateurs
    const renderUsersManagement = () => (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">👥 Gestion des utilisateurs</h5>
                                <Button variant="primary" onClick={() => openUserModal()}>
                                    <i className="fas fa-plus me-2"></i>Ajouter un utilisateur
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <InputGroup>
                                        <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher un utilisateur..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={6}>
                                    <div className="text-end">
                                        <small className="text-muted">
                                            {users.length} utilisateur(s) trouvé(s)
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                            <div className="table-responsive">
                                <Table hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nom</th>
                                            <th>Email</th>
                                            <th>Université</th>
                                            <th>Type</th>
                                            <th>Statut</th>
                                            <th>Inscription</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.filter(user => 
                                            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            user.university.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="me-2">
                                                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                                <span className="text-white fw-bold">{user.name.charAt(0)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="fw-bold">{user.name}</div>
                                                    </div>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>{user.university}</td>
                                                <td>
                                                    <Badge bg={user.is_student ? 'info' : 'warning'} pill>
                                                        {user.is_student ? 'Étudiant' : 'Professionnel'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={user.is_active ? 'success' : 'danger'} pill>
                                                        {user.is_active ? 'Actif' : 'Inactif'}
                                                    </Badge>
                                                </td>
                                                <td className="text-muted">{user.created_at}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-primary"
                                                            onClick={() => openUserModal(user)}
                                                            title="Modifier"
                                                        >
                                                            ✏️
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-danger"
                                                            onClick={() => handleDeleteUser(user.id)}
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
                </Col>
            </Row>
        </Container>
    );

    // Rendu de la gestion des annonces
    const renderAnnouncementsManagement = () => (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">📢 Gestion des annonces</h5>
                                <Button variant="primary" onClick={() => openAnnouncementModal()}>
                                    <i className="fas fa-plus me-2"></i>Ajouter une annonce
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <InputGroup>
                                        <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher une annonce..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={6}>
                                    <div className="text-end">
                                        <small className="text-muted">
                                            {announcements.length} annonce(s) trouvée(s)
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                            <div className="table-responsive">
                                <Table hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Titre</th>
                                            <th>Catégorie</th>
                                            <th>Type</th>
                                            <th>Prix</th>
                                            <th>Auteur</th>
                                            <th>Statut</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {announcements.filter(ann => 
                                            ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            ann.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            ann.author.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(announcement => (
                                            <tr key={announcement.id}>
                                                <td>
                                                    <div>
                                                        <div className="fw-bold">{announcement.title}</div>
                                                        <small className="text-muted">{announcement.description}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary" pill>{announcement.category}</Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={getTypeColor(announcement.type)} pill>
                                                        {announcement.type}
                                                    </Badge>
                                                </td>
                                                <td className="fw-bold text-success">{announcement.price}€</td>
                                                <td>{announcement.author}</td>
                                                <td>
                                                    <Badge bg={getStatusColor(announcement.status)} pill>
                                                        {announcement.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-muted">{announcement.created_at}</td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-primary"
                                                            onClick={() => openAnnouncementModal(announcement)}
                                                            title="Modifier"
                                                        >
                                                            ✏️
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-danger"
                                                            onClick={() => handleDeleteAnnouncement(announcement.id)}
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
                </Col>
            </Row>
        </Container>
    );

    // Rendu de la gestion des universités
    const renderUniversitiesManagement = () => (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">🎓 Gestion des universités</h5>
                                <Button variant="primary" onClick={() => openUniversityModal()}>
                                    <i className="fas fa-plus me-2"></i>Ajouter une université
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <InputGroup>
                                        <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher une université..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={6}>
                                    <div className="text-end">
                                        <small className="text-muted">
                                            {universities.length} université(s) trouvée(s)
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                            <div className="table-responsive">
                                <Table hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nom</th>
                                            <th>Ville</th>
                                            <th>Site web</th>
                                            <th>Étudiants</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {universities.filter(uni => 
                                            uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            uni.city.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(university => (
                                            <tr key={university.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="me-2">
                                                            <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                                <span className="text-white">🎓</span>
                                                            </div>
                                                        </div>
                                                        <div className="fw-bold">{university.name}</div>
                                                    </div>
                                                </td>
                                                <td>{university.city}</td>
                                                <td>
                                                    <a href={`https://${university.website}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                        {university.website}
                                                    </a>
                                                </td>
                                                <td>
                                                    <Badge bg="info" pill>{university.students_count || 0}</Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={university.active ? 'success' : 'danger'} pill>
                                                        {university.active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-primary"
                                                            onClick={() => openUniversityModal(university)}
                                                            title="Modifier"
                                                        >
                                                            ✏️
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant={university.active ? 'outline-warning' : 'outline-success'}
                                                            onClick={() => handleToggleUniversityStatus(university.id)}
                                                            title={university.active ? 'Désactiver' : 'Activer'}
                                                        >
                                                            {university.active ? '⏸️' : '▶️'}
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-danger"
                                                            onClick={() => handleDeleteUniversity(university.id)}
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
                </Col>
            </Row>
        </Container>
    );

    return (
        <div className="content-with-navbar">
            <Container fluid>
                {/* En-tête du dashboard */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h1 className="h3 fw-bold text-dark">📊 Dashboard Administration</h1>
                                <p className="text-muted mb-0">Gérez votre plateforme CampusVente</p>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-muted">Bienvenue, {user?.name || 'Admin'}</span>
                                <Badge bg="success" pill>En ligne</Badge>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Navigation par onglets */}
                <Row className="mb-4">
                    <Col>
                        <Nav variant="pills" className="nav-pills-custom">
                            <Nav.Item>
                                <Nav.Link 
                                    active={activeTab === 'overview'} 
                                    onClick={() => {
                                        setActiveTab('overview');
                                        setCurrentPage(1);
                                        setSearchTerm('');
                                    }}
                                >
                                    📊 Vue d'ensemble
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link 
                                    active={activeTab === 'users'} 
                                    onClick={() => {
                                        setActiveTab('users');
                                        setCurrentPage(1);
                                        setSearchTerm('');
                                    }}
                                >
                                    👥 Utilisateurs
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link 
                                    active={activeTab === 'announcements'} 
                                    onClick={() => {
                                        setActiveTab('announcements');
                                        setCurrentPage(1);
                                        setSearchTerm('');
                                    }}
                                >
                                    📢 Annonces
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link 
                                    active={activeTab === 'categories'} 
                                    onClick={() => {
                                        setActiveTab('categories');
                                        setCurrentPage(1);
                                        setSearchTerm('');
                                    }}
                                >
                                    🏷️ Catégories
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link 
                                    active={activeTab === 'universities'} 
                                    onClick={() => {
                                        setActiveTab('universities');
                                        setCurrentPage(1);
                                        setSearchTerm('');
                                    }}
                                >
                                    🎓 Universités
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>

                {/* Contenu des onglets */}
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsersManagement()}
                {activeTab === 'announcements' && renderAnnouncementsManagement()}
                {activeTab === 'categories' && renderCategoriesManagement()}
                {activeTab === 'universities' && renderUniversitiesManagement()}

                {/* Modal pour les catégories */}
                <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedCategory ? '✏️ Modifier la catégorie' : '➕ Ajouter une catégorie'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nom de la catégorie</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ex: Électronique"
                                            value={categoryForm.name}
                                            onChange={(e) => handleCategoryFormChange('name', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Icône</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="📱"
                                            value={categoryForm.icon}
                                            onChange={(e) => handleCategoryFormChange('icon', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Description de la catégorie"
                                    value={categoryForm.description}
                                    onChange={(e) => handleCategoryFormChange('description', e.target.value)}
                                />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ordre d'affichage</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={categoryForm.sort_order}
                                            onChange={(e) => handleCategoryFormChange('sort_order', parseInt(e.target.value))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="switch"
                                            id="category-active"
                                            label="Catégorie active"
                                            checked={categoryForm.is_active}
                                            onChange={(e) => handleCategoryFormChange('is_active', e.target.checked)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
                            Annuler
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={selectedCategory ? handleUpdateCategory : handleCreateCategory}
                        >
                            {selectedCategory ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal pour les utilisateurs */}
                <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedUser ? '✏️ Modifier l\'utilisateur' : '➕ Ajouter un utilisateur'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nom complet</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ex: Jean Dupont"
                                            value={userForm.name}
                                            onChange={(e) => handleUserFormChange('name', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="jean@example.com"
                                            value={userForm.email}
                                            onChange={(e) => handleUserFormChange('email', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Université</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ex: Sorbonne Université"
                                    value={userForm.university}
                                    onChange={(e) => handleUserFormChange('university', e.target.value)}
                                />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="switch"
                                            id="user-student"
                                            label="Étudiant"
                                            checked={userForm.is_student}
                                            onChange={(e) => handleUserFormChange('is_student', e.target.checked)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="switch"
                                            id="user-active"
                                            label="Compte actif"
                                            checked={userForm.is_active}
                                            onChange={(e) => handleUserFormChange('is_active', e.target.checked)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                            Annuler
                        </Button>
                        <Button variant="primary">
                            {selectedUser ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal pour les annonces */}
                <Modal show={showAnnouncementModal} onHide={() => setShowAnnouncementModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedAnnouncement ? '✏️ Modifier l\'annonce' : '➕ Ajouter une annonce'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Titre</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ex: MacBook Pro 2021"
                                    value={announcementForm.title}
                                    onChange={(e) => handleAnnouncementFormChange('title', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Description de l'annonce"
                                    value={announcementForm.description}
                                    onChange={(e) => handleAnnouncementFormChange('description', e.target.value)}
                                />
                            </Form.Group>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Catégorie</Form.Label>
                                        <Form.Select
                                            value={announcementForm.category}
                                            onChange={(e) => handleAnnouncementFormChange('category', e.target.value)}
                                        >
                                            <option value="">Choisir une catégorie</option>
                                            <option value="Électronique">Électronique</option>
                                            <option value="Services">Services</option>
                                            <option value="Sport">Sport</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Type</Form.Label>
                                        <Form.Select
                                            value={announcementForm.type}
                                            onChange={(e) => handleAnnouncementFormChange('type', e.target.value)}
                                        >
                                            <option value="sell">Vente</option>
                                            <option value="buy">Achat</option>
                                            <option value="service">Service</option>
                                            <option value="housing">Logement</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Prix (€)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            value={announcementForm.price}
                                            onChange={(e) => handleAnnouncementFormChange('price', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Statut</Form.Label>
                                <Form.Select
                                    value={announcementForm.status}
                                    onChange={(e) => handleAnnouncementFormChange('status', e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">En attente</option>
                                    <option value="inactive">Inactive</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAnnouncementModal(false)}>
                            Annuler
                        </Button>
                        <Button variant="primary">
                            {selectedAnnouncement ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal pour les universités */}
                <Modal show={showUniversityModal} onHide={() => setShowUniversityModal(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedUniversity ? '✏️ Modifier l\'université' : '➕ Ajouter une université'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nom de l'université</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ex: Université de Yaoundé I"
                                            value={universityForm.name}
                                            onChange={(e) => handleUniversityFormChange('name', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Acronyme</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ex: UY1"
                                            value={universityForm.acronym}
                                            onChange={(e) => handleUniversityFormChange('acronym', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ville</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ex: Yaoundé"
                                            value={universityForm.city}
                                            onChange={(e) => handleUniversityFormChange('city', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Région</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ex: Centre"
                                            value={universityForm.region}
                                            onChange={(e) => handleUniversityFormChange('region', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Type</Form.Label>
                                        <Form.Select
                                            value={universityForm.type}
                                            onChange={(e) => handleUniversityFormChange('type', e.target.value)}
                                        >
                                            <option value="public">Publique</option>
                                            <option value="private">Privée</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Année de fondation</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Ex: 1962"
                                            value={universityForm.founded}
                                            onChange={(e) => handleUniversityFormChange('founded', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Site web</Form.Label>
                                        <Form.Control
                                            type="url"
                                            placeholder="Ex: https://www.uy1.uninet.cm"
                                            value={universityForm.website}
                                            onChange={(e) => handleUniversityFormChange('website', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Description de l'université"
                                    value={universityForm.description}
                                    onChange={(e) => handleUniversityFormChange('description', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="university-active"
                                    label="Université active"
                                    checked={universityForm.active}
                                    onChange={(e) => handleUniversityFormChange('active', e.target.checked)}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowUniversityModal(false)}>
                            Annuler
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={selectedUniversity ? handleUpdateUniversity : handleCreateUniversity}
                        >
                            {selectedUniversity ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Dashboard;