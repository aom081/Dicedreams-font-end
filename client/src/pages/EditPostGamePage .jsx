import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Button, TextField, Box } from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';

const EditPostGamePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId, accessToken, role } = useContext(AuthContext); // Fetch user details from AuthContext

    const [event, setEvent] = useState({
        name_games: '',
        detail_post: '',
        num_people: '',
        date_meet: '',
        time_meet: '',
    });

    const [loading, setLoading] = useState(true);

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

                const eventData = response.data;

                if (eventData.users_id !== userId) {
                    alert('You do not have permission to edit this post.');
                    navigate('/');
                    return;
                }

                setEvent(eventData);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch event details', error);
                alert('Failed to fetch event details. Please try again later.');
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

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`http://localhost:8080/api/postGame/${id}`, event, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'users_id': userId,
                },
            });

            alert('Event updated successfully!');
            navigate(`/events/${id}`);
        } catch (error) {
            console.error('Failed to update event', error);
            alert('Failed to update event. Please try again later.');
        }
    };

    if (loading) {
        return <Typography variant="h6" id="loading">Loading...</Typography>;
    }

    return (
        <Container maxWidth="md" sx={{ padding: '2rem 0', marginTop: '2rem' }} id="edit-post-page">
            <Paper elevation={3} sx={{ padding: 5, marginTop: 4, backgroundColor: '#2c2c2c', color: 'white' }} id="edit-post-form">
                <Typography variant="h4" gutterBottom id="edit-post-title">
                    Edit Post
                </Typography>
                <form onSubmit={handleFormSubmit}>
                    <TextField
                        fullWidth
                        label="Game Name"
                        name="name_games"
                        value={event.name_games}
                        onChange={handleInputChange}
                        sx={{ marginBottom: 2, backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                        id="edit-post-game-name"
                    />
                    <TextField
                        fullWidth
                        label="Details"
                        name="detail_post"
                        value={event.detail_post}
                        onChange={handleInputChange}
                        sx={{ marginBottom: 2, backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                        id="edit-post-details"
                    />
                    <TextField
                        fullWidth
                        label="Number of Participants"
                        name="num_people"
                        value={event.num_people}
                        onChange={handleInputChange}
                        sx={{ marginBottom: 2, backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                        id="edit-post-participants"
                    />
                    <TextField
                        fullWidth
                        label="Date"
                        name="date_meet"
                        type="date"
                        value={event.date_meet}
                        onChange={handleInputChange}
                        sx={{ marginBottom: 2, backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                        id="edit-post-date"
                    />
                    <TextField
                        fullWidth
                        label="Time"
                        name="time_meet"
                        type="time"
                        value={event.time_meet}
                        onChange={handleInputChange}
                        sx={{ marginBottom: 2, backgroundColor: '#1c1c1c', input: { color: 'white' } }}
                        id="edit-post-time"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            id="save-changes-button"
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => navigate(`/events/${id}`)}
                            sx={{ marginLeft: 2 }}
                            id="cancel-button"
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default EditPostGamePage;
