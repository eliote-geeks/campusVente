import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, ButtonGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { notificationsAPI } from '../services/api.js';
import Avatar from '../components/Avatar.jsx';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [successMessage, setSuccessMessage] = useState('');

    // Charger les notifications depuis l'API
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                setLoading(true);
                const response = await notificationsAPI.getAll();
                
                if (response && response.success) {
                    setNotifications(response.data?.notifications || []);
                } else {
                    setNotifications([]);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des notifications:', error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        const userId = user?.id;
        if (userId) {
            loadNotifications();
        } else {
            setLoading(false);
            setNotifications([]);
        }
    }, [user?.id]);

    const markAsRead = async (notificationId) => {
        try {
            const response = await notificationsAPI.markAsRead(notificationId);
            
            // Note: axios interceptor returns response.data directly
            if (response.success) {
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.id === notificationId 
                            ? { ...notif, read: true }
                            : notif
                    )
                );
                setSuccessMessage('Notification marquée comme lue');
                setTimeout(() => setSuccessMessage(''), 2000);
            }
        } catch (error) {
            console.error('Erreur lors du marquage:', error);
            setSuccessMessage('Erreur lors du marquage de la notification');
            setTimeout(() => setSuccessMessage(''), 2000);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await notificationsAPI.markAllAsRead();
            
            // Note: axios interceptor returns response.data directly
            if (response.success) {
                setNotifications(prev => 
                    prev.map(notif => ({ ...notif, read: true }))
                );
                setSuccessMessage('Toutes les notifications marquées comme lues');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            console.error('Erreur lors du marquage de toutes les notifications:', error);
            setSuccessMessage('Erreur lors du marquage des notifications');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await notificationsAPI.delete(notificationId);
            
            // Note: axios interceptor returns response.data directly
            if (response.success) {
                setNotifications(prev => 
                    prev.filter(notif => notif.id !== notificationId)
                );
                setSuccessMessage('Notification supprimée');
                setTimeout(() => setSuccessMessage(''), 2000);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setSuccessMessage('Erreur lors de la suppression de la notification');
            setTimeout(() => setSuccessMessage(''), 2000);
        }
    };

    const getFilteredNotifications = () => {
        switch (filter) {
            case 'unread':
                return notifications.filter(notif => !notif.read);
            case 'read':
                return notifications.filter(notif => notif.read);
            default:
                return notifications;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));

        if (diffMinutes < 60) {
            return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    };

    const getNotificationTypeColor = (type) => {
        switch (type) {
            case 'promotional_announcement': return 'success';
            case 'urgent_announcement': return 'warning';
            case 'like': return 'danger';
            case 'rating': return 'warning';
            case 'message': return 'primary';
            case 'announcement': return 'info';
            case 'system': return 'secondary';
            default: return 'secondary';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return '🔥';
            case 'medium': return '⚡';
            case 'low': return '📋';
            default: return '📋';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'secondary';
        }
    };

    const unreadCount = notifications.filter(notif => !notif.read).length;
    const filteredNotifications = getFilteredNotifications();

    if (loading) {
        return (
            <div className="content-with-navbar">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="text-muted mt-3">Chargement des notifications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-with-navbar">
            <Container className="py-4">
                {successMessage && (
                    <Alert variant="success" className="mb-4">
                        {successMessage}
                    </Alert>
                )}

                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-1">
                                    🔔 Notifications 
                                    {unreadCount > 0 && (
                                        <Badge bg="danger" className="ms-2">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </h2>
                                <p className="text-muted mb-0">
                                    {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
                                    {filter !== 'all' && ` (${filter === 'unread' ? 'non lues' : 'lues'})`}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                {unreadCount > 0 && (
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={markAllAsRead}
                                    >
                                        ✅ Tout marquer comme lu
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col lg={3}>
                        {/* Filtres */}
                        <Card className="card-modern mb-4">
                            <Card.Header>
                                <h6 className="fw-bold mb-0">🔍 Filtres</h6>
                            </Card.Header>
                            <Card.Body>
                                <ButtonGroup vertical className="w-100">
                                    <Button 
                                        variant={filter === 'all' ? 'primary' : 'outline-primary'}
                                        onClick={() => setFilter('all')}
                                        className="text-start"
                                    >
                                        📋 Toutes ({notifications.length})
                                    </Button>
                                    <Button 
                                        variant={filter === 'unread' ? 'primary' : 'outline-primary'}
                                        onClick={() => setFilter('unread')}
                                        className="text-start"
                                    >
                                        🔴 Non lues ({unreadCount})
                                    </Button>
                                    <Button 
                                        variant={filter === 'read' ? 'primary' : 'outline-primary'}
                                        onClick={() => setFilter('read')}
                                        className="text-start"
                                    >
                                        ✅ Lues ({notifications.length - unreadCount})
                                    </Button>
                                </ButtonGroup>
                            </Card.Body>
                        </Card>

                        {/* Statistiques */}
                        <Card className="card-modern">
                            <Card.Header>
                                <h6 className="fw-bold mb-0">📊 Résumé</h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Total</span>
                                    <Badge bg="primary">{notifications.length}</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span>Non lues</span>
                                    <Badge bg="danger">{unreadCount}</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Aujourd'hui</span>
                                    <Badge bg="info">
                                        {notifications.filter(n => 
                                            new Date(n.created_at).toDateString() === new Date().toDateString()
                                        ).length}
                                    </Badge>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={9}>
                        {/* Liste des notifications */}
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-5">
                                <span style={{ fontSize: '64px' }}>
                                    {filter === 'unread' ? '📭' : filter === 'read' ? '📝' : '🔔'}
                                </span>
                                <h4 className="text-muted mt-3 mb-3">
                                    {filter === 'unread' ? 'Aucune notification non lue' : 
                                     filter === 'read' ? 'Aucune notification lue' : 
                                     'Aucune notification'}
                                </h4>
                                <p className="text-muted">
                                    {filter === 'unread' ? 'Toutes vos notifications sont à jour !' :
                                     filter === 'read' ? 'Aucune notification lue pour le moment.' :
                                     'Vous recevrez ici vos notifications d\'activité.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredNotifications.map(notification => (
                                    <Card 
                                        key={notification.id} 
                                        className={`card-modern ${
                                            !notification.read ? 'border-primary bg-light' : ''
                                        } ${
                                            notification.priority === 'high' ? 'border-danger border-2' : 
                                            notification.priority === 'medium' ? 'border-warning border-1' : ''
                                        }`}
                                        style={{
                                            boxShadow: notification.priority === 'high' ? '0 4px 15px rgba(220, 53, 69, 0.3)' : 
                                                      notification.priority === 'medium' ? '0 2px 10px rgba(255, 193, 7, 0.2)' : 
                                                      '0 1px 3px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Card.Body className="p-3">
                                            <div className="d-flex align-items-start gap-3">
                                                {/* Avatar ou icône */}
                                                <div className="flex-shrink-0">
                                                    {notification.user ? (
                                                        <Avatar
                                                            src={notification.user.avatar}
                                                            name={notification.user.name}
                                                            size={40}
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{ 
                                                                width: '40px', 
                                                                height: '40px', 
                                                                backgroundColor: notification.priority === 'high' ? '#fff5f5' : '#f8f9fa',
                                                                border: notification.priority === 'high' ? '2px solid #dc3545' : '1px solid #dee2e6',
                                                                fontSize: '20px'
                                                            }}
                                                        >
                                                            {notification.icon && notification.icon.startsWith('fa') ? (
                                                                <i className={notification.icon}></i>
                                                            ) : notification.icon ? (
                                                                notification.icon
                                                            ) : (
                                                                getPriorityIcon(notification.priority) || '🔔'
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Contenu */}
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className="fw-bold mb-1">
                                                            {notification.priority === 'high' && (
                                                                <Badge bg="danger" className="me-2" style={{ fontSize: '9px' }}>
                                                                    🔥 PRIORITÉ
                                                                </Badge>
                                                            )}
                                                            {notification.title}
                                                            {!notification.read && (
                                                                <Badge bg="primary" className="ms-2" style={{ fontSize: '8px' }}>
                                                                    NOUVEAU
                                                                </Badge>
                                                            )}
                                                        </h6>
                                                        <small className="text-muted">
                                                            {formatDate(notification.created_at)}
                                                        </small>
                                                    </div>
                                                    
                                                    <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                                                        {notification.message}
                                                    </p>

                                                    {/* Informations supplémentaires pour les annonces promotionnelles */}
                                                    {notification.type === 'promotional_announcement' && notification.data && (
                                                        <div className="mb-2 p-2 rounded" style={{ backgroundColor: '#e8f5e8' }}>
                                                            <small className="text-success fw-bold">
                                                                💰 Prix: {notification.data.price?.toLocaleString('fr-FR')} FCFA
                                                                {notification.data.location && ` • 📍 ${notification.data.location}`}
                                                            </small>
                                                        </div>
                                                    )}

                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex gap-1">
                                                            <Badge bg={getPriorityColor(notification.priority)} style={{ fontSize: '9px' }}>
                                                                {getPriorityIcon(notification.priority)} {notification.priority?.toUpperCase()}
                                                            </Badge>
                                                            <Badge bg={getNotificationTypeColor(notification.type)} style={{ fontSize: '9px' }}>
                                                                {notification.icon && notification.icon.startsWith('fa') ? (
                                                                    <i className={notification.icon}></i>
                                                                ) : (
                                                                    notification.icon
                                                                )} {notification.type.replace('_', ' ').toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                        
                                                        <div className="d-flex gap-1">
                                                            {notification.data?.announcement_id && (
                                                                <Button size="sm" variant="outline-primary" style={{ fontSize: '11px' }}>
                                                                    👁️ Voir annonce
                                                                </Button>
                                                            )}
                                                            {!notification.read && (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline-success"
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    style={{ fontSize: '11px' }}
                                                                >
                                                                    ✅ Lu
                                                                </Button>
                                                            )}
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline-danger"
                                                                onClick={() => deleteNotification(notification.id)}
                                                                style={{ fontSize: '11px' }}
                                                            >
                                                                🗑️
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Notifications;