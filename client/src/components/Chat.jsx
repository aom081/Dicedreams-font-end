import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import dayjs from 'dayjs';

const Chat = ({ userId, username, post_games_id }) => {
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null); // To track editing state
    const messagesEndRef = useRef(null);

    console.log('Chat component loaded with post_games_id:', post_games_id);

    // Fetch chat messages
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
                setMessages(data); // Set fetched messages
            } else {
                console.error("Failed to fetch chat messages:", await response.text());
                setErrorMessage('Failed to load messages.');
            }
        } catch (error) {
            console.error("Error fetching chat messages:", error);
            setErrorMessage('Failed to load messages.');
        } finally {
            setLoading(false);
        }
    };

    // Send or update a message
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
                    // Update existing message
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
                    // Send new message
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
                        // Update the message in the list
                        setMessages((prevMessages) =>
                            prevMessages.map((msg) =>
                                msg.chat_id === editingMessage.chat_id ? data : msg
                            )
                        );
                        setEditingMessage(null); // Clear edit state
                    } else {
                        // Append new message
                        setMessages((prevMessages) => [...prevMessages, data]);
                    }
                    setChatMessage(''); // Clear input field
                } else {
                    console.error("Failed to send message:", await response.text());
                    setErrorMessage('Failed to send message.');
                }
            } catch (error) {
                console.error("Error sending message:", error);
                setErrorMessage('Failed to send message.');
            }
        }
    };

    // Delete a message
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
            } else {
                console.error("Failed to delete message:", await response.text());
                setErrorMessage('Failed to delete message.');
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            setErrorMessage('Failed to delete message.');
        }
    };

    // Edit a message
    const handleEditMessage = (message) => {
        setEditingMessage(message);
        setChatMessage(message.message); // Populate the input with the message content
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingMessage(null);
        setChatMessage('');
    };

    // Fetch messages on component mount and set up polling
    useEffect(() => {
        if (post_games_id) {
            fetchChatMessages(post_games_id); // Fetch messages
            const interval = setInterval(() => fetchChatMessages(post_games_id), 5000); // Poll every 5 seconds
            return () => clearInterval(interval); // Cleanup on unmount
        } else {
            console.error('No post_games_id provided!');
        }
    }, [post_games_id]);

    return (
        <Box id="chat-paper" elevation={3} sx={{ marginTop: 4, padding: 3, backgroundColor: '#424242', color: 'white' }}>
            <Typography id="chat-title" variant="h5" gutterBottom>Chat</Typography>
            <Box
                id="chat-messages"
                sx={{ height: 300, overflowY: 'auto', backgroundColor: '#333', padding: 2, borderRadius: 1 }}
            >
                {loading ? (
                    <Typography id="loading-messages" variant="body2">Loading messages...</Typography>
                ) : messages.length > 0 ? (
                    messages.map((msg) => (
                        <Box
                            key={msg.chat_id}
                            id={`message-${msg.chat_id}`}
                            sx={{
                                backgroundColor: msg.user_id === userId ? '#3f51b5' : '#757575',
                                color: 'white',
                                padding: 1,
                                marginBottom: 1,
                                borderRadius: '8px',
                                alignSelf: msg.user_id === userId ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                position: 'relative', // For positioning the buttons
                            }}
                        >
                            <Typography variant="subtitle2" id={`message-username-${msg.chat_id}`}>
                                {msg.username}
                                <Typography
                                    variant="caption"
                                    sx={{ marginLeft: 1, fontSize: '0.8rem' }}
                                    id={`message-timestamp-${msg.chat_id}`}
                                >
                                    {msg.datetime_chat}
                                </Typography>
                            </Typography>
                            <Typography variant="body2" id={`message-text-${msg.chat_id}`}>
                                {msg.message}
                            </Typography>

                            {msg.user_id === userId && (
                                <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
                                    <Button
                                        size="small"
                                        onClick={() => handleEditMessage(msg)}
                                        sx={{ color: 'white' }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => handleDeleteMessage(msg.chat_id)}
                                        sx={{ color: 'white' }}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    ))
                ) : (
                    <Typography id="no-messages" variant="body2">No messages yet.</Typography>
                )}
                <div ref={messagesEndRef} />
            </Box>

            <Grid id="message-input-grid" container spacing={2} sx={{ marginTop: 2 }}>
                <Grid item xs={9}>
                    <TextField
                        id="message-input"
                        fullWidth
                        variant="outlined"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Type your message"
                        InputProps={{ style: { color: 'white' } }}
                        multiline
                        maxRows={4}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#555',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#777',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#3f51b5',
                                },
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Button
                        id="send-message-button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={sendMessage}
                        disabled={!chatMessage.trim()}
                        sx={{ height: '100%' }}
                    >
                        {editingMessage ? 'Update' : 'Send'}
                    </Button>
                    {editingMessage && (
                        <Button
                            id="cancel-edit-button"
                            fullWidth
                            variant="contained"
                            color="secondary"
                            onClick={cancelEdit}
                            sx={{ height: '100%', marginTop: 1 }}
                        >
                            Cancel
                        </Button>
                    )}
                </Grid>
            </Grid>

            <Snackbar
                open={Boolean(errorMessage)}
                autoHideDuration={6000}
                onClose={() => setErrorMessage('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Chat;
