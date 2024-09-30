import React, { useState, useEffect } from "react";
import { Box, Button, ButtonGroup, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [requests, setRequests] = useState([]); // State for requests
    const [activeTab, setActiveTab] = useState('notification'); // State for active tab
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchUserDetails = async (user_id) => {
        try {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) throw new Error("Access token not found");

            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/users/${user_id}`, // Adjust API endpoint if necessary
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Error fetching user details");

            const userData = await response.json();
            return userData.username; // Assuming the API returns a `username`
        } catch (error) {
            console.error(`Error fetching user details for user_id ${user_id}:`, error);
            return "Unknown User"; // Fallback if there's an error
        }
    };

    const fetchGameDetails = async (post_games_id) => {
        try {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) throw new Error("Access token not found");

            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/${post_games_id}`, // Adjust API endpoint if necessary
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Error fetching game details");

            const gameData = await response.json();
            return gameData.name_games; // Assuming the API returns a `name_games`
        } catch (error) {
            console.error(`Error fetching game details for post_games_id ${post_games_id}:`, error);
            return "Unknown Game"; // Fallback if there's an error
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
            console.log('Fetching notifications from API...');
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
            console.log('Raw notification data:', data); // Log raw data for debugging

            if (data.messages && Array.isArray(data.messages)) {
                const sortedNotifications = data.messages.sort((a, b) => new Date(b.time) - new Date(a.time));

                const notificationsWithDetails = await Promise.all(
                    sortedNotifications.map(async (notification) => {
                        const username = await fetchUserDetails(notification.data.user_id);
                        const name_games = await fetchGameDetails(notification.data.post_games_id);
                        return { ...notification, username, name_games };
                    })
                );

                // Separate requests and notifications
                const filteredRequests = notificationsWithDetails.filter((notification) => notification.type === 'participate');
                const filteredNotifications = notificationsWithDetails.filter((notification) => notification.type !== 'participate');

                setRequests(filteredRequests); // Set requests
                setNotifications(filteredNotifications); // Set non-request notifications
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
        console.log('Marking all notifications as read...');
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
            console.log('All notifications marked as read');
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            setError("Error marking all notifications as read");
        }
    };

    const handleMarkAsRead = async (id) => {
        console.log(`Marking notification ${id} as read`);
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
            console.log(`Notification ${id} marked as read`);
        } catch (error) {
            console.error(`Error marking notification ${id} as read:`, error);
            setError("Error marking notification as read");
        }
    };
    // Function to approve participation
    const handleApprove = async (part_Id) => {
        console.log(`Approving participant ${part_Id}`);
        try {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                console.error("Access token not found");
                setError("Access token not found");
                return;
            }

            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/${part_Id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ status: "approved" }), // Payload for approval
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Participant ${part_Id} approved`);
            // Optionally update UI to reflect the approval
            setRequests((prevRequests) =>
                prevRequests.filter((request) => request.notification_id !== part_Id)
            );
        } catch (error) {
            console.error(`Error approving participant ${part_Id}:`, error);
            setError("Error approving participant");
        }
    };

    // Function to refuse participation
    const handleRefuse = async (part_Id) => {
        console.log(`Refusing participant ${part_Id}`);
        try {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                console.error("Access token not found");
                setError("Access token not found");
                return;
            }

            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/participate/${part_Id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ status: "refused" }), // Payload for refusal
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Participant ${part_Id} refused`);
            // Optionally update UI to reflect the refusal
            setRequests((prevRequests) =>
                prevRequests.filter((request) => request.notification_id !== part_Id)
            );
        } catch (error) {
            console.error(`Error refusing participant ${part_Id}:`, error);
            setError("Error refusing participant");
        }
    };

    useEffect(() => {
        fetchNotifications(); // Initial fetch
        const intervalId = setInterval(fetchNotifications, 5000); // Fetch every 5 seconds
        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

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
                    <Button onClick={() => setActiveTab('request')} sx={{ color: activeTab === 'request' ? 'red' : 'inherit', '&:hover': { color: 'red' } }}>Request</Button>
                    <Button onClick={() => setActiveTab('notification')} sx={{ color: activeTab === 'notification' ? 'red' : 'inherit', '&:hover': { color: 'red' } }}>Notification</Button>
                </ButtonGroup>

                {activeTab === 'notification' ? (
                    <Box>
                        {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <Box key={index} sx={{ marginBottom: 2 }}>
                                    <Typography variant="body1" sx={{ textDecoration: notification.read ? 'line-through' : 'none' }}>
                                        {`Notification ID: ${notification.notification_id} - Type: ${notification.type} - Time: ${new Date(notification.time).toLocaleString()} - Game: ${notification.name_games} - User: ${notification.username}`}
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
                    <TableContainer component={Paper} sx={{ backgroundColor: 'black' }}>
                        {requests.length > 0 ? (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white' }}>User</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Game</TableCell>
                                        <TableCell sx={{ color: 'white', textAlign: 'center' }}>Approve</TableCell>
                                        <TableCell sx={{ color: 'white', textAlign: 'center' }}>Refuse</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.map((request, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ color: 'white' }}>{request.username}</TableCell>
                                            <TableCell sx={{ color: 'white' }}>{request.name_games}</TableCell>
                                            <TableCell align="center">
                                                <Button variant="contained" color="primary" size="small" onClick={() => handleApprove(request.notification_id)}>Approve</Button>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button variant="contained" color="secondary" size="small" onClick={() => handleRefuse(request.notification_id)}>Refuse</Button>
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