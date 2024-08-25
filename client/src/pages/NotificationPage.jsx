import React, { useState } from 'react';
import { Box, Typography, ButtonGroup, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const NotificationPage = () => {
    const [activeTab, setActiveTab] = useState('notification');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const requests = [
        { name: 'Deda', game: 'เกมเศรษฐี' },
        { name: 'Aom', game: 'เกมเศรษฐี' },
        { name: 'P', game: 'เกมเศรษฐี' },
        { name: 'Cell', game: 'เกมเศรษฐี' },
        { name: 'Aom', game: 'เกมเศรษฐี' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12 }}>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 600,
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: 2,
                    padding: 3,
                    textAlign: 'center',
                }}
            >
                <ButtonGroup variant="text" color="primary" sx={{ marginBottom: 2 }}>
                    <Button onClick={() => handleTabChange('request')} sx={{ color: activeTab === 'request' ? 'red' : 'inherit', '&:hover': { color: 'red' } }}>Request</Button>
                    <Button onClick={() => handleTabChange('notification')} sx={{ color: activeTab === 'notification' ? 'red' : 'inherit', '&:hover': { color: 'red' } }}>Notification</Button>
                </ButtonGroup>

                {activeTab === 'notification' ? (
                    <Box>
                        <Typography variant="body1" sx={{ marginBottom: 1 }}>
                            ท่านได้โดนปฏิเสธในการเข้าร่วม
                        </Typography>
                        <Divider sx={{ backgroundColor: 'white', marginY: 1 }} />
                        <Typography variant="body1" sx={{ marginBottom: 1 }}>
                            ท่านได้รับการเข้าร่วมเรียบร้อยแล้ว
                        </Typography>
                        <Divider sx={{ backgroundColor: 'white', marginY: 1 }} />
                        <Typography variant="body1">
                            การใช้งานของท่านผิดปกติไม่สามารถเข้าร่วมได้เป็นเวลา 3 วัน
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ backgroundColor: 'black', color: 'white' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}>Name</TableCell>
                                    <TableCell sx={{ color: 'white' }}>Game</TableCell>
                                    <TableCell sx={{ color: 'white' }} align="center">Confirm</TableCell>
                                    <TableCell sx={{ color: 'white' }} align="center">Delete</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((request, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={{ color: 'white' }}>{request.name}</TableCell>
                                        <TableCell sx={{ color: 'white' }}>{request.game}</TableCell>
                                        <TableCell align="center">
                                            <Button variant="contained" color="primary" size="small">Confirm</Button>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button variant="contained" color="secondary" size="small">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>
    );
};

export default NotificationPage;
