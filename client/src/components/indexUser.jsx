import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MailIcon from "@mui/icons-material/Mail";

const IndexUser = ({ data, imgU, nameU }) => {
  const [clicked, setClicked] = useState(false);
  const [posts, setPosts] = useState(data || []);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const ITEM_HEIGHT = 48;
  const options = ["เข้าร่วม", "แก้ไขชื่อ", "อื่นๆ"];

  useEffect(() => {
    if (data) {
      setPosts(data);
    }
  }, [data]);

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
    const year = date.getFullYear();
    const weekday = thaiDays[date.getDay()];

    // Format time as HH.MM น.
    const [hours, minutes] = timeString.split(":");
    const formattedTime = `${hours}.${minutes} น.`;

    return `${weekday}ที่ ${day} ${thaiMonths[month]} พ.ศ.${year} เวลา ${formattedTime}`;
  };

  const chatClick = () => {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 3000);
  };

  const fromDateNDay = (dateStr) => {
    const date = new Date(dateStr);

    const thaiYear = date.getUTCFullYear() + 543;

    // Format the month and time
    const monthsThai = [
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

    const day = date.getUTCDate();
    const month = monthsThai[date.getUTCMonth()];
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();

    // Format time with leading zero if needed
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} น.`;

    // Combine the date and time
    return `${day} ${month} เวลา ${formattedTime}`;
  };

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
                src={imgU || "https://via.placeholder.com/40"} // Default avatar
                sx={{ width: 40, height: 40, marginRight: 2 }}
              />
              <Box>
                <Typography variant="body1" sx={{ color: "white" }}>
                  {nameU || "Unknown User"}
                </Typography>
                <Typography variant="body2" sx={{ color: "gray" }}>
                  {fromDateNDay(post.creation_date)}
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
                textAlign: "left",
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
                {`สถานที่: ${post.loaction ? post.loaction : "????"}`}
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
                  {clicked ? (
                    <>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body1">
                        New feature is coming soon
                      </Typography>
                    </>
                  ) : (
                    <>
                      <MailIcon />
                      <Typography variant="body1">Chat</Typography>
                    </>
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default IndexUser;
