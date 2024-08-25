import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import { Box } from '@mui/material';

const LayoutMain = () => {
  const [events, setEvents] = useState([]);

  const addEvent = (newEvent) => {
    setEvents((prevEvents) => [newEvent, ...prevEvents]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'transparent' }}>
      
      <Box component="main" sx={{ overflowY: 'auto', p: 2 }}>
        <Navbar />
        <Outlet context={{ addEvent }} />
        <Footer />
      </Box>
    </Box>
  );
};

export default LayoutMain;
