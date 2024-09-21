// Chat.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid } from '@mui/material';
import dayjs from 'dayjs';

const Chat = ({ userId, username }) => {
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSendMessage = () => {
        if (chatMessage.trim()) {
            const timestamp = dayjs().format('MMM DD YYYY, h:mm A'); // Format the timestamp
            setMessages((prevMessages) => [
                ...prevMessages,
                { userId, username, text: chatMessage, timestamp } // Include timestamp in each message
            ]);
            setChatMessage('');  // Clear input field
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default behavior (like submitting a form)
            handleSendMessage(); // Call send message function
        }
    };

    return (
        <Box id="chat-paper" elevation={3} sx={{ marginTop: 4, padding: 3, backgroundColor: '#424242', color: 'white' }}>
            <Typography id="chat-title" variant="h5" gutterBottom>Event Chat</Typography>

            {/* Display messages */}
            <Box id="chat-messages" sx={{ height: 200, overflowY: 'auto', backgroundColor: '#333', padding: 2, borderRadius: 1 }}>
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <Box key={index} id={`message-${index}`} sx={{
                            backgroundColor: msg.userId === userId ? '#3f51b5' : '#757575',
                            color: 'white', padding: 1, marginBottom: 1, borderRadius: '8px'
                        }}>
                            <Typography variant="subtitle2" id={`message-username-${index}`}>
                                {msg.username} {/* Displaying username */}
                                <Typography variant="caption" sx={{ marginLeft: 1, fontSize: '0.8rem' }} id={`message-timestamp-${index}`}>
                                    {msg.timestamp} {/* Displaying timestamp */}
                                </Typography>
                            </Typography>
                            <Typography variant="body2" id={`message-text-${index}`}>
                                {msg.text}
                            </Typography>
                        </Box>
                    ))
                ) : (
                    <Typography id="no-messages" variant="body2">No messages yet.</Typography>
                )}
            </Box>

            {/* Message input */}
            <Grid id="message-input-grid" container spacing={2} sx={{ marginTop: 2 }}>
                <Grid item xs={9}>
                    <TextField
                        id="message-input"
                        fullWidth
                        variant="outlined"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={handleKeyPress} // Add keypress handler
                        placeholder="Type your message"
                        InputProps={{ style: { color: 'white' } }}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Button
                        id="send-message-button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                    >
                        Send
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Chat;
