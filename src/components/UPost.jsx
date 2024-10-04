import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MailIcon from "@mui/icons-material/Mail";
import { useNavigate } from "react-router-dom";

const UserPosts = ({ user }) => {
  const navigate = useNavigate();

  const chatClick = () => {
    alert("Coming soon")
    // navigate("/chat");
  };

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const ITEM_HEIGHT = 48;
  const options = ["เข้าร่วม", "แก้ไขชื่อ", "อื่นๆ"];

  if (!user.users_id) {
    return <Alert severity="error">{error}</Alert>;
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          alert("กรุณาลอกอินใหม่อีกครั้ง");
          navigate("/");
          throw new Error("No token found");
        }

        const response = await axios.get(
          // `https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/user/48b0a732-b292-4cf8-bdd2-52156f177587`, // test
          `https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/user/${user.users_id}`, // real
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPosts(response.data);
        setLoading(false);
        console.log("res-->", response.data);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user.users_id]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const formatDateToThai = (dateString, timeString) => {
    const thaiDays = [
      "วันอาทิตย์",
      "วันจันทร์",
      "วันอังคาร",
      "วันพุธ",
      "วันพฤหัสบดี",
      "วันศุกร์",
      "วันเสาร์",
    ];

    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543; // Buddhist Era is 543 years ahead
    const weekday = thaiDays[date.getDay()];

    // Format time as HH.MM น.
    const [hours, minutes] = timeString.split(":");
    const formattedTime = `${hours}.${minutes} น.`;

    return `${weekday} ที่ ${day} ${thaiMonths[month]} พ.ศ.${year} เวลา ${formattedTime}`;
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ padding: 2, color: "white" }}>
      {posts.map((post) => {
        const formattedDate = formatDateToThai(post.date_meet, post.time_meet);

        return (
          <Box
            key={post.post_games_id}
            sx={{
              backgroundColor: "#222",
              borderRadius: 2,
              width: "61%",
              margin: "20px auto",
              padding: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                paddingBottom: 2,
              }}
            >
              <Avatar
                src={user.user_image || "https://via.placeholder.com/40"} // Default avatar
                sx={{ width: 40, height: 40, marginRight: 2 }}
              />
              <Box>
                <Typography variant="body1" sx={{ color: "white" }}>
                  {user.username || "Unknown User"}
                </Typography>
                <Typography variant="body2" sx={{ color: "gray" }}>
                  {post.date_meet}
                </Typography>
              </Box>

              <Box sx={{ marginLeft: "auto" }}>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={menuOpen ? "long-menu" : undefined}
                  aria-expanded={menuOpen ? "true" : undefined}
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                  sx={{ color: "white" }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="long-menu"
                  MenuListProps={{
                    "aria-labelledby": "long-button",
                  }}
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  PaperProps={{
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5,
                      width: "20ch",
                    },
                  }}
                >
                  {options.map((option) => (
                    <MenuItem key={option} onClick={handleMenuClose}>
                      {option}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>

            <Box sx={{ textAlign: "center", marginTop: 1, marginBottom: 1 }}>
              {post.games_image ? (
                <img
                  src={post.games_image}
                  alt={post.name_games}
                  style={{
                    width: "100%",
                    height: "auto",
                    marginTop: 8,
                    borderRadius: 8,
                  }}
                />
              ) : (
                <Typography variant="body2" sx={{ color: "white" }}>
                  No image available
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                textAlign: "Left",
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 1,
              }}
            >
              <Typography variant="h6" sx={{ color: "white", marginTop: 2 }}>
                {post.name_games}
              </Typography>
              <Typography variant="body1" sx={{ color: "white", marginTop: 2 }}>
                {formattedDate}
              </Typography>
              <Typography
                variant="body2"
                sx={{ marginTop: 1, color: "white", marginTop: 2 }}
              >
                {post.detail_post}
              </Typography>
              <Typography variant="body2" sx={{ color: "white", marginTop: 2 }}>
                {`สถานที่: ${post.loaction ? post.loaction : "เดี๋ยวบอก"}`}
              </Typography>
              <Typography variant="body2" sx={{ color: "white" }}>
                {`จำนวนคนจะไป: 1/${post.num_people}`}
              </Typography>

              <Box
                sx={{
                  marginTop: 2,
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <Button
                  onClick={chatClick}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid white",
                    color: "white",
                    backgroundColor: "#333",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "center",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <MailIcon />
                  <Typography variant="body1">Chat</Typography>
                </Button>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default UserPosts;
