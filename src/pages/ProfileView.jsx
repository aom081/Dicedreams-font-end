import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Buffer } from "buffer";
import {
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  ButtonGroup,
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import UserPosts from "../components/UPost";
import axios from "axios";

const ProfileView = () => {
  const [user, setUser] = useState(null);
  const [age, setAge] = useState(null);
  const { encodedId } = useParams();
  const navigate = useNavigate();

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // or "error"
  });


  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [action, setAction] = useState(() => () => {});

  const decodeUserId = (encodedId) => {
    try {
      return Buffer.from(encodedId, "base64").toString("utf-8");
    } catch (error) {
      console.error("Error decoding user ID:", error);
      setSnackbar({
        open: true,
        message: "Error decoding user ID:" + error,
        severity: "error",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  const getUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const userId = decodeUserId(encodedId);

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

      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/users/${userId}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      if (response.data.role === "store") {
        navigate("/store");
      } else if (response.data.role === "admin") {
        navigate("/manage_contracts");
      }

      setSnackbar({
        open: true,
        message: "Successfully fetching user data " + response.data.username,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching user data",
        severity: "error",
      });
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    getUser();
  }, [encodedId]);

  useEffect(() => {
    if (user && user.birthday) {
      const intervalId = setInterval(() => {
        setAge(calculateAge(user.birthday));
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [user]);

  if (!user) return <div>Loading...</div>;

  const formatBirthday = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      date
    );

    const day = date.getDate();
    const suffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const dayWithSuffix = `${day}${suffix(day)}`;
    return formattedDate.replace(day.toString(), dayWithSuffix);
  };

  return (
    <Box sx={{ marginTop: 8 }}>
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

      <Box
        sx={{
          backgroundColor: "#222",
          borderRadius: 2,
          width: "60%",
          margin: "20px auto",
          padding: 2,
        }}
      >
        <Box
          sx={{
            height: "20vh",
            width: "50%",
            backgroundImage: `url(${
              user.user_image ? user.user_image : "../public/p1.png" // use
            })`,
            // backgroundImage: "url(../public/p1.png)", // test
            backgroundSize: "contain",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
            borderRadius: "0.5rem",
          }}
        ></Box>
        <br />
        <Box sx={{ marginLeft: 2, marginRight: 2, marginTop: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
            {user.username ? user.username : user.username}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
            Name :{" "}
            {(user.first_name ? user.first_name : "ไม่พบข้อมูล") +
              " " +
              (user.last_name ? user.last_name : "ไม่พบข้อมูล")}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
            Gender :{" "}
            {user.gender == "ชาย"
              ? "Male"
              : user.gender == "หญิง"
              ? "Female"
              : "Top secret"}
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
            Birthday : {formatBirthday(user.birthday)}
          </Typography>
          {age && (
            <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
              Age:{" "}
              {`${age.years}y ${age.months}m ${age.days}d ${age.hours}h ${age.minutes}m ${age.seconds}s`}
            </Typography>
          )}
          <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
            ID: {user.users_id ? user.users_id : "ไม่พบข้อมูล"}
          </Typography>

          <Box sx={{ margin: 2 }}>
            <div>
              <TextField
                id="outlined-required"
                label="Bio"
                defaultValue={
                  user.bio ? user.bio : "Hello, I'm ready to play with you 👋"
                }
                variant="outlined"
                multiline
                rows={3}
                InputLabelProps={{
                  style: { color: "white" },
                }}
                InputProps={{
                  readOnly: true,
                  style: { color: "white", borderColor: "white" },
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
            </div>
          </Box>

          <Box
            sx={{
              marginLeft: 3,
              marginRight: 2,
              marginTop: 4,
              paddingBottom: 2,
            }}
          >
            <ButtonGroup
              variant="outlined"
              aria-label="Basic button group"
              sx={{
                "& .MuiButtonGroup-grouped": {
                  borderColor: "#63c5da",
                  textTransform: "none",
                },
              }}
            >
              <Button
                sx={{
                  color: "#fff",
                  borderColor: "#112233",
                  "&:hover": {
                    borderColor: "#112233",
                    backgroundColor: "rgba(17,34,51,0.1)",
                  },
                  paddingLeft: "40px",
                }}
              >
                Post
              </Button>
              <Button
                sx={{
                  color: "#0492c2",
                  borderColor: "#112233",
                  "&:hover": {
                    borderColor: "#112233",
                    backgroundColor: "rgba(17,34,51,0.1)",
                  },
                }}
              >
                Participation History
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      </Box>

      <UserPosts user={user} />
    </Box>
  );
};

export default ProfileView;
