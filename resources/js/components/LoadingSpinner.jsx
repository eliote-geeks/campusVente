import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Chargement...' }) => {
    return (
        <Container 
            className="d-flex justify-content-center align-items-center" 
            style={{ minHeight: '100vh' }}
        >
            <div className="text-center">
                <Spinner 
                    animation="border" 
                    role="status" 
                    className="mb-3"
                    style={{ 
                        width: '3rem', 
                        height: '3rem',
                        borderWidth: '3px',
                        color: 'var(--bs-primary)'
                    }}
                />
                <div className="fw-semibold text-muted">
                    {message}
                </div>
            </div>
        </Container>
    );
};

export default LoadingSpinner;