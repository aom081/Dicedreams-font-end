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
    <div className="py-24 flex flex-col justify-center items-center" id="post-container">
      <FormControl className="section-container" id="post-form">
        <FormLabel className="subtitle" sx={{ fontFamily: 'Mount Light' }} id="post-form-label">
          Let's create a party for fun
        </FormLabel>
        <Tooltip
          title={
            <div style={{ fontSize: '16px', padding: '8px' }}>
              Click to create a post
            </div>
          }
          arrow
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 10],
                },
              },
            ],
          }}
          classes={{ tooltip: 'bg-yellow-500 text-black' }}
          id="post-tooltip"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'burlywood',
              backgroundImage: 'url(/path-to-wood-texture.jpg)',
              borderRadius: '10px',
              border: '1px solid #8B4513',
              padding: '10px',
              overflow: 'hidden',
              cursor: 'pointer'
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
                minWidth: { xs: '300px', sm: '500px', md: '700px', lg: '1050px' },
                fontSize: '16px',
                padding: '12px 16px',
                fontWeight,
                fontStyle: italic ? 'italic' : 'normal',
                textAlign: 'left',
                pointerEvents: 'none',  // To prevent the input from being focused
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '5px',
                fontFamily: 'Mount Light'
              }}
              id="post-input"
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: 'crimson', height: '100px', pointerEvents: 'none', color: "white" }}  // To prevent the button from being focused
              id="post-button"
            >
              Post
            </Button>
          </Box>
        </Tooltip>
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
    </div>
  );
}


