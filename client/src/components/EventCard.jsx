import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Card, CardHeader, CardMedia, CardContent, CardActions, Avatar, Button, Typography, IconButton, Menu, MenuItem, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { AuthContext } from '../Auth/AuthContext';

function EventCard(props) {
    const {
        userId, postTime, image, nameGames, dateMeet, timeMeet,
        detailPost, numPeople, maxParticipants, eventId,
    } = props;

    const navigate = useNavigate();
    const { accessToken, role, userId: currentUserId } = useContext(AuthContext);

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const [username, setUsername] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const [alertMessage, setAlertMessage] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

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

    const handleEndPost = async () => {
        try {
            setOpenConfirmDialog(false);

            // Send a PUT request to update the status of the post
            await axios.put(`http://localhost:8080/api/postGame/${eventId}`, {
                status_post: 'unActive',
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setAlertMessage({
                open: true,
                message: 'The event has been successfully marked as inactive.',
                severity: 'success',
            });

            // Optionally, refresh the page or redirect to the home page after a short delay
            setTimeout(() => {
                setAlertMessage({ open: false, message: '', severity: 'success' });
                navigate('/'); // Redirect or refresh the page
            }, 500); // 0.5 seconds delay before redirecting
        } catch (error) {
            console.error('Failed to delete post', error);
            setAlertMessage({
                open: true,
                message: 'Failed to delete the post. Please try again.',
                severity: 'error',
            });
            setTimeout(() => {
                setAlertMessage({ open: false, message: '', severity: 'error' });
            }, 500);
        }
    };

    const handleCloseAlert = () => {
        setAlertMessage((prev) => ({ ...prev, open: false }));
    };

    const handleConfirmEndPost = () => {
        setOpenConfirmDialog(true);
    };

    const handleCancelEndPost = () => {
        setOpenConfirmDialog(false);
    };

    useEffect(() => {
        const checkEventTime = async () => {
            if (dateMeet && timeMeet) {
                const eventTime = dayjs(`${dateMeet} ${timeMeet}`, 'YYYY-MM-DD HH:mm:ss');
                const currentTime = dayjs();

                if (currentTime.isAfter(eventTime)) {
                    try {
                        // Mark the post as inactive
                        await axios.put(`http://localhost:8080/api/postGame/${eventId}/status`, {
                            status_post: 'unActive',
                        }, {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });

                        // Show notification about the post being inactive
                        setAlertMessage({
                            open: true,
                            message: 'Event time has passed. Post is now inactive.',
                            severity: 'info',
                        });

                        // Delay 0.5 seconds before refreshing the website
                        setTimeout(() => {
                            setAlertMessage({ open: false, message: '', severity: 'info' });
                            window.location.reload(); // Reload the website
                        }, 500); // 0.5 seconds delay
                    } catch (error) {
                        console.error('Failed to update post status', error);
                    }
                }
            }
        };

        const interval = setInterval(checkEventTime, 2000);
        return () => clearInterval(interval);
    }, [dateMeet, timeMeet, eventId, accessToken]);


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
                                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                            >
                                <MenuItem onClick={handleEditPost} id={`event-menu-edit-${eventId}`}>Edit</MenuItem>
                                <MenuItem onClick={handleConfirmEndPost} id={`event-menu-end-${eventId}`}>End Post</MenuItem>
                            </Menu>
                        </>
                    )
                }
                title={username || 'Unknown User'}
                subheader={postTime ? dayjs(postTime).format('MMM DD, YYYY') : 'Unknown Date'}
            />
            <CardMedia
                component="img"
                height="194"
                image={image || 'https://via.placeholder.com/150'}
                alt={nameGames || 'No game image'}
                id={`event-image-${eventId}`}
            />
            <CardContent>
                <Typography variant="h5" color="text.secondary" id={`event-title-${eventId}`}>
                    {nameGames || 'Unknown Game'}
                </Typography>
                <Typography variant="body2" color="text.secondary" id={`event-date-time-${eventId}`}>
                    {formattedDateMeet} at {formattedTimeMeet}
                </Typography>
                <Typography variant="body2" color="text.secondary" id={`event-detail-${eventId}`}>
                    {detailPost || 'No details available'}
                </Typography>
                <Typography variant="body2" color="text.secondary" id={`event-participants-${eventId}`}>
                    Participants: {numPeople}/{maxParticipants || 'N/A'}
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

            {/* Confirmation Dialog for Ending Post */}
            <Dialog
                open={openConfirmDialog}
                onClose={handleCancelEndPost}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
            >
                <DialogTitle id="confirm-dialog-title">Confirm End Post</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        Are you sure you want to mark this post as inactive? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEndPost} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleEndPost} color="secondary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={alertMessage.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alertMessage.severity} sx={{ width: '100%' }}>
                    {alertMessage.message}
                </Alert>
            </Snackbar>
        </Card>
    );
}

EventCard.propTypes = {
    userId: PropTypes.string.isRequired,
    postTime: PropTypes.string,
    image: PropTypes.string,
    nameGames: PropTypes.string.isRequired,
    dateMeet: PropTypes.string,
    timeMeet: PropTypes.string,
    detailPost: PropTypes.string,
    numPeople: PropTypes.number,
    maxParticipants: PropTypes.number,
    eventId: PropTypes.string.isRequired,
};

export default EventCard;
