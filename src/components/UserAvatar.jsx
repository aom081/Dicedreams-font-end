import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Avatar } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../Auth/AuthContext';

function UserAvatar({ userId, eventId }) {
    const { accessToken } = useContext(AuthContext);
    const [username, setUsername] = useState(null);
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async (id) => {
            try {
                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const { username, user_image } = response.data;
                setUsername(username);
                setProfilePic(user_image);
            } catch (error) {
                console.error('ไม่สามารถดึงข้อมูลรายละเอียดผู้ใช้', error);
            }
        };

        if (userId) {
            fetchUserDetails(userId);
        }
    }, [userId, accessToken]);

    return (
        <Avatar
            sx={{ bgcolor: 'red' }}
            aria-label="profile-picture"
            src={profilePic || ''}
            alt={`${username ? username[0] : 'U'}'s profile picture`}
            id={`user-avatar-${eventId}`}
        >
            {username ? username[0] : 'U'}
        </Avatar>
    );
}

UserAvatar.propTypes = {
    userId: PropTypes.string.isRequired,
    eventId: PropTypes.string.isRequired,
};

export default UserAvatar;
