import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { createApiUrl } from '../config/api';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        isStudent: false,
        university: '',
        studyLevel: '',
        fieldOfStudy: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [loadingUniversities, setLoadingUniversities] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // Load Cameroon universities from API
    useEffect(() => {
        const fetchUniversities = async () => {
            setLoadingUniversities(true);
            try {
                const response = await fetch(createApiUrl('/universities'));
                const data = await response.json();
                if (data.success) {
                    setUniversities(data.data);
                } else {
                    console.error('Failed to fetch universities');
                }
            } catch (error) {
                console.error('Error fetching universities:', error);
            } finally {
                setLoadingUniversities(false);
            }
        };

        fetchUniversities();
    }, []);

    const studyLevels = [
        'Licence 1',
        'Licence 2',
        'Licence 3',
        'Master 1',
        'Master 2',
        'Doctorat',
        'École d\'ingénieur',
        'BTS',
        'DUT'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        if (formData.isStudent && (!formData.university || !formData.studyLevel)) {
            setError('Veuillez remplir tous les champs obligatoires pour les étudiants');
            setLoading(false);
            return;
        }

        try {
            const result = await register(formData);
            
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Erreur lors de l\'inscription');
            }
        } catch (err) {
            setError('Erreur lors de l\'inscription. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-with-navbar">
            <div className="d-flex justify-content-center align-items-center py-5">
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <div className="card-modern">
                        <div className="p-5">
                            <div className="text-center mb-4">
                                <div className="gradient-bg text-white d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                                     style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                                    🎓
                                </div>
                                <h2 className="fw-bold mb-2">Inscription</h2>
                                <p className="text-muted">
                                    Rejoignez la communauté CampusVente
                                </p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">
                                                Prénom
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="Jean"
                                                required
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
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Dupont"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

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
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
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
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">
                                                Confirmer le mot de passe
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        name="isStudent"
                                        checked={formData.isStudent}
                                        onChange={handleChange}
                                        label="Je suis étudiant(e)"
                                        className="fw-semibold"
                                    />
                                </Form.Group>

                                {formData.isStudent && (
                                    <div className="border rounded p-3 mb-3" style={{backgroundColor: '#f8f9fa'}}>
                                        <h6 className="fw-bold mb-3">Informations étudiantes</h6>
                                        
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">
                                                Université
                                            </Form.Label>
                                            <Form.Select
                                                name="university"
                                                value={formData.university}
                                                onChange={handleChange}
                                                required
                                                disabled={loadingUniversities}
                                            >
                                                <option value="">
                                                    {loadingUniversities ? 'Chargement...' : 'Choisir une université'}
                                                </option>
                                                {universities.map((uni) => (
                                                    <option key={uni.id} value={uni.name}>
                                                        {uni.name} {uni.acronym && `(${uni.acronym})`}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">
                                                        Niveau d'études
                                                    </Form.Label>
                                                    <Form.Select
                                                        name="studyLevel"
                                                        value={formData.studyLevel}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="">Choisir un niveau</option>
                                                        {studyLevels.map((level, index) => (
                                                            <option key={index} value={level}>
                                                                {level}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
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
                                                        value={formData.fieldOfStudy}
                                                        onChange={handleChange}
                                                        placeholder="Informatique, Médecine..."
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-100 btn-modern btn-gradient"
                                    size="lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Inscription...' : 'S\'inscrire'}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    Déjà un compte ?{' '}
                                    <Link to="/login" className="text-primary fw-semibold">
                                        Connectez-vous
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

export default Register;