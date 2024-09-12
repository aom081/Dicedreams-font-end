import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Paper, Typography, Button, TextField, Box, Grid, useMediaQuery, Snackbar, Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AuthContext } from '../Auth/AuthContext';

const EditPostGamePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role } = useContext(AuthContext);

    const [event, setEvent] = useState({
        name_games: '',
        detail_post: '',
        num_people: '',
        date_meet: '',
        time_meet: '',
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
                const response = await axios.get(`https://dicedreams-backend-deploy-to-render.onrender.com/api-docs/postGame/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'users_id': userId,
                        'role': role,
                    },
                });

                const eventData = response.data;

                if (eventData.users_id !== userId) {
                    alert('You do not have permission to edit this post.');
                    navigate('/');
                    return;
                }

                setEvent(eventData);
                setPreviewImage(eventData.games_image);
                setLoading(false);
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

        try {
            await axios.put(`https://dicedreams-backend-deploy-to-render.onrender.com/api-docs/postGame/${id}`, event, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'users_id': userId,
                },
            });

            setAlertMessage({
                open: true,
                message: 'Event updated successfully!',
                severity: 'success',
            });

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
                            <TextField
                                fullWidth
                                label="Date"
                                name="date_meet"
                                type="date"
                                value={event.date_meet}
                                onChange={handleInputChange}
                                sx={{ backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Time"
                                name="time_meet"
                                type="time"
                                value={event.time_meet}
                                onChange={handleInputChange}
                                sx={{ backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="num_people"
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
                open={alertMessage.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}  // Position set to bottom middle
            >
                <Alert onClose={handleCloseSnackbar} severity={alertMessage.severity} sx={{ width: '100%' }}>
                    {alertMessage.message}
                </Alert>
            </Snackbar>

        </Container>
    );
};

export default EditPostGamePage;
