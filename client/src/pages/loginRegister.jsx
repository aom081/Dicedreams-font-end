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
  const fileInputRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("register") === "true") {
      setIsRegister(true);
    }
  }, [location]);

  const handleLogin = async () => {
    if (!formData.identifier) {
      setAlert({ open: true, message: "กรอก E-mail หรือ Username ไม่ถูกต้อง", severity: "error" });
      return;
    }
    if (!formData.loginPassword) {
      setAlert({ open: true, message: "กรอก Password ไม่ถูกต้อง", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/auth", {
        identifier: formData.identifier,
        password: formData.loginPassword,
      });
      const { access_token } = response.data;
      login(access_token);
      navigate("/");
      setAlert({ open: true, message: "เข้าสู่ระบบสำเร็จ!", severity: "success" });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (error.request ? "ไม่มีการตอบสนองจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งในภายหลัง" : "ข้อผิดพลาด: " + error.message);
      setAlert({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const requiredFields = [
      { name: "first_name", label: "First Name" },
      { name: "last_name", label: "Last Name" },
      { name: "username", label: "Username" },
      { name: "phone_number", label: "Telephone Number" },
      { name: "email", label: "E-mail" },
      { name: "password", label: "Password" },
      { name: "birthday", label: "Day/month/year of birth" },
      { name: "gender", label: "Gender" },
    ];

    for (const field of requiredFields) {
      if (!formData[field.name]) {
        setAlert({ open: true, message: `ไม่กรอก ${field.label}`, severity: "error" });
        return;
      }
    }

    if (formData.password.length <= 8) {
      setAlert({ open: true, message: "รหัสผ่านต้องมีความยาวมากกว่า 8 ตัวอักษร", severity: "error" });
      return;
    }

    const age = dayjs().diff(formData.birthday, "year");
    if (age < 12) {
      setAlert({ open: true, message: "คุณต้องมีอายุอย่างน้อย 12 ปีเพื่อสมัครสมาชิก", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const formattedBirthday = dayjs(formData.birthday).format("MM/DD/YYYY");

      const convertImageToBase64 = (imageFile) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };

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

      const response = await axios.post("http://localhost:8080/api/users", dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setAlert({ open: true, message: "ลงทะเบียนสำเร็จ!", severity: "success" });

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
      const errorMessage =
        error.response?.data?.message ||
        (error.request ? "ไม่มีการตอบสนองจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งในภายหลัง" : "ข้อผิดพลาด: " + error.message);
      setAlert({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, user_image: file, user_image_preview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleCloseAlert = () => {
    setAlert({ open: false, message: "", severity: "success" });
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
          <Button onClick={() => setIsRegister(false)} id="login-button">
            <Typography style={{ color: "#FFFFFF" }}>Log In</Typography>
          </Button>
          <Button onClick={() => setIsRegister(true)} id="register-button">
            <Typography style={{ color: "#FFFFFF" }}>Register</Typography>
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
              alignItems="center"
              justifyContent="space-between"
              sx={{ marginTop: "16px" }}
              id="image-upload-section"
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current.click()}
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
                <img
                  src={formData.user_image_preview}
                  alt="Preview"
                  style={{ width: "100px", height: "100px", marginLeft: "16px" }}
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
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          id="alert-snackbar"
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: "100%" }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default LoginPage;
