import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';
import { AuthContext } from '../Auth/AuthContext';

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
  const fileInputRef = useRef(null);

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

    if (!formValues.name_games) {
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
      setAlertMessage({ open: true, message: 'Meeting time must be at least 12 hours in the future', severity: 'error' });
      return;
    }

    const formattedDate = selectedDate.format('MM/DD/YYYY');

    const requestData = {
      name_games: formValues.name_games,
      detail_post: formValues.detail_post,
      num_people: numberOfPlayers,
      date_meet: formattedDate,
      time_meet: timeValue.format('HH:mm:ss'),
      games_image: formValues.games_image,
      status_post: 'active',
      users_id: userId,
      username, // Directly use username from context
      profilePic, // Directly use profilePic from context
    };

    try {
      const response = await fetch('http://localhost:8080/api/PostGame', {
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
      setAlertMessage({ open: true, message: 'Error creating post. Please try again.', severity: 'error' });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleCloseAlert = () => {
    setAlertMessage({ open: false, message: '', severity: '' });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120vh', position: 'relative', p: 4 }} id="create-post-container">
      <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3, p: 2, mt: 4, mb: 4 }} id="create-post-card">
        <CardContent>
          <Typography variant="h4" gutterBottom id="create-post-title">Create a board game post</Typography>
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              id="name_games"
              label="Board game name"
              name="name_games"
              value={formValues.name_games}
              onChange={handleInputChange}
              placeholder="mtg werewolf monopoly game and others"
              multiline
              sx={{ mb: 2 }}
              required
              inputProps={{ 'data-testid': 'name-games-input' }}
            />
            <TextField
              fullWidth
              id="detail_post"
              label="Post details"
              name="detail_post"
              value={formValues.detail_post}
              onChange={handleInputChange}
              placeholder="Details"
              multiline
              sx={{ mb: 2 }}
              inputProps={{ 'data-testid': 'detail-post-input' }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ mb: 2 }} id="date_meet">
                <DatePicker
                  label="Select an appointment date"
                  views={['year', 'month', 'day']}
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                  required
                  inputProps={{ 'data-testid': 'date-picker' }}
                />
              </Box>
              <Box sx={{ mb: 2 }} id="time_meet">
                <TimePicker
                  label="Select a time"
                  value={timeValue}
                  onChange={(time) => setTimeValue(time)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                  required
                  inputProps={{ 'data-testid': 'time-picker' }}
                />
              </Box>
            </LocalizationProvider>
            <TextField
              fullWidth
              id="num_people"
              label="Number of participants"
              type="number"
              value={numberOfPlayers}
              onChange={handleNumberChange}
              sx={{ mb: 2 }}
              InputProps={{ inputProps: { min: 0 } }}
              required
              inputProps={{ 'data-testid': 'num-people-input' }}
            />
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadClick}
              sx={{ mb: 2 }}
              fullWidth
              id="upload-image-button"
            >
              Upload Image
            </Button>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageChange}
              id="file-input"
            />
            {previewImage && <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', marginBottom: '10px' }} id="image-preview" />}
            <Stack direction="row" spacing={38} sx={{ mt: 2 }}>
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
        open={alertMessage.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        id="snackbar"
      >
        <Alert onClose={handleCloseAlert} severity={alertMessage.severity} sx={{ width: '100%' }}>
          {alertMessage.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatePost;
