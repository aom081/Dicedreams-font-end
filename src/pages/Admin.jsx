import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Checkbox,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const CheckUsers = async () => {
      const id = localStorage.getItem("users_id");
      const token = localStorage.getItem("access_token");

      if (!token) {
        showSnackbar("กรุณาลอกอินใหม่อีกครั้ง", "error");
        navigate("/");
        throw new Error("No token found");
      }

      try {
        const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/users/${id}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.role !== "admin") {
          showSnackbar("ไม่สามารถใช้งานส่วนนี้ได้", "error");
          navigate("/");
        } else {
          fetchUsers();
        }
      } catch (error) {
        showSnackbar("Error fetching users", "error");
        console.error("Error fetching users:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://dicedreams-backend-deploy-to-render.onrender.com/api/users/"
        );
        const data = await response.json();
        setUsers(data);
        console.log(data);
      } catch (error) {
        showSnackbar("Error fetching users", "error");
        console.error("Error fetching users:", error);
      }
    };

    CheckUsers();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const deluser = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      showSnackbar("กรุณาลอกอินใหม่อีกครั้ง", "error");
      navigate("/");
      throw new Error("No token found");
    }

    try {
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/users/${userToDelete}`;
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      showSnackbar("User deleted successfully", "success");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      showSnackbar("Error deleting user", "error");
      console.error("Error deleting user:", error.response.data.error);
    }
    setOpenConfirmDialog(false);
  };

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setOpenConfirmDialog(true); 
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number.includes(searchTerm)
    );
  });

  return (
    <Box sx={{ marginTop: 8 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleHomeClick}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Manage Contacts
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h3">User list</Typography>
          {/* Search Input */}
          <TextField
            label="Search users"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: "300px" }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Avatar</TableCell>
                <TableCell>Fullname</TableCell>
                <TableCell>Birthday</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tools</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user.users_id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Avatar alt={user.first_name} src={user.user_image} />
                  </TableCell>
                  <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                  <TableCell>{user.birthday}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ marginLeft: 1 }}
                      onClick={() => handleDeleteClick(user.users_id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Snackbar for alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ width: "100%" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "80%", fontSize: "1rem" }}
        >
          <AlertTitle sx={{ fontSize: "1.50rem" }}>
            {snackbar.severity === "error" ? "Error" : "Success"}
          </AlertTitle>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={deluser} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;
