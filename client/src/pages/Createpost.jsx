import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
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
  const [openDialog, setOpenDialog] = useState(false); // State for dialog
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

      setAlertMessage({ open: false, message: '', severity: '' });
      navigate('/');
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
    setOpenDialog(true); // Open the dialog
  };

  const handleCloseAlert = () => {
    setAlertMessage({ open: false, message: '', severity: '' });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog
  };

  const handleConfirmCancel = () => {
    setOpenDialog(false);
    navigate('/'); // Navigate back after confirmation
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
        <CardContent id="create-post-card-content">
          <Typography variant="h4" gutterBottom id="create-post-title">
            Create a board game post
          </Typography>
          <form onSubmit={handleSubmit} noValidate id="create-post-form">
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
              id="post-details-textfield"
            />

            <LocalizationProvider dateAdapter={AdapterDayjs} id="localization-provider">
              <Stack direction="row" spacing={2} sx={{ mb: 2 }} id="date-time-picker">
                <DatePicker
                  label="Select an appointment date"
                  views={['year', 'month', 'day']}
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  renderInput={(params) => <TextField {...params} id="date-picker" />}
                  disablePast
                  id="appointment-date-picker"
                />
                <TimePicker
                  label="Select an appointment time"
                  value={timeValue}
                  onChange={(newTime) => setTimeValue(newTime)}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  renderInput={(params) => <TextField {...params} id="time-picker" />}
                  id="appointment-time-picker"
                />
              </Stack>
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Number of players"
              variant="outlined"
              type="number"
              value={numberOfPlayers}
              onChange={handleNumberChange}
              inputProps={{ min: 0, 'data-testid': 'number-of-players-input', id: 'number-of-players-input' }}
              sx={{ mb: 2 }}
              id="number-of-players-textfield"
            />

            <Box sx={{ mb: 2 }} id="image-upload-box">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload-input"
              />
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadClick}
                fullWidth
                id="image-upload-button"
              >
                Upload Image
              </Button>
              {previewImage && (
                <Box
                  component="img"
                  src={previewImage}
                  alt="Preview"
                  sx={{
                    maxHeight: 200,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    mt: 2,
                  }}
                  id="image-preview"
                />
              )}
            </Box>

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

      <Snackbar open={alertMessage.open} autoHideDuration={6000} onClose={handleCloseAlert} id="alert-snackbar">
        <Alert onClose={handleCloseAlert} severity={alertMessage.severity} id="alert-message">
          <AlertTitle id="alert-title">{alertMessage.severity === 'error' ? 'Error' : 'Success'}</AlertTitle>
          {alertMessage.message}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={handleCloseDialog} id="cancel-dialog">
        <DialogTitle id="cancel-dialog-title">Cancel Post Creation</DialogTitle>
        <DialogContent id="cancel-dialog-content">
          <DialogContentText id="cancel-dialog-text">
            Are you sure you want to cancel creating this post?
          </DialogContentText>
        </DialogContent>
        <DialogActions id="cancel-dialog-actions">
          <Button onClick={handleCloseDialog} id="cancel-dialog-back-button">Back</Button>
          <Button onClick={handleConfirmCancel} id="cancel-dialog-confirm-button">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreatePost;
