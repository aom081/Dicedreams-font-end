import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Button, Box, Avatar, Grid, Snackbar, Alert,AlertTitle, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
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
    const [refuseDialogOpen, setRefuseDialogOpen] = useState(false);  // Added for refuse dialog
    const [participantToRefuse, setParticipantToRefuse] = useState(null);  // Added to store participant to refuse

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
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleApprove(participant.part_Id, participant.participant_apply_datetime, participant.participant_status, participant.user_id, participant.post_games_id)}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        sx={{ marginLeft: 2 }}
                                        onClick={() => handleRefuseClick(participant)}
                                    >
                                        Refuse
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    )) : (
                        <Typography>No pending participants.</Typography>
                    )}
                </Grid>

                <Box sx={{ marginTop: 2 }}>
                    <Button variant="contained" onClick={handleApproveAll}>Approve All</Button>
                </Box>

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
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleRemoveClick(participant)}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    )) : (
                        <Typography>No joined participants.</Typography>
                    )}
                </Grid>

                <Box sx={{ marginTop: 2 }}>
                    <Button variant="contained" color="error" onClick={handleRemoveAll}>Remove All</Button>
                </Box>
                <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                    <Button variant="contained" color="primary" onClick={() => navigate(`/events/${id }`)}>
                        Return to Details Page
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={alertMessage.open}
                autoHideDuration={6000}
                onClose={() => setAlertMessage({ ...alertMessage, open: false })}
            >
                <Alert
                    severity={alertMessage.severity}
                    onClose={() => setAlertMessage({ ...alertMessage, open: false })}
                    sx={{ width: "80%", fontSize: "1rem" }}
                >
                    <AlertTitle sx={{ fontSize: "1.5rem" }}>
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
            >
                <DialogTitle id="refuse-dialog-title">Refuse Participant</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธผู้เข้าร่วมรายนี้
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRefuseDialogOpen(false)}>ยกเลิก</Button>
                    <Button onClick={handleRefuseConfirm} color="error">Refuse</Button>
                </DialogActions>
            </Dialog>

            {/* Remove Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                aria-labelledby="confirm-dialog-title"
            >
                <DialogTitle id="confirm-dialog-title">Remove Participant</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณแน่ใจหรือไม่ว่าต้องการลบผู้เข้าร่วมรายนี้
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>ยกเลิก</Button>
                    <Button onClick={handleRemoveConfirm} color="error">Remove</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EditParticipantsPage;
