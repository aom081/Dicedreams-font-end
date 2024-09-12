import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
    const [userId, setUserId] = useState(localStorage.getItem('users_id'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [profilePic, setProfilePic] = useState(localStorage.getItem('profile_pic'));
    const [role, setRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        if (accessToken) {
            try {
                const decodedToken = jwtDecode(accessToken);
                const id = decodedToken.users_id;
                const userRole = decodedToken.role; // Default to 'user' if not provided
                setUserId(id);
                setRole(userRole);
                fetchUserDetails(id);
            } catch (error) {
                console.error('Error decoding token:', error);
                logout();
            }
        }
    }, [accessToken]);

    const fetchUserDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const { username, user_image, role: userRole } = response.data;
            setUsername(username);
            setProfilePic(user_image);
            setRole(userRole);
            localStorage.setItem('username', username);
            localStorage.setItem('profile_pic', user_image);
            localStorage.setItem('role', userRole);
        } catch (error) {
            console.error('Failed to fetch user details', error);
        }
    };

    const login = (token) => {
        localStorage.setItem('access_token', token);
        const decodedToken = jwtDecode(token);
        const id = decodedToken.users_id;
        const userRole = decodedToken.role;
        setAccessToken(token);
        setUserId(id);
        setRole(userRole);
        localStorage.setItem('users_id', id);
        localStorage.setItem('role', userRole);
        fetchUserDetails(id);
    };

    const logout = () => {
        localStorage.clear();
        setAccessToken(null);
        setUserId(null);
        setUsername(null);
        setProfilePic(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                userId,
                username,
                profilePic,
                role,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
