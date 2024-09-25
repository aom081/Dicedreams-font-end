import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Paper, Typography, Button, Box, Snackbar, Alert, AlertTitle, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle, Grid
} from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';
import dayjs from 'dayjs';
import Chat from '../components/Chat'; // Importing Chat component

const DetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role, username } = useContext(AuthContext);

    const [event, setEvent] = useState({
        name_games: '',
        detail_post: '',
        num_people: '',
        date_meet: dayjs(),
        time_meet: dayjs(),
        games_image: '',
        chat_id: '', // Add chat_id to initial state
    });

    const [participants, setParticipants] = useState([]);
    const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: 'success' });
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const loadEventDetails = async () => {
            try {
                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const eventData = response.data;

                setEvent({
                    ...eventData,
                    date_meet: dayjs(eventData.date_meet),
                    time_meet: dayjs(eventData.time_meet, "HH:mm"),
                    chat_id: eventData.chat_id || '', // Ensure chat_id is set
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
            await axios.put(`https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${id}`, { status_post: 'unActive' }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setAlertMessage({ open: true, message: 'Post successfully ended', severity: 'success' });
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            setAlertMessage({ open: true, message: 'Failed to end post.', severity: 'error' });
        }
    };

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
            await axios.post(`https://dicedreams-backend-deploy-to-render.onrender.com/api/participate`, participantData, {
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
                <Typography id="event-name" variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
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
                            onClick={() => navigate(-1)}
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

            {/* Chat Component */}
            <Chat
                userId={userId}
                username={username}
                chat_id={event.chat_id}
                post_games_id={id} // Pass the post_games_id correctly
            />

            {/* Confirmation Dialog */}
            <Dialog 
            id="end-post-dialog" 
            open={openDialog} 
            onClose={() => handleDialogClose(false)}>
                <DialogTitle id="end-post-dialog-title">End Post</DialogTitle>
                <DialogContent id="end-post-dialog-content">
                    <DialogContentText id="end-post-dialog-content-text">
                        คุณแน่ใจหรือไม่ว่าต้องการจบโพสต์นี้
                    </DialogContentText>
                </DialogContent>
                <DialogActions id="end-post-dialog-actions">
                    <Button onClick={() => handleDialogClose(false)} id="cancel-end-post-button" color='primary'>ยกเลิก</Button>
                    <Button onClick={() => handleDialogClose(true)} id="confirm-end-post-button" color="error">
                        ยืนยัน
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={alertMessage.open}
                autoHideDuration={6000}
                onClose={() => setAlertMessage({ ...alertMessage, open: false })}
                id="details-snackbar"
                sx={{ width: "100%" }} // Adjusting width of the Snackbar
            >
                <Alert
                    onClose={() => setAlertMessage({ ...alertMessage, open: false })}
                    severity={alertMessage.severity}
                    sx={{ width: "80%", fontSize: "1rem" }} // Setting width of the Alert and font size for message
                >
                    <AlertTitle sx={{ fontSize: "1.50rem" }}> {/* Alert title font size */}
                        {alertMessage.severity === "error" ? "Error" : "Success"}
                    </AlertTitle>
                    {alertMessage.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default DetailsPage;
