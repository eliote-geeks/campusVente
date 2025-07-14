import React from 'react';

const Avatar = ({ 
    src, 
    name, 
    size = 40, 
    className = '', 
    onClick = null,
    style = {}
}) => {
    // Générer les initiales depuis le nom
    const getInitials = (fullName) => {
        if (!fullName) return '?';
        
        const names = fullName.trim().split(' ');
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    // Générer une couleur basée sur le nom
    const getColorFromName = (name) => {
        if (!name) return '#6c757d';
        
        const colors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f',
            '#8e44ad', '#16a085', '#2980b9', '#27ae60', '#d35400',
            '#c0392b', '#7f8c8d', '#2c3e50', '#e74c3c', '#3498db'
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    const initials = getInitials(name);
    const backgroundColor = getColorFromName(name);

    // Construire l'URL complète pour les avatars stockés
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // Si c'est déjà une URL complète, l'utiliser directement
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Si c'est un chemin relatif, construire l'URL complète
        if (imagePath.startsWith('avatars/')) {
            return `http://127.0.0.1:8000/storage/${imagePath}`;
        }
        
        return imagePath;
    };

    const imageUrl = getImageUrl(src);

    // Si une image est fournie et valide, l'utiliser
    if (imageUrl && imageUrl !== '' && !imageUrl.includes('placeholder')) {
        return (
            <img
                src={imageUrl}
                alt={name || 'Avatar'}
                className={`rounded-circle ${className}`}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    objectFit: 'cover',
                    cursor: onClick ? 'pointer' : 'default',
                    ...style
                }}
                onClick={onClick}
                onError={(e) => {
                    // Si l'image échoue à charger, remplacer par l'avatar par défaut
                    e.target.style.display = 'none';
                    const parent = e.target.parentNode;
                    if (parent && !parent.querySelector('.default-avatar')) {
                        const defaultAvatar = document.createElement('div');
                        defaultAvatar.className = `rounded-circle d-flex align-items-center justify-content-center default-avatar ${className}`;
                        defaultAvatar.style.cssText = `
                            width: ${size}px;
                            height: ${size}px;
                            background-color: ${backgroundColor};
                            color: white;
                            font-weight: bold;
                            font-size: ${Math.round(size * 0.4)}px;
                            cursor: ${onClick ? 'pointer' : 'default'};
                            user-select: none;
                            ${Object.entries(style).map(([key, value]) => `${key}: ${value}`).join('; ')}
                        `;
                        defaultAvatar.textContent = initials;
                        if (onClick) {
                            defaultAvatar.addEventListener('click', onClick);
                        }
                        parent.appendChild(defaultAvatar);
                    }
                }}
            />
        );
    }

    // Sinon, utiliser l'avatar par défaut avec initiales
    return (
        <div
            className={`rounded-circle d-flex align-items-center justify-content-center ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor,
                color: 'white',
                fontWeight: 'bold',
                fontSize: `${Math.round(size * 0.4)}px`,
                cursor: onClick ? 'pointer' : 'default',
                userSelect: 'none',
                ...style
            }}
            onClick={onClick}
            title={name || 'Avatar'}
        >
            {initials}
        </div>
    );
};

export default Avatar;