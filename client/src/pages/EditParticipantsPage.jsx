import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Button, Box, Avatar, Grid, Snackbar, Alert } from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';

const EditParticipantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role } = useContext(AuthContext);

    const [pendingParticipants, setPendingParticipants] = useState([]);
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
                console.log('Fetching participants for post ID:', id);
                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/post/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log('API response:', response.data);

                const participants = response.data || [];
                setPendingParticipants(participants.filter(p => p.participant_status === 'pending'));
                setJoinedParticipants(participants.filter(p => p.participant_status === 'joined'));

                console.log('Pending participants:', participants.filter(p => p.participant_status === 'pending'));
                console.log('Joined participants:', participants.filter(p => p.participant_status === 'joined'));
            } catch (error) {
                console.error('Error fetching participants:', error);
                alert('Failed to load participants.');
                navigate('/');
            }
        };
        loadParticipants();
    }, [id, userId, accessToken, role, navigate]);

    const handleApprove = async (participantId) => {
        try {
            console.log('Approving participant with ID:', participantId);
            await axios.put(`https://dicedreams-backend-deploy-to-render.onrender.com/participate/${id}`, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setAlertMessage({ open: true, message: 'Participant approved!', severity: 'success' });
            setPendingParticipants(prev => prev.filter(p => p.participant_id !== participantId));
            const approvedParticipant = pendingParticipants.find(p => p.participant_id === participantId);
            setJoinedParticipants(prev => [...prev, { ...approvedParticipant, participant_status: 'joined' }]);

            console.log('Approved participant:', approvedParticipant);
            console.log('Updated pending participants:', pendingParticipants);
            console.log('Updated joined participants:', joinedParticipants);
        } catch (error) {
            console.error('Failed to approve participant:', error);
            setAlertMessage({ open: true, message: 'Failed to approve participant.', severity: 'error' });
        }
    };

    const handleRemove = async (participantId) => {
        try {
            console.log('Removing participant with ID:', participantId);
            await axios.delete(`https://dicedreams-backend-deploy-to-render.onrender.com/participate/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setAlertMessage({ open: true, message: 'Participant removed!', severity: 'success' });
            setJoinedParticipants(prev => prev.filter(p => p.participant_id !== participantId));

            console.log('Participant removed:', participantId);
            console.log('Updated joined participants:', joinedParticipants);
        } catch (error) {
            console.error('Failed to remove participant:', error);
            setAlertMessage({ open: true, message: 'Failed to remove participant.', severity: 'error' });
        }
    };

    const handleApproveAll = async () => {
        try {
            console.log('Approving all pending participants:', pendingParticipants);
            await Promise.all(pendingParticipants.map(p => handleApprove(p.participant_id)));
            setAlertMessage({ open: true, message: 'All participants approved!', severity: 'success' });
            console.log('All participants approved');
        } catch (error) {
            console.error('Failed to approve all participants:', error);
            setAlertMessage({ open: true, message: 'Failed to approve all participants.', severity: 'error' });
        }
    };

    const handleRemoveAll = async () => {
        try {
            console.log('Removing all joined participants:', joinedParticipants);
            await Promise.all(joinedParticipants.map(p => handleRemove(p.participant_id)));
            setAlertMessage({ open: true, message: 'All participants removed!', severity: 'success' });
            console.log('All participants removed');
        } catch (error) {
            console.error('Failed to remove all participants:', error);
            setAlertMessage({ open: true, message: 'Failed to remove all participants.', severity: 'error' });
        }
    };

    const handleRefuse = async (participantId) => {
        try {
            console.log('Refusing participant with ID:', participantId);
            await axios.delete(`https://dicedreams-backend-deploy-to-render.onrender.com/participate/${id}/refuse/${participantId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setAlertMessage({ open: true, message: 'Participant refused!', severity: 'success' });
            setPendingParticipants(prev => prev.filter(p => p.participant_id !== participantId));

            console.log('Participant refused:', participantId);
            console.log('Updated pending participants:', pendingParticipants);
        } catch (error) {
            console.error('Failed to refuse participant:', error);
            setAlertMessage({ open: true, message: 'Failed to refuse participant.', severity: 'error' });
        }
    };

    return (
        <Container
            id="edit-participants-page-container"
            maxWidth="md"
            sx={{ padding: '2rem 0', marginTop: '2rem' }}
        >
            <Paper
                id="edit-participants-page-paper"
                elevation={3}
                sx={{ padding: 4, backgroundColor: '#2c2c2c', color: 'white', position: 'relative' }}
            >
                <Typography id="edit-participants-page-title" variant="h4" gutterBottom>
                    Manage Participants
                </Typography>

                <Typography id="pending-participants-title" variant="h6" gutterBottom>
                    Pending Participants
                </Typography>
                <Grid container spacing={2} id="pending-participants-grid">
                    {pendingParticipants.length > 0 ? pendingParticipants.map(participant => (
                        <Grid item xs={12} key={participant.participant_id} id={`pending-participant-${participant.participant_id}`}>
                            <Box id={`pending-participant-box-${participant.participant_id}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                    <Avatar id={`pending-participant-avatar-${participant.participant_id}`} alt={`${participant.first_name} ${participant.last_name}`} src={participant.user_image || "https://via.placeholder.com/40"} />
                                    <Typography id={`pending-participant-name-${participant.participant_id}`} variant="body1" sx={{ marginLeft: 2 }}>
                                        {`${participant.first_name} ${participant.last_name}`}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button id={`approve-button-${participant.participant_id}`} variant="contained" color="success" onClick={() => handleApprove(participant.participant_id)}>
                                        Approve
                                    </Button>
                                    <Button id={`refuse-button-${participant.participant_id}`} variant="outlined" color="error" onClick={() => handleRefuse(participant.participant_id)}>
                                        Refuse
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    )) : <Typography id="no-pending-participants">No pending participants.</Typography>}
                </Grid>

                <Button id="approve-all-button" variant="contained" color="success" sx={{ marginTop: 2 }} onClick={handleApproveAll}>
                    Approve All
                </Button>

                <Typography id="joined-participants-title" variant="h6" gutterBottom sx={{ marginTop: 4 }}>
                    Joined Participants
                </Typography>
                <Grid container spacing={2} id="joined-participants-grid">
                    {joinedParticipants.length > 0 ? joinedParticipants.map(participant => (
                        <Grid item xs={12} key={participant.participant_id} id={`joined-participant-${participant.participant_id}`}>
                            <Box id={`joined-participant-box-${participant.participant_id}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                    <Avatar id={`joined-participant-avatar-${participant.participant_id}`} alt={`${participant.first_name} ${participant.last_name}`} src={participant.user_image || "https://via.placeholder.com/40"} />
                                    <Typography id={`joined-participant-name-${participant.participant_id}`} variant="body1" sx={{ marginLeft: 2 }}>
                                        {`${participant.first_name} ${participant.last_name}`}
                                    </Typography>
                                </Box>
                                <Button id={`remove-button-${participant.participant_id}`} variant="contained" color="error" onClick={() => handleRemove(participant.participant_id)}>
                                    Remove
                                </Button>
                            </Box>
                        </Grid>
                    )) : <Typography id="no-joined-participants">No joined participants.</Typography>}
                </Grid>

                <Button id="remove-all-button" variant="contained" color="error" sx={{ marginTop: 2 }} onClick={handleRemoveAll}>
                    Remove All
                </Button>
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                    }}
                >
                    <Button
                        id="return-button"
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/events/${id}`)}
                    >
                        Return to Details Page
                    </Button>
                </Box>
                <Snackbar open={alertMessage.open} autoHideDuration={3000} onClose={() => setAlertMessage({ ...alertMessage, open: false })}>
                    <Alert onClose={() => setAlertMessage({ ...alertMessage, open: false })} severity={alertMessage.severity} sx={{ width: '100%' }}>
                        {alertMessage.message}
                    </Alert>
                </Snackbar>
            </Paper>
        </Container>
    );
};

export default EditParticipantsPage;
