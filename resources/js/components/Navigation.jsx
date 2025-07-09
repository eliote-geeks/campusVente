import React from 'react';
import { Navbar, Nav, Container, Button, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Navigation = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

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
                        <Nav.Link as={Link} to="/dashboard" className="fw-semibold text-dark px-3">
                            📊 Dashboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/announcements" className="fw-semibold text-dark px-3">
                            📢 Annonces
                        </Nav.Link>
                        <Nav.Link as={Link} to="/create-announcement" className="fw-semibold text-primary px-3">
                            ➕ Créer une annonce
                        </Nav.Link>
                        <Nav.Link as={Link} to="/students" className="fw-semibold text-dark px-3">
                            👥 Étudiants
                        </Nav.Link>
                        <Nav.Link as={Link} to="/meetings" className="fw-semibold text-dark px-3">
                            🤝 Rencontres
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
                                    <img 
                                        src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                                        alt="Profile" 
                                        className="rounded-circle me-2"
                                        style={{width: '32px', height: '32px'}}
                                    />
                                    {user.firstName}
                                    {user.isStudent && (
                                        <Badge className="student-badge ms-2">
                                            Étudiant
                                        </Badge>
                                    )}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/profile">
                                        👤 Mon Profil
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/my-announcements">
                                        📝 Mes Annonces
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/settings">
                                        ⚙️ Paramètres
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
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