import React, { useState } from 'react';
import { Container } from 'react-bootstrap';

const CampusLoveTest = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const profiles = [
        { id: 1, name: "Test 1", photo: "https://via.placeholder.com/400x600/ff6b6b/white?text=Test+1" },
        { id: 2, name: "Test 2", photo: "https://via.placeholder.com/400x600/4834d4/white?text=Test+2" },
        { id: 3, name: "Test 3", photo: "https://via.placeholder.com/400x600/00d2d3/white?text=Test+3" }
    ];

    const currentProfile = profiles[currentIndex];

    return (
        <Container>
            <h1>CampusLove Test - Index: {currentIndex}</h1>
            
            {currentProfile && (
                <div style={{ 
                    width: '300px', 
                    height: '400px', 
                    margin: '0 auto',
                    border: '2px solid #ff6b6b',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: 'white'
                }}>
                    <img 
                        src={currentProfile.photo}
                        alt={currentProfile.name}
                        style={{ 
                            width: '100%', 
                            height: '300px', 
                            objectFit: 'cover' 
                        }}
                    />
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h3>{currentProfile.name}</h3>
                        <p>Profile ID: {currentProfile.id}</p>
                    </div>
                </div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                    onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : 0)}
                    style={{ margin: '0 10px', padding: '10px 20px' }}
                >
                    Précédent
                </button>
                <button 
                    onClick={() => setCurrentIndex(prev => prev < profiles.length - 1 ? prev + 1 : prev)}
                    style={{ margin: '0 10px', padding: '10px 20px' }}
                >
                    Suivant
                </button>
            </div>
        </Container>
    );
};

export default CampusLoveTest;