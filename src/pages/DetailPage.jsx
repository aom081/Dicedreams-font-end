import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Paper, Typography, Button, Box, Snackbar, Alert, AlertTitle, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Avatar
} from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';
import dayjs from 'dayjs';
import Chat from '../components/Chat'; // Importing Chat component
import UserAvatar from '../components/UserAvatar';

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
        owner_name: '',
        owner_image: '',
        users_id: '', // Owner's user ID
    });

    const [participants, setParticipants] = useState([]);
    const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: 'success' });
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const loadEventDetails = async () => {
            try {
                // Fetch event details
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

                // Fetch participants separately
                const participantsResponse = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/post/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const participantsData = participantsResponse.data;

                // Log participants data to console
                console.log("Participants Data:", participantsData);

                setParticipants(participantsData || []);

            } catch (error) {
                console.error('Failed to fetch event details or participants:', error);
                alert('ไม่สามารถเรียกรายละเอียดกิจกรรมหรือผู้เข้าร่วมได้');
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
            setAlertMessage({ open: true, message: 'สิ้นสุดการโพสต์เรียบร้อยแล้ว', severity: 'success' });
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            setAlertMessage({ open: true, message: 'ไม่สามารถอัปเดตสถานะโพสต์ได้', severity: 'error' })
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
            setAlertMessage({ open: true, message: 'เข้าร่วมงานสำเร็จ!', severity: 'success' });

            // Reload participants after joining
            const participantsResponse = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/post/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const participantsData = participantsResponse.data;
            setParticipants(participantsData || []);

        } catch (error) {
            setAlertMessage({ open: true, message: 'ไม่สามารถเข้าร่วมกิจกรรมได้', severity: 'error' });
        }
    };

    const isOwner = userId === event.users_id;

    // Check if the user has already been approved as a participant
    const isApprovedParticipant = participants.some(
        (participant) => participant.user_id === userId && participant.participant_status === 'approved'
    );

    // Check if the user has a pending participant status
    const isPendingParticipant = participants.some(
        (participant) => participant.user_id === userId && participant.participant_status === 'pending'
    );

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
                    {!isOwner && !isApprovedParticipant && !isPendingParticipant && (
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
                    {!isOwner && isApprovedParticipant && (
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1" color="success.main">
                                คุณได้รับการอนุมัติให้เข้าร่วมกิจกรรมนี้แล้ว
                            </Typography>
                        </Grid>
                    )}
                    {!isOwner && isPendingParticipant && (
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1" color="warning.main">
                                คุณได้ทำการขอเข้าร่วมแล้วกรุณารอยืนยัน
                            </Typography>
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
                    <Typography id="manage-event-title" variant="h5" gutterBottom>Manage post game</Typography>
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
                                variant="contained"
                                color="error"
                                onClick={confirmEndPost}
                            >
                                End Post
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <Paper elevation={3}
                id="logo-participant"
                sx={{
                    padding: { xs: 2, md: 5 },
                    marginTop: 4, backgroundColor: '#2c2c2c', color: 'white'
                }}>
                {/* Participants Display Section */}
                <Typography id="participant-list-title" variant="h6" gutterBottom>
                    Participants
                </Typography>
                <Box id="participant-images-box" sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: 2 }}>
                    {/* Render the owner first */}
                    <Box id="owner-image" sx={{ textAlign: 'center' }}>
                        <Avatar
                            id="owner-avatar"
                            alt={event.owner_name}
                            src={event.owner_image || '/default-avatar.png'} // Ensure this path is correct
                            sx={{ width: 50, height: 50, marginBottom: 1 }}
                        />
                        <Typography variant="body2">{event.owner_name}</Typography>
                        <Typography variant="caption" color="textSecondary">(Owner)</Typography>
                    </Box>

                    {/* Render other participants */}
                    {participants.map((participant, index) => {
                        const { user } = participant;
                        const fullName = `${user.first_name} ${user.last_name}`;
                        const BASE_URL = 'https://dicedreams-backend-deploy-to-render.onrender.com'; // Replace with your actual base URL
                        const avatarSrc = user.user_image ? `${BASE_URL}/path/to/images/${user.user_image}` : '/default-avatar.png';

                        return (
                            <Box
                                key={participant.part_Id}
                                sx={{
                                    display: 'flex',            // Enables Flexbox
                                    flexDirection: 'column',    // Stacks children vertically
                                    alignItems: 'center',       // Centers children horizontally
                                    textAlign: 'center',        // Centers text within Typography
                                    padding: 1,                  // Optional: Adds padding for better spacing
                                }}
                            >
                                <Avatar
                                    alt={fullName}
                                    src={avatarSrc}
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        marginBottom: 1,
                                    }}
                                />
                                <Typography variant="body2">
                                    {fullName}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Paper>

            {/* Chat component */}
            <Chat
                userId={userId}
                username={username}
                accessToken={accessToken}
                chatId={event.chat_id}
            />

            {/* Snackbar for success/error messages */}
            <Snackbar
                open={alertMessage.open}
                autoHideDuration={2000}
                onClose={() => setAlertMessage({ ...alertMessage, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={alertMessage.severity}
                    onClose={() => setAlertMessage({ ...alertMessage, open: false })}
                >
                    <AlertTitle>{alertMessage.severity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    {alertMessage.message}
                </Alert>
            </Snackbar>

            {/* End Post Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => handleDialogClose(false)}
                aria-labelledby="confirm-end-dialog-title"
                aria-describedby="confirm-end-dialog-description"
            >
                <DialogTitle id="confirm-end-dialog-title">Confirm End Post</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-end-dialog-description">
                        คุณแน่ใจหรือไม่ว่าต้องการจบโพสต์นี้? การกระทำนี้ไม่สามารถยกเลิกได้
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)} color="primary">
                        ยกเลิก
                    </Button>
                    <Button onClick={() => handleDialogClose(true)} color="error">
                        End Post
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DetailsPage;
