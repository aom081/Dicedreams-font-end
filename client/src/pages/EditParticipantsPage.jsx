import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Button, Box, Avatar, Grid, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';

const EditParticipantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role } = useContext(AuthContext);

    const [pendingParticipants, setPendingParticipants] = useState([]);
    const [joinedParticipants, setJoinedParticipants] = useState([]);
    const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: 'success' });

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [participantToRemove, setParticipantToRemove] = useState(null);

    useEffect(() => {
        console.log("Fetching participants for post ID:", id); // Debugging: Fetch participants

        const loadParticipants = async () => {
            if (!userId || !accessToken || role !== 'user') {
                alert('Unauthorized access.');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8080/api/participate/post/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log("Participants fetched:", response.data); // Debugging: Fetch response

                const participants = response.data || [];
                setPendingParticipants(participants.filter(p => p.participant_status === 'pending'));
                setJoinedParticipants(participants.filter(p => p.participant_status === 'approved'));
            } catch (error) {
                console.error('Error fetching participants:', error); // Debugging: Fetch error
                alert('Failed to load participants.');
                navigate('/');
            }
        };

        loadParticipants();
    }, [id, userId, accessToken, role, navigate]);

    const updateParticipantStatus = async (participantId, status) => {
        try {
            const response = await axios.put(`http://localhost:8080/participate/${participantId}`, { participant_status: status }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!response.data) throw new Error('Failed to update status');
            return response.data;
        } catch (error) {
            throw new Error('Failed to update status: ' + error.message);
        }
    };

    const handleApprove = async (part_Id, participant_apply_datetime, participant_status, user_id, post_games_id) => {
        const payload = {
            participant_apply_datetime,
            participant_status: 'approved',
            user_id,
            post_games_id
        };

        try {
            const response = await axios.put(`http://localhost:8080/api/participate/${part_Id}`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setAlertMessage({ open: true, message: 'Participant approved!', severity: 'success' });

            setPendingParticipants(prev => {
                const updatedPending = prev.filter(p => p.part_Id !== part_Id);
                const approvedParticipant = prev.find(p => p.part_Id === part_Id);
                setJoinedParticipants(prevJoined => [...prevJoined, { ...approvedParticipant, participant_status: 'approved' }]);
                return updatedPending;
            });
        } catch (error) {
            console.error('Failed to approve participant:', error);
            setAlertMessage({ open: true, message: 'Failed to approve participant.', severity: 'error' });
        }
    };

    const handleRefuse = async (part_Id, participant_apply_datetime, participant_status, user_id, post_games_id) => {
        const payload = {
            participant_apply_datetime,
            participant_status: 'refused',
            user_id,
            post_games_id
        };

        try {
            const response = await axios.delete(`http://localhost:8080/api/participate/${part_Id}`, {
                data: payload,
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setAlertMessage({ open: true, message: 'Participant refused!', severity: 'success' });
            setPendingParticipants(prev => prev.filter(p => p.part_Id !== part_Id));
        } catch (error) {
            console.error('Failed to refuse participant:', error);
            setAlertMessage({ open: true, message: 'Failed to refuse participant.', severity: 'error' });
        }
    };

    const handleRemove = async (part_Id, participant_apply_datetime, participant_status, user_id, post_games_id) => {
        const payload = {
            participant_apply_datetime,
            participant_status: 'removed',
            user_id,
            post_games_id
        };

        try {
            const response = await axios.delete(`http://localhost:8080/api/participate/${part_Id}`, {
                data: payload,
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setAlertMessage({ open: true, message: 'Participant removed!', severity: 'success' });
            setJoinedParticipants(prev => prev.filter(p => p.part_Id !== part_Id));
        } catch (error) {
            console.error('Failed to remove participant:', error);
            setAlertMessage({ open: true, message: 'Failed to remove participant.', severity: 'error' });
        }
    };

    const handleApproveAll = async () => {
        try {
            await Promise.all(pendingParticipants.map(p => handleApprove(p.part_Id, p.participant_apply_datetime, p.participant_status, p.user_id, p.post_games_id)));
            setAlertMessage({ open: true, message: 'All participants approved!', severity: 'success' });
        } catch (error) {
            console.error('Failed to approve all participants:', error);
            setAlertMessage({ open: true, message: 'Failed to approve all participants.', severity: 'error' });
        }
    };

    const handleRemoveAll = async () => {
        try {
            await Promise.all(joinedParticipants.map(p => handleRemove(p.part_Id, p.participant_apply_datetime, p.participant_status, p.user_id, p.post_games_id)));
            setAlertMessage({ open: true, message: 'All participants removed!', severity: 'success' });
        } catch (error) {
            console.error('Failed to remove all participants:', error);
            setAlertMessage({ open: true, message: 'Failed to remove all participants.', severity: 'error' });
        }
    };


    const handleRemoveClick = (participant) => {
        setParticipantToRemove(participant);
        setConfirmDialogOpen(true);
    };

    const handleRemoveConfirm = async () => {
        try {
            if (participantToRemove) {
                await handleRemove(participantToRemove.part_Id);
                setParticipantToRemove(null);
                setConfirmDialogOpen(false);
            }
        } catch (error) {
            setAlertMessage({ open: true, message: error.message, severity: 'error' });
        }
    };

    return (
        <Container maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }}>
            <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#2c2c2c', color: 'white', position: 'relative' }}>
                <Typography variant="h4" gutterBottom>
                    Manage Participants
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Pending Participants
                </Typography>
                <Grid container spacing={2}>
                    {pendingParticipants.length > 0 ? pendingParticipants.map(participant => (
                        <Grid item xs={12} key={participant.part_Id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                    <Avatar alt={`${participant?.user?.first_name} ${participant?.user?.last_name}`}
                                        src={participant?.user?.user_image || "https://via.placeholder.com/40"} />
                                    <Typography variant="body1" sx={{ marginLeft: 2 }}>
                                        {`${participant?.user?.first_name} ${participant?.user?.last_name}`}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleApprove(participant.part_Id)}>
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRefuse(participant.part_Id)}>
                                        Refuse
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    )) : <Typography>No pending participants.</Typography>}
                </Grid>

                <Button variant="contained" color="success" sx={{ marginTop: 2 }} onClick={handleApproveAll}>
                    Approve All
                </Button>

                <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>
                    Joined Participants
                </Typography>
                <Grid container spacing={2}>
                    {joinedParticipants.length > 0 ? joinedParticipants.map(participant => (
                        <Grid item xs={12} key={participant.part_Id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                    <Avatar alt={`${participant?.user?.first_name} ${participant?.user?.last_name}`}
                                        src={participant?.user?.user_image || "https://via.placeholder.com/40"} />
                                    <Typography variant="body1" sx={{ marginLeft: 2 }}>
                                        {`${participant?.user?.first_name} ${participant?.user?.last_name}`}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRemoveClick(participant)}>
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    )) : <Typography>No joined participants.</Typography>}
                </Grid>

                <Button variant="contained" color="error" sx={{ marginTop: 2 }} onClick={handleRemoveAll}>
                    Remove All
                </Button>
                <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                    <Button variant="contained" color="primary" onClick={() => navigate(`/events/${id}`)}>
                        Return to Details Page
                    </Button>
                </Box>
            </Paper>

            <Snackbar open={alertMessage.open} autoHideDuration={6000} onClose={() => setAlertMessage({ ...alertMessage, open: false })}>
                <Alert onClose={() => setAlertMessage({ ...alertMessage, open: false })} severity={alertMessage.severity}>
                    {alertMessage.message}
                </Alert>
            </Snackbar>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Confirm Removal</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove this participant?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleRemoveConfirm} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EditParticipantsPage;
