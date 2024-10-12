import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formatDateToThai = (isoDateString) => {
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

  const date = new Date(isoDateString);

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const weekday = thaiDays[date.getDay()];

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedTime = `${hours}:${minutes} น.`;

  return `${day} ${thaiMonths[month]} พ.ศ. ${year} เวลา ${formattedTime}`;
};

const StoreAc = ({ data, storeImg, storeName }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleMenuClick = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedActivityId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const encodeId = (postId) => {
    return btoa(postId)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const handleEditClick = () => {
    const encodedId = encodeId(selectedActivityId);
    navigate(`/store/editActivity/${encodedId}`);
  };

  const deleteAc = async () => {
    const acID = selectedActivityId;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setSnackbar({
        open: true,
        message: "กรุณาลอกอินใหม่อีกครั้ง",
        severity: "error",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
      return;
    }

    try {
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/postActivity/${acID}`;

      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSnackbar({
        open: true,
        message: "Activity deleted successfully",
        severity: "success",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: `Error deleting activity: ${error.response.data.error}`,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Error deleting activity",
          severity: "error",
        });
      }
    }
  };

  const handleDeleteClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = (confirm) => {
    setDialogOpen(false);
    if (confirm) {
      deleteAc();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!data || data.length === 0) {
    return <Typography>No activities available.</Typography>;
  }

  return (
    <>
      {data.map((activity, index) => (
        <Box
          key={index}
          sx={{
            backgroundColor: "#400467",
            borderRadius: "1rem",
            paddingTop: 1,
            width: "80%",
            margin: "auto",
            marginBottom: 4,
          }}
        >
          <Box
            sx={{
              backgroundColor: "#400467",
              height: "8vh",
              width: "100%",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white",
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{ bgcolor: "red", marginRight: 2 }}
                aria-label="profile-picture"
                src={storeImg}
                alt={"No Image"}
              />
              <Box>
                <Typography variant="h6">{storeName}</Typography>
                <Typography variant="h10">
                  {formatDateToThai(activity.creation_date)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ marginLeft: "auto" }}>
              <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={menuOpen ? "long-menu" : undefined}
                aria-expanded={menuOpen ? "true" : undefined}
                aria-haspopup="true"
                onClick={(event) =>
                  handleMenuClick(event, activity.post_activity_id)
                }
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
                    maxHeight: 48 * 4.5,
                    width: "20ch",
                  },
                }}
              >
                <MenuItem
                  key="EDIT"
                  onClick={() => {
                    handleMenuClose();
                    handleEditClick();
                  }}
                >
                  EDIT
                </MenuItem>

                <MenuItem
                  key="DELETE ACTIVITY"
                  onClick={() => {
                    handleMenuClose();
                    handleDeleteClick();
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Box sx={{ marginLeft: 2, marginRight: 2, marginBottom: 2 }}>
            <img
              src={activity.post_activity_image || "No img"}
              alt={activity.post_activity_image || "No img"}
              style={{ width: "100%", borderRadius: 4 }}
            />
          </Box>

          <Box sx={{ margin: 4, paddingBottom: 3 }}>
            <Typography variant="h5">
              {activity.name_activity || "no text"}
            </Typography>
            <Typography variant="body1">
              วันที่กิจกรรมเริ่ม: {activity.date_activity}
            </Typography>
            <Typography variant="body1">
              เวลาที่กิจกรรมเริ่ม: {activity.time_activity}
            </Typography>
            <Typography variant="body1">
              สถานที่:{" "}
              {activity.location || (
                <>
                  43/5 ถนนราชดำเนิน (ถนนต้นสน) ซอย เทศบาล <br />
                  &nbsp;&nbsp;&nbsp; ตำบลพระปฐมเจดีย์ อำเภอเมืองนครปฐม นครปฐม
                  73000
                </>
              )}
            </Typography>

            <Typography variant="body1">
              {activity.detail_post || "????"}
            </Typography>
          </Box>
        </Box>
      ))}

      {/* Snackbar for success/error notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog for deletion */}
      <Dialog open={dialogOpen} onClose={() => handleDialogClose(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this activity?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)}>Cancel</Button>
          <Button onClick={() => handleDialogClose(true)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StoreAc;
