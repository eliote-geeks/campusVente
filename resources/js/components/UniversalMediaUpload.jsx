import React from 'react';
import MediaUpload from './MediaUpload.jsx';
import CampusLoveMediaUpload from './CampusLoveMediaUpload.jsx';

const UniversalMediaUpload = ({ 
    type = 'announcement', // 'announcement' ou 'campus_love'
    ...props 
}) => {
    if (type === 'campus_love') {
        return <CampusLoveMediaUpload {...props} />;
    }
    
    return <MediaUpload {...props} />;
};

export default UniversalMediaUpload;