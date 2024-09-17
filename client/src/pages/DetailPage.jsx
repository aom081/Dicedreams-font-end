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

    const [event, setEvent] = useState({
        name_games: '',
        detail_post: '',
        num_people: '',
        date_meet: dayjs(),
        time_meet: dayjs(),
        games_image: '',
    });

    const [participants, setParticipants] = useState([]);
    const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: 'success' });
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const loadEventDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/postGame/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const eventData = response.data;

                setEvent({
                    ...eventData,
                    date_meet: dayjs(eventData.date_meet),
                    time_meet: dayjs(eventData.time_meet, "HH:mm"),
                });
                setParticipants(eventData.participants || []);
            } catch (error) {
                console.error('Failed to fetch event details:', error);
                alert('Failed to fetch event details.');
                navigate('/');
            }
        };
        loadEventDetails();
    }, [id, accessToken, navigate]);

    const handleEndPost = async () => {
        try {
            await axios.put(`http://localhost:8080/api/postGame/${id}`, { status_post: 'unActive' }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setAlertMessage({ open: true, message: 'ลบโพสต์นัดเล่น สำเร็จ', severity: 'success' });
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            setAlertMessage({ open: true, message: 'Failed to update post status.', severity: 'error' });
        }
    };

    useEffect(() => {
        if (!event.name_games) return;

        const checkTimeToHidePost = () => {
            const currentTime = dayjs();
            const appointmentTime = dayjs(event.date_meet).set('hour', event.time_meet.hour()).set('minute', event.time_meet.minute());
            if (currentTime.isAfter(appointmentTime)) {
                handleEndPost();
            }
        };
        const intervalId = setInterval(checkTimeToHidePost, 60000);
        return () => clearInterval(intervalId);
    }, [event]);

    const confirmEndPost = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = (confirmed) => {
        setOpenDialog(false);
        if (confirmed) handleEndPost();
    };

    const handleJoinEvent = async () => {
        const participantData = {
            participant_apply_datetime: dayjs().format('MM/DD/YYYY HH:mm:ss'),
            participant_status: 'pending',
            user_id: userId,
            post_games_id: id
        };

        try {
            await axios.post(`http://localhost:8080/api/participate`, participantData, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setAlertMessage({ open: true, message: 'Successfully joined the event!', severity: 'success' });
        } catch (error) {
            setAlertMessage({ open: true, message: 'Failed to join the event.', severity: 'error' });
        }
    };

    const isOwner = userId === event.users_id;

    if (!event.name_games) {
        return <Typography id="loading-message" variant="h6">Loading...</Typography>;
    }

    return (
        <Container id="details-container" maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }}>
            <Paper id="details-paper" elevation={3} sx={{
                padding: { xs: 2, md: 5 },
                marginTop: 4, backgroundColor: '#2c2c2c', color: 'white'
            }}>
                <Typography
                    id="event-name"
                    variant="h4"
                    gutterBottom
                    sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}
                >
                    {event.name_games || 'Untitled Event'}
                </Typography>
                <Typography id="event-date" variant="body1" gutterBottom>
                    {`${event.date_meet.format('MMM DD YYYY')} at ${event.time_meet.format('h:mm A')}`}
                </Typography>

                {event.games_image && (
                    <Box id="event-image-box" sx={{ marginTop: 2, marginBottom: 2 }}>
                        <img id="event-image" src={event.games_image} alt="Event" style={{ width: '100%', height: 'auto' }} />
                    </Box>
                )}

                <Typography id="event-details" variant="body1" gutterBottom>
                    {event.detail_post || '{ No content available }'}
                </Typography>

                <Typography id="event-participant-count" variant="body1" gutterBottom>
                    Participants: {event.num_people || 1}
                </Typography>
                <Grid id="actions-grid" container spacing={2} sx={{ marginTop: 3 }}>
                    {!isOwner && (
                        <Grid item xs={12} sm={6}>
                            <Button
                                id="join-event-button"
                                fullWidth
                                variant="contained"
                                color="error"
                                onClick={handleJoinEvent}
                            >
                                Join
                            </Button>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                        <Button
                            id="return-home-button"
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
                <Paper id="manage-event-paper" elevation={3} sx={{
                    padding: { xs: 2, md: 5 },
                    marginTop: 4, backgroundColor: '#424242', color: 'white'
                }}>
                    <Typography id="manage-event-title" variant="h5" gutterBottom>Manage Event</Typography>
                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <Button
                                id="manage-participants-button"
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
                                id="edit-post-button"
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
                                id="end-post-button"
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

            <Snackbar
                id="snackbar-alert"
                open={alertMessage.open}
                autoHideDuration={3000}
                onClose={() => setAlertMessage({ ...alertMessage, open: false })}
            >
                <Alert onClose={() => setAlertMessage({ ...alertMessage, open: false })}
                    severity={alertMessage.severity} sx={{ width: '100%' }}>
                    {alertMessage.message}
                </Alert>
            </Snackbar>

            <Dialog
                id="confirm-end-dialog"
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>{"End Post?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you really want to end this post? This action is irreversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button id="cancel-end-button" onClick={() => handleDialogClose(false)}>Cancel</Button>
                    <Button id="confirm-end-button" onClick={() => handleDialogClose(true)} color="error">End Post</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DetailsPage;
