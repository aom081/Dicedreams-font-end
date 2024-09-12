import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Paper, Typography, Button, Box, Avatar, TextField,
    Snackbar, Alert, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Grid
} from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';
import dayjs from 'dayjs';

const DetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: 'success' });
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const loadEventDetails = async () => {
            if (!userId || !accessToken || role !== 'user') {
                alert('Unauthorized access.');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api-docs/postGame/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setEvent(response.data);
                setParticipants(response.data.participants || []);
            } catch (error) {
                alert('Failed to fetch event details.');
                navigate('/');
            }
        };
        loadEventDetails();
    }, [id, userId, accessToken, role, navigate]);

    const handleEndPost = async () => {
        try {
            await axios.put(`https://dicedreams-backend-deploy-to-render.onrender.com/api-docs/postGame/${id}`, { status_post: 'unActive' }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setAlertMessage({ open: true, message: 'ลบโพสต์นัดเล่น สำเร็จ', severity: 'success' });
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            setAlertMessage({ open: true, message: 'Failed to update post status.', severity: 'error' });
        }
    };

    useEffect(() => {
        if (!event) return;
        const checkTimeToHidePost = () => {
            const currentTime = dayjs();
            const appointmentTime = dayjs(`${event.date_meet} ${event.time_meet}`);
            if (currentTime.isAfter(appointmentTime)) handleEndPost();
        };
        const intervalId = setInterval(checkTimeToHidePost, 60000);
        return () => clearInterval(intervalId);
    }, [event]);

    const confirmEndPost = () => setOpenDialog(true);

    const handleDialogClose = (confirmed) => {
        setOpenDialog(false);
        if (confirmed) handleEndPost();
    };

    if (!event) return <Typography variant="h6">Loading...</Typography>;

    const isOwner = userId === event.users_id;

    return (
        <Container maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }}>
            <Paper elevation={3} sx={{
                padding: { xs: 2, md: 5 },
                marginTop: 4, backgroundColor: '#2c2c2c', color: 'white'
            }}>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}
                >
                    {event.name_games || 'Untitled Event'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    {`${dayjs(event.date_meet).format('MMM DD YYYY')} at ${dayjs(event.time_meet, 'HH:mm:ss').format('h:mm A')}`}
                </Typography>

                {event.image && (
                    <Box sx={{ marginTop: 2, marginBottom: 2 }}>
                        <img src={event.image} alt="Event" style={{ width: '100%', height: 'auto' }} />
                    </Box>
                )}

                <Typography variant="body1" gutterBottom>
                    {event.detail_post || 'No content available'}
                </Typography>

                <Typography variant="body1" gutterBottom>
                    Participants: {event.num_people || 1}
                </Typography>
                <Grid container spacing={2} sx={{ marginTop: 3 }}>
                    {!isOwner && (
                        <Grid item xs={12} sm={6}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="error"
                                onClick={() => navigate('/join-event', { state: { eventId: id } })}
                            >
                                Join
                            </Button>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/')}
                        >
                            Return to Home
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            {isOwner && (
                <Paper elevation={3} sx={{
                    padding: { xs: 2, md: 5 },
                    marginTop: 4, backgroundColor: '#424242', color: 'white'
                }}>
                    <Typography variant="h5" gutterBottom>Manage Event</Typography>
                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/edit-participants/${id}`)}
                            >
                                Manage Participants
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/edit-event/${id}`)}
                            >
                                Edit Post
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                onClick={confirmEndPost}
                            >
                                End Post
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <Paper elevation={3} sx={{
                padding: { xs: 2, md: 5 },
                marginTop: 4, backgroundColor: '#2c2c2c', color: 'white'
            }}>
                <Typography variant="h5" gutterBottom>Participants</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {participants.length > 0 ? participants.map((participant, index) => (
                        <Avatar key={index} alt={participant.username} src={participant.user_image || "https://via.placeholder.com/40"} />
                    )) : (
                        <Typography variant="body2" color="text.secondary">
                            No participants yet.
                        </Typography>
                    )}
                </Box>
            </Paper>

            <Paper elevation={3} sx={{
                padding: { xs: 2, md: 5 },
                marginTop: 4, backgroundColor: '#2c2c2c', color: 'white'
            }}>
                <Typography variant="h5" gutterBottom>Comments</Typography>
                <TextField
                    label="Leave a comment..."
                    variant="outlined"
                    multiline
                    fullWidth
                    rows={4}
                    sx={{ marginTop: 2, marginBottom: 2, backgroundColor: 'white' }}
                />
                <Button variant="contained" color="primary" sx={{ marginTop: 3 }}>
                    Submit Comment
                </Button>
            </Paper>

            <Snackbar
                open={alertMessage.open}
                autoHideDuration={3000}
                onClose={() => setAlertMessage({ open: false })}>
                <Alert onClose={() => setAlertMessage({ open: false })} severity={alertMessage.severity}>
                    {alertMessage.message}
                </Alert>
            </Snackbar>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm End Post</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to end this post?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)} color="primary">Cancel</Button>
                    <Button onClick={() => handleDialogClose(true)} color="error">End Post</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DetailsPage;

