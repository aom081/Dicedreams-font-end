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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const CheckUsers = async () => {
      const id = localStorage.getItem("users_id");
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("กรุณาลอกอินใหม่อีกครั้ง");
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
        if (response.data.role != "admin") {
          alert("ไม่สามารถใช้งานส่วนนี้ได้");
          navigate("/");
        } else {
          fetchUsers();
        }
      } catch (error) {
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
        console.error("Error fetching users:", error);
      }
    };

    CheckUsers();
  }, []);

  const handleHomeClick = () => {
    navigate("/Home");
  };

  const deluser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("กรุณาลอกอินใหม่อีกครั้ง");
      navigate("/");
      throw new Error("No token found");
    }

    try {
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/users/${id}`;
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      alert("User deleted successfully");
      // fetchUsers();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting user:", error.response.data.error);
    }
  };

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
          <Button variant="contained">Next</Button>
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
              {users.map((user, index) => (
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
                    {/* Use an arrow function to call deluser */}
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ marginLeft: 1 }}
                      onClick={() => deluser(user.users_id)}
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
    </Box>
  );
};

export default Admin;
