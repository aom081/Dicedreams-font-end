import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormControl, FormLabel, InputBase, Button, Box, Snackbar, Alert, Tooltip } from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';

export default function Post() {
  const [italic, setItalic] = useState(false);
  const [fontWeight, setFontWeight] = useState('normal');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);

  const handlePostClick = () => {
    if (!accessToken) {
      setSnackbar({ open: true, message: 'Please login or register first', severity: 'error' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);  // Redirect after 2 seconds
    } else {
      navigate('/create-post');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f0f0f0', // Light background to highlight the wooden sign
      }}
      id="post-container"
    >
      <FormControl sx={{ width: '100%', maxWidth: '1100px' }} id="post-form">
        <FormLabel
          sx={{
            fontFamily: 'Mount Light',
            fontSize: '24px',
            textAlign: 'center',
            marginBottom: '20px',
            color: '#8B4513'
          }}
          id="post-form-label"
        >
          Let's create a party for fun
        </FormLabel>
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
            width: '100%',
          }}
          onClick={handlePostClick}
          id="post-box"
        >
          <InputBase
            multiline
            minRows={3}
            sx={{
              flex: 1,
              marginRight: '18px',
              fontSize: { xs: '14px', sm: '16px', md: '18px' },
              padding: '12px 16px',
              fontWeight,
              fontStyle: italic ? 'italic' : 'normal',
              textAlign: 'left',
              pointerEvents: 'none',  // To prevent the input from being focused
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '5px',
              fontFamily: 'Mount Light',
              color: '#8B4513',
              border: '1px solid #8B4513'
            }}
            id="post-input"
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#A52A2A',
              height: '100px',
              pointerEvents: 'none', // To prevent the button from being focused
              color: "white",
              fontSize: { xs: '12px', sm: '14px', md: '16px' },
              padding: '10px 20px',
              borderRadius: '5px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.5)'
            }}
            id="post-button"
          >
            Post
          </Button>
        </Box>
      </FormControl>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        id="post-snackbar"
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} id="post-alert">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
