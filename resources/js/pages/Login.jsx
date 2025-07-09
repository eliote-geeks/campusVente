import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData);
            
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Erreur de connexion');
            }
        } catch (err) {
            setError('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-with-navbar">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div className="card-modern">
                        <div className="p-5">
                            <div className="text-center mb-4">
                                <div className="gradient-bg text-white d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                                     style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                                    🎓
                                </div>
                                <h2 className="fw-bold mb-2">Connexion</h2>
                                <p className="text-muted">
                                    Connectez-vous à CampusVente
                                </p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Email
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="votre@email.com"
                                        required
                                        className="form-control-lg"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">
                                        Mot de passe
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        className="form-control-lg"
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className="w-100 btn-modern btn-gradient"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Connexion...' : 'Se connecter'}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    Pas encore de compte ?{' '}
                                    <Link to="/register" className="text-primary fw-semibold">
                                        Inscrivez-vous
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;