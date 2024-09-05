import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Paper, Typography, Button, Box, Avatar, TextField,
    Snackbar, Alert, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle
} from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';
import dayjs from 'dayjs';

const DetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [isPostHidden, setIsPostHidden] = useState(false);
    const [participants, setParticipants] = useState([]); // Assuming you fetch participants
    const [alertMessage, setAlertMessage] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const [openDialog, setOpenDialog] = useState(false); // State for managing dialog visibility

    useEffect(() => {
        if (!userId || !accessToken || !role) {
            alert('Please log in to access this page.');
            navigate('/login');
            return;
        }

        if (role !== 'user') {
            alert('You do not have permission to access this page.');
            navigate('/login');
            return;
        }

        const loadEventDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/postGame/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'users_id': userId,
                    },
                });

                console.log('Event details:', response.data);
                setEvent(response.data);
                setParticipants(response.data.participants || []); // Adjust based on your API response
            } catch (error) {
                console.error('Failed to fetch event details', error);
                alert('Failed to fetch event details. Please try again later.');
                navigate('/');
            }
        };

        loadEventDetails();
    }, [id, userId, accessToken, role, navigate]);

    const notifyUserBeforeEndPost = () => {
        setAlertMessage({
            open: true,
            message: 'The post will be ended shortly.',
            severity: 'info',
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000); // Notify for 2 seconds before proceeding
        });
    };

    const handleEndPost = async () => {
        try {
            await notifyUserBeforeEndPost(); // Notify the user before ending the post

            // Send a PUT request to update the status of the post
            await axios.put(`http://localhost:8080/api/postGame/${id}`, {
                status_post: 'unActive', // Update the status to 'unActive'
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setAlertMessage({
                open: true,
                message: 'Post has been marked as unActive successfully.',
                severity: 'success',
            });

            setTimeout(() => {
                setAlertMessage({ open: false, message: '', severity: 'success' });
                navigate('/'); // Redirect to home or another appropriate page
            }, 1500); // 1.5 seconds delay before resetting the alert
        } catch (error) {
            console.error('Failed to update post status', error);
            setAlertMessage({
                open: true,
                message: 'Failed to update the post status. Please try again.',
                severity: 'error',
            });
            setTimeout(() => {
                setAlertMessage({ open: false, message: '', severity: 'error' });
            }, 1500);
        }
    };


    // Automatically hide the post when current time matches appointment time
    useEffect(() => {
        if (!event) return;

        const checkTimeToHidePost = () => {
            const currentTime = dayjs();
            const appointmentTime = dayjs(`${event.date_meet} ${event.time_meet}`);

            if (currentTime.isAfter(appointmentTime)) {
                handleEndPost(); // End the post automatically
            }
        };

        // Initial check
        checkTimeToHidePost();

        // Set interval to check every minute
        const intervalId = setInterval(checkTimeToHidePost, 60000); // 60,000 ms = 1 minute

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [event]);

    const confirmEndPost = () => {
        setOpenDialog(true); // Show confirmation dialog
    };

    const handleDialogClose = (confirmed) => {
        setOpenDialog(false);
        if (confirmed) {
            handleEndPost(); // Proceed with deletion if confirmed
        }
    };

    if (isPostHidden) {
        return null; // Do not render the page if the post is hidden
    }

    if (!event) {
        return <Typography variant="h6" id="loading">Loading...</Typography>;
    }

    const {
        name_games,
        detail_post,
        num_people,
        date_meet,
        time_meet,
        users_id: eventOwnerId,
        image,
    } = event;

    const isOwner = userId === eventOwnerId;

    return (
        <Container maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }} id="details-page">
            <Paper elevation={3} sx={{ padding: 5, marginTop: 4, backgroundColor: '#2c2c2c', color: 'white' }} id="event-details">
                <Typography variant="h4" gutterBottom id="event-name">
                    {name_games || 'Untitled Event'}
                </Typography>
                <Typography variant="body1" gutterBottom id="event-date-time">
                    {`${dayjs(date_meet).format('MMM DD YYYY')} at ${dayjs(time_meet, 'HH:mm:ss').format('h:mm A')}`}
                </Typography>
                {image && (
                    <Box sx={{ marginTop: 2, marginBottom: 2 }}>
                        <img src={image} alt="Event" style={{ width: '100%', height: 'auto' }} />
                    </Box>
                )}
                <Typography variant="body1" gutterBottom id="event-detail">
                    {detail_post || 'No content available'}
                </Typography>
                <Typography variant="body1" gutterBottom id="event-location">
                    Location: ร้าน Outcast Gaming
                </Typography>
                <Typography variant="body1" gutterBottom id="event-participants">
                    Participants: {num_people || 1}
                </Typography>

                {/* Buttons for Event Owner */}
                {isOwner ? (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/')}
                            sx={{ marginTop: 3 }}
                            id="return-home-button"
                        >
                            Return to Home
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/edit-participants/${id}`)}
                            sx={{ marginTop: 3, marginLeft: 2 }}
                            id="edit-participants-button"
                        >
                            Edit Participants
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/edit-event/${id}`)}
                            sx={{ marginTop: 3, marginLeft: 2 }}
                            id="edit-post-button"
                        >
                            Edit Post
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={confirmEndPost}
                            sx={{ marginTop: 3, marginLeft: 2 }}
                            id="end-post-button"
                        >
                            End Post
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => navigate('/join-event', { state: { eventId: id } })}
                            sx={{ marginTop: 3 }}
                            id="join-button"
                        >
                            Join
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/')}
                            sx={{ marginTop: 3, marginLeft: 2 }}
                            id="return-home-button"
                        >
                            Return to Home
                        </Button>
                    </>
                )}
            </Paper>

            <Paper elevation={3} sx={{ padding: 5, marginTop: 4, backgroundColor: '#2c2c2c', color: 'white' }} id="participants-section">
                <Typography variant="h5" gutterBottom id="participants-title">
                    Participants
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    {participants.length > 0 ? (
                        participants.map((participant, index) => (
                            <Avatar
                                key={index}
                                alt={participant.username}
                                src={participant.user_image || "https://via.placeholder.com/40"}
                                id={`participant-avatar-${index + 1}`}
                            />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No participants yet.
                        </Typography>
                    )}
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ padding: 5, marginTop: 4, backgroundColor: '#2c2c2c', color: 'white' }} id="comments-section">
                <Typography variant="h5" gutterBottom id="comments-title">
                    Comments
                </Typography>
                <TextField
                    id="comment-input"
                    label="Leave a comment..."
                    variant="outlined"
                    multiline
                    fullWidth
                    rows={4}
                    sx={{ marginTop: 2, marginBottom: 2, backgroundColor: 'white' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 3, marginLeft: 2 }}
                    id="submit-comment-button"
                >
                    Submit Comment
                </Button>
            </Paper>

            <Snackbar
                open={alertMessage.open}
                autoHideDuration={6000}
                onClose={() => setAlertMessage({ open: false, message: '', severity: 'success' })}
                id="notification"
            >
                <Alert
                    onClose={() => setAlertMessage({ open: false, message: '', severity: 'success' })}
                    severity={alertMessage.severity}
                    sx={{ width: '100%' }}
                >
                    {alertMessage.message}
                </Alert>
            </Snackbar>

            {/* Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => handleDialogClose(false)}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
            >
                <DialogTitle id="confirm-dialog-title">{"Confirm End Post"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        Are you sure you want to end this post? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)} color="primary" id="cancel-button">
                        Cancel
                    </Button>
                    <Button onClick={() => handleDialogClose(true)} color="error" id="confirm-end-button">
                        End Post
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DetailsPage;
