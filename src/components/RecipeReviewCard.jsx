import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Paper, Select, MenuItem, CircularProgress, Alert
} from '@mui/material';
import { getPostGames } from '../components/apiService';
import EventCard from './EventCard';

function RecipeReviewCard() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState(localStorage.getItem('filter') || 'new'); // Load from localStorage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll to top when returning from postgame creation
  useEffect(() => {
    if (sessionStorage.getItem('postgameCreated')) {
      window.scrollTo(0, 0); // Scroll to top
      sessionStorage.removeItem('postgameCreated'); // Remove the flag after scrolling
    }
  }, []);

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getPostGames({ status_post: 'active' });
        setEvents(data);
      } catch (error) {
        setError('Error fetching events: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setFilter(newFilter);
    localStorage.setItem('filter', newFilter); // Save filter state to localStorage
  };

  // Sort the events based on creation date and filter type
  const filteredEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.creation_date);
    const dateB = new Date(b.creation_date);

    if (filter === 'new') {
      // Sort from newest to oldest
      return dateB - dateA;
    } else {
      // Sort from oldest to newest
      return dateA - dateB;
    }
  });

  return (
    <Container sx={{ padding: '2rem 0' }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <Paper sx={{ padding: '1rem', marginBottom: '2rem', textAlign: 'center', backgroundColor: 'rgba(85, 0, 27, 0.5)' }}>
            <Typography variant="h4" component="div" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
              Featured Games
            </Typography>
            <Select
              value={filter}
              onChange={handleFilterChange}
              sx={{ marginBottom: '1rem', minWidth: '150px', color: 'white', fontWeight: 'bold' }}
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="old">Old</MenuItem>
            </Select>
          </Paper>
        </Grid>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          filteredEvents.map((event) => (
            <Grid item key={event.post_games_id} xs={12} sm={10} md={8}>
              <EventCard
                userId={event.users_id}
                profilePic={event.user_image}
                username={event.username}
                postTime={event.creation_date}
                image={event.games_image}
                nameGames={event.name_games}
                dateMeet={event.date_meet}
                timeMeet={event.time_meet}
                detailPost={event.detail_post}
                numPeople={event.num_people}
                maxParticipants={event.maxParticipants}
                eventId={event.post_games_id}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default RecipeReviewCard;

