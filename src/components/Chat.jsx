import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Avatar, Snackbar, Alert, AlertTitle, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';

const Chat = ({ userId, username, post_games_id }) => {
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            chat_id: 1,
            message: "Hello! This is a test message.",
            datetime_chat: dayjs().format('MM/DD/YYYY HH:mm:ss'),
            user_id: 1,
            user: { username: 'JohnDoe', user_image: '' },
        },
        {
            chat_id: 2,
            message: "This is another test message.",
            datetime_chat: dayjs().format('MM/DD/YYYY HH:mm:ss'),
            user_id: 2,
            user: { username: 'JaneDoe', user_image: '' },
        },
    ]);
    const [errorMessage, setErrorMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMessage, setCurrentMessage] = useState(null);
    const messagesEndRef = useRef(null);

    const sendMessage = () => {
        if (chatMessage.trim()) {
            const newMessage = {
                chat_id: messages.length + 1,
                message: chatMessage,
                datetime_chat: dayjs().format('MM/DD/YYYY HH:mm:ss'),
                user_id: userId,
                user: { username, user_image: '' },
            };

            if (editingMessage) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.chat_id === editingMessage.chat_id ? { ...msg, message: chatMessage } : msg
                    )
                );
                setEditingMessage(null);
            } else {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }

            setChatMessage('');
            scrollToBottom();
        }
    };

    const handleDeleteMessage = (chatId) => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.chat_id !== chatId));
        handleMenuClose();
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Box id="chat-container" sx={{ marginTop: 4, padding: 3, backgroundColor: '#424242', color: 'white' }}>
            <Typography id="chat-title" variant="h5" gutterBottom>Chat</Typography>
            <Box
                id="chat-messages-box"
                sx={{ height: 300, overflowY: 'auto', backgroundColor: '#333', padding: 2, borderRadius: 1 }}
            >
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <Box
                            id={`message-${msg.chat_id}`}
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
                                id={`avatar-${msg.chat_id}`}
                                alt={msg.user?.username || 'Anonymous'}
                                src={msg.user?.user_image || '/default-avatar.png'}
                                sx={{ marginRight: 1 }}
                            />
                            <Box id={`message-content-${msg.chat_id}`}>
                                <Typography id={`message-username-${msg.chat_id}`} variant="subtitle2">
                                    {msg.user?.username || 'Anonymous'}
                                    <Typography
                                        id={`message-time-${msg.chat_id}`}
                                        variant="caption"
                                        sx={{ marginLeft: 1, fontSize: '0.8rem' }}
                                    >
                                        {msg.datetime_chat}
                                    </Typography>
                                </Typography>
                                <Typography id={`message-text-${msg.chat_id}`} variant="body2">
                                    {msg.message}
                                </Typography>
                            </Box>
                            {msg.user_id === userId && (
                                <>
                                    <IconButton
                                        id={`message-menu-icon-${msg.chat_id}`}
                                        className="message-menu-icon"
                                        aria-label="settings"
                                        onClick={(event) => handleMenuOpen(event, msg)}
                                        sx={{ position: 'absolute', top: 0, right: 0, display: 'none' }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        id={`message-menu-${msg.chat_id}`}
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl) && currentMessage?.chat_id === msg.chat_id}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem id={`edit-message-${msg.chat_id}`} onClick={() => handleEditMessage(msg)}>Edit</MenuItem>
                                        <MenuItem id={`delete-message-${msg.chat_id}`} onClick={() => handleDeleteMessage(msg.chat_id)}>Delete</MenuItem>
                                    </Menu>
                                </>
                            )}
                        </Box>
                    ))
                ) : (
                    <Typography id="no-messages-text" variant="body2">ยังไม่มีข้อความ มาเริ่มการสนทนา!</Typography>
                )}
                <div id="messages-end" ref={messagesEndRef} />
            </Box>

            <TextField
                id="message-input"
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
                InputProps={{ style: { color: 'black' } }}
            />
            <Box id="send-button-container" sx={{ display: 'flex', marginTop: 1 }}>
                {editingMessage ? (
                    <>
                        <Button
                            id="update-message-button"
                            variant="contained"
                            sx={{
                                backgroundColor: 'yellow',
                                color: 'black',
                                '&:hover': { backgroundColor: 'gold' }, // Slightly darker on hover
                            }}
                            onClick={sendMessage}
                        >
                            Update
                        </Button>

                        <Button
                            id="cancel-edit-button"
                            variant="outlined" // Use outlined to make it look transparent
                            sx={{
                                color: 'primary.main', // Text is the primary theme color
                                borderColor: 'primary.main', // Border is the primary theme color
                                backgroundColor: 'transparent',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 255, 0.1)' }, // Light blue on hover for effect
                                marginLeft: 1,
                            }}
                            onClick={cancelEdit}
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <Button
                        id="send-message-button"
                        variant="contained"
                        sx={{
                            backgroundColor: 'crimson',
                            color: 'white'
                            , '&:hover': { backgroundColor: 'darkred' }
                        }}
                        onClick={sendMessage}
                    >
                        Send
                    </Button>
                )}
            </Box>

            <Snackbar id="error-snackbar" open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage('')}>
                <Alert id="error-alert" severity="error" onClose={() => setErrorMessage('')}>
                    <AlertTitle id="error-alert-title">Error</AlertTitle>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Chat;
