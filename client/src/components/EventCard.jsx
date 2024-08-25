import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardHeader, CardMedia, CardContent, CardActions, Avatar, Button, Typography, IconButton, Menu, MenuItem
} from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { AuthContext } from '../Auth/AuthContext';

function EventCard(props) {
    const {
        userId, // The users_id from the post_games table
        postTime,
        image,
        nameGames,
        dateMeet,
        timeMeet,
        detailPost,
        numPeople,
        maxParticipants,
        eventId,
    } = props;

    const navigate = useNavigate();
    const { accessToken, role, userId: currentUserId } = useContext(AuthContext);

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const [username, setUsername] = useState(null);
    const [profilePic, setProfilePic] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditPost = () => {
        navigate(`/edit-event/${eventId}`);
        handleMenuClose();
    };

    const handleDeletePost = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/post_games/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            // Add any additional logic after deletion if necessary
        } catch (error) {
            console.error('Failed to delete post', error);
        }
        handleMenuClose();
    };

    useEffect(() => {
        const fetchUserDetails = async (id) => {
            try {
                const response = await axios.get(`http://localhost:8080/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const { username, user_image } = response.data;
                setUsername(username);
                setProfilePic(user_image);
            } catch (error) {
                console.error('Failed to fetch user details', error);
            }
        };

        if (userId) {
            fetchUserDetails(userId);
        }
    }, [userId, accessToken]);

    const formattedDateMeet = dateMeet ? dayjs(dateMeet).format('MMM DD YYYY') : 'Unknown Date';
    const formattedTimeMeet = timeMeet ? dayjs(timeMeet, 'HH:mm:ss').format('h:mm A') : 'Unknown Time';

    const handleJoinClick = () => {
        navigate(`/events/${eventId}`, {
            state: {
                userId: currentUserId,
                accessToken,
                role,
            },
        });
    };

    const handleChatClick = () => {
        navigate(`/events/${eventId}`, {
            state: {
                userId: currentUserId,
                accessToken,
                role,
            },
        });
    };

    return (
        <Card
            id={`event-card-${eventId}`}
            sx={{ maxWidth: '100%', margin: '16px 0', backgroundColor: '#424242', boxShadow: '0px 6px 4px rgba(0, 0, 0, 0.5)' }}
        >
            <CardHeader
                id={`event-card-header-${eventId}`}
                avatar={
                    <Avatar
                        sx={{ bgcolor: 'red' }}
                        aria-label="profile-picture"
                        src={profilePic || ''}
                        alt={`${username ? username[0] : 'U'}'s profile picture`}
                        id={`event-avatar-${eventId}`}
                    >
                        {username ? username[0] : 'U'}
                    </Avatar>
                }
                action={
                    currentUserId === userId && (
                        <>
                            <IconButton
                                aria-label="settings"
                                aria-controls={`event-menu-${eventId}`}
                                aria-haspopup="true"
                                onClick={handleMenuOpen}
                                id={`event-menu-button-${eventId}`}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                id={`event-menu-${eventId}`}
                                anchorEl={anchorEl}
                                open={isMenuOpen}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleEditPost}>Edit</MenuItem>
                                <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
                            </Menu>
                        </>
                    )
                }
                title={username || 'Unknown User'}
                subheader={postTime ? dayjs(postTime).format('MMM DD YYYY h:mm A') : 'Unknown Time'}
                sx={{ color: 'white' }}
            />
            <CardMedia
                component="img"
                sx={{ width: '100%', height: 'auto' }}
                image={image || ''}
                alt="Event image"
                id={`event-image-${eventId}`}
            />
            <CardContent id={`event-card-content-${eventId}`} sx={{ color: 'white' }}>
                <Typography variant="h6" component="div" id={`event-name-${eventId}`}>
                    {nameGames || 'Untitled Event'}
                </Typography>
                <Typography variant="body2" color="text.secondary" id={`event-date-time-${eventId}`}>
                    {formattedDateMeet} at {formattedTimeMeet}
                </Typography>
                <Typography variant="body2" color="text.secondary" id={`event-detail-${eventId}`}>
                    {detailPost || 'No content available'}
                </Typography>
                <Typography variant="body2" color="text.secondary" id={`event-participants-${eventId}`}>
                    Participants: {numPeople || 0}/{maxParticipants || '1'}
                </Typography>
            </CardContent>
            <CardActions disableSpacing sx={{ justifyContent: 'space-between', padding: '16px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        backgroundColor: 'crimson',
                        color: 'white',
                        padding: '12px 24px',
                        fontSize: '1rem',
                        width: '120px'
                    }}
                    onClick={handleJoinClick}
                    id={`join-button-${eventId}`}
                >
                    Join
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    sx={{
                        borderColor: 'white',
                        color: 'white',
                        padding: '12px 24px',
                        fontSize: '1rem',
                        width: '120px'
                    }}
                    onClick={handleChatClick}
                    id={`chat-button-${eventId}`}
                >
                    Chat
                </Button>
            </CardActions>
        </Card>
    );
}

EventCard.propTypes = {
    userId: PropTypes.string.isRequired,
    postTime: PropTypes.string,
    image: PropTypes.string,
    nameGames: PropTypes.string,
    dateMeet: PropTypes.string,
    timeMeet: PropTypes.string,
    detailPost: PropTypes.string,
    numPeople: PropTypes.number,
    maxParticipants: PropTypes.number,
    eventId: PropTypes.string.isRequired,
};

export default EventCard;
