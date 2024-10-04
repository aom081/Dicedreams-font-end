import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  LinearProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import UploadIcon from "@mui/icons-material/UploadFile";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";


const StoreAc = () => {
  const [acName, setAcName] = useState("");
  const [acDetail, setAcDetail] = useState("");
  const [eventDate, setEventDate] = useState(dayjs());
  const [eventTime, setEventTime] = useState(dayjs());
  const [dragging, setDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [store, setstore] = useState(null);

  const navigate = useNavigate();


  const handleDateChange = (newValue) => setEventDate(newValue);
  const handleTimeChange = (newValue) => setEventTime(newValue);

  const getStore = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const userId = localStorage.getItem("store_id");
      // const userId = "3594f82f-e3bf-11ee-9efc-30d0422f59c9"; // test

      console.log("getStore userId-->", userId);

      if (!token) {
        alert("กรุณาลอกอินใหม่อีกครั้ง");
        navigate("/");
        throw new Error("No token found");
      }

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/store/${userId}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const storeData = response.data;
      setstore(storeData);
      console.log("response",response)

    } catch (error) {
      alert("Error fetching store data  " + error.response.data.error.message);
      console.error("Error fetching store data", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setAcDetail(value);
    }
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

  const handleSave = async () => {
    if (!acName || !acDetail || !eventDate || !eventTime) {
      alert("Please fill all fields and select a file before saving.");
      return;
    }

    const now = new Date();

    const formattedDate =
      ("0" + (now.getMonth() + 1)).slice(-2) +
      "/" +
      ("0" + now.getDate()).slice(-2) +
      "/" +
      now.getFullYear() +
      " " +
      ("0" + now.getHours()).slice(-2) +
      ":" +
      ("0" + now.getMinutes()).slice(-2) +
      ":" +
      ("0" + now.getSeconds()).slice(-2);

    let base64Image;
    if (!selectedFile) {
      base64Image = "";
    } else {
      base64Image = await convertImageToBase64(selectedFile);
    }

    try {
      const user_id = localStorage.getItem("store_id");
      // const user_id = "3594f82f-e3bf-11ee-9efc-30d0422f59c9"; // test
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("No token found. Please login.");
        return;
      }

      const formData = {
        creation_date: formattedDate,
        name_activity: acName,
        status_post: "active",
        detail_post: acDetail,
        date_activity: eventDate.format("YYYY-MM-DD"),
        time_activity: eventTime.format("HH:mm:ss"),
        post_activity_image: base64Image,
        store_id: user_id,
      };
      
      console.log("form--->",formData)

      const response = await axios.post(
        `https://dicedreams-backend-deploy-to-render.onrender.com/api/postActivity`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("File uploaded and user updated successfully", response.data);
      alert("File uploaded and activity saved successfully.");
      navigate("/store");
    } catch (error) {
      alert("Error Post Activity  " + error);
      console.error("Error Post Activity", error);      
      navigate("/store");
    }
  };

  useEffect(() => {
    getStore();
  }, []);

  return (
    <Box sx={{ marginTop: 8 }}>
      <Box
        sx={{
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
              <Typography sx={{ color: "white" }}>
                Drag and drop or click to select a file
              </Typography>
            </>
          )}
        </Box>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          fullWidth
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default StoreAc;
