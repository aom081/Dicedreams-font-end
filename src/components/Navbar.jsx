import React, { useState, useContext } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Box, Drawer,
    List, ListItem, ListItemText, Button, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { AuthContext } from '../Auth/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FilterComponentInNavBar from './FilterComponentInNavBar';

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false); // New state for filter visibility
    const { accessToken, logout, username, profilePic, role } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery('(max-width: 600px)');

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const handleLogout = () => {
        logout();
        setDialogOpen(false);
        navigate('/');
    };

    const handleFilterToggle = () => { // New toggle function
        setFilterVisible((prev) => !prev);
    };

    const drawerList = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            id="drawer-list"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem
                    button
                    component={Link}
                    to="/"
                    id="home-link"
                >
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/participation-history"
                    id="participation-history-link"
                    disabled={!accessToken}
                >
                    <ListItemText primary="Show Participation History" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/notifications"
                    id="notifications-link"
                    disabled={!accessToken}
                >
                    <ListItemText primary="Notifications" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/rules"
                    id="rules-link"
                >
                    <ListItemText primary="Website Rules" />
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to="/profile"
                    id="profile-link"
                    disabled={!accessToken}
                >
                    <ListItemText primary="Profile" />
                </ListItem>
                <Divider />
                <ListItem>
                    <Typography variant="h6" id="filter-events-title">Filter Events</Typography>
                </ListItem>
                <ListItem>
                    {/* If you have other filter components, include them here */}
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
            {/* Always display the Search Button/Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, marginLeft: 2 }}>
                {isMobile ? (
                    <IconButton
                        color="inherit"
                        id="search-icon"
                        onClick={handleFilterToggle} // Attach toggle handler
                    >
                        <SearchIcon />
                    </IconButton>
                ) : (
                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{ marginLeft: 2 }}
                        id="search-button"
                        onClick={handleFilterToggle} // Attach toggle handler
                    >
                        Search...
                    </Button>
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AppBar position="fixed" sx={{ backgroundColor: role === 'admin' ? '#3F51B5' : role === 'store' ? '#DC143C' : '#272727' }}>
                <Toolbar>
                    {location.pathname === '/login' || location.pathname === '/register' ? renderBasicNavbar() : renderFullNavbar()}
                </Toolbar>
                {filterVisible && <FilterComponentInNavBar />} {/* Conditionally render the filter component */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>Logout</DialogTitle>
                    <DialogContent>
                        <DialogContentText>คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)} color="primary">ยกเลิก</Button>
                        <Button onClick={handleLogout} color="primary" autoFocus>Logout</Button>
                    </DialogActions>
                </Dialog>
            </AppBar>
        </LocalizationProvider>
    );
};

export default Navbar;
