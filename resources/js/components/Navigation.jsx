import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { notificationsAPI } from '../services/api.js';
import Avatar from './Avatar.jsx';

const Navigation = () => {
    const { user, isAuthenticated, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);

    // Charger le nombre de notifications non lues
    useEffect(() => {
        const fetchNotificationCount = async () => {
            if (isAuthenticated && user) {
                try {
                    const response = await notificationsAPI.getAll();
                    // Note: axios interceptor returns response.data directly
                    if (response.success) {
                        setNotificationCount(response.data.unread_count || 0);
                    }
                } catch (error) {
                    console.error('Erreur lors du chargement du compteur de notifications:', error?.response?.data?.message || error?.message || error);
                    // En cas d'erreur, garder le compteur à 0
                    setNotificationCount(0);
                }
            } else {
                setNotificationCount(0);
            }
        };

        fetchNotificationCount();
        
        // Mettre à jour toutes les 30 secondes
        const interval = setInterval(fetchNotificationCount, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    // Récupérer les vraies informations utilisateur depuis la BD
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (isAuthenticated && user?.id) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${user.id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Accept': 'application/json'
                        }
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        setUserProfile(data.data);
                        // Mettre à jour le contexte avec les vraies données
                        updateUser({
                            ...user,
                            ...data.data,
                            firstName: data.data.name?.split(' ')[0] || user.firstName,
                            lastName: data.data.name?.split(' ').slice(1).join(' ') || user.lastName
                        });
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération du profil:', error);
                }
            }
        };
        
        fetchUserProfile();
    }, [isAuthenticated, user?.id, updateUser]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const currentUser = userProfile || user;

    return (
        <Navbar expand="lg" className="navbar-modern fixed-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    <span className="d-flex align-items-center">
                        <span className="gradient-bg text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                              style={{ width: '28px', height: '28px', fontSize: '14px' }}>
                            🎓
                        </span>
                        <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600, fontSize: '16px' }}>
                            CampusVente
                        </span>
                    </span>
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto ms-4">
                        <Nav.Link as={Link} to="/" className="fw-semibold text-dark px-3">
                            🏠 Accueil
                        </Nav.Link>
                        {(currentUser?.is_admin || userProfile?.is_admin) && (
                            <Nav.Link as={Link} to="/dashboard" className="fw-semibold text-dark px-3">
                                📊 Dashboard
                            </Nav.Link>
                        )}
                        <Nav.Link as={Link} to="/announcements" className="fw-semibold text-dark px-3">
                            📢 Annonces
                        </Nav.Link>
                        <Nav.Link as={Link} to="/create-announcement" className="fw-semibold text-primary px-3">
                            ➕ Créer une annonce
                        </Nav.Link>
                        <Nav.Link as={Link} to="/students" className="fw-semibold text-dark px-3">
                            👥 Étudiants
                        </Nav.Link>
                        <Nav.Link as={Link} to="/campus-love" className="fw-semibold text-danger px-3">
                            💕 CampusLove
                        </Nav.Link>
                    </Nav>
                    
                    <Nav>
                        {isAuthenticated && user ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle 
                                    variant="outline-primary" 
                                    id="dropdown-basic"
                                    className="btn-modern d-flex align-items-center"
                                >
                                    <Avatar
                                        src={currentUser?.avatar}
                                        name={currentUser?.name}
                                        size={32}
                                        className="me-2"
                                    />
                                    <div className="d-flex flex-column align-items-start me-2">
                                        <span className="fw-semibold">
                                            {currentUser?.name?.split(' ')[0] || currentUser?.firstName || 'Utilisateur'}
                                        </span>
                                        {currentUser?.rating && (
                                            <small className="text-warning">
                                                ⭐ {parseFloat(currentUser.rating).toFixed(1)}
                                            </small>
                                        )}
                                    </div>
                                    {(currentUser?.is_admin || userProfile?.is_admin) && (
                                        <Badge bg="danger" className="ms-1" style={{fontSize: '10px'}}>
                                            Admin
                                        </Badge>
                                    )}
                                    {(currentUser?.is_student || currentUser?.isStudent) && !(currentUser?.is_admin || userProfile?.is_admin) && (
                                        <Badge bg="primary" className="ms-1" style={{fontSize: '10px'}}>
                                            Étudiant
                                        </Badge>
                                    )}
                                    {notificationCount > 0 && (
                                        <Badge bg="danger" className="ms-1" style={{fontSize: '9px'}}>
                                            {notificationCount}
                                        </Badge>
                                    )}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Header>
                                        <div className="text-center">
                                            <Avatar
                                                src={currentUser?.avatar}
                                                name={currentUser?.name}
                                                size={50}
                                                className="mb-2"
                                            />
                                            <div className="fw-bold">{currentUser?.name || 'Utilisateur'}</div>
                                            <small className="text-muted">{currentUser?.email}</small>
                                            {currentUser?.university && (
                                                <div><small className="text-primary">{currentUser.university}</small></div>
                                            )}
                                        </div>
                                    </Dropdown.Header>
                                    <Dropdown.Divider />
                                    <Dropdown.Item as={Link} to="/profile">
                                        👤 Mon Profil
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/my-announcements">
                                        📝 Mes Annonces
                                        {currentUser?.announcements_count > 0 && (
                                            <Badge bg="secondary" className="ms-2" style={{fontSize: '10px'}}>
                                                {currentUser.announcements_count}
                                            </Badge>
                                        )}
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/favorites">
                                        ❤️ Mes Favoris
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/my-ratings">
                                        ⭐ Mes Notes
                                        {currentUser?.total_ratings > 0 && (
                                            <Badge bg="warning" className="ms-2" style={{fontSize: '10px'}}>
                                                {currentUser.total_ratings}
                                            </Badge>
                                        )}
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/notifications">
                                        🔔 Notifications
                                        {notificationCount > 0 && (
                                            <Badge bg="danger" className="ms-2" style={{fontSize: '10px'}}>
                                                {notificationCount}
                                            </Badge>
                                        )}
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item as={Link} to="/settings">
                                        ⚙️ Paramètres
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={handleLogout}>
                                        🚪 Déconnexion
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <div className="d-flex gap-2">
                                <Button 
                                    as={Link} 
                                    to="/login" 
                                    variant="outline-primary"
                                    className="btn-modern"
                                    size="sm"
                                >
                                    Connexion
                                </Button>
                                <Button 
                                    as={Link} 
                                    to="/register" 
                                    className="btn-modern btn-gradient"
                                    size="sm"
                                >
                                    Inscription
                                </Button>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;