import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Paper, Typography, Button, TextField, Box, Grid, useMediaQuery, Snackbar, Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AuthContext } from '../Auth/AuthContext';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';  // Ensure dayjs is imported

const EditPostGamePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role } = useContext(AuthContext);

    const [event, setEvent] = useState({
        name_games: '',
        detail_post: '',
        num_people: '',
        date_meet: dayjs(),  // Ensure this starts as a dayjs object
        time_meet: dayjs(),  // Ensure this starts as a dayjs object
        games_image: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: 'success' });
    const fileInputRef = useRef(null);
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        const verifyUserAndLoadEvent = async () => {
            if (!userId || !accessToken || !role) {
                alert('Please log in to access this page.');
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8080/api/postGame/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'users_id': userId,
                        'role': role,
                    },
                });

                console.log('API Response:', response.data);

                const eventData = response.data;

                if (eventData.users_id !== userId) {
                    alert('You do not have permission to edit this post.');
                    navigate('/');
                    return;
                }

                // Convert date_meet and time_meet to dayjs objects if they are strings
                const updatedEvent = {
                    ...eventData,
                    date_meet: dayjs(eventData.date_meet),
                    time_meet: dayjs(eventData.time_meet, 'HH:mm:ss'), // Ensure the correct format when loading time
                };

                console.log('Parsed Date:', updatedEvent.date_meet.format('YYYY-MM-DD'));
                console.log('Parsed Time:', updatedEvent.time_meet.format('HH:mm'));
                console.log('Is date_meet valid:', dayjs(eventData.date_meet).isValid());
                console.log('Is time_meet valid:', dayjs(eventData.time_meet, 'HH:mm:ss').isValid());

                setEvent(updatedEvent);
                setPreviewImage(eventData.games_image);
                setLoading(false);

                // Log the event data after it is loaded
                console.log('Event data loaded:', updatedEvent);

            } catch (error) {
                console.error('Failed to fetch event details', error);
                setAlertMessage({
                    open: true,
                    message: 'Failed to fetch event details. Please try again later.',
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
        console.log(`Input Change - ${name}: `, value); // Log each input change
    };

    // Inside handleNumberChange
    const handleNumberChange = (e) => {
        const { value } = e.target;
        setEvent((prevEvent) => ({
            ...prevEvent,
            num_people: value > 0 ? value : 1,
        }));
        console.log('Number of Participants: ', value); // Log the number change
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

        // Format the date_meet to "MM/DD/YYYY" before sending
        const formattedEvent = {
            ...event,
            date_meet: event.date_meet.format('MM/DD/YYYY'),  // Format date as "MM/DD/YYYY"
            time_meet: event.time_meet.format('HH:mm A'),    // Ensure time is formatted correctly
        };

        // Log the formatted event data
        console.log('Submitting edited event data: ', formattedEvent);

        try {
            // Send updated event data to the server
            await axios.put(`http://localhost:8080/api/postGame/${id}`, formattedEvent, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'users_id': userId,
                },
            });

            // Show success message
            setAlertMessage({
                open: true,
                message: 'Event updated successfully!',
                severity: 'success',
            });

            // Redirect after a short delay to allow the Snackbar to be visible
            setTimeout(() => {
                navigate(`/events/${id}`);
            }, 1500);
        } catch (error) {
            console.error('Failed to update event', error);
            setAlertMessage({
                open: true,
                message: 'Failed to update event. Please try again later.',
                severity: 'error',
            });
        }
    };

    const handleCloseSnackbar = () => {
        setAlertMessage({ ...alertMessage, open: false });
    };

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <Container id="edit-post-game-page-container" maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }}>
            <Paper id="edit-post-game-paper" elevation={3} sx={{ padding: isMobile ? 2 : 5, marginTop: 4, backgroundColor: '#2c2c2c', color: 'white' }}>
                <Typography id="edit-post-title" variant="h4" gutterBottom>
                    Edit Post
                </Typography>
                <form id="edit-post-form" onSubmit={handleFormSubmit}>
                    <Grid container spacing={isMobile ? 2 : 3}>
                        <Grid item xs={12}>
                            <TextField
                                id="edit-post-game-name"
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
                                id="edit-post-detail"
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
                                    id="edit-post-date-picker"
                                    label="Date"
                                    value={event.date_meet}
                                    onChange={(newValue) => {
                                        setEvent((prevEvent) => ({
                                            ...prevEvent,
                                            date_meet: newValue,
                                        }));
                                        console.log('Date Selected: ', newValue.format('MM/DD/YYYY')); // Log date change
                                    }}
                                    sx={{ backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                                    format="MMM-DD-YYYY"
                                    fullWidth
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    id="edit-post-time-picker"
                                    label="Time"
                                    value={event.time_meet} // Ensure this is a valid dayjs object
                                    onChange={(newValue) => {
                                        setEvent((prevEvent) => ({
                                            ...prevEvent,
                                            time_meet: newValue,
                                        }));
                                        console.log('Time Selected: ', newValue.format('HH:mm A')); // Log the selected time
                                    }}
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
                                id="edit-post-num-people"
                                fullWidth
                                label="Number of Participants"
                                type="number"
                                value={event.num_people}
                                onChange={handleNumberChange}
                                sx={{ backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                                InputProps={{ inputProps: { min: 1 } }}
                                required
                                inputProps={{ 'data-testid': 'num-people-input' }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                id="edit-post-upload-button"
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
                                    id="edit-post-image-preview"
                                    src={previewImage}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', marginBottom: '10px' }}
                                />
                            )}
                        </Grid>
                    </Grid>

                    <Box id="edit-post-action-buttons" sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                        <Button
                            id="edit-post-save-button"
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
                            id="edit-post-cancel-button"
                            variant="outlined"
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                backgroundColor: 'transparent',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                                padding: '8px 24px',
                            }}
                            onClick={() => navigate(`/events/${id}`)}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>

            {/* Snackbar Notification */}
            <Snackbar
                id="edit-post-snackbar"
                open={alertMessage.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}  // Position set to bottom middle
            >
                <Alert id="edit-post-alert" onClose={handleCloseSnackbar} severity={alertMessage.severity} sx={{ width: '100%' }}>
                    {alertMessage.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EditPostGamePage;
