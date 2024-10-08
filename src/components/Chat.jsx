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
        <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#424242', color: 'white' }}>
            <Typography variant="h5" gutterBottom>Chat</Typography>
            <Box sx={{ height: 300, overflowY: 'auto', backgroundColor: '#333', padding: 2, borderRadius: 1 }}>
                {messages.length > 0 ? (
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
                                alt={msg.user?.username || 'Anonymous'}
                                src={msg.user?.user_image || '/default-avatar.png'}
                                sx={{ marginRight: 1 }}
                            />
                            <Box>
                                <Typography variant="subtitle2">
                                    {msg.user?.username || 'Anonymous'}
                                    <Typography variant="caption" sx={{ marginLeft: 1, fontSize: '0.8rem' }}>
                                        {msg.datetime_chat}
                                    </Typography>
                                </Typography>
                                <Typography variant="body2">{msg.message}</Typography>
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
                    <Typography variant="body2">ยังไม่มีข้อความ มาเริ่มการสนทนา!</Typography>
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
                InputProps={{ style: { color: 'black' } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 1 }}>
                {editingMessage ? (
                    <>
                        <Button variant="contained" color="primary" onClick={sendMessage}>Update</Button>
                        <Button variant="contained" color="secondary" onClick={cancelEdit} sx={{ marginLeft: 1 }}>Cancel</Button>
                    </>
                ) : (
                    <Button variant="contained" color="primary" onClick={sendMessage}>Send</Button>
                )}
            </Box>

            <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage('')}>
                <Alert severity="error" onClose={() => setErrorMessage('')}>
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Chat;
