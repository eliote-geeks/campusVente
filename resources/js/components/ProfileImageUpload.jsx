import React, { useState, useRef } from 'react';
import { Modal, Button, Alert, ProgressBar } from 'react-bootstrap';
import { createApiUrl } from '../config/api';
import Avatar from './Avatar.jsx';

const ProfileImageUpload = ({ 
    show, 
    onHide, 
    currentImage, 
    userName, 
    onImageUpdate 
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        
        if (!file) return;

        // Vérifier le type de fichier
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Seuls les fichiers JPEG, PNG, GIF et WebP sont autorisés.');
            return;
        }

        // Vérifier la taille (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('La taille du fichier ne doit pas dépasser 5MB.');
            return;
        }

        setError('');
        setSelectedFile(file);

        // Créer un aperçu
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Veuillez sélectionner une image.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            // Simuler le progrès d'upload
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            const response = await fetch(createApiUrl('/profile/avatar'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await response.json();

            if (data.success) {
                setSuccess('Photo de profil mise à jour avec succès !');
                
                // Appeler le callback pour mettre à jour l'image dans le parent
                if (onImageUpdate) {
                    onImageUpdate(data.data.avatar_url || preview);
                }

                // Fermer la modal après 2 secondes
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                throw new Error(data.message || 'Erreur lors de l\'upload');
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            setError('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(null);
        setError('');
        setSuccess('');
        setUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onHide();
    };

    const handleRemoveImage = async () => {
        setUploading(true);
        try {
            const response = await fetch(createApiUrl('/profile/avatar'), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Photo de profil supprimée avec succès !');
                
                // Revenir à l'avatar par défaut
                if (onImageUpdate) {
                    onImageUpdate(null);
                }

                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                throw new Error(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            setError('Erreur lors de la suppression de l\'image.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>📸 Changer la photo de profil</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert variant="success" className="mb-3">
                        {success}
                    </Alert>
                )}

                <div className="text-center mb-4">
                    <div className="mb-3">
                        <Avatar
                            src={preview || currentImage}
                            name={userName}
                            size={120}
                            className="shadow"
                        />
                    </div>
                    
                    <p className="text-muted mb-3">
                        Photo actuelle de {userName}
                    </p>
                </div>

                {uploading && (
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span>Upload en cours...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <ProgressBar now={uploadProgress} animated />
                    </div>
                )}

                <div className="mb-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="form-control"
                        disabled={uploading}
                    />
                    <div className="form-text">
                        Formats acceptés : JPEG, PNG, GIF, WebP (max 5MB)
                    </div>
                </div>

                {selectedFile && (
                    <div className="mb-3">
                        <div className="bg-light p-3 rounded">
                            <strong>Fichier sélectionné :</strong><br />
                            📄 {selectedFile.name}<br />
                            📏 {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                    </div>
                )}

                <div className="d-flex gap-2 justify-content-center">
                    <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="btn-modern"
                    >
                        {uploading ? '⏳ Upload...' : '📤 Télécharger'}
                    </Button>
                    
                    {currentImage && (
                        <Button
                            variant="outline-danger"
                            onClick={handleRemoveImage}
                            disabled={uploading}
                            className="btn-modern"
                        >
                            🗑️ Supprimer
                        </Button>
                    )}
                    
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={uploading}
                        className="btn-modern"
                    >
                        Annuler
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ProfileImageUpload;