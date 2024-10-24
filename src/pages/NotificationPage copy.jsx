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
    const [initialLoading, setInitialLoading] = useState(true); // Loading state for first time only
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
            setInitialLoading(false); // Stop loading if there's an error
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
        } finally {
            setInitialLoading(false); // Set loading to false after first fetch completes
        }
    };

    const fetchRequests = async () => {
        const accessToken = localStorage.getItem("access_token");
        const user_id = localStorage.getItem("users_id");

        if (!accessToken) {
            console.error("Access token not found");
            setError("Access token not found");
            setInitialLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/user/${user_id}`,
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

            if (data && Array.isArray(data.requests)) {
                const requestsWithDetails = await Promise.all(
                    data.requests.map(async (request) => {
                        const user_id = request.data?.user_id;
                        const post_games_id = request.data?.post_games_id;

                        const userDetails = user_id ? await fetchUserDetails(user_id) : { first_name: "Unknown", last_name: "User", user_image: "" };
                        const name_games = await fetchGameDetails(post_games_id);

                        return {
                            ...request,
                            ...userDetails,
                            name_games,
                        };
                    })
                );

                setRequests(requestsWithDetails);
            } else {
                setError("Invalid data format");
            }
        } catch (error) {
            setError("Error fetching participation requests");
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchRequests(); // Fetch participation requests as well
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

    const handleEditParticipants = (post_games_id) => {
        navigate(`/edit-participants/${post_games_id}`);
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

                {activeTab === 'request' ? (
                    <Box id="request-section">
                        <Typography id="request-section-title" variant="h5" sx={{ mb: 2 }}>Requests</Typography>
                        <TableContainer id="request-table-container" component={Paper}>
                            <Table id="request-table">
                                <TableHead id="request-table-head">
                                    <TableRow>
                                        <TableCell id="request-table-cell-header">Request Info</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody id="request-table-body">
                                    {requests.map((request) => (
                                        <TableRow key={request.notification_id} id={`request-row-${request.notification_id}`}>
                                            <TableCell id={`request-cell-${request.notification_id}`}>
                                                <Box display="flex" alignItems="center" id={`request-user-info-${request.notification_id}`}>
                                                    <Avatar alt="user_image" src={request.user_image} id={`request-user-avatar-${request.notification_id}`} />
                                                    <Box ml={2} id={`request-user-text-${request.notification_id}`}>
                                                        <Typography id={`request-user-name-${request.notification_id}`}>{`${request.first_name} ${request.last_name} requested to join ${request.name_games}`}</Typography>
                                                        <Button
                                                            id={`request-edit-participants-button-${request.notification_id}`}
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleEditParticipants(request.data?.post_games_id)}
                                                        >
                                                            Edit Participants
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ) : (
                    <Box id="notification-section">
                        <Typography id="notification-section-title" variant="h5" sx={{ mb: 2 }}>Notifications</Typography>
                        <TableContainer id="notification-table-container" component={Paper}>
                            <Table id="notification-table">
                                <TableHead id="notification-table-head">
                                    <TableRow>
                                        <TableCell id="notification-table-cell-header">Notification Info</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody id="notification-table-body">
                                    {notifications.map((notification) => (
                                        <TableRow key={notification.notification_id} id={`notification-row-${notification.notification_id}`}>
                                            <TableCell id={`notification-cell-${notification.notification_id}`}>
                                                <Box display="flex" alignItems="center" id={`notification-user-info-${notification.notification_id}`}>
                                                    <Avatar alt="user_image" src={notification.user_image} id={`notification-user-avatar-${notification.notification_id}`} />
                                                    <Box ml={2} id={`notification-user-text-${notification.notification_id}`}>
                                                        <Typography id={`notification-user-name-${notification.notification_id}`}>{`${notification.first_name} ${notification.last_name} invited you to join ${notification.name_games}`}</Typography>
                                                        <Button
                                                            id={`notification-view-event-button-${notification.notification_id}`}
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleMarkAsReadAndNavigate(notification.notification_id, notification.data?.post_games_id)}
                                                        >
                                                            View Event
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default NotificationPage;
