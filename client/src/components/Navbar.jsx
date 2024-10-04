import React, { useState, useContext } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Input, Box, Drawer,
    List, ListItem, ListItemText, Button, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search'; // Import the search icon
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';
import FilterComponent from './FilterComponent';

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const { accessToken, logout, username, profilePic } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery('(max-width: 600px)');

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const handleSearchSubmit = (event) => {
        if (event.key === 'Enter') {
            navigate(`/index?search=${encodeURIComponent(searchQuery)}`);
            console.log('Search query:', searchQuery);
        }
    };

    const handleLogout = () => {
        logout();
        setDialogOpen(false);
        navigate('/');
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
                    to="/participation-history"
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
                    <FilterComponent onSearch={() => setDrawerOpen(false)} id="filter-component" />
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
            {!isMobile && (
                <Link to="/" id="logo-link">
                    <img src='logoDice.png' alt="DiceDreams Logo" id="logo-image" style={{ marginRight: '18px', height: '64px' }} />
                </Link>
            )}
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
                {isMobile ? (
                    <IconButton
                        color="inherit"
                        id="search-icon"
                    >
                        <SearchIcon />
                    </IconButton>
                ) : (
                    <>
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{ marginLeft: 2 }}
                            id="search-button"
                        >
                            Search...
                        </Button>
                    </>
                )}
            </Box>
            {accessToken ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                        backgroundColor: 'rgba(220, 20, 60, 0.5)', 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '5px 10px',
                        borderRadius: '8px',
                         }}>
                        {!isMobile && (
                            <Link
                                to="/profile"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        marginRight: '5px',
                                        fontWeight: 'bold',
                                    }}
                                    id="username"
                                >
                                    {username}
                                </Typography>
                            </Link>
                        )}
                        <Avatar
                            src={profilePic}
                            alt={username}
                            sx={{
                                width: 40,
                                height: 40,
                                border: '2px solid white',
                            }}
                            id="profile-picture"
                        />
                    </Box>
                    
                    <IconButton
                        color="inherit"
                        onClick={() => setDialogOpen(true)}
                        id="logout-button"
                        sx={{
                            marginLeft: '10px',
                            color: 'white',
                            borderRadius: '8px',
                            padding: '5px 10px',
                        }}
                    >
                        {isMobile ? <LogoutIcon /> : 'Log out'}
                    </IconButton>
                </Box>
            ) : (
                    <>
                        {isMobile ? (
                            <>
                                <IconButton color="inherit" onClick={() => navigate('/login')} id="login-icon">
                                    <LoginIcon />
                                </IconButton>
                                <IconButton color="primary" onClick={() => navigate('/login?register=true')} id="register-icon">
                                    <AppRegistrationIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" onClick={() => navigate('/login')} id="login-button">Log in</Button>
                                <Button variant="contained" color="primary" onClick={() => navigate('/login?register=true')} id="register-button">Register</Button>
                            </>
                        )}
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
            {!isMobile && (
                <Link to="/" id="basic-logo-link">
                    <img src='logoDice.png' alt="DiceDreams Logo" id="basic-logo-image" style={{ marginRight: '18px', height: '64px' }} />
                </Link>
            )}
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
                    : renderFullNavbar()
                }
            </Toolbar>
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
            >
                <DialogTitle id="logout-dialog-title">Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText id="logout-dialog-description">
                        คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary" id="cancel-logout-button">
                        ยกเลิก
                    </Button>
                    <Button onClick={handleLogout} color="primary" autoFocus id="confirm-logout-button">
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </AppBar>
    );
};

export default Navbar;
