import {
  Box,
  Typography,
  Avatar,
  Grid,
  Button,
  Paper,
  TextField,
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

const decodeId = (encodedId) => {
  encodedId = encodedId.replace(/-/g, "+").replace(/_/g, "/");
  return atob(encodedId);
};

const EditActivity = () => {
  const { encodedId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [editableData, setEditableData] = useState({
    name_activity: "",
    detail_post: "",
    date_activity: "",
    time_activity: "",
    status_post: "",
  });
  const [dragging, setDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const getStoreAcId = async (postId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setSnackbar({
          open: true,
          severity: "error",
          message: "กรุณาลอกอินใหม่อีกครั้ง",
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
        throw new Error("No token found");
      }

      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/postActivity/${postId}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPost(response.data);
      setEditableData({
        name_activity: response.data.name_activity,
        detail_post: response.data.detail_post,
        date_activity:
          response.data.date_activity === "0000-00-00"
            ? ""
            : response.data.date_activity,
        time_activity: response.data.time_activity || "",
        status_post: response.data.status_post,
      });
      setImagePreview(response.data.post_activity_image);

      setSnackbar({
        open: true,
        message: "Successfully fetching Store Activity data ",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Error fetching StoreAc data " + error,
      });
    }
  };

  useEffect(() => {
    try {
      const postId = decodeId(encodedId);
      getStoreAcId(postId);
    } catch (error) {
      console.error("Failed to decode the ID:", error);
    }
  }, [encodedId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData({
      ...editableData,
      [name]: value,
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const chooseFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const convertImageToBase64 = (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const postId = decodeId(encodedId);
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/postActivity/${postId}`;

      let base64Image = "";
      if (selectedFile) {
        base64Image = await convertImageToBase64(selectedFile);
      }

      const formattedDateActivity = editableData.date_activity
        ? format(new Date(editableData.date_activity), "MM/dd/yyyy")
        : "";

      const updatedData = {
        ...editableData,
        date_activity: formattedDateActivity,
        ...(base64Image && { post_activity_image: base64Image }),
      };

      await axios.put(url, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSnackbar({
        open: true,
        severity: "success",
        message: "Changes saved successfully!",
      });
      setTimeout(() => {
        navigate("/store");
      }, 2000);
    } catch (error) {
      console.error("Failed to save changes:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to save changes",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!post) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ padding: 8 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        id="post-snackbar"
        sx={{ width: "100%" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "80%", fontSize: "1rem" }}
          id="post-alert"
        >
          <AlertTitle sx={{ fontSize: "1.50rem" }}>
            {snackbar.severity === "error" ? "Error" : "Success"}
          </AlertTitle>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Activity
        </Typography>
        <Grid container spacing={3}>
          {/* Image Upload Section */}
          <Grid item xs={12} md={6}>
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: dragging ? "2px dashed #000" : "2px solid transparent",
                padding: 2,
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={chooseFile}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {imagePreview ? (
                <Avatar
                  variant="rounded"
                  src={imagePreview}
                  alt="Selected image"
                  sx={{ width: "100%", height: "auto", borderRadius: 4 }}
                />
              ) : (
                <Typography variant="body1">
                  Drag and drop an image here, or click to select one
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Editable Activity Details */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Activity Name"
              name="name_activity"
              value={editableData.name_activity}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Details"
              name="detail_post"
              value={editableData.detail_post}
              onChange={handleInputChange}
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date of Activity"
              name="date_activity"
              type="date"
              value={editableData.date_activity}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Time of Activity"
              name="time_activity"
              type="time"
              value={editableData.time_activity}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Status"
              name="status_post"
              value={editableData.status_post}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>

        {/* Footer Buttons */}
        <Box sx={{ marginTop: 4 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginRight: 2 }}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditActivity;
