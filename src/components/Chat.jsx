import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Avatar, Snackbar, Alert, AlertTitle, IconButton, Menu, MenuItem, CircularProgress } from '@mui/material';
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

    // ดึงข้อมูลแชทครั้งเดียวเมื่อ component mount และใช้ interval ดึงข้อมูลซ้ำทุก 10 วินาที
    const fetchChatMessages = async (postId) => {
        setLoading(true); // เปิดการแสดง Loading Indicator
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
                setMessages(data); // ตั้งค่าให้แสดงข้อความที่ดึงมา
            } else {
                setErrorMessage('โหลดข้อความไม่สำเร็จ');
            }
        } catch (error) {
            setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        } finally {
            setLoading(false); // ปิดการแสดง Loading Indicator เมื่อโหลดเสร็จสิ้น
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
                    // ถ้าเป็นการแก้ไขข้อความ
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
                    // ถ้าเป็นการส่งข้อความใหม่
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
                        // อัปเดตข้อความที่แก้ไข
                        setMessages((prevMessages) =>
                            prevMessages.map((msg) =>
                                msg.chat_id === editingMessage.chat_id ? data : msg
                            )
                        );
                        setEditingMessage(null);
                    } else {
                        // เพิ่มข้อความใหม่
                        setMessages((prevMessages) => [...prevMessages, data]);
                        setChatMessage(''); // เคลียร์ข้อความที่ส่งแล้ว
                    }
                    scrollToBottom(); // เลื่อนหน้าไปยังข้อความล่าสุด
                } else {
                    setErrorMessage('ไม่สามารถส่งข้อความได้');
                }
            } catch (error) {
                setErrorMessage('เกิดข้อผิดพลาดในการส่งข้อความ');
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
                setErrorMessage('ลบข้อความไม่สำเร็จ');
            }
        } catch (error) {
            setErrorMessage('ลบข้อความไม่สำเร็จ');
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
            const interval = setInterval(() => fetchChatMessages(post_games_id), 10000); // ดึงข้อมูลทุก 10 วินาที
            return () => clearInterval(interval);
        }
    }, [post_games_id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#424242', color: 'white' }}>
            <Typography variant="h5" gutterBottom>Chat</Typography>
            <Box sx={{ height: 300, overflowY: 'auto', backgroundColor: '#333', padding: 2, borderRadius: 1 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress /> {/* แสดง Loading Spinner */}
                    </Box>
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
