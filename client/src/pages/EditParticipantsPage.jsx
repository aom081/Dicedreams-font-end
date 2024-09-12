import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Button, Box, Avatar, Grid, Snackbar, Alert } from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';

const EditParticipantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role } = useContext(AuthContext);

    const [waitingParticipants, setWaitingParticipants] = useState([]);
    const [joinedParticipants, setJoinedParticipants] = useState([]);
    const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const loadParticipants = async () => {
            if (!userId || !accessToken || role !== 'user') {
                alert('Unauthorized access.');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${id}/participants`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const participants = response.data.participants || [];
                setWaitingParticipants(participants.filter(p => p.status === 'waiting'));
                setJoinedParticipants(participants.filter(p => p.status === 'joined'));
            } catch (error) {
                alert('Failed to load participants.');
                navigate('/');
            }
        };
        loadParticipants();
    }, [id, userId, accessToken, role, navigate]);

    const handleApprove = async (participantId) => {
        try {
            await axios.put(`https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${id}/participants/${participantId}/approve`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setAlertMessage({ open: true, message: 'Participant approved!', severity: 'success' });
            setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
            const approvedParticipant = waitingParticipants.find(p => p.id === participantId);
            setJoinedParticipants(prev => [...prev, { ...approvedParticipant, status: 'joined' }]);
        } catch (error) {
            setAlertMessage({ open: true, message: 'Failed to approve participant.', severity: 'error' });
        }
    };

    const handleRemove = async (participantId) => {
        try {
            await axios.put(`https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${id}/participants/${participantId}/remove`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setAlertMessage({ open: true, message: 'Participant removed!', severity: 'success' });
            setJoinedParticipants(prev => prev.filter(p => p.id !== participantId));
        } catch (error) {
            setAlertMessage({ open: true, message: 'Failed to remove participant.', severity: 'error' });
        }
    };

    return (
        <Container maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }}>
            <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#2c2c2c', color: 'white' }}>
                <Typography variant="h4" gutterBottom>Manage Participants</Typography>

                <Typography variant="h6" gutterBottom>Waiting Participants</Typography>
                <Grid container spacing={2}>
                    {waitingParticipants.length > 0 ? waitingParticipants.map(participant => (
                        <Grid item xs={12} key={participant.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Avatar alt={participant.username} src={participant.user_image || "https://via.placeholder.com/40"} />
                                <Typography variant="body1">{participant.username}</Typography>
                                <Button variant="contained" color="success" onClick={() => handleApprove(participant.id)}>Approve</Button>
                            </Box>
                        </Grid>
                    )) : <Typography>No waiting participants.</Typography>}
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>Joined Participants</Typography>
                <Grid container spacing={2}>
                    {joinedParticipants.length > 0 ? joinedParticipants.map(participant => (
                        <Grid item xs={12} key={participant.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Avatar alt={participant.username} src={participant.user_image || "https://via.placeholder.com/40"} />
                                <Typography variant="body1">{participant.username}</Typography>
                                <Button variant="contained" color="error" onClick={() => handleRemove(participant.id)}>Remove</Button>
                            </Box>
                        </Grid>
                    )) : <Typography>No joined participants.</Typography>}
                </Grid>
            </Paper>

            <Snackbar
                open={alertMessage.open}
                autoHideDuration={3000}
                onClose={() => setAlertMessage({ open: false })}>
                <Alert onClose={() => setAlertMessage({ open: false })} severity={alertMessage.severity}>
                    {alertMessage.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EditParticipantsPage;
