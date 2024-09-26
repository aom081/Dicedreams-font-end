import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  ButtonGroup,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
  useMediaQuery,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import axios from "axios";
import { AuthContext } from "../Auth/AuthContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone_number: "",
    email: "",
    password: "",
    birthday: dayjs(),
    gender: "",
    identifier: "",
    loginPassword: "",
    user_image: null,
    user_image_preview: null,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("register") === "true") {
      setIsRegister(true);
    }
    console.log("Location params:", queryParams);
  }, [location]);

  const handleLogin = async () => {
    console.log("Attempting login with data:", formData);

    // Check identifier field (email or username)
    if (!formData.identifier) {
      setAlert({ open: true, message: "กรอก E-mail หรือ Username ไม่ถูกต้อง", severity: "error" });
      document.getElementById("identifier").focus(); // Move cursor to identifier field
      return;
    }

    // Check password field
    if (!formData.loginPassword) {
      setAlert({ open: true, message: "กรอก Password ไม่ถูกต้อง", severity: "error" });
      document.getElementById("loginPassword").focus(); // Move cursor to password field
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://dicedreams-backend-deploy-to-render.onrender.com/api/auth", {
        identifier: formData.identifier,
        password: formData.loginPassword,
      });

      const { access_token } = response.data;
      login(access_token);
      setAlert({ open: true, message: "เข้าสู่ระบบสำเร็จ!", severity: "success" });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.request ? "ไม่มีการตอบสนองจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งในภายหลัง" : "ข้อผิดพลาด: " + error.message);
      setAlert({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    console.log("Attempting registration with data:", formData);

    // Array of required fields
    const requiredFields = [
      { name: "first_name", label: "First Name", id: "first_name" },
      { name: "last_name", label: "Last Name", id: "last_name" },
      { name: "username", label: "Username", id: "username" },
      { name: "phone_number", label: "Telephone Number", id: "phone_number" },
      { name: "email", label: "E-mail", id: "email" },
      { name: "password", label: "Password", id: "password" },
      { name: "birthday", label: "Day/month/year of birth", id: "birthday" },
      { name: "gender", label: "Gender", id: "gender-radio-group" },
    ];

    // Loop to check required fields
    for (const field of requiredFields) {
      if (!formData[field.name]) {
        console.log(`${field.label} is missing`);
        setAlert({ open: true, message: `ไม่กรอก ${field.label}`, severity: "error" });
        document.getElementById(field.id).focus(); // Move cursor to the error field
        return;
      }
    }

    // Check password length
    if (formData.password.length <= 8) {
      setAlert({ open: true, message: "รหัสผ่านต้องมีความยาวมากกว่า 8 ตัวอักษร", severity: "error" });
      document.getElementById("password").focus(); // Move cursor to password field
      return;
    }

    // Check user age
    const age = dayjs().diff(formData.birthday, "year");
    if (age < 12) {
      setAlert({ open: true, message: "คุณต้องมีอายุอย่างน้อย 12 ปีเพื่อสมัครสมาชิก", severity: "error" });
      document.getElementById("birthday").focus(); // Move cursor to birthday field
      return;
    }

    setLoading(true);

    try {
      const formattedBirthday = dayjs(formData.birthday).format("MM/DD/YYYY");
      const base64Image = formData.user_image
        ? await convertImageToBase64(formData.user_image)
        : null;

      const dataToSend = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        birthday: formattedBirthday,
        gender: formData.gender,
        user_image: base64Image,
      };

      console.log("Data to send:", dataToSend);

      const response = await axios.post("https://dicedreams-backend-deploy-to-render.onrender.com/api/users", dataToSend);

      setAlert({ open: true, message: "ลงทะเบียนสำเร็จ!", severity: "success" });

      // Reset form data after successful registration
      setFormData({
        first_name: "",
        last_name: "",
        username: "",
        phone_number: "",
        email: "",
        password: "",
        birthday: dayjs(),
        gender: "",
        identifier: "",
        loginPassword: "",
        user_image: null,
        user_image_preview: null,
      });

      setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 6000);
      setIsRegister(false);
    } catch (error) {
      console.error("Registration error:", error);

      // Log the error response to check its structure
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }

      let errorMessage = "ข้อผิดพลาด: กรุณาลองใหม่อีกครั้ง";
      if (error.response) {
        // Access the error messages correctly
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          if (error.response.data.includes("E-mail is already in use")) {
            errorMessage = "E-mail นี้ถูกใช้แล้ว";
          } else if (error.response.data.includes("Username is already taken")) {
            errorMessage = "Username นี้ถูกใช้แล้ว";
          }
        } else if (error.response.data.error) {
          if (error.response.data.error.includes("E-mail is already in use")) {
            errorMessage = "E-mail นี้ถูกใช้แล้ว";
          } else if (error.response.data.error.includes("Username is already taken")) {
            errorMessage = "Username นี้ถูกใช้แล้ว";
          }
        }
      } else if (error.request) {
        errorMessage = "ไม่มีการตอบสนองจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งในภายหลัง";
      }

      setAlert({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("Cancel button clicked");
    if (isRegister) {
      setOpenCancelDialog(true);
    } else {
      navigate("/");
    }
  };

  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate("/");
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log("File selected:", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("File preview loaded");
        setFormData((prev) => ({ ...prev, user_image: file, user_image_preview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
    console.log("Password visibility toggled:", !showPassword);
  };

  const handleCloseAlert = () => {
    console.log("Closing alert");
    setAlert({ open: false, message: "", severity: "success" });
  };

  // Function to convert image to Base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{
        backgroundImage: "url(./public/warhamerAoSloginpage.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "125vh",
      }}
      id="login-page-container"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        bgcolor="rgba(1, 1, 1, 0.8)"
        p={5}
        borderRadius={2}
        width={isMobile ? "90%" : isRegister ? "700px" : "500px"}
        maxWidth="90%"
        sx={{ backdropFilter: "blur(10px)" }}
        id="login-page-content-box"
      >
        <ButtonGroup variant="text" fullWidth id="login-register-button-group">
          <Button
            onClick={() => setIsRegister(false)}
            id="login-button"
            style={{
              color: isRegister ? "#FFFFFF" : "crimson", // Crimson for login button when on login page
            }}
          >
            <Typography style={{ color: "inherit" }}>Log In</Typography>
          </Button>
          <Button
            onClick={() => setIsRegister(true)}
            id="register-button"
            style={{
              color: isRegister ? "crimson" : "#FFFFFF", // Crimson for register button when on register page
            }}
          >
            <Typography style={{ color: "inherit" }}>Register</Typography>
          </Button>
        </ButtonGroup>

        {isRegister ? (
          <Box width="100%" id="register-form">
            <Box
              display="flex"
              flexDirection="row"
              gap={2}
              mb={2}
              justifyContent="space-between"
              id="name-fields"
            >
              <TextField
                id="first_name"
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                id="last_name"
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
            </Box>
            <TextField
              id="username"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              id="phone_number"
              label="Telephone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              id="email"
              label="E-mail"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              id="password"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      id="toggle-password-visibility-button"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                id="birthday"
                label="Day/month/year of birth"
                value={formData.birthday}
                onChange={(newValue) => setFormData((prev) => ({ ...prev, birthday: newValue }))}
                fullWidth
                required
                sx={{ width: "100%", marginTop: "16px" }}
              />
            </LocalizationProvider>
            <FormLabel component="legend" sx={{ marginTop: "16px" }} id="gender-label">
              Gender
            </FormLabel>
            <RadioGroup
              id="gender-radio-group"
              row
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <FormControlLabel value="male" control={<Radio />} label="Male" id="male-radio" />
              <FormControlLabel value="female" control={<Radio />} label="Female" id="female-radio" />
              <FormControlLabel value="other" control={<Radio />} label="Other" id="other-radio" />
            </RadioGroup>
            <Box
              display="flex"
              flexDirection="column" // Stack button and image vertically
              alignItems="flex-start"
              sx={{ marginTop: "16px" }}
              id="image-upload-section"
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current.click()}
                sx={{ mb: 2 }} // Margin bottom for spacing between button and image
                id="upload-image-button"
              >
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
                id="image-input"
              />
              {formData.user_image_preview && (
                <Box
                  component="img"
                  src={formData.user_image_preview}
                  alt="Preview"
                  sx={{
                    maxWidth: '100%', // Set max width to 100%
                    marginBottom: '10px', // Add margin below the image
                    borderRadius: 2, // Optional: round the corners of the image
                  }}
                  id="image-preview"
                />
              )}
            </Box>
            <Box mt={4} display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                onClick={handleRegister}
                disabled={loading}
                fullWidth
                style={{
                  backgroundColor: "crimson",
                  color: "white",
                }}
              >
                {loading ? <CircularProgress size={24} style={{ color: "white" }} /> : "Register"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                fullWidth
                style={{
                  color: "white",
                  borderColor: "white",
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box width="100%" id="login-form">
            <TextField
              id="identifier"
              label="E-mail or Username"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              id="loginPassword"
              label="Password"
              name="loginPassword"
              value={formData.loginPassword}
              onChange={handleInputChange}
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      id="toggle-password-visibility-button"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box mt={4} display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                onClick={handleLogin}
                disabled={loading}
                fullWidth
                id="login-submit-button"
                style={{
                  backgroundColor: "crimson",
                  color: "white",
                }}
              >
                {loading ? <CircularProgress size={24} style={{ color: "white" }} /> : "Log In"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                fullWidth
                id="cancel-login-button"
                style={{
                  color: "white",
                  borderColor: "white",
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Confirmation Dialog for Canceling Registration */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">ยืนยันการยกเลิก</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการลงทะเบียน? ข้อมูลที่คุณกรอกจะไม่ถูกบันทึก
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            ไม่
          </Button>
          <Button onClick={handleConfirmCancel} color="primary" autoFocus>
            ใช่
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        id="login-snackbar"
        sx={{ width: "100%" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: "80%", fontSize: "1rem" }}>
          <AlertTitle sx={{ fontSize: "1.50rem" }}>
            {alert.severity === "error" ? "Error" : "Success"}
          </AlertTitle>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LoginPage;
