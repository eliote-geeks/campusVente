import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tab, Tabs } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const University = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    
    // Données simulées pour l'université
    const universityData = {
        id: 1,
        name: 'Université de Yaoundé I',
        acronym: 'UY1',
        logo: 'https://images.unsplash.com/photo-1498736297812-3a08021f206f?w=150&h=150&fit=crop',
        banner: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=300&fit=crop',
        location: 'Yaoundé, Centre',
        description: 'L\'Université de Yaoundé I est la première université du Cameroun, fondée en 1962. Elle est spécialisée en sciences et technologies et forme des ingénieurs, scientifiques et professionnels de haut niveau.',
        website: 'https://www.uy1.uninet.cm',
        studentCount: 45000,
        establishedYear: 1962,
        rating: 4.5,
        departments: [
            'École Nationale Supérieure Polytechnique',
            'Faculté des Sciences',
            'Faculté de Médecine et des Sciences Biomédicales',
            'École Normale Supérieure',
            'Institut Universitaire de Technologie'
        ]
    };

    const activeStudents = [
        {
            id: 1,
            name: 'Marie Dupont',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop&crop=face',
            studyLevel: 'Master 2',
            fieldOfStudy: 'Informatique',
            joinDate: '2024-01-15',
            postsCount: 12,
            rating: 4.8
        },
        {
            id: 2,
            name: 'Pierre Martin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
            studyLevel: 'Licence 3',
            fieldOfStudy: 'Mathématiques',
            joinDate: '2024-01-10',
            postsCount: 8,
            rating: 4.6
        },
        {
            id: 3,
            name: 'Sophie Legrand',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
            studyLevel: 'Master 1',
            fieldOfStudy: 'Littérature',
            joinDate: '2024-01-08',
            postsCount: 15,
            rating: 4.9
        }
    ];

    return (
        <div className="content-with-navbar">
            <div className="grid-container px-3">
                {/* Header pleine largeur */}
                <div style={{ gridColumn: '1 / -1' }} className="mb-4">
                    <div className="card-modern">
                        <div 
                            className="position-relative"
                            style={{ 
                                backgroundImage: `url(${universityData.banner})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: '250px'
                            }}
                        >
                            <div className="position-absolute top-0 start-0 w-100 h-100"
                                 style={{ 
                                     background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)'
                                 }}
                            />
                            <div className="position-absolute bottom-0 start-0 p-4 text-white">
                                <div className="d-flex align-items-end">
                                    <img 
                                        src={universityData.logo} 
                                        alt={universityData.name}
                                        className="rounded-circle me-3"
                                        style={{ width: '80px', height: '80px', border: '4px solid white' }}
                                    />
                                    <div>
                                        <h2 className="fw-bold mb-1">{universityData.name}</h2>
                                        <p className="mb-1">📍 {universityData.location}</p>
                                        <div className="d-flex gap-3">
                                            <span>👥 {universityData.studentCount.toLocaleString()} étudiants</span>
                                            <span>📅 Fondée en {universityData.establishedYear}</span>
                                            <span>⭐ {universityData.rating}/5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="feed-column" style={{ gridColumn: '1 / -1' }}>
                    <div className="d-flex justify-content-center mb-4">
                        <div className="d-flex gap-2">
                            <button className={`btn-social ${activeTab === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('overview')}>
                                📋 Aperçu
                            </button>
                            <button className={`btn-social ${activeTab === 'students' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('students')}>
                                👥 Étudiants
                            </button>
                        </div>
                    </div>

                    <div className="card-modern">
                        <div className="p-4">
                            {activeTab === 'overview' && (
                                <div className="mb-4">
                                    <h5 className="fw-bold mb-3">À propos de l'université</h5>
                                    <p className="text-muted">{universityData.description}</p>
                                    
                                    <div className="mb-3">
                                        <h6 className="fw-semibold mb-2">Domaines d'études</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {universityData.departments.map((dept, index) => (
                                                <Badge key={index} bg="light" text="dark" className="p-2">
                                                    {dept}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="outline-primary" 
                                            className="btn-modern"
                                            onClick={() => window.open(universityData.website, '_blank')}
                                        >
                                            🌐 Site officiel
                                        </Button>
                                        <Button 
                                            className="btn-modern btn-gradient"
                                        >
                                            📧 Contacter l'université
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'students' && (
                                <div className="mb-4">
                                    <h5 className="fw-bold mb-3">Étudiants actifs</h5>
                                    <Row>
                                        {activeStudents.map(student => (
                                            <Col key={student.id} md={6} className="mb-3">
                                                <Card className="h-100">
                                                    <Card.Body>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <img 
                                                                src={student.avatar} 
                                                                alt={student.name}
                                                                className="rounded-circle me-3"
                                                                style={{ width: '50px', height: '50px' }}
                                                            />
                                                            <div>
                                                                <h6 className="fw-bold mb-0">{student.name}</h6>
                                                                <small className="text-muted">
                                                                    {student.studyLevel} - {student.fieldOfStudy}
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <small className="text-muted">
                                                                    📝 {student.postsCount} annonces
                                                                </small>
                                                                <br />
                                                                <small className="text-muted">
                                                                    ⭐ {student.rating}/5
                                                                </small>
                                                            </div>
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm"
                                                                className="btn-modern"
                                                            >
                                                                💬 Contacter
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default University;