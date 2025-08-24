import React, { useState, useRef } from 'react';
import { Button, Alert, Badge, Form, Row, Col, Modal, ProgressBar } from 'react-bootstrap';

const MediaUploadBase64 = ({ images = [], onImagesChange, maxFiles = 5 }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef(null);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        // Vérifier la limite de fichiers
        if (images.length + files.length > maxFiles) {
            setError(`Vous ne pouvez uploader que ${maxFiles} images maximum`);
            return;
        }

        setUploading(true);
        setError('');

        const newImages = [];

        for (const file of files) {
            try {
                // Vérifier que c'est une image
                if (!file.type.startsWith('image/')) {
                    setError(`${file.name} n'est pas un fichier image valide`);
                    continue;
                }

                // Vérifier la taille (2MB max pour éviter des base64 trop lourds)
                if (file.size > 2 * 1024 * 1024) {
                    setError(`${file.name} est trop volumineux (max 2MB)`);
                    continue;
                }

                // Convertir en base64
                const base64 = await convertToBase64(file);
                
                const imageItem = {
                    base64: base64,
                    name: file.name,
                    size: file.size,
                    type: file.type
                };

                newImages.push(imageItem);

            } catch (error) {
                console.error(`Erreur lors du traitement de ${file.name}:`, error);
                setError(`Erreur lors du traitement de ${file.name}`);
            }
        }

        // Mettre à jour la liste des images
        const updatedImages = [...images, ...newImages];
        onImagesChange(updatedImages);

        setUploading(false);
        
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        onImagesChange(updatedImages);
    };

    const previewImageItem = (imageItem) => {
        setPreviewImage(imageItem);
        setShowPreview(true);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderImageThumbnail = (imageItem, index) => {
        return (
            <Col key={index} xs={6} sm={4} md={3} className="mb-3">
                <div className="media-thumbnail-container position-relative">
                    <img
                        src={imageItem.base64}
                        alt={imageItem.name}
                        className="img-thumbnail media-thumbnail"
                        style={{ width: '100%', height: '100px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => previewImageItem(imageItem)}
                    />
                    <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 rounded-circle p-1"
                        style={{ width: '25px', height: '25px', fontSize: '12px' }}
                        onClick={() => removeImage(index)}
                    >
                        ×
                    </Button>
                    <div className="media-info mt-1">
                        <small className="text-muted d-block text-truncate">
                            {imageItem.name}
                        </small>
                        <Badge variant="secondary" className="me-1">
                            {formatFileSize(imageItem.size)}
                        </Badge>
                    </div>
                </div>
            </Col>
        );
    };

    return (
        <div className="media-upload-container">
            <Form.Group>
                <Form.Label>Images (base64)</Form.Label>
                
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                
                <div className="upload-area">
                    <Form.Control
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading || images.length >= maxFiles}
                        className="mb-3"
                    />
                    
                    {uploading && (
                        <div className="mb-3">
                            <ProgressBar animated now={100} />
                            <small className="text-muted">Traitement des images...</small>
                        </div>
                    )}
                    
                    <small className="text-muted">
                        {images.length}/{maxFiles} images • Formats acceptés: JPG, PNG, GIF • Taille max: 2MB par image
                    </small>
                </div>

                {images.length > 0 && (
                    <div className="media-grid mt-3">
                        <Row>
                            {images.map((imageItem, index) => renderImageThumbnail(imageItem, index))}
                        </Row>
                    </div>
                )}
            </Form.Group>

            {/* Modal de prévisualisation */}
            <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Prévisualisation - {previewImage?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {previewImage && (
                        <img
                            src={previewImage.base64}
                            alt={previewImage.name}
                            className="img-fluid"
                            style={{ maxHeight: '70vh' }}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Badge variant="info">
                        {previewImage && formatFileSize(previewImage.size)}
                    </Badge>
                    <Button variant="secondary" onClick={() => setShowPreview(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MediaUploadBase64;