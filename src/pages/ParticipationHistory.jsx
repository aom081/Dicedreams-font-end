import React from 'react';
import { Box, Avatar, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const ParticipationHistory = () => {
    const rows = [
        {
            userName: 'วนัสพร กาญจน์วัฒน์',
            postName: 'Werewolf',
            dateTime: '2/12/2566',
            avatar: 'https://via.placeholder.com/40', // Placeholder image
            viewLink: '/post/1'
        },
        {
            userName: 'ณัฐวุฒิ แก้วมหา',
            postName: 'ซาเรม 1692',
            dateTime: '2/12/2566',
            avatar: 'https://via.placeholder.com/40', // Placeholder image
            viewLink: '/post/2'
        }
    ];

    return (
        <Box sx={{ margin: 4, backgroundColor: 'black', padding: 2, borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
                Participation History
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'black' }}>
                            <TableCell sx={{ color: 'white' }}></TableCell>
                            <TableCell sx={{ color: 'white' }}>User Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Post Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Date Time</TableCell>
                            <TableCell sx={{ color: 'white' }}>View</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index} sx={{ backgroundColor: 'black', '&:hover': { backgroundColor: 'gray' } }}>
                                <TableCell>
                                    <Avatar alt={row.userName} src={row.avatar} />
                                </TableCell>
                                <TableCell sx={{ color: 'white' }}>{row.userName}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{row.postName}</TableCell>
                                <TableCell sx={{ color: 'white' }}>{row.dateTime}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="primary" component={Link} to={row.viewLink}>
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ParticipationHistory;
