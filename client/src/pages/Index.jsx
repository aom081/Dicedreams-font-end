import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Button, Avatar } from "@mui/material";
import IndexStore from "../components/indexStore";
import IndexUser from "../components/indexUser";

const Index = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [errorStore, setErrorStore] = useState(null);
  const [errorUser, setErrorUser] = useState(null);
  const searchQuery = new URLSearchParams(location.search).get("search");
  const [result, setResult] = useState({ data: null, tag: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await searchUser();
        await searchStore();
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
      }
    };

    fetchData();
  }, [searchQuery]);

  useEffect(() => {
    const updatedResult = searchResults();
    setResult(updatedResult);
  }, [user, store, searchQuery]);

  useEffect(() => {
    if (result.tag === "store" && result.data) {
      getStore(result.data.store_id);
    } else if (result.tag === "user" && result.data) {
      getUserAc(result.data.users_id);
    }
  }, [result]);

  async function searchUser() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/users`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      console.log("User data-->", response.data);
      console.log("result data-->", result);
    } catch (error) {
      setError("Error fetching user data");
      console.error(error);
    }
  }

  async function searchStore() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/store`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStore(response.data);
      console.log("Store data:", response.data);
    } catch (error) {
      setError("Error fetching store data");
      console.error(error);
    }
  }

  function searchResults() {
    if (!searchQuery) return { data: null, tag: null };

    const normalizedQuery = searchQuery.toLowerCase();

    const matchedUsers = user?.filter(
      (u) =>
        u.first_name.toLowerCase().includes(normalizedQuery) ||
        u.username.toLowerCase().includes(normalizedQuery) ||
        u.users_id.toLowerCase().includes(normalizedQuery)
    );

    const matchedStores = store?.filter(
      (s) =>
        s.name_store.toLowerCase().includes(normalizedQuery) ||
        s.users_id.toLowerCase().includes(normalizedQuery)
    );

    console.log("Matched Users:", matchedUsers);
    console.log("Matched Stores:", matchedStores);

    if (matchedStores && matchedStores.length > 0) {
      return { data: matchedStores[0], tag: "store" };
    } else if (matchedUsers && matchedUsers.length > 0) {
      return { data: matchedUsers[0], tag: "user" };
    } else {
      return { data: null, tag: null };
    }
  }

  async function getStore(id) {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/postActivity/store/${id}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStoreData(response.data);
      console.log("Store response:", response.data);
    } catch (error) {
      setErrorStore("Error fetching store data");
      console.error(error);
    }
  }

  async function getUserAc(id) {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token found");
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/user/${id}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
      console.log("User response:", response.data);
    } catch (error) {
      setErrorUser("Error fetching store data");
      console.error(error);
    }
  }

  const formatDateToThai = (isoDateString) => {
    if (!isoDateString) return "";
    const thaiDays = [
      "วันอาทิตย์",
      "วันจันทร์",
      "วันอังคาร",
      "วันพุธ",
      "วันพฤหัสบดี",
      "วันศุกร์",
      "วันเสาร์",
    ];
    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const date = new Date(isoDateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear() + 543; // Buddhist Era
    const weekday = thaiDays[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours}:${minutes} น.`;
    return `${day} ${thaiMonths[month]} เวลา ${formattedTime}`;
  };

  if (error) {
    return (
      <Box sx={{ bgcolor: "#222", margin: 20, p: 2, borderRadius: 2 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!storeData && result.tag === "store") {
    return (
      <Box sx={{ bgcolor: "#222", margin: 20, p: 2, borderRadius: 2 }}>
        <Typography variant="h6">Loading store data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ marginTop: 15 }}>
      {result.data && (
        <>
          <Box
            sx={{
              backgroundColor: "#333",
              height: "8vh",
              width: "70%",
              margin: "20px auto",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white",
              p: 2,
              mb: 4,
            }}
          >
            <Avatar
              sx={{ bgcolor: "red" }}
              aria-label="profile-picture"
              src={
                result.tag === "store"
                  ? result.data.store_image
                  : result.data.user_image
              }
              alt={
                result.tag === "store"
                  ? result.data.name_store
                  : result.data.username
              }
            />
            <Typography variant="h5">
              {result.tag === "store"
                ? result.data.name_store
                : result.data.username}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`/profile/${
                result.tag === "store" ? result.data.store_id : "ss"
              }`}
              sx={{
                color: "white",
                backgroundColor: "#00BFFF",
                "&:hover": { backgroundColor: "#115293" },
              }}
            >
              View Profile
            </Button>
          </Box>

          {result.tag === "store" ? (
            <IndexStore
              data={storeData}
              imgS={result.data.store_image}
              nameS={result.data.name_store}
            />
          ) : (
            <IndexUser
              data={userData}
              imgU={result.data.user_image}
              nameU={result.data.username}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default Index;
