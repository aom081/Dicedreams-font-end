import React from 'react';
import { AppBar, Toolbar, Typography, Link, IconButton, Box } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
    return (
        <AppBar position="static" color="primary" id="footer">
            <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
                <Typography
                    id="footer-company-info"
                    variant="body1"
                    color="inherit"
                    sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}
                >
                    &copy; 2024 Your Company
                </Typography>
                <Box
                    id="footer-links"
                    sx={{ display: 'flex', alignItems: 'center', mt: { xs: 1, sm: 0 } }}
                >
                    <Link
                        id="footer-privacy-policy"
                        href="#"
                        color="inherit"
                        sx={{ mr: 2 }}
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        id="footer-terms-of-service"
                        href="#"
                        color="inherit"
                        sx={{ mr: 2 }}
                    >
                        Terms of Service
                    </Link>
                    <IconButton
                        id="footer-facebook"
                        href="#"
                        color="inherit"
                        aria-label="facebook"
                        sx={{ mr: 1 }}
                    >
                        <FacebookIcon />
                    </IconButton>
                    <IconButton
                        id="footer-twitter"
                        href="#"
                        color="inherit"
                        aria-label="twitter"
                        sx={{ mr: 1 }}
                    >
                        <TwitterIcon />
                    </IconButton>
                    <IconButton
                        id="footer-linkedin"
                        href="#"
                        color="inherit"
                        aria-label="linkedin"
                    >
                        <LinkedInIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Footer;
