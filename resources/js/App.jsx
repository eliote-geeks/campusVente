import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Navigation from './components/Navigation.jsx';
import AnimatedRoutes from './components/AnimatedRoutes.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import Announcements from './pages/Announcements.jsx';
import CreateAnnouncement from './pages/CreateAnnouncement.jsx';
import Meetings from './pages/Meetings.jsx';
import University from './pages/University.jsx';
import Students from './pages/Students.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import MyAnnouncements from './pages/MyAnnouncements.jsx';
import Favorites from './pages/Favorites.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

// Composant pour protéger les routes privées
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <LoadingSpinner />;
    }
    
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Composant pour rediriger les utilisateurs connectés
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <LoadingSpinner />;
    }
    
    return !isAuthenticated ? children : <Navigate to="/" />;
};

// Composant principal de l'application
const AppContent = () => {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="App">
            <Navigation />
            <Container fluid className="px-0">
                <AnimatedRoutes>
                    <Routes>
                        {/* Routes publiques */}
                        <Route 
                            path="/login" 
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            } 
                        />
                        <Route 
                            path="/register" 
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            } 
                        />
                        
                        {/* Routes privées */}
                        <Route 
                            path="/" 
                            element={
                                <PrivateRoute>
                                    <Home />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/dashboard" 
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/profile" 
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/announcements" 
                            element={
                                <PrivateRoute>
                                    <Announcements />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/create-announcement" 
                            element={
                                <PrivateRoute>
                                    <CreateAnnouncement />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/meetings" 
                            element={
                                <PrivateRoute>
                                    <Meetings />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/university/:id" 
                            element={
                                <PrivateRoute>
                                    <University />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/students" 
                            element={
                                <PrivateRoute>
                                    <Students />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/student/:id" 
                            element={
                                <PrivateRoute>
                                    <StudentProfile />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/my-announcements" 
                            element={
                                <PrivateRoute>
                                    <MyAnnouncements />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/favorites" 
                            element={
                                <PrivateRoute>
                                    <Favorites />
                                </PrivateRoute>
                            } 
                        />
                        
                        {/* Route par défaut */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </AnimatedRoutes>
            </Container>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;