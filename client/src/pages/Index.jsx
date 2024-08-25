import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import IndexCom from "../components/Index";
import { Box, Typography, Button, Avatar } from "@mui/material";
import { Link } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);
  const searchQuery = new URLSearchParams(location.search).get("search");

  useEffect(() => {
    console.log("Received search query:", searchQuery);
    searchUser();
    searchStore();
  }, [searchQuery]);

  async function searchUser() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token found");
      }
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/users`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      console.log("user data-->", response.data);
    } catch (error) {
      setError("Error fetching user data");
      console.error(error);
    }
  }

  async function searchStore() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token found");
      }
      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/store`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const result = searchResults();

  console.log("result-->", result);

  return (
    <Box
      sx={{
        marginTop: 15,
      }}
    >
      {error && <div>{error}</div>}
      <IndexCom data={result.data} tag={result.tag} />
    </Box>
  );
};

export default Index;
