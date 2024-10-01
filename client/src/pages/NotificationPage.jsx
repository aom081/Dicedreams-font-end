import React, { useState, useEffect } from "react";
import { Box, Button, ButtonGroup, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [requests, setRequests] = useState([]); // State for requests
    const [activeTab, setActiveTab] = useState('notification'); // State for active tab
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch User Details
    const fetchUserDetails = async (user_id) => {
        try {
            if (!user_id) {
                console.error('Error: user_id is undefined or null');
                return "Unknown User";
            }

            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) throw new Error("Access token not found");

            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/users/${user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error(`Error fetching user details: ${response.status}`);
            const userData = await response.json();
            return userData.username;
        } catch (error) {
            console.error(`Error fetching user details for user_id ${user_id}:`, error);
            return "Unknown User";
        }
    };

    const fetchGameDetails = async (post_games_id) => {
        try {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) throw new Error("Access token not found");

            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${post_games_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Error fetching game details");

            const gameData = await response.json();
            return gameData.name_games;
        } catch (error) {
            console.error(`Error fetching game details for post_games_id ${post_games_id}:`, error);
            return "Unknown Game";
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
                const sortedNotifications = data.messages.sort((a, b) => new Date(b.time) - new Date(a.time));

                const notificationsWithDetails = await Promise.all(
                    sortedNotifications.map(async (notification) => {
                        const user_id = notification.data?.user_id;
                        if (!user_id) {
                            return {
                                ...notification,
                                username: "Unknown User",
                                name_games: await fetchGameDetails(notification.data.post_games_id || "Unknown Game"),
                            };
                        }

                        const username = await fetchUserDetails(user_id);
                        const name_games = await fetchGameDetails(notification.data.post_games_id);

                        return { ...notification, username, name_games };
                    })
                );

                const filteredRequests = notificationsWithDetails.filter((notification) => notification.type === 'participate');
                const filteredNotifications = notificationsWithDetails.filter((notification) => notification.type !== 'participate');

                setRequests(filteredRequests);
                setNotifications(filteredNotifications);
            } else {
                setError("Invalid data format");
            }
        } catch (error) {
            setError("Error fetching notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleMarkAsReadAndNavigate = async (id, post_games_id) => {
        try {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                setError("Access token not found");
                return;
            }

            // Mark as read
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

            // Navigate to the event details page after marking as read
            navigate(`/events/${post_games_id}`);
        } catch (error) {
            setError("Error marking notification as read and navigating");
        }
    };

    return (
        <Box id="notification-page-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, minHeight: '80vh' }}>
            <Box
                id="notification-box"
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
                <ButtonGroup id="tab-button-group" variant="text" color="primary" sx={{ marginBottom: 2 }}>
                    <Button id="request-tab-button" onClick={() => setActiveTab('request')} sx={{ color: activeTab === 'request' ? 'red' : 'inherit', '&:hover': { color: 'red' } }}>Request</Button>
                    <Button id="notification-tab-button" onClick={() => setActiveTab('notification')} sx={{ color: activeTab === 'notification' ? 'red' : 'inherit', '&:hover': { color: 'red' } }}>Notification</Button>
                </ButtonGroup>

                {activeTab === 'notification' ? (
                    <Box id="notifications-container">
                        {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <Box
                                    id={`notification-${index}`}
                                    key={index}
                                    onClick={() => handleMarkAsReadAndNavigate(notification.notification_id, notification.data.post_games_id)} // Navigate on click
                                    sx={{
                                        display: 'flex',
                                        justifyContent: notification.read ? 'flex-end' : 'flex-start',
                                        marginBottom: 2,
                                        cursor: 'pointer', // Change cursor to indicate clickable
                                    }}
                                >
                                    <Box
                                        id={`notification-content-${index}`}
                                        sx={{
                                            maxWidth: '70%',
                                            padding: 2,
                                            borderRadius: 2,
                                            backgroundColor: notification.read ? '#d3d3d3' : '#1976d2', // Subtle background for read notifications
                                            color: 'white',
                                            textAlign: 'left',
                                            wordWrap: 'break-word',
                                        }}
                                    >
                                        <Typography
                                            id={`notification-text-${index}`}
                                            variant="body1"
                                        >
                                            {`Game: ${notification.name_games} - User: ${notification.username}`}
                                        </Typography>
                                        <Typography
                                            id={`notification-time-${index}`}
                                            variant="caption"
                                            display="block"
                                            sx={{ color: 'lightgray' }}
                                        >
                                            {`Time: ${new Date(notification.time).toLocaleString()}`}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Typography id="no-notifications-text" variant="body1" sx={{ color: 'white', marginBottom: 2 }}>
                                No notifications available.
                            </Typography>
                        )}
                    </Box>
                ) : (
                    <TableContainer id="requests-container" component={Paper} sx={{ backgroundColor: 'black' }}>
                        {requests.length > 0 ? (
                            <Table id="requests-table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell id="user-column-header" sx={{ color: 'white' }}>User</TableCell>
                                        <TableCell id="game-column-header" sx={{ color: 'white' }}>Game</TableCell>
                                        <TableCell id="approve-column-header" sx={{ color: 'white', textAlign: 'center' }}>Approve</TableCell>
                                        <TableCell id="refuse-column-header" sx={{ color: 'white', textAlign: 'center' }}>Refuse</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map((request, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ color: 'white' }}>{request.username}</TableCell>
                                            <TableCell sx={{ color: 'white' }}>{request.name_games}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Button variant="contained" color="success">Approve</Button>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Button variant="contained" color="error">Refuse</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography id="no-requests-text" variant="body1" sx={{ color: 'white', marginBottom: 2 }}>
                                No participation requests available.
                            </Typography>
                        )}
                    </TableContainer>
                )}
            </Box>
        </Box>
    );
};

export default NotificationPage;
