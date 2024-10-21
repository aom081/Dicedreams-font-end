import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
} from "@mui/material";
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
                return { first_name: "Unknown", last_name: "User", user_image: "" };
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
            return {
                first_name: userData.first_name || "Unknown",
                last_name: userData.last_name || "User",
                user_image: userData.user_image || "",
            };
        } catch (error) {
            console.error(`Error fetching user details for user_id ${user_id}:`, error);
            return { first_name: "Unknown", last_name: "User", user_image: "" };
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
                        const post_games_id = notification.data?.post_games_id;

                        const userDetails = user_id ? await fetchUserDetails(user_id) : { first_name: "Unknown", last_name: "User", user_image: "" };
                        const name_games = await fetchGameDetails(post_games_id);

                        return {
                            ...notification,
                            ...userDetails,
                            name_games,
                        };
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
        <Box
            id="notification-page-container"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: { xs: 2, sm: 4, md: 6, lg: 12 }, // Responsive padding
                minHeight: '80vh',
            }}
        >
            <Box
                id="notification-box"
                sx={{
                    width: '100%',
                    maxWidth: 800,
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: 2,
                    padding: { xs: 2, sm: 3 }, // Responsive padding
                    textAlign: 'center',
                }}
            >
                <ButtonGroup
                    id="tab-button-group"
                    variant="text"
                    color="primary"
                    sx={{ marginBottom: 2 }}
                >
                    <Button
                        id="request-tab-button"
                        onClick={() => setActiveTab('request')}
                        sx={{
                            color: activeTab === 'request' ? 'red' : 'inherit',
                            '&:hover': { color: 'red' },
                            fontSize: { xs: '0.8rem', sm: '1rem' }, // Responsive font size
                        }}
                    >
                        Request
                    </Button>
                    <Button
                        id="notification-tab-button"
                        onClick={() => setActiveTab('notification')}
                        sx={{
                            color: activeTab === 'notification' ? 'red' : 'inherit',
                            '&:hover': { color: 'red' },
                            fontSize: { xs: '0.8rem', sm: '1rem' }, // Responsive font size
                        }}
                    >
                        Notification
                    </Button>
                </ButtonGroup>

                {activeTab === 'notification' ? (
                    <Box id="notifications-container">
                        {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <Box
                                    key={index}
                                    id={`notification-content-${index}`}
                                    onClick={() => handleMarkAsReadAndNavigate(notification.notification_id, notification.data.post_games_id)}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column', // Vertical stacking
                                        gap: 1,
                                        maxWidth: '100%',
                                        padding: { xs: 1, sm: 2 }, // Responsive padding
                                        borderRadius: 2,
                                        backgroundColor: notification.read ? '#808080' : '#1976d2',
                                        color: 'white',
                                        wordWrap: 'break-word',
                                        cursor: 'pointer',
                                        marginBottom: { xs: 1, sm: 2 }, // Responsive margin
                                    }}
                                >
                                    {/* User and Game Info */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                                        <Avatar src={notification.user_image} alt={`${notification.first_name} ${notification.last_name}`} />
                                        <Typography id={`notification-text-${index}`} variant="body1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                            {`Game: ${notification.name_games} - User: ${notification.first_name} ${notification.last_name}`}
                                        </Typography>
                                    </Box>

                                    {/* Notification Message */}
                                    <Typography id={`notification-message-${index}`} variant="body2" sx={{ color: 'lightgray', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                        {`Message: ${notification.data?.message || 'No message'}`}
                                    </Typography>

                                    {/* Time Info */}
                                    <Typography id={`notification-time-${index}`} variant="caption" display="block" sx={{ color: 'lightgray', textAlign: 'right', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                        {`Time: ${new Date(notification.time).toLocaleString()}`}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography id="no-notifications-text" variant="body1" sx={{ color: 'white', marginBottom: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                No notifications available.
                            </Typography>
                        )}
                    </Box>
                ) : (
                    <TableContainer id="requests-container" component={Paper} sx={{ backgroundColor: 'black', overflowX: 'auto' }}>
                        {requests.length > 0 ? (
                            <Table id="requests-table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell id="user-column-header" sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                            User
                                        </TableCell>
                                        <TableCell id="game-column-header" sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                            Game
                                        </TableCell>
                                        <TableCell id="approve-column-header" sx={{ color: 'white', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                            Participants
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                    <TableBody>
                                        {requests.map((request, index) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                                                        <Avatar src={request.user_image} alt={`${request.first_name} ${request.last_name}`} />
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                display: { xs: 'none', sm: 'inline' }, // Hide name on extra-small screens
                                                            }}
                                                        >
                                                            {`${request.first_name} ${request.last_name}`}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ color: 'white', fontSize: { xs: '0.8rem', sm: '1rem' } }}>{request.name_games}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        sx={{ fontSize: { xs: '0.7rem', sm: '0.9rem' } }} // Responsive font size
                                                        onClick={() => navigate(`/edit-participants/${request.data.post_games_id}`)}
                                                    >
                                                        View Participants
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                            </Table>
                        ) : (
                            <Typography id="no-requests-text" variant="body1" sx={{ color: 'white', marginBottom: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
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