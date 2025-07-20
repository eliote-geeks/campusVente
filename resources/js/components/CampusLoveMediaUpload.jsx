import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Row, Col, Form, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { X, Upload, Image, Plus, Edit3, MapPin, Tag } from 'lucide-react';
import './CampusLoveMediaUpload.css';

const CampusLoveMediaUpload = ({ 
    photos = [], 
    onPhotosChange, 
    maxPhotos = 6,
    profile = null 
}) => {
    const [uploadingPhotos, setUploadingPhotos] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [showMetadataModal, setShowMetadataModal] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
    const [photoMetadata, setPhotoMetadata] = useState({
        description: '',
        location: '',
        tags: []
    });
    const [newTag, setNewTag] = useState('');
    
    const fileInputRef = useRef(null);

    const handleFiles = useCallback(async (files) => {
        if (files.length === 0) return;
        
        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) {
                setError('Seules les images sont acceptées');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                setError('Les images doivent faire moins de 10MB');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;
        
        if (photos.length + validFiles.length > maxPhotos) {
            setError(`Vous ne pouvez avoir que ${maxPhotos} photos maximum`);
            return;
        }

        setError('');
        setUploadingPhotos(validFiles.map((file, index) => ({ 
            file, 
            id: Date.now() + index,
            preview: URL.createObjectURL(file),
            progress: 0 
        })));

        try {
            const formData = new FormData();
            validFiles.forEach(file => {
                formData.append('photos[]', file);
            });

            const token = localStorage.getItem('token');
            
            const response = await fetch('/api/v1/campus-love/photos/upload-multiple', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                if (onPhotosChange) {
                    onPhotosChange(data.data.profile);
                }
                setUploadingPhotos([]);
            } else {
                setError(data.message || 'Erreur lors de l\'upload');
                setUploadingPhotos([]);
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            setError('Erreur lors de l\'upload des photos');
            setUploadingPhotos([]);
        }
    }, [photos.length, maxPhotos, onPhotosChange]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleDeletePhoto = async (photoIndex) => {
        if (!photos[photoIndex]) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/campus-love/photos', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    photo_path: photos[photoIndex]
                })
            });

            const data = await response.json();
            
            if (data.success && onPhotosChange) {
                onPhotosChange(data.data);
            } else {
                setError(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            setError('Erreur lors de la suppression de la photo');
        }
    };

    const handleSetProfilePhoto = async (photoIndex) => {
        if (!photos[photoIndex]) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/campus-love/photos/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    photo_path: photos[photoIndex]
                })
            });

            const data = await response.json();
            
            if (data.success && onPhotosChange) {
                onPhotosChange(data.data);
            } else {
                setError(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur photo de profil:', error);
            setError('Erreur lors de la mise à jour de la photo de profil');
        }
    };

    const openMetadataModal = (photoIndex) => {
        setSelectedPhotoIndex(photoIndex);
        const descriptions = profile?.photo_descriptions || {};
        const locations = profile?.photo_locations || {};
        const tags = profile?.photo_tags || {};
        
        setPhotoMetadata({
            description: descriptions[photoIndex] || '',
            location: locations[photoIndex] || '',
            tags: tags[photoIndex] || []
        });
        setShowMetadataModal(true);
    };

    const savePhotoMetadata = async () => {
        if (selectedPhotoIndex === null) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/campus-love/photos/metadata', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    photo_index: selectedPhotoIndex,
                    description: photoMetadata.description,
                    location: photoMetadata.location,
                    tags: photoMetadata.tags
                })
            });

            const data = await response.json();
            
            if (data.success) {
                if (onPhotosChange) {
                    onPhotosChange(data.data.profile);
                }
                setShowMetadataModal(false);
                setSelectedPhotoIndex(null);
            } else {
                setError(data.message || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur sauvegarde métadonnées:', error);
            setError('Erreur lors de la sauvegarde des métadonnées');
        }
    };

    const addTag = () => {
        if (newTag.trim() && photoMetadata.tags.length < 5 && !photoMetadata.tags.includes(newTag.trim())) {
            setPhotoMetadata(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setPhotoMetadata(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return '/api/placeholder/300/400';
        if (photoPath.startsWith('http')) return photoPath;
        return `/storage/${photoPath}`;
    };

    return (
        <div className="campus-love-media-upload">
            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                        <Image size={20} className="me-2" />
                        Photos de profil ({photos.length}/{maxPhotos})
                    </h6>
                    <Badge bg={photos.length === 0 ? 'danger' : photos.length < 3 ? 'warning' : 'success'}>
                        {photos.length === 0 ? 'Aucune photo' : 
                         photos.length < 3 ? 'Ajoutez plus de photos' : 'Profil complet'}
                    </Badge>
                </Card.Header>
                
                <Card.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
                            {error}
                        </Alert>
                    )}

                    {/* Zone de drag & drop */}
                    <div
                        className={`drag-drop-zone ${dragActive ? 'drag-active' : ''} ${photos.length >= maxPhotos ? 'disabled' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => photos.length < maxPhotos && fileInputRef.current?.click()}
                    >
                        <div className="drag-drop-content">
                            <Upload size={48} className="mb-3" />
                            <h5>Glissez-déposez vos photos ici</h5>
                            <p className="text-muted">
                                ou cliquez pour sélectionner des fichiers<br/>
                                <small>JPEG, PNG, GIF - Maximum 10MB par photo</small>
                            </p>
                            {photos.length < maxPhotos && (
                                <Button variant="primary" size="sm">
                                    <Plus size={16} className="me-1" />
                                    Choisir des photos
                                </Button>
                            )}
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {/* Photos en cours d'upload */}
                    {uploadingPhotos.length > 0 && (
                        <div className="uploading-photos mt-3">
                            <h6>Upload en cours...</h6>
                            <Row>
                                {uploadingPhotos.map((uploadingPhoto) => (
                                    <Col xs={6} md={4} lg={3} key={uploadingPhoto.id} className="mb-3">
                                        <div className="photo-upload-preview">
                                            <img 
                                                src={uploadingPhoto.preview} 
                                                alt="Upload en cours"
                                                className="img-fluid rounded"
                                            />
                                            <div className="upload-overlay">
                                                <Spinner animation="border" size="sm" />
                                                <small>Upload...</small>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {/* Photos existantes */}
                    {photos.length > 0 && (
                        <div className="existing-photos mt-3">
                            <h6>Vos photos</h6>
                            <Row>
                                {photos.map((photoPath, index) => (
                                    <Col xs={6} md={4} lg={3} key={index} className="mb-3">
                                        <div className="photo-preview">
                                            <img 
                                                src={getPhotoUrl(photoPath)} 
                                                alt={`Photo ${index + 1}`}
                                                className="img-fluid rounded"
                                            />
                                            
                                            {/* Overlay avec actions */}
                                            <div className="photo-overlay">
                                                <div className="photo-actions">
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        onClick={() => openMetadataModal(index)}
                                                        title="Modifier les détails"
                                                    >
                                                        <Edit3 size={14} />
                                                    </Button>
                                                    
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleSetProfilePhoto(index)}
                                                        title="Photo de profil principale"
                                                    >
                                                        <Image size={14} />
                                                    </Button>
                                                    
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeletePhoto(index)}
                                                        title="Supprimer"
                                                    >
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Badge photo principale */}
                                            {profile?.profile_photo === photoPath && (
                                                <Badge bg="primary" className="photo-main-badge">
                                                    Principale
                                                </Badge>
                                            )}

                                            {/* Métadonnées visibles */}
                                            <div className="photo-metadata">
                                                {profile?.photo_descriptions?.[index] && (
                                                    <small className="metadata-description">
                                                        {profile.photo_descriptions[index].substring(0, 30)}...
                                                    </small>
                                                )}
                                                {profile?.photo_locations?.[index] && (
                                                    <small className="metadata-location">
                                                        <MapPin size={12} className="me-1" />
                                                        {profile.photo_locations[index]}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal pour les métadonnées de photo */}
            <Modal show={showMetadataModal} onHide={() => setShowMetadataModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Détails de la photo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Décrivez cette photo..."
                                value={photoMetadata.description}
                                onChange={(e) => setPhotoMetadata(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                maxLength={200}
                            />
                            <Form.Text className="text-muted">
                                {photoMetadata.description.length}/200 caractères
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                <MapPin size={16} className="me-1" />
                                Lieu
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Où cette photo a-t-elle été prise ?"
                                value={photoMetadata.location}
                                onChange={(e) => setPhotoMetadata(prev => ({
                                    ...prev,
                                    location: e.target.value
                                }))}
                                maxLength={100}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                <Tag size={16} className="me-1" />
                                Tags ({photoMetadata.tags.length}/5)
                            </Form.Label>
                            
                            {/* Tags existants */}
                            <div className="mb-2">
                                {photoMetadata.tags.map((tag, index) => (
                                    <Badge 
                                        key={index} 
                                        bg="secondary" 
                                        className="me-2 mb-1"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => removeTag(tag)}
                                    >
                                        {tag} <X size={12} />
                                    </Badge>
                                ))}
                            </div>

                            {/* Ajouter un nouveau tag */}
                            {photoMetadata.tags.length < 5 && (
                                <div className="d-flex">
                                    <Form.Control
                                        type="text"
                                        placeholder="Ajouter un tag..."
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        maxLength={30}
                                    />
                                    <Button 
                                        variant="outline-primary" 
                                        className="ms-2"
                                        onClick={addTag}
                                        disabled={!newTag.trim() || photoMetadata.tags.includes(newTag.trim())}
                                    >
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            )}
                            <Form.Text className="text-muted">
                                Ex: selfie, voyage, amis, nature, sport...
                            </Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMetadataModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={savePhotoMetadata}>
                        Sauvegarder
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CampusLoveMediaUpload;