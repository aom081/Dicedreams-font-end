import React, { useContext } from 'react';
import RecipeReviewCard from '../components/RecipeReviewCard';
import Post from '../components/Post';
import { EventProvider } from '../components/EventContext';
import { AuthContext } from '../Auth/AuthContext';
import { Box, Typography } from '@mui/material'; // Import Box and Typography for styling

const Home = () => {
  const { accessToken } = useContext(AuthContext); // Get accessToken from AuthContext

  return (
    <EventProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {accessToken ? (
          <Post /> // Render Post if accessToken is available
        ) : (
          <Box
            sx={{
              minHeight: '20vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'end',
              padding: '10px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.5)',
                backgroundColor: '#DEB887',
                backgroundImage: 'url(/path-to-wood-texture.jpg)',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                borderRadius: '10px',
                border: '2px solid #8B4513',
                padding: '15px',
                cursor: 'pointer',
                width: '80%',
                justifyContent: 'center',
                textAlign: 'center',
              }}
              onClick={() => { /* Optional: Add a link to the signup page or a relevant action */ }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: '#8B4513',
                  fontWeight: 'bold',
                  fontFamily: 'Mount Light',
                  letterSpacing: 'wide', // Apply letter spacing from your CSS
                }}
              >
                Join us today! Sign up to share your posts and be part of the community.
              </Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ p: 2 }}>
          <RecipeReviewCard />
        </Box>
      </Box>
    </EventProvider>
  );
};

export default Home;
