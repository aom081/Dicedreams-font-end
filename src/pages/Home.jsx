import React from 'react';
import RecipeReviewCard from '../components/RecipeReviewCard';
import Post from '../components/Post';
import { EventProvider } from '../components/EventContext';
import { Box } from '@mui/material';

const Home = () => {
  return (
    <EventProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Post />
        <Box sx={{ p: 2 }}>
          <RecipeReviewCard />
        </Box>
      </Box>
    </EventProvider>
  );
};

export default Home;


