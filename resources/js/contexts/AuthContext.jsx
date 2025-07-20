import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, auth } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté au chargement
        const token = auth.getToken();
        const savedUser = auth.getUser();
        
        if (token && savedUser) {
            setUser(savedUser);
            setIsAuthenticated(true);
        }
        
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await authAPI.login(credentials);
            const data = response.data || response; // Gérer les deux formats
            
            if (data.success) {
                const { user: userData, token } = data;
                
                // Sauvegarder le token et les données utilisateur
                auth.setToken(token);
                auth.setUser(userData);
                
                setUser(userData);
                setIsAuthenticated(true);
                
                return { success: true, user: userData };
            } else {
                throw new Error(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Erreur de connexion' 
            };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await authAPI.register(userData);
            const data = response.data || response; // Gérer les deux formats
            
            if (data.success) {
                const { user: newUser, token } = data;
                
                // Sauvegarder le token et les données utilisateur
                auth.setToken(token);
                auth.setUser(newUser);
                
                setUser(newUser);
                setIsAuthenticated(true);
                
                return { success: true, user: newUser };
            } else {
                throw new Error(data.message || 'Erreur d\'inscription');
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || 'Erreur d\'inscription' 
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
        } finally {
            // Nettoyer l'état local même en cas d'erreur
            auth.clear();
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        auth.setUser(updatedUser);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};