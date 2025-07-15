import React, { useState } from 'react';
import { Modal, Carousel, Button, Badge } from 'react-bootstrap';

const MediaGallery = ({ media = [], images = [], title = "Médias", onImageClick = null }) => {
    const [showModal, setShowModal] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // Combiner les anciens images et les nouveaux médias
    const allMedia = [];
    
    // Debug: voir ce qui est passé
    console.log('MediaGallery - images:', images);
    console.log('MediaGallery - media:', media);
    
    // Ajouter les anciennes images (compatibilité)
    if (images && images.length > 0) {
        images.forEach(image => {
            // Détecter si c'est une vidéo même dans le format images
            const isVideo = image.includes('.mp4') || image.includes('.mov') || image.includes('.avi') || image.includes('.webm');
            allMedia.push({
                type: isVideo ? 'video' : 'image',
                url: image,
                thumbnail: image
            });
        });
    }
    
    // Ajouter les nouveaux médias
    if (media && media.length > 0) {
        media.forEach(item => {
            if (typeof item === 'string') {
                // Ancien format - juste une URL, déterminer le type par l'extension
                const isVideo = item.includes('.mp4') || item.includes('.mov') || item.includes('.avi') || item.includes('.webm');
                allMedia.push({
                    type: isVideo ? 'video' : 'image',
                    url: item,
                    thumbnail: item
                });
            } else if (item && typeof item === 'object') {
                // Nouveau format avec type et URL
                allMedia.push({
                    type: item.type || 'image',
                    url: item.url || item.src || item,
                    thumbnail: item.thumbnail || item.url || item.src || item
                });
            }
        });
    }

    // Si aucun média, retourner un placeholder simple
    if (allMedia.length === 0) {
        return (
            <div className="position-relative d-flex align-items-center justify-content-center bg-light w-100 h-100">
                <div className="text-center text-muted">
                    <div style={{ fontSize: '2rem' }}>📷</div>
                    <small>Aucune image</small>
                </div>
            </div>
        );
    }

    // Utiliser allMedia directement avec gestion d'erreur par image

    const handleMediaClick = (index) => {
        setActiveIndex(index);
        setShowModal(true);
        if (onImageClick) {
            onImageClick();
        }
    };

    const renderMedia = (mediaItem, style = {}) => {
        console.log('Rendering media item:', mediaItem);
        
        if (mediaItem.type === 'video') {
            return (
                <div className="position-relative bg-dark d-flex align-items-center justify-content-center" style={style}>
                    <video
                        src={mediaItem.url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        controls={false}
                        muted
                        preload="metadata"
                        playsInline
                        loop
                        onMouseEnter={(e) => {
                            e.target.currentTime = 0;
                            e.target.play().catch(() => {});
                        }}
                        onMouseLeave={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                        }}
                        onError={(e) => {
                            console.error('Erreur chargement vidéo:', mediaItem.url, e);
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className="position-absolute top-50 start-50 translate-middle">
                        <div className="bg-dark bg-opacity-75 rounded-circle p-3" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                            <span style={{ color: 'white', fontSize: '24px' }}>▶️</span>
                        </div>
                    </div>
                    {/* Badge vidéo */}
                    <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-danger" style={{ fontSize: '10px' }}>
                            🎥 VIDÉO
                        </span>
                    </div>
                </div>
            );
        } else {
            return (
                <img
                    src={mediaItem.url}
                    alt={title}
                    style={{ ...style, objectFit: 'cover' }}
                    onError={(e) => {
                        console.error('Erreur chargement image:', mediaItem.url);
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjhmOWZhIi8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCA4OS41IDEzOS41IDc5IDEyOSA3OUgxMTlDMTA4LjUgNzkgOTggODkuNSA5OCAxMDBWMTIwQzk4IDEzMC41IDEwOC41IDE0MSAxMTkgMTQxSDEyOUMxMzkuNSAxNDEgMTUwIDEzMC41IDE1MCAxMjBWMTAwWiIgZmlsbD0iI2RjZGNkYyIvPgo8cGF0aCBkPSJNMTgwIDEwMEMxODAgODkuNSAxNjkuNSA3OSAxNTkgNzlIMTQ5QzEzOC41IDc5IDEyOCA4OS41IDEyOCAxMDBWMTIwQzEyOCAxMzAuNSAxMzguNSAxNDEgMTQ5IDE0MUgxNTlDMTY5LjUgMTQxIDE4MCAxMzAuNSAxODAgMTIwVjEwMFoiIGZpbGw9IiNkY2RjZGMiLz4KPHRleHQgeD0iMTUwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc2ODQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjUwMCI+SW1hZ2UgaW5kaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K';
                        e.target.onerror = null; // Éviter la boucle infinie
                    }}
                />
            );
        }
    };

    const renderMediaInModal = (mediaItem) => {
        if (mediaItem.type === 'video') {
            return (
                <video
                    src={mediaItem.url}
                    className="d-block w-100"
                    style={{ maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
                    controls
                    controlsList="nodownload"
                    preload="metadata"
                    playsInline
                    onError={(e) => {
                        console.error('Erreur chargement vidéo modal:', mediaItem.url);
                        e.target.style.display = 'none';
                    }}
                    onLoadStart={() => console.log('Chargement vidéo démarré')}
                    onCanPlay={() => console.log('Vidéo prête à être lue')}
                />
            );
        } else {
            return (
                <img
                    src={mediaItem.url}
                    alt={title}
                    className="d-block w-100"
                    style={{ maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
                    onError={(e) => {
                        console.error('Erreur chargement image modal:', mediaItem.url);
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjhmOWZhIi8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCA4OS41IDEzOS41IDc5IDEyOSA3OUgxMTlDMTA4LjUgNzkgOTggODkuNSA5OCAxMDBWMTIwQzk4IDEzMC41IDEwOC41IDE0MSAxMTkgMTQxSDEyOUMxMzkuNSAxNDEgMTUwIDEzMC41IDE1MCAxMjBWMTAwWiIgZmlsbD0iI2RjZGNkYyIvPgo8cGF0aCBkPSJNMTgwIDEwMEMxODAgODkuNSAxNjkuNSA3OSAxNTkgNzlIMTQ5QzEzOC41IDc5IDEyOCA4OS41IDEyOCAxMDBWMTIwQzEyOCAxMzAuNSAxMzguNSAxNDEgMTQ5IDE0MUgxNTlDMTY5LjUgMTQxIDE4MCAxMzAuNSAxODAgMTIwVjEwMFoiIGZpbGw9IiNkY2RjZGMiLz4KPHRleHQgeD0iMTUwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc2ODQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjUwMCI+SW1hZ2UgaW5kaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K';
                        e.target.onerror = null;
                    }}
                />
            );
        }
    };

    return (
        <>
            {/* Affichage principal */}
            <div className="position-relative w-100 h-100">
                {renderMedia(allMedia[0], {
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                })}
                
                {/* Badge compteur de médias */}
                {allMedia.length > 1 && (
                    <div className="position-absolute bottom-0 end-0 m-2">
                        <Badge bg="dark" className="bg-opacity-75">
                            📷 {allMedia.length}
                        </Badge>
                    </div>
                )}

                {/* Badge type vidéo */}
                {allMedia[0].type === 'video' && (
                    <div className="position-absolute top-0 start-0 m-2">
                        <Badge bg="danger">
                            🎥 Vidéo
                        </Badge>
                    </div>
                )}

                {/* Overlay cliquable */}
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                    onClick={() => handleMediaClick(0)}
                />
            </div>

            {/* Modal galerie */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>
                        {allMedia[activeIndex]?.type === 'video' ? '🎥' : '📸'} {title} ({activeIndex + 1}/{allMedia.length})
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0 bg-dark">
                    <Carousel
                        activeIndex={activeIndex}
                        onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                        indicators={allMedia.length > 1}
                        controls={allMedia.length > 1}
                        interval={null}
                        variant="dark"
                    >
                        {allMedia.map((mediaItem, index) => (
                            <Carousel.Item key={index}>
                                <div className="d-flex justify-content-center align-items-center bg-dark" style={{ minHeight: '70vh' }}>
                                    {renderMediaInModal(mediaItem)}
                                </div>
                                {mediaItem.type === 'video' && (
                                    <Carousel.Caption className="bg-dark bg-opacity-75 rounded mx-auto" style={{ maxWidth: '300px' }}>
                                        <p className="mb-1">🎥 Vidéo {index + 1}</p>
                                        <small className="text-muted">Utilisez les contrôles pour lire, mettre en pause ou ajuster le volume</small>
                                    </Carousel.Caption>
                                )}
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Modal.Body>
                {allMedia.length > 1 && (
                    <Modal.Footer className="justify-content-center bg-dark border-0">
                        <div className="d-flex gap-2 flex-wrap justify-content-center">
                            {allMedia.map((mediaItem, index) => (
                                <div
                                    key={index}
                                    className={`position-relative border rounded overflow-hidden ${
                                        index === activeIndex ? 'border-primary border-3' : 'border-secondary'
                                    }`}
                                    style={{ cursor: 'pointer', width: '80px', height: '60px' }}
                                    onClick={() => setActiveIndex(index)}
                                >
                                    {renderMedia(mediaItem, {
                                        width: '100%',
                                        height: '100%'
                                    })}
                                    {mediaItem.type === 'video' && (
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <div className="bg-dark bg-opacity-75 rounded-circle p-1">
                                                <span style={{ color: 'white', fontSize: '10px' }}>▶️</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="position-absolute bottom-0 start-0 w-100 text-center bg-dark bg-opacity-75">
                                        <small className="text-white" style={{ fontSize: '9px' }}>
                                            {index + 1}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Modal.Footer>
                )}
            </Modal>
        </>
    );
};

export default MediaGallery;