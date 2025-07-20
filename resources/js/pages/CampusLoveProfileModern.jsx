import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
    User, Heart, Camera, Settings, BarChart3, Upload, Plus, X, 
    MapPin, Briefcase, GraduationCap, Calendar, Edit2, Save, 
    Target, Palette, Music, Film, Zap, Globe
} from 'lucide-react';
import axios from 'axios';

const CampusLoveProfileModern = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const [formData, setFormData] = useState({
        display_name: '',
        tagline: '',
        bio: '',
        birth_date: '',
        gender: '',
        looking_for: '',
        city: '',
        university: '',
        field_of_study: '',
        interests: [],
        hobbies: [],
        music_preferences: [],
    });

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/v1/campus-love/profile/me');
            if (response.data.success) {
                const profileData = response.data.data;
                setProfile(profileData);
                setFormData({
                    display_name: profileData.display_name || '',
                    tagline: profileData.tagline || '',
                    bio: profileData.bio || '',
                    birth_date: profileData.birth_date || '',
                    gender: profileData.gender || '',
                    looking_for: profileData.looking_for || '',
                    city: profileData.city || '',
                    university: profileData.university || '',
                    field_of_study: profileData.field_of_study || '',
                    interests: profileData.interests || [],
                    hobbies: profileData.hobbies || [],
                    music_preferences: profileData.music_preferences || [],
                });
            }
        } catch (err) {
            setError('Erreur lors du chargement du profil');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/v1/campus-love/profile/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Erreur stats:', err);
        }
    };

    const updateProfile = async (section, data) => {
        setSaving(true);
        try {
            const response = await axios.put('/api/v1/campus-love/profile', data);
            if (response.data.success) {
                setProfile(response.data.data);
                setSuccess('Profil mis à jour !');
                setEditingSection(null);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Erreur lors de la mise à jour');
            setTimeout(() => setError(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (files) => {
        setUploading(true);
        const formDataUpload = new FormData();
        
        for (let i = 0; i < files.length; i++) {
            formDataUpload.append('photos[]', files[i]);
        }

        try {
            const response = await axios.post('/api/v1/campus-love/photos/upload-multiple', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                setSuccess('Photos uploadées avec succès !');
                fetchProfile(); // Rafraîchir le profil
                setShowPhotoModal(false);
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError('Erreur lors de l\'upload des photos');
            setTimeout(() => setError(''), 3000);
        } finally {
            setUploading(false);
        }
    };

    const addInterest = (section, value) => {
        if (value && !formData[section].includes(value)) {
            setFormData(prev => ({
                ...prev,
                [section]: [...prev[section], value]
            }));
        }
    };

    const removeInterest = (section, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter(item => item !== value)
        }));
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    const ProfileSection = ({ title, icon: Icon, isEditing, onEdit, onSave, children }) => (
        <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center">
                    <Icon size={20} className="text-primary me-2" />
                    <h6 className="mb-0 fw-bold">{title}</h6>
                </div>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={isEditing ? onSave : onEdit}
                    disabled={saving}
                >
                    {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                </Button>
            </Card.Header>
            <Card.Body className="pt-2">
                {children}
            </Card.Body>
        </Card>
    );

    const PhotoGrid = () => (
        <div className="row g-3">
            {profile?.photos?.map((photo, index) => (
                <div key={index} className="col-4 col-md-3">
                    <div className="position-relative">
                        <img
                            src={`/storage/${photo}`}
                            alt={`Photo ${index + 1}`}
                            className="img-fluid rounded"
                            style={{ aspectRatio: '1', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = '/api/placeholder/200/200?text=Photo&bg=f8f9fa&color=6c757d';
                            }}
                        />
                        {index === 0 && (
                            <Badge bg="primary" className="position-absolute top-0 start-0 m-1">
                                Principal
                            </Badge>
                        )}
                    </div>
                </div>
            ))}
            <div className="col-4 col-md-3">
                <div
                    className="d-flex align-items-center justify-content-center border border-2 border-dashed rounded position-relative"
                    style={{ aspectRatio: '1', cursor: 'pointer', minHeight: '120px' }}
                    onClick={() => setShowPhotoModal(true)}
                >
                    <div className="text-center text-muted">
                        <Plus size={32} className="mb-2" />
                        <small>Ajouter</small>
                    </div>
                </div>
            </div>
        </div>
    );

    const InterestTags = ({ section, label, icon: Icon, color = "primary" }) => (
        <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
                <Icon size={16} className={`text-${color} me-2`} />
                <small className="fw-bold text-muted">{label}</small>
            </div>
            <div className="d-flex flex-wrap gap-2">
                {formData[section]?.map((item, index) => (
                    <Badge key={index} bg={color} className="d-flex align-items-center gap-1">
                        {item}
                        {editingSection === 'interests' && (
                            <X 
                                size={14} 
                                style={{ cursor: 'pointer' }}
                                onClick={() => removeInterest(section, item)}
                            />
                        )}
                    </Badge>
                ))}
                {editingSection === 'interests' && (
                    <Badge bg="outline-secondary" style={{ cursor: 'pointer' }}>
                        <Plus size={14} />
                    </Badge>
                )}
            </div>
        </div>
    );

    return (
        <Container className="py-4">
            <Row>
                <Col lg={8} className="mx-auto">
                    {error && <Alert variant="danger" className="alert-dismissible">{error}</Alert>}
                    {success && <Alert variant="success" className="alert-dismissible">{success}</Alert>}

                    {/* En-tête du profil */}
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body className="text-center py-4">
                            <div className="position-relative d-inline-block mb-3">
                                <div 
                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                    style={{ width: '80px', height: '80px' }}
                                >
                                    <User size={32} className="text-white" />
                                </div>
                                <div 
                                    className="position-absolute bottom-0 end-0 bg-success rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: '24px', height: '24px' }}
                                >
                                    <div className="bg-white rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                                </div>
                            </div>
                            <h4 className="mb-1">{profile?.display_name || user?.name}</h4>
                            {profile?.tagline && (
                                <p className="text-muted mb-3">{profile.tagline}</p>
                            )}
                            <div className="d-flex justify-content-center gap-4 small text-muted">
                                {profile?.city && (
                                    <div className="d-flex align-items-center gap-1">
                                        <MapPin size={14} />
                                        {profile.city}
                                    </div>
                                )}
                                {profile?.university && (
                                    <div className="d-flex align-items-center gap-1">
                                        <GraduationCap size={14} />
                                        {profile.university}
                                    </div>
                                )}
                            </div>
                            {stats && (
                                <div className="row mt-4">
                                    <div className="col-4">
                                        <div className="text-primary fw-bold">{stats.completion_percentage}%</div>
                                        <small className="text-muted">Complété</small>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-primary fw-bold">{stats.photos_count}</div>
                                        <small className="text-muted">Photos</small>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-success fw-bold">En ligne</div>
                                        <small className="text-muted">Statut</small>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Photos */}
                    <ProfileSection
                        title="Photos"
                        icon={Camera}
                        isEditing={false}
                        onEdit={() => setShowPhotoModal(true)}
                        onSave={() => {}}
                    >
                        <PhotoGrid />
                    </ProfileSection>

                    {/* Informations de base */}
                    <ProfileSection
                        title="Informations de base"
                        icon={User}
                        isEditing={editingSection === 'basic'}
                        onEdit={() => setEditingSection('basic')}
                        onSave={() => updateProfile('basic', {
                            display_name: formData.display_name,
                            tagline: formData.tagline,
                            bio: formData.bio,
                            birth_date: formData.birth_date,
                            gender: formData.gender,
                            looking_for: formData.looking_for
                        })}
                    >
                        {editingSection === 'basic' ? (
                            <div className="space-y-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Nom d'affichage</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData(prev => ({...prev, display_name: e.target.value}))}
                                        placeholder="Comment voulez-vous apparaître ?"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Slogan</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.tagline}
                                        onChange={(e) => setFormData(prev => ({...prev, tagline: e.target.value}))}
                                        placeholder="Une phrase qui vous décrit"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Bio</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                                        placeholder="Parlez-nous de vous..."
                                    />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Date de naissance</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={(e) => setFormData(prev => ({...prev, birth_date: e.target.value}))}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Genre</Form.Label>
                                            <Form.Select
                                                value={formData.gender}
                                                onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value}))}
                                            >
                                                <option value="">Sélectionner</option>
                                                <option value="male">Homme</option>
                                                <option value="female">Femme</option>
                                                <option value="other">Autre</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        ) : (
                            <div>
                                {profile?.bio && <p className="mb-2">{profile.bio}</p>}
                                <div className="row small text-muted">
                                    {profile?.birth_date && (
                                        <div className="col-auto d-flex align-items-center gap-1 mb-2">
                                            <Calendar size={14} />
                                            {new Date().getFullYear() - new Date(profile.birth_date).getFullYear()} ans
                                        </div>
                                    )}
                                    {profile?.gender && (
                                        <div className="col-auto d-flex align-items-center gap-1 mb-2">
                                            <User size={14} />
                                            {profile.gender === 'male' ? 'Homme' : profile.gender === 'female' ? 'Femme' : 'Autre'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </ProfileSection>

                    {/* Localisation et études */}
                    <ProfileSection
                        title="Localisation & Études"
                        icon={MapPin}
                        isEditing={editingSection === 'location'}
                        onEdit={() => setEditingSection('location')}
                        onSave={() => updateProfile('location', {
                            city: formData.city,
                            university: formData.university,
                            field_of_study: formData.field_of_study
                        })}
                    >
                        {editingSection === 'location' ? (
                            <div className="space-y-3">
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Ville</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
                                        placeholder="Votre ville"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Université</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.university}
                                        onChange={(e) => setFormData(prev => ({...prev, university: e.target.value}))}
                                        placeholder="Votre université"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Domaine d'études</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.field_of_study}
                                        onChange={(e) => setFormData(prev => ({...prev, field_of_study: e.target.value}))}
                                        placeholder="Votre domaine d'études"
                                    />
                                </Form.Group>
                            </div>
                        ) : (
                            <div className="row small">
                                {profile?.city && (
                                    <div className="col-12 d-flex align-items-center gap-2 mb-2">
                                        <MapPin size={16} className="text-primary" />
                                        <span>{profile.city}</span>
                                    </div>
                                )}
                                {profile?.university && (
                                    <div className="col-12 d-flex align-items-center gap-2 mb-2">
                                        <GraduationCap size={16} className="text-primary" />
                                        <span>{profile.university}</span>
                                    </div>
                                )}
                                {profile?.field_of_study && (
                                    <div className="col-12 d-flex align-items-center gap-2 mb-2">
                                        <Briefcase size={16} className="text-primary" />
                                        <span>{profile.field_of_study}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </ProfileSection>

                    {/* Intérêts */}
                    <ProfileSection
                        title="Intérêts & Passions"
                        icon={Heart}
                        isEditing={editingSection === 'interests'}
                        onEdit={() => setEditingSection('interests')}
                        onSave={() => updateProfile('interests', {
                            interests: formData.interests,
                            hobbies: formData.hobbies,
                            music_preferences: formData.music_preferences
                        })}
                    >
                        <InterestTags section="interests" label="Centres d'intérêt" icon={Target} color="primary" />
                        <InterestTags section="hobbies" label="Loisirs" icon={Zap} color="success" />
                        <InterestTags section="music_preferences" label="Musique" icon={Music} color="info" />
                    </ProfileSection>
                </Col>
            </Row>

            {/* Modal Upload Photo */}
            <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <Camera size={20} />
                        Ajouter des photos
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center py-4">
                        <Upload size={48} className="text-muted mb-3" />
                        <p className="text-muted mb-3">
                            Sélectionnez jusqu'à 6 photos pour votre profil
                        </p>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e.target.files)}
                            className="form-control"
                            disabled={uploading}
                        />
                        {uploading && (
                            <div className="mt-3">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Upload en cours...
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default CampusLoveProfileModern;