import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import UploadIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";

const StoreAc = () => {
  const [acName, setAcName] = useState("");
  const [acDetail, setAcDetail] = useState("");
  const [eventDate, setEventDate] = useState(dayjs());
  const [eventTime, setEventTime] = useState(dayjs());

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [showUploadBar, setShowUploadBar] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setAcDetail(value);
    }
  };

  const handleDateChange = (newValue) => {
    setEventDate(newValue);
  };

  const handleTimeChange = (newValue) => {
    setEventTime(newValue);
  };

  const handleCloseUploadBar = () => {
    setShowUploadBar(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploading(false);
  };

  const convertImageToBase64 = (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (file) => {
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setShowUploadBar(true);

    if (file.size > 3000000) {
      alert("ขนาดไฟล์เกิน 3 MB");
      setUploading(false);
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/svg+xml",
        "image/png",
        "image/jpg",
        "image/gif",
      ].includes(file.type)
    ) {
      alert("กรุณาเลือกไฟล์ตามนามสกุลที่ระบุ");
      setUploading(false);
      return;
    }

    try {
      const user_id = localStorage.getItem("users_id");
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token found");
      }

      const base64Image = await convertImageToBase64(file);

      let birthDay = transformDateFormat(user.birthday);

      const formData = {
        id: user_id || "no_data_now",
        first_name: firstName || "no_data_now",
        last_name: lastName || "no_data_now",
        username: user.username || "no_data_now",
        email: user.email || "no_data_now",
        birthday: birthDay || "no_data_now",
        phone_number: phoneNumber || "no_data_now",
        gender: user.gender || "no_data_now",
        user_image: base64Image || "no_data_now",
      };
      console.log("formData-->", formData);

      const response = await axios.put(
        `http://localhost:8080/api/users/${user_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            let percentCompleted = Math.floor((loaded * 100) / total);
            setUploadProgress(percentCompleted);
          },
        }
      );

      setUploading(false);
      setUploadProgress(100);
      setUploadedImageUrl(response.data.user_image);

      setUser((prevUser) => ({
        ...prevUser,
        user_image: response.data.user_image,
      }));

      console.log("File uploaded and user updated successfully", response.data);
      console.log("Uploaded Image URL:-->", uploadedImageUrl);

      // Wait for 2 seconds before clearing the upload progress and calling getUser
      setTimeout(() => {
        setUploadProgress(0);
        getUser();
      }, 2000);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      setUploadError("File upload failed");
      console.error("Error uploading file", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;

    if (files.length > 0) {
      const file = files[0];
      console.log(files);
      handleFileUpload(file);
    }
  };

  const chooseFile = () => {
    fileInputRef.current.click();
  };

  const createAc = async (file) => {
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setShowUploadBar(true);

    if (file.size > 3000000) {
      alert("ขนาดไฟล์เกิน 3 MB");
      setUploading(false);
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/svg+xml",
        "image/png",
        "image/jpg",
        "image/gif",
      ].includes(file.type)
    ) {
      alert("กรุณาเลือกไฟล์ตามนามสกุลที่ระบุ");
      setUploading(false);
      return;
    }
    try {
      const user_id = localStorage.getItem("users_id");
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("No token found");
      }

      const base64Image = await convertImageToBase64(file);
      let dataAc = {
        name_activity: acName,
        status_post: "active",
        creation_date: useNow(),
        detail_post: acDetail,
        date_activity: eventDate,
        time_activity: eventTime,
        post_activity_image: base64Image,
        store_id: user_id,
      };

      console.log("dataAc-->", dataAc);

      const response = await axios.put(
        `http://localhost:8080/api/postActivity`,
        dataAc,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            let percentCompleted = Math.floor((loaded * 100) / total);
            setUploadProgress(percentCompleted);
          },
        }
      );

      setUploading(false);
      setUploadProgress(100);
      setUploadedImageUrl(response.data.user_image);

      setUser((prevUser) => ({
        ...prevUser,
        user_image: response.data.user_image,
      }));

      console.log("File uploaded and user updated successfully", response.data);
      console.log("Uploaded Image URL:-->", uploadedImageUrl);

      // Wait for 2 seconds before clearing the upload progress and calling getUser
      setTimeout(() => {
        setUploadProgress(0);
        getUser();
      }, 2000);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      setUploadError("File upload failed");
      console.error("Error uploading file", error);
    }
  };

  return (
    <Box sx={{ marginTop: 8 }}>
      <Box
        sx={{
          marginTop: 8,
          backgroundColor: "red",
          borderRadius: 2,
          width: "60%",
          margin: "20px auto",
          padding: 2,
          fontWeight: "bold",
          fontSize: 20,
          textAlign: "center",
        }}
      >
        <h1>Create an activity post</h1>
      </Box>

      <Box
        sx={{
          backgroundColor: "#222",
          borderRadius: 2,
          width: "60%",
          margin: "20px auto",
          padding: 2,
        }}
      >
        {/* acName */}
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            fullWidth
            label="Activity Name"
            variant="outlined"
            value={acName}
            onChange={(e) => setAcName(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
            }}
          />
        </Box>

        {/* acDetail */}
        <Box sx={{ marginBottom: 2 }}>
          <div>
            <TextField
              id="outlined-required"
              label="Activity Detail"
              value={acDetail}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
              InputLabelProps={{
                readOnly: true,
                style: { color: "white" },
              }}
              InputProps={{
                style: { color: "white" },
              }}
              sx={{
                width: "100%",
                height: "100px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "white",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "white",
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
              }}
            />
            <div style={{ marginTop: "10px", color: "white" }}>
              {acDetail.length}/{100}
            </div>
          </div>
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2}>
              {/* Event Date */}
              <Grid item xs={6}>
                <DatePicker
                  label="Select Date of Event"
                  value={eventDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      fullWidth
                      sx={{
                        "& .MuiInputLabel-root": { color: "white" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "white" },
                          "&:hover fieldset": { borderColor: "white" },
                          "&.Mui-focused fieldset": { borderColor: "white" },
                        },
                        "& .MuiInputBase-input": { color: "white" },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Event Time */}
              {/* Event Time */}
              <Grid item xs={6}>
                <TimePicker
                  label="Select Time of Event"
                  value={eventTime}
                  onChange={handleTimeChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      fullWidth
                      sx={{
                        "& .MuiInputLabel-root": { color: "white" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "white" },
                          "&:hover fieldset": { borderColor: "white" },
                          "&.Mui-focused fieldset": { borderColor: "white" },
                        },
                        "& .MuiInputBase-input": { color: "white" },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>

        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          sx={{
            padding: 2,
            backgroundColor: dragging ? "rgba(255, 255, 255, 0.1)" : "black",
            border: "2px dashed white",
            borderRadius: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            cursor: "pointer",
            marginBottom: 2,
          }}
          onClick={chooseFile}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
                marginBottom: "10px",
              }}
            />
          ) : (
            <>
              <UploadIcon sx={{ color: "white", fontSize: 40 }} />
              <Typography sx={{ color: "white", marginTop: 1 }}>
                Drag and drop an image here
              </Typography>
              <Typography sx={{ color: "white", marginTop: 1 }}>
                Or click to select an image
              </Typography>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
        </Box>

        {showUploadBar && (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ flex: 1 }}
              />
              <IconButton onClick={handleCloseUploadBar}>
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>
          </Box>
        )}
        {uploading && (
          <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <CircularProgress sx={{ marginRight: 2 }} />
            <Typography sx={{ color: "white" }}>Uploading...</Typography>
          </Box>
        )}
        {uploadError && (
          <Box sx={{ marginBottom: 2 }}>
            <Typography sx={{ color: "red" }}>{uploadError}</Typography>
          </Box>
        )}

        <Button
          //   onClick={updateUser}
          sx={{
            color: "#fff",
            backgroundColor: "#AB003B",
            borderColor: "#AB003B",
            "&:hover": {
              backgroundColor: "#AB003B",
            },
          }}
        >
          CONFIRM
        </Button>
      </Box>
    </Box>
  );
};

export default StoreAc;
