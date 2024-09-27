import React, { useState, useEffect } from "react";
import { Box, Button, ButtonGroup, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [requests, setRequests] = useState([]); // Add state for requests
    const [activeTab, setActiveTab] = useState('notification'); // State for active tab
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Function to handle navigation to PostGameDetail or Chat
    const handleButtonClick = async (event, notification) => {
        event.preventDefault();
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            // Navigate to sign-in if no access token
            navigate("/signin");
            return;
        }

        // Mark as read before navigating
        if (!notification.read) {
            await handleMarkAsRead(notification.notification_id);
        }

        if (notification.type === "participate") {
            navigate(`/PostGameDetail?id=${notification.data.post_games_id}`);
        } else if (notification.type === "chat") {
            navigate(`/PostGameDetail?id=${notification.data.post_games_id}#chat`);
        }
    };

    const fetchNotifications = async () => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            console.error("Access token not found");
            setError("Access token not found");
            return;
        }

        try {
            const response = await fetch(
                "https://dicedreams-backend-deploy-to-render.onrender.com/api/notification/user",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.messages && Array.isArray(data.messages)) {
                setNotifications(
                    data.messages.sort((a, b) => new Date(b.time) - new Date(a.time))
                );
            } else {
                console.error("Invalid data format:", data);
                setError("Invalid data format");
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setError("Error fetching notifications");
        }
    };

    useEffect(() => {
        fetchNotifications(); // Initial fetch
        const intervalId = setInterval(fetchNotifications, 5000); // Fetch every 5 seconds
        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const handleMarkAllAsRead = async () => {
        try {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                console.error("Access token not found");
                setError("Access token not found");
                return;
            }

            await fetch(
                "https://dicedreams-backend-deploy-to-render.onrender.com/api/notification/mark-all-as-read",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) => ({
                    ...notification,
                    read: true,
                }))
            );
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            setError("Error marking all notifications as read");
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                console.error("Access token not found");
                setError("Access token not found");
                return;
            }

            const response = await fetch(
                "https://dicedreams-backend-deploy-to-render.onrender.com/api/notification",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ notification_id: [id] }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification.notification_id === id
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
            setError("Error marking notification as read");
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, minHeight: '80vh' }}>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 800,
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
                        {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <Box key={index} sx={{ marginBottom: 2 }}>
                                    <Typography variant="body1" sx={{ textDecoration: notification.read ? 'line-through' : 'none' }}>
                                        {`Notification ID: ${notification.notification_id} - Type: ${notification.type} - Time: ${new Date(notification.time).toLocaleString()}`}
                                    </Typography>
                                    {!notification.read && (
                                        <Button variant="contained" color="primary" size="small" onClick={() => handleMarkAsRead(notification.notification_id)}>
                                            Mark as Read
                                        </Button>
                                    )}
                                    <Divider sx={{ backgroundColor: 'white', marginY: 1 }} />
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body1" sx={{ color: 'white', marginBottom: 2 }}>
                                No notifications available.
                            </Typography>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="contained" color="secondary" onClick={handleMarkAllAsRead}>
                                Mark All as Read
                            </Button>
                        )}
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ backgroundColor: 'black', color: 'white' }}>
                        {requests.length > 0 ? (
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
                        ) : (
                            <Typography variant="body1" sx={{ color: 'white', padding: 2 }}>
                                No requests available.
                            </Typography>
                        )}
                    </TableContainer>
                )}
            </Box>
        </Box>
    );
};

export default NotificationPage;
