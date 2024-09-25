import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Avatar, Snackbar, Alert,AlertTitle, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';

const Chat = ({ userId, username, post_games_id }) => {
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMessage, setCurrentMessage] = useState(null);
    const messagesEndRef = useRef(null);

    const fetchChatMessages = async (postId) => {
        try {
            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/chat/post/${postId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log(data); // Add this line to inspect the response structure
                setMessages(data);
            } else {
                setErrorMessage('Failed to load messages.');
            }
        } catch (error) {
            setErrorMessage('Failed to load messages.');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (chatMessage.trim()) {
            try {
                const token = localStorage.getItem('access_token');
                const newMessage = {
                    message: chatMessage,
                    datetime_chat: dayjs().format('MM/DD/YYYY HH:mm:ss'),
                    user_id: userId,
                    post_games_id: post_games_id
                };

                let response;
                if (editingMessage) {
                    response = await fetch(
                        `https://dicedreams-backend-deploy-to-render.onrender.com/api/chat/${editingMessage.chat_id}`,
                        {
                            method: 'PUT',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(newMessage)
                        }
                    );
                } else {
                    response = await fetch(
                        `https://dicedreams-backend-deploy-to-render.onrender.com/api/chat`,
                        {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(newMessage)
                        }
                    );
                }

                if (response.ok) {
                    const data = await response.json();
                    if (editingMessage) {
                        setMessages((prevMessages) =>
                            prevMessages.map((msg) =>
                                msg.chat_id === editingMessage.chat_id ? data : msg
                            )
                        );
                        setEditingMessage(null);
                    } else {
                        setMessages((prevMessages) => [...prevMessages, data]);
                        setChatMessage(''); // Clear input after sending
                    }
                    scrollToBottom(); // Scroll to latest message
                } else {
                    const errorText = await response.text();
                    if (response.status === 500) {
                        setErrorMessage('Internal Server Error. Please try again.');
                    } else {
                        setErrorMessage(`Failed to send message: ${errorText}`);
                    }
                }
            } catch (error) {
                console.error("Error sending message:", error);
                setErrorMessage('Failed to send message.');
            }
        }
    };

    const handleDeleteMessage = async (chatId) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(
                `https://dicedreams-backend-deploy-to-render.onrender.com/api/chat/${chatId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                setMessages((prevMessages) => prevMessages.filter((msg) => msg.chat_id !== chatId));
                handleMenuClose();
            } else {
                setErrorMessage('Failed to delete message.');
            }
        } catch (error) {
            setErrorMessage('Failed to delete message.');
        }
    };

    const handleEditMessage = (message) => {
        setEditingMessage(message);
        setChatMessage(message.message);
        handleMenuClose();
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setChatMessage('');
    };

    const handleMenuOpen = (event, message) => {
        setAnchorEl(event.currentTarget);
        setCurrentMessage(message);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentMessage(null);
    };

    useEffect(() => {
        if (post_games_id) {
            fetchChatMessages(post_games_id);
            const interval = setInterval(() => fetchChatMessages(post_games_id), 5000);
            return () => clearInterval(interval);
        }
    }, [post_games_id]);

    return (
        <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#424242', color: 'white' }}>
            <Typography variant="h5" gutterBottom>Chat</Typography>
            <Box sx={{ height: 300, overflowY: 'auto', backgroundColor: '#333', padding: 2, borderRadius: 1 }}>
                {loading ? (
                    <Typography variant="body2">Loading messages...</Typography>
                ) : messages.length > 0 ? (
                    messages.map((msg) => (
                        <Box
                            key={msg.chat_id}
                            sx={{
                                backgroundColor: msg.user_id === userId ? '#3f51b5' : '#757575',
                                color: 'white',
                                padding: 1,
                                marginBottom: 1,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                maxWidth: '80%',
                                position: 'relative',
                                '&:hover .message-menu-icon': { display: 'inline-block' },
                            }}
                        >
                            <Avatar
                                alt={msg.user?.username || 'Anonymous'} // Add safe navigation with "?" to avoid undefined errors
                                src={msg.user?.user_image || '/default-avatar.png'} // Provide a fallback image
                                sx={{ marginRight: 1 }}
                            />
                            <Box>
                                <Typography variant="subtitle2">
                                    {msg.user?.username || 'Anonymous'} {/* Add fallback for undefined username */}
                                    <Typography variant="caption" sx={{ marginLeft: 1, fontSize: '0.8rem' }}>
                                        {msg.datetime_chat}
                                    </Typography>
                                </Typography>
                                <Typography variant="body2">
                                    {msg.message}
                                </Typography>
                            </Box>
                            {msg.user_id === userId && (
                                <>
                                    <IconButton
                                        className="message-menu-icon"
                                        aria-label="settings"
                                        onClick={(event) => handleMenuOpen(event, msg)}
                                        sx={{ position: 'absolute', top: 0, right: 0, display: 'none' }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl) && currentMessage?.chat_id === msg.chat_id}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem onClick={() => handleEditMessage(msg)}>Edit</MenuItem>
                                        <MenuItem onClick={() => handleDeleteMessage(msg.chat_id)}>Delete</MenuItem>
                                    </Menu>
                                </>
                            )}
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2">No messages yet. Start the conversation!</Typography>
                )}
                <div ref={messagesEndRef} />
            </Box>
            <TextField
                label="Enter message"
                variant="outlined"
                size="small"
                fullWidth
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
                sx={{ marginTop: 2, backgroundColor: 'white', borderRadius: 1 }}
                InputProps={{ style: { color: 'black' } }} // Text color changed to gray
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: editingMessage ? 'yellow' : 'crimson', // Yellow background for edit
                        color: editingMessage ? 'black' : 'white', // Black text for edit
                        '&:hover': {
                            backgroundColor: editingMessage ? 'darkorange' : '#67091C' // Darker yellow on hover
                        }
                    }}
                    onClick={sendMessage}
                >
                    {editingMessage ? 'Edit' : 'Send'}
                </Button>
                {editingMessage && (
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: 'red',
                            color: 'red',
                            backgroundColor: 'transparent', // Transparent background for Cancel
                            '&:hover': {
                                backgroundColor: 'rgba(255, 0, 0, 0.1)', // Slight red hover effect
                            }
                        }}
                        onClick={cancelEdit}
                    >
                        Cancel Edit
                    </Button>
                )}
            </Box>


            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}  // Centered Snackbar
                open={Boolean(errorMessage)}
                autoHideDuration={6000}
                onClose={() => setErrorMessage('')}
                id="chat-snackbar"  // Unique ID for easier testing
                sx={{ width: '100%' }}  // Full width Snackbar
            >
                <Alert
                    onClose={() => setErrorMessage('')}
                    severity="error"
                    sx={{ width: '80%', fontSize: '1rem' }}  // Width and font size for message content
                >
                    <AlertTitle sx={{ fontSize: '1.50rem' }}>Error</AlertTitle>  // Styled title
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Chat;
