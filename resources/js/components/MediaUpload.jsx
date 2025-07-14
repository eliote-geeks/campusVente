import React, { useState, useRef } from 'react';
import { Button, Alert, Badge, Form, Row, Col, Modal, ProgressBar } from 'react-bootstrap';

const MediaUpload = ({ media = [], onMediaChange, maxFiles = 10 }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [previewMedia, setPreviewMedia] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        // Vérifier la limite de fichiers
        if (media.length + files.length > maxFiles) {
            setError(`Vous ne pouvez uploader que ${maxFiles} fichiers maximum`);
            return;
        }

        setUploading(true);
        setError('');

        const newMedia = [];

        for (const file of files) {
            try {
                // Vérifier le type de fichier
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');

                if (!isImage && !isVideo) {
                    setError(`${file.name} n'est pas un fichier image ou vidéo valide`);
                    continue;
                }

                // Vérifier la taille (10MB max)
                if (file.size > 10 * 1024 * 1024) {
                    setError(`${file.name} est trop volumineux (max 10MB)`);
                    continue;
                }

                // Créer une URL temporaire pour la prévisualisation
                const url = URL.createObjectURL(file);
                
                // Pour la démo, on simule l'upload en gardant l'URL blob
                // En production, on uploaderait vers un serveur
                const mediaItem = {
                    type: isImage ? 'image' : 'video',
                    url: url,
                    thumbnail: url, // Pour les vidéos, on pourrait générer une miniature
                    file: file,
                    name: file.name,
                    size: file.size,
                    uploaded: false // Indique si c'est uploadé vers le serveur
                };

                newMedia.push(mediaItem);

            } catch (error) {
                console.error(`Erreur lors du traitement de ${file.name}:`, error);
                setError(`Erreur lors du traitement de ${file.name}`);
            }
        }

        // Mettre à jour la liste des médias
        const updatedMedia = [...media, ...newMedia];
        onMediaChange(updatedMedia);

        setUploading(false);
        
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeMedia = (index) => {
        const updatedMedia = media.filter((_, i) => i !== index);
        
        // Libérer l'URL blob si nécessaire
        if (media[index] && media[index].url && media[index].url.startsWith('blob:')) {
            URL.revokeObjectURL(media[index].url);
        }
        
        onMediaChange(updatedMedia);
    };

    const previewMediaItem = (mediaItem) => {
        setPreviewMedia(mediaItem);
        setShowPreview(true);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderMediaThumbnail = (mediaItem, index) => {
        const isVideo = mediaItem.type === 'video';
        
        return (
            <div key={index} className="position-relative border rounded overflow-hidden mb-2" style={{ width: '100px', height: '100px' }}>
                {isVideo ? (
                    <video
                        src={mediaItem.url}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => previewMediaItem(mediaItem)}
                        muted
                    />
                ) : (
                    <img
                        src={mediaItem.url}
                        alt={mediaItem.name}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => previewMediaItem(mediaItem)}
                    />
                )}
                
                {/* Badge type */}
                <div className="position-absolute top-0 start-0 m-1">
                    <Badge bg={isVideo ? 'danger' : 'primary'} style={{ fontSize: '8px' }}>
                        {isVideo ? '🎥' : '📸'}
                    </Badge>
                </div>
                
                {/* Bouton supprimer */}
                <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1 rounded-circle border-0"
                    style={{ width: '20px', height: '20px', fontSize: '10px' }}
                    onClick={() => removeMedia(index)}
                >
                    ×
                </Button>
                
                {/* Informations fichier */}
                <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1">
                    <small style={{ fontSize: '8px' }}>
                        {formatFileSize(mediaItem.size)}
                    </small>
                </div>
            </div>
        );
    };

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label className="form-label-enhanced">
                    📷 Photos et vidéos 
                    <Badge bg="secondary" className="ms-2">{media.length}/{maxFiles}</Badge>
                </Form.Label>
                
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-3">
                        {error}
                    </Alert>
                )}

                {/* Zone d'upload */}
                <div className="border rounded p-3 mb-3" style={{ borderStyle: 'dashed', backgroundColor: '#f8f9fa' }}>
                    <div className="text-center">
                        <div className="mb-3">
                            <span style={{ fontSize: '2rem' }}>📁</span>
                        </div>
                        <p className="mb-2">Glissez vos fichiers ici ou cliquez pour sélectionner</p>
                        <Button 
                            variant="outline-primary" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || media.length >= maxFiles}
                        >
                            {uploading ? 'Upload en cours...' : 'Sélectionner des fichiers'}
                        </Button>
                        <Form.Control
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <div className="mt-2">
                            <small className="text-muted">
                                Formats acceptés: JPG, PNG, GIF, MP4, MOV (max 10MB par fichier)
                            </small>
                        </div>
                    </div>
                </div>

                {/* Prévisualisation des médias */}
                {media.length > 0 && (
                    <div>
                        <h6 className="mb-3">Médias sélectionnés :</h6>
                        <Row>
                            {media.map((mediaItem, index) => (
                                <Col key={index} xs={6} md={3} className="mb-3">
                                    {renderMediaThumbnail(mediaItem, index)}
                                    <div className="text-center">
                                        <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                                            {mediaItem.name}
                                        </small>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {uploading && (
                    <ProgressBar animated now={100} variant="primary" className="mt-3" />
                )}
            </Form.Group>

            {/* Modal de prévisualisation */}
            <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {previewMedia?.type === 'video' ? '🎥' : '📸'} Prévisualisation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {previewMedia && (
                        <div>
                            {previewMedia.type === 'video' ? (
                                <video
                                    src={previewMedia.url}
                                    controls
                                    className="img-fluid"
                                    style={{ maxHeight: '70vh' }}
                                />
                            ) : (
                                <img
                                    src={previewMedia.url}
                                    alt={previewMedia.name}
                                    className="img-fluid"
                                    style={{ maxHeight: '70vh' }}
                                />
                            )}
                            <div className="mt-3">
                                <p><strong>Nom:</strong> {previewMedia.name}</p>
                                <p><strong>Taille:</strong> {formatFileSize(previewMedia.size)}</p>
                                <p><strong>Type:</strong> {previewMedia.type}</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPreview(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MediaUpload;