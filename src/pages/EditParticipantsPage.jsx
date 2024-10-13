import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Button, Box, Avatar, Grid, Snackbar, Alert, AlertTitle, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
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
    const [refuseDialogOpen, setRefuseDialogOpen] = useState(false);
    const [participantToRefuse, setParticipantToRefuse] = useState(null);

    useEffect(() => {
        console.log("Fetching participants for post ID:", id); // Debugging: Fetch participants

        const loadParticipants = async () => {
            if (!userId || !accessToken || role !== 'user') {
                alert('Unauthorized access.');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/post/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log("Participants fetched:", response.data); // Debugging: Fetch response

                const participants = response.data || [];
                setPendingParticipants(participants.filter(p => p.participant_status === 'pending'));
                setJoinedParticipants(participants.filter(p => p.participant_status === 'approved'));
            } catch (error) {
                console.error('Error fetching participants:', error); // Debugging: Fetch error
                alert('โหลดผู้เข้าร่วมไม่สำเร็จ');
                navigate('/');
            }
        };

        loadParticipants();
    }, [id, userId, accessToken, role, navigate]);

    const handleApprove = async (part_Id, participant_apply_datetime, participant_status, user_id, post_games_id) => {
        const payload = {
            participant_apply_datetime,
            participant_status: 'approved',
            user_id,
            post_games_id
        };

        try {
            const response = await axios.put(`https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/${part_Id}`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setAlertMessage({ open: true, message: 'ผู้เข้าร่วมได้รับการอนุมัติแล้ว!', severity: 'success' });

            setPendingParticipants(prev => {
                const updatedPending = prev.filter(p => p.part_Id !== part_Id);
                const approvedParticipant = prev.find(p => p.part_Id === part_Id);
                setJoinedParticipants(prevJoined => [...prevJoined, { ...approvedParticipant, participant_status: 'approved' }]);
                return updatedPending;
            });
        } catch (error) {
            console.error('Failed to approve participant:', error);
            setAlertMessage({ open: true, message: 'อนุมัติผู้เข้าร่วมไม่สำเร็จ', severity: 'error' });
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
            const response = await axios.delete(`https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/${part_Id}`, {
                data: payload,
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            setAlertMessage({ open: true, message: 'ผู้เข้าร่วมถูกลบออก!', severity: 'success' });
            setJoinedParticipants(prev => prev.filter(p => p.part_Id !== part_Id));
        } catch (error) {
            console.error('Failed to remove participant:', error);
            setAlertMessage({ open: true, message: 'ไม่สามารถลบผู้เข้าร่วมได้', severity: 'error' });
        }
    };

    const handleApproveAll = async () => {
        try {
            await Promise.all(pendingParticipants.map(p => handleApprove(p.part_Id, p.participant_apply_datetime, p.participant_status, p.user_id, p.post_games_id)));
            setAlertMessage({ open: true, message: 'ผู้เข้าร่วมทั้งหมดได้รับการอนุมัติแล้ว!', severity: 'success' });
        } catch (error) {
            console.error('Failed to approve all participants:', error);
            setAlertMessage({ open: true, message: 'ไม่สามารถอนุมัติผู้เข้าร่วมทั้งหมดได้', severity: 'error' });
        }
    };

    const handleRemoveAll = async () => {
        try {
            await Promise.all(joinedParticipants.map(p => handleRemove(p.part_Id, p.participant_apply_datetime, p.participant_status, p.user_id, p.post_games_id)));
            setAlertMessage({ open: true, message: 'ผู้เข้าร่วมทั้งหมดถูกลบออก!', severity: 'success' });
        } catch (error) {
            console.error('Failed to remove all participants:', error);
            setAlertMessage({ open: true, message: 'ไม่สามารถลบผู้เข้าร่วมทั้งหมดได้', severity: 'error' });
        }
    };

    const handleRefuseClick = (participant) => {
        setParticipantToRefuse(participant);
        setRefuseDialogOpen(true);
    };

    const handleRefuseConfirm = async () => {
        if (participantToRefuse) {
            const { part_Id, participant_apply_datetime, participant_status, user_id, post_games_id } = participantToRefuse;

            const payload = {
                participant_apply_datetime,
                participant_status: 'refused',
                user_id,
                post_games_id
            };

            try {
                await axios.delete(`https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/${part_Id}`, {
                    data: payload,
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                setAlertMessage({ open: true, message: 'ปฏิเสธผู้เข้าร่วม!', severity: 'success' });
                setPendingParticipants(prev => prev.filter(p => p.part_Id !== part_Id));
                setRefuseDialogOpen(false);
            } catch (error) {
                setAlertMessage({ open: true, message: 'ไม่สามารถปฏิเสธผู้เข้าร่วมได้', severity: 'error' });
            }
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
        <Container maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }} id="edit-participants-page">
            <Paper elevation={3} sx={{ padding: 4, backgroundColor: '#2c2c2c', color: 'white', position: 'relative' }} id="participants-paper">
                <Typography variant="h4" gutterBottom id="participants-title">
                    Manage Participants
                </Typography>

                <Typography variant="h6" gutterBottom id="pending-participants-title">
                    Pending Participants
                </Typography>
                <Grid container spacing={2} id="pending-participants-grid">
                    {pendingParticipants.length > 0 ? pendingParticipants.map(participant => (
                        <Grid item xs={12} key={participant.part_Id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} id={`pending-participant-${participant.part_Id}`}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                    <Avatar alt={`${participant?.user?.first_name} ${participant?.user?.last_name}`}
                                        src={participant?.user?.user_image || "https://via.placeholder.com/40"} />
                                    <Typography variant="body1" sx={{ marginLeft: 2 }} id={`pending-participant-name-${participant.part_Id}`}>
                                        {`${participant?.user?.first_name} ${participant?.user?.last_name}`}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleApprove(participant.part_Id, participant.participant_apply_datetime, participant.participant_status, participant.user_id, participant.post_games_id)}
                                        id={`approve-button-${participant.part_Id}`}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        sx={{ marginLeft: 2 }}
                                        onClick={() => handleRefuseClick(participant)}
                                        id={`refuse-button-${participant.part_Id}`}
                                    >
                                        Refuse
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    )) : (
                        <Typography id="no-pending-participants">No pending participants.</Typography>
                    )}
                </Grid>

                <Box sx={{ marginTop: 2 }} id="approve-all-button-container">
                    <Button variant="contained" onClick={handleApproveAll} id="approve-all-button">Approve All</Button>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }} id="joined-participants-title">
                    Joined Participants
                </Typography>
                <Grid container spacing={2} id="joined-participants-grid">
                    {joinedParticipants.length > 0 ? joinedParticipants.map(participant => (
                        <Grid item xs={12} key={participant.part_Id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} id={`joined-participant-${participant.part_Id}`}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                    <Avatar alt={`${participant?.user?.first_name} ${participant?.user?.last_name}`}
                                        src={participant?.user?.user_image || "https://via.placeholder.com/40"} />
                                    <Typography variant="body1" sx={{ marginLeft: 2 }} id={`joined-participant-name-${participant.part_Id}`}>
                                        {`${participant?.user?.first_name} ${participant?.user?.last_name}`}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleRemoveClick(participant)}
                                        id={`remove-button-${participant.part_Id}`}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    )) : (
                        <Typography id="no-joined-participants">No joined participants.</Typography>
                    )}
                </Grid>

                <Box sx={{ marginTop: 2 }} id="remove-all-button-container">
                    <Button variant="contained" color="error" onClick={handleRemoveAll} id="remove-all-button">Remove All</Button>
                </Box>
                <Box sx={{ position: 'absolute', bottom: 16, right: 16 }} id="return-button-container">
                    <Button variant="contained" color="primary" onClick={() => navigate(`/events/${id}`)} id="return-button">
                        Return to Details Page
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={alertMessage.open}
                autoHideDuration={6000}
                onClose={() => setAlertMessage({ ...alertMessage, open: false })}
                id="alert-snackbar"
            >
                <Alert
                    severity={alertMessage.severity}
                    onClose={() => setAlertMessage({ ...alertMessage, open: false })}
                    sx={{ width: "80%", fontSize: "1rem" }}
                    id="alert"
                >
                    <AlertTitle sx={{ fontSize: "1.5rem" }} id="alert-title">
                        {alertMessage.severity === "error" ? "Error" : "Success"}
                    </AlertTitle>
                    {alertMessage.message}
                </Alert>
            </Snackbar>

            {/* Refuse Confirmation Dialog */}
            <Dialog
                open={refuseDialogOpen}
                onClose={() => setRefuseDialogOpen(false)}
                aria-labelledby="refuse-dialog-title"
                id="refuse-dialog"
            >
                <DialogTitle id="refuse-dialog-title">Refuse Participant</DialogTitle>
                <DialogContent>
                    <DialogContentText id="refuse-dialog-content">
                        คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธผู้เข้าร่วมรายนี้
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRefuseDialogOpen(false)} id="refuse-dialog-cancel-button">ยกเลิก</Button>
                    <Button onClick={handleRefuseConfirm} color="error" id="refuse-dialog-confirm-button">Refuse</Button>
                </DialogActions>
            </Dialog>

            {/* Remove Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                aria-labelledby="confirm-dialog-title"
                id="confirm-dialog"
            >
                <DialogTitle id="confirm-dialog-title">Remove Participant</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-content">
                        คุณแน่ใจหรือไม่ว่าต้องการลบผู้เข้าร่วมรายนี้
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} id="confirm-dialog-cancel-button">ยกเลิก</Button>
                    <Button onClick={handleRemoveConfirm} color="error" id="confirm-dialog-confirm-button">Remove</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EditParticipantsPage;
