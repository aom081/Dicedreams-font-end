import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Paper, Typography, Button, TextField, Box, Grid, useMediaQuery, Snackbar, Alert,AlertTitle, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AuthContext } from '../Auth/AuthContext';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const EditPostGamePage = () => {
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

    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: 'success' });
    const fileInputRef = useRef(null);
    const isMobile = useMediaQuery('(max-width:600px)');

    // State for confirmation dialog
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const verifyUserAndLoadEvent = async () => {
            if (!userId || !accessToken || !role) {
                alert('กรุณาเข้าสู่ระบบเพื่อเข้าสู่หน้านี้');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'users_id': userId,
                        'role': role,
                    },
                });

                const eventData = response.data;

                if (eventData.users_id !== userId) {
                    alert('คุณไม่ได้รับอนุญาตให้แก้ไขโพสต์นี้');
                    navigate('/');
                    return;
                }

                const updatedEvent = {
                    ...eventData,
                    date_meet: dayjs(eventData.date_meet),
                    time_meet: dayjs(eventData.time_meet, 'HH:mm:ss'),
                };

                setEvent(updatedEvent);
                setPreviewImage(eventData.games_image);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch event details', error);
                setAlertMessage({
                    open: true,
                    message: 'ไม่สามารถเรียกรายละเอียดกิจกรรมได้ โปรดลองอีกครั้งในภายหลัง',
                    severity: 'error',
                });
                navigate('/');
            }
        };

        verifyUserAndLoadEvent();
    }, [id, userId, accessToken, role, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEvent((prevEvent) => ({
            ...prevEvent,
            [name]: value,
        }));
    };

    const handleNumberChange = (e) => {
        const { value } = e.target;
        setEvent((prevEvent) => ({
            ...prevEvent,
            num_people: value > 0 ? value : 1,
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEvent((prevEvent) => ({
                    ...prevEvent,
                    games_image: reader.result,
                }));
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const formattedEvent = {
            ...event,
            date_meet: event.date_meet.format('MM/DD/YYYY'),
            time_meet: event.time_meet.format('HH:mm A'),
        };

        try {
            await axios.put(`https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${id}`, formattedEvent, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'users_id': userId,
                },
            });

            setAlertMessage({
                open: true,
                message: 'อัปเดตกิจกรรมสำเร็จแล้ว!',
                severity: 'success',
            });

            setTimeout(() => {
                navigate(`/events/${id}`);
            }, 1500);
        } catch (error) {
            console.error('Failed to update event', error);
            setAlertMessage({
                open: true,
                message: 'ไม่สามารถอัปเดตกิจกรรมได้ โปรดลองอีกครั้งในภายหลัง',
                severity: 'error',
            });
        }
    };

    const handleCancelClick = () => {
        setOpenDialog(true);  // Open the confirmation dialog
    };

    const handleConfirmCancel = () => {
        setOpenDialog(false);
        navigate(`/events/${id}`);  // Navigate back to the event page without saving
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);  // Close the confirmation dialog
    };

    const handleCloseSnackbar = () => {
        setAlertMessage({ ...alertMessage, open: false });
    };

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <Container maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }}>
            <Paper elevation={3} sx={{ padding: isMobile ? 2 : 5, marginTop: 4, backgroundColor: '#2c2c2c', color: 'white' }}>
                <Typography variant="h4" gutterBottom>
                    Edit Post
                </Typography>
                <form onSubmit={handleFormSubmit}>
                    <Grid container spacing={isMobile ? 2 : 3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Game Name"
                                name="name_games"
                                value={event.name_games}
                                onChange={handleInputChange}
                                sx={{ backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Details"
                                name="detail_post"
                                value={event.detail_post}
                                onChange={handleInputChange}
                                sx={{ backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Date"
                                    value={event.date_meet}
                                    onChange={(newValue) => setEvent((prevEvent) => ({
                                        ...prevEvent,
                                        date_meet: newValue,
                                    }))}
                                    sx={{ backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                                    format="MMM-DD-YYYY"
                                    fullWidth
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    label="Time"
                                    value={event.time_meet}
                                    onChange={(newValue) => setEvent((prevEvent) => ({
                                        ...prevEvent,
                                        time_meet: newValue,
                                    }))}
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                    }}
                                    views={['hours', 'minutes']}
                                    sx={{
                                        backgroundColor: '#1c1c1c',
                                        '.MuiInputBase-root': { color: 'white' },
                                        '.MuiInputLabel-root': { color: 'white' },
                                    }}
                                    fullWidth
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Number of Participants"
                                type="number"
                                value={event.num_people}
                                onChange={handleNumberChange}
                                sx={{ backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                                InputProps={{ inputProps: { min: 1 } }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => fileInputRef.current.click()}
                                sx={{ marginBottom: 2 }}
                            >
                                Upload New Image
                            </Button>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', marginBottom: '10px' }}
                                />
                            )}
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: 'yellow',
                                color: 'black',
                                '&:hover': { backgroundColor: 'black', color: 'yellow' },
                            }}
                            type="submit"
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                backgroundColor: 'transparent',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                            }}
                            onClick={handleCancelClick}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="cancel-dialog-title"
                aria-describedby="cancel-dialog-description"
            >
                <DialogTitle id="cancel-dialog-title">Cancel Edits</DialogTitle>
                <DialogContent>
                    <DialogContentText id="cancel-dialog-description">
                        คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ การเปลี่ยนแปลงที่ไม่ได้บันทึกทั้งหมดจะสูญหาย
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        แก้ไขต่อไป
                    </Button>
                    <Button onClick={handleConfirmCancel} color="error" autoFocus>
                        ยกเลิกการเปลี่ยนแปลง
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar Notification */}
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                open={alertMessage.open}
                autoHideDuration={6000} // Increased duration
                onClose={handleCloseSnackbar}
                id="edit-snackbar"
                sx={{ width: "100%" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={alertMessage.severity} sx={{ width: "80%", fontSize: "1rem" }}>
                    <AlertTitle sx={{ fontSize: "1.5rem" }}>
                        {alertMessage.severity === "error" ? "Error" : "Success"}
                    </AlertTitle>
                    {alertMessage.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EditPostGamePage;
