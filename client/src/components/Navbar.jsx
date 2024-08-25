import React, { useState, useContext } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Input, Box, Drawer,
    List, ListItem, ListItemText, Button, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCircleUser } from 'react-icons/fa6';
import axios from 'axios';
import FilterComponent from './FilterComponent';
import { AuthContext } from '../Auth/AuthContext';

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { accessToken, login, logout } = useContext(AuthContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        if (event.key === 'Enter') {
            navigate(`/index?search=${encodeURIComponent(searchQuery)}`);
            console.log('Search query:', searchQuery);
        }
    };

    const navigateToLogin = () => {
        navigate('/login');
    };

    const navigateToRegister = () => {
        navigate('/login?register=true');
    };

    const navigateToNotifications = () => {
        navigate('/notifications');
    };

    const navigateToParticipationHistory = () => {
        navigate('/participation-history');
    };

    const navigateToDetails = (eventId) => {
        navigate(`/events/${eventId}`);
    };

    const handleLogout = () => {
        logout();
        setDialogOpen(false);
        navigate('/');
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
    };

    const openDialog = () => {
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
    };

    const drawerList = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            id="drawer-list"
        >
            <List>
                <ListItem
                    button
                    component={Link}
                    to="/"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                    id="home-link"
                >
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to='/participation-history'
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                    id="participation-history-link"
                >
                    <ListItemText primary="Show Participation History" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/notifications"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                    id="notifications-link"
                >
                    <ListItemText primary="Notifications" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/rules"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                    id="rules-link"
                >
                    <ListItemText primary="Website Rules" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/profile"
                    id="profile-link"
                >
                    <ListItemText primary="Profile" />
                </ListItem>
                <Divider />
                <ListItem>
                    <Typography variant="h6" id="filter-events-title">Filter Events</Typography>
                </ListItem>
                <ListItem>
                    <FilterComponent onSearch={closeDrawer} id="filter-component" />
                </ListItem>
            </List>
        </Box>
    );

    const renderFullNavbar = () => (
        <>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
                id="menu-button"
            >
                <MenuIcon />
            </IconButton>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                id="drawer"
            >
                {drawerList()}
            </Drawer>
            <Link to="/" id="logo-link">
                <img src='logoDice.png' alt="DiceDreams Logo" id="logo-image" style={{ marginRight: '18px', height: '64px' }} />
            </Link>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    id="navbar-title"
                >
                    <span style={{ color: 'crimson', fontWeight: 'bold' }}>Dice</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>Dreams</span>
                </Typography>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, marginLeft: 2 }}>
                <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchSubmit}
                    sx={{ marginLeft: 2 }}
                    id="search-input"
                />
            </Box>
            {accessToken ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="inherit" onClick={() => navigate('/profile')} id="profile-button">
                        <FaCircleUser size={24} />
                    </IconButton>
                    <Button color="inherit" onClick={openDialog} id="logout-button">Log out</Button>
                </Box>
            ) : (
                <>
                    <Button color="inherit" onClick={navigateToLogin} id="login-button">Log in</Button>
                    <Button variant="contained" color="primary" onClick={navigateToRegister} id="register-button">Register</Button>
                </>
            )}
        </>
    );

    const renderBasicNavbar = () => (
        <>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
                id="basic-menu-button"
            >
                <MenuIcon />
            </IconButton>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                id="basic-drawer"
            >
                {drawerList()}
            </Drawer>
            <Link to="/" id="basic-logo-link">
                <img src='logoDice.png' alt="DiceDreams Logo" id="basic-logo-image" style={{ marginRight: '18px', height: '64px' }} />
            </Link>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    id="basic-navbar-title"
                >
                    <span style={{ color: 'crimson', fontWeight: 'bold' }}>Dice</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>Dreams</span>
                </Typography>
            </Link>
            <Box sx={{ flexGrow: 1 }} />
            <Button color="inherit" onClick={() => navigate('/')} id="home-button">Go to Home</Button>
        </>
    );

    return (
        <AppBar position="fixed" color="inherit" id="navbar">
            <Toolbar>
                {location.pathname === '/login' || location.pathname === '/register'
                    ? renderBasicNavbar()
                    : renderFullNavbar()}
            </Toolbar>
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                id="logout-dialog"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Logout"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary" id="cancel-logout-button">
                        Cancel
                    </Button>
                    <Button onClick={handleLogout} color="primary" autoFocus id="confirm-logout-button">
                        Log out
                    </Button>
                </DialogActions>
            </Dialog>
        </AppBar>
    );
}

export default Navbar;
