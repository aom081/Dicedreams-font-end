import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import dayjs from 'dayjs';
import { AuthContext } from '../Auth/AuthContext';
import { useMediaQuery, useTheme } from '@mui/material';
import { predefinedGames } from '../constants/gameList';

const CreatePost = () => {
  const { userId, accessToken, username, profilePic } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeValue, setTimeValue] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [formValues, setFormValues] = useState({
    name_games: '',
    detail_post: '',
    games_image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState({ open: false, message: '', severity: '' });
  const [gameOption, setGameOption] = useState('');
  const [customGameName, setCustomGameName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const fileInputRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNumberChange = (event) => {
    let value = event.target.value;
    if (parseInt(value) < 0) {
      value = 0;
    }
    setNumberOfPlayers(value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormValues((prevValues) => ({
          ...prevValues,
          games_image: reader.result,
        }));
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบข้อมูลฟอร์มที่ต้องกรอก
    if (!formValues.name_games && gameOption !== 'Other') {
      setAlertMessage({ open: true, message: 'ไม่กรอก Game name', severity: 'error' });
      return;
    }
    if (!selectedDate) {
      setAlertMessage({ open: true, message: 'ไม่เลือก Date', severity: 'error' });
      return;
    }
    if (!timeValue) {
      setAlertMessage({ open: true, message: 'ไม่เลือก Time', severity: 'error' });
      return;
    }
    if (numberOfPlayers <= 0) {
      setAlertMessage({ open: true, message: 'ไม่กรอก Number of people', severity: 'error' });
      return;
    }
    if (!formValues.games_image) {
      setAlertMessage({ open: true, message: 'ไม่อัพโหลด Image', severity: 'error' });
      return;
    }

    const currentDateTime = dayjs();
    const selectedDateTime = dayjs(selectedDate).hour(timeValue.hour()).minute(timeValue.minute());
    const hoursDifference = selectedDateTime.diff(currentDateTime, 'hour');

    if (hoursDifference < 12) {
      setAlertMessage({ open: true, message: 'เวลานัดเล่นอย่างน้อยต้อง 12 ชั่วโมงก่อนเวลาปัจจุบัน', severity: 'error' });
      return;
    }

    const formattedDate = selectedDate.format('MM/DD/YYYY');

    const requestData = {
      name_games: formValues.name_games,
      detail_post: formValues.detail_post,
      num_people: numberOfPlayers,
      date_meet: formattedDate,
      time_meet: timeValue.format('HH:mm A'),
      games_image: formValues.games_image,
      status_post: 'active',
      users_id: userId,
      username,
      profilePic,
    };

    try {
      const response = await fetch('https://dicedreams-backend-deploy-to-render.onrender.com/api/PostGame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Set a flag in sessionStorage indicating that a post was created
      sessionStorage.setItem('postgameCreated', 'true');

      // แสดงข้อความสำเร็จ
      setAlertMessage({ open: true, message: 'สร้างโพสต์สำเร็จ!', severity: 'success' });

      // หน่วงเวลา 2 วินาทีเพื่อให้ผู้ใช้เห็นข้อความแจ้งเตือน
      setTimeout(() => {
        setAlertMessage({ open: false, message: '', severity: '' });

        // Navigate to home page หลังจากหน่วงเวลา
        navigate('/');
      }, 2000); // หน่วงเวลา 2 วินาที
    } catch (error) {
      console.error('Error:', error);
      setAlertMessage({ open: true, message: 'เกิดข้อผิดพลาดในการสร้างโพสต์ โปรดลองอีกครั้ง', severity: 'error' });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = () => {
    setOpenDialog(true);
  };

  const handleCloseAlert = () => {
    setAlertMessage({ open: false, message: '', severity: '' });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmCancel = () => {
    setOpenDialog(false);
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '90vh',
        p: isMobile ? 2 : 4,
      }}
      id="create-post-container"
    >
      <Card
        sx={{
          maxWidth: isMobile ? '100%' : 600,
          width: '100%',
          boxShadow: 3,
          p: 2,
          mt: 4,
          mb: 4,
        }}
        id="create-post-card"
      >
        <CardContent>
          <Typography variant="h4" gutterBottom id="create-post-title">
            Create a board game post
          </Typography>
          <form onSubmit={handleSubmit} noValidate>
            <Autocomplete
              fullWidth
              value={gameOption}
              onChange={(event, newValue) => {
                if (newValue === 'Other') {
                  setGameOption('');
                  setFormValues((prevValues) => ({
                    ...prevValues,
                    name_games: customGameName,
                  }));
                } else {
                  setGameOption(newValue || '');
                  setFormValues((prevValues) => ({
                    ...prevValues,
                    name_games: newValue || '',
                  }));
                }
              }}
              onInputChange={(event, newInputValue) => {
                setCustomGameName(newInputValue);
              }}
              options={predefinedGames}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select or enter a board game"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  inputProps={{
                    ...params.inputProps,
                    'data-testid': 'game-select',
                    id: 'game-select',
                  }}
                />
              )}
              getOptionLabel={(option) => option || ''}
              id="game-autocomplete"
            />

            <TextField
              fullWidth
              label="Post Details"
              variant="outlined"
              name="detail_post"
              multiline
              rows={4}
              value={formValues.detail_post}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              inputProps={{ 'data-testid': 'detail-post-input', id: 'detail-post-input' }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }} id="date-time-picker">
                <DatePicker
                  label="Select an appointment date"
                  views={['year', 'month', 'day']}
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                  required
                  inputProps={{ 'data-testid': 'date-picker' }}
                  id="date-picker"
                />
                <TimePicker
                  label="Appointment Time"
                  value={timeValue}
                  onChange={(time) => setTimeValue(time)}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                  inputProps={{ 'data-testid': 'time-picker' }}
                  id="time-picker"
                />
              </Stack>
            </LocalizationProvider>

            <Select
              fullWidth
              value={numberOfPlayers ? numberOfPlayers.toString() : ''} // Ensures the value is a string for display
              onChange={(event) => {
                const parsedValue = parseInt(event.target.value);
                if (isNaN(parsedValue) || parsedValue <= 0) {
                  setAlertMessage({ open: true, message: 'Please enter a valid number of people', severity: 'error' });
                  setNumberOfPlayers(0); // Reset the value to 0 or handle differently
                } else {
                  setAlertMessage({ open: false, message: '', severity: '' });
                  setNumberOfPlayers(parsedValue);
                }
              }}
              displayEmpty
              sx={{ mb: 2 }}
              inputProps={{
                'data-testid': 'num-people-select',
                id: 'num-people-select',
              }}
            >
              <MenuItem value="">
                Select number of people
              </MenuItem>
              {/* For easier testing, provide specific predefined options */}
              {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                <MenuItem key={num} value={num.toString()}>
                  {num}
                </MenuItem>
              ))}
            </Select>

            <Button
              variant="contained"
              component="span"
              fullWidth
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadClick}
              sx={{ mb: 2 }}
              id="upload-button"
            >
              Upload image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              id="image-input"
            />
            {previewImage && (
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                }}
                id="preview-image-container"
              >
                <Typography variant="h6" gutterBottom>
                  Image preview
                </Typography>
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{ width: '100%', maxWidth: '300px', marginTop: '10px' }}
                  id="image-preview"
                />
              </Box>
            )}

            <Stack direction={isMobile ? 'column' : 'row'} spacing={isMobile ? 2 : 38} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: 'crimson',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#b22222',
                  },
                  fullWidth: true,
                }}
                id="create-post-button"
              >
                Create post
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  fullWidth: true,
                }}
                onClick={handleCancel}
                id="cancel-button"
              >
                Cancel
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={alertMessage.open}
        autoHideDuration={60000}
        onClose={handleCloseAlert}
        id="alert-snackbar"
        sx={{ width: "100%" }}
      >
        <Alert onClose={handleCloseAlert} severity={alertMessage.severity} id="alert">
          <AlertTitle sx={{ fontSize: "1.50rem" }}>
            {alertMessage.severity === 'error' ? 'Error' : 'Success'}
            </AlertTitle>
          {alertMessage.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        id="cancel-dialog"
      >
        <DialogTitle id="cancel-dialog-title">Confirm Cancel</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-text">
            Are you sure you want to cancel? Your changes will not be saved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" id="cancel-dialog-close-button">
            No
          </Button>
          <Button onClick={handleConfirmCancel} color="primary" autoFocus id="cancel-dialog-confirm-button">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreatePost;
