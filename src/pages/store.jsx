import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  LinearProgress,
  TextField,
  Tabs,
  IconButton,
  Tab,
  CircularProgress,
  Button,
  colors,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import Activity from "../components/storeAc";
import { blue } from "@mui/material/colors";

const Store = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [store, setstore] = useState(null);
  const [storeAc, setstoreAc] = useState(null);

  const [storeID, setStoreID] = useState("");

  const [phone, setPhone] = useState("");
  const [housename, setHousename] = useState("");
  const [alley, setAlley] = useState("");
  const [road, setRoad] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [gender, setGender] = useState("");

  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadBar, setShowUploadBar] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  const fileInputRef = useRef(null);

  const menuOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  const defaultImage = "../../public/Necrons2.jpg";

  const [multipleStores, setMultipleStores] = useState([]);
  const [showMultipleStores, setShowMultipleStores] = useState(false);

  const handleSave = () => {
    try {
      const user_id = storeID;
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("กรุณาลอกอินใหม่อีกครั้ง");
        navigate("/");
        throw new Error("No token found");
      }

      const formData = {
        store_id: user_id,
        name_store: storeName || "no_data_now",
        phone_number: phone || "no_data_now",
        house_number: houseNumber || "no_data_now",
        alley: alley || "no_data_now",
        road: road || "no_data_now",
        district: district || "no_data_now",
        sub_district: subDistrict || "no_data_now",
        province: province || "no_data_now",
      };

      console.log("formData-->", formData);

      const response = axios.put(
        `https://dicedreams-backend-deploy-to-render.onrender.com/api/store/${user_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("File uploaded and user updated successfully", response.data);
      alert("File uploaded and user updated successfully  ");

      setTimeout(() => {
        window.location.reload()
        //getStore();
      }, 500);
    } catch (error) {
      alert("Error uploading file  " + error);
      console.error("Error uploading file: ", error);
    }
  };

  const handleCancel = () => {
    setActiveTab(0);
  };

  const getStoreAll = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const userId = localStorage.getItem("users_id");

      if (!token) {
        alert("กรุณาลอกอินใหม่อีกครั้ง");
        navigate("/");
        throw new Error("No token found");
      }

      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/store`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const storeData = response.data;
      let getid = [];
      let spare = [];

      storeData.forEach((element) => {
        if (element.users_id === userId) {
          getid.push(element);
        }
      });

      if (getid.length === 1) {
        setStoreID(getid[0].store_id);
        console.log("found data ==> ", getid);
      } else if (getid.length > 1) {
        console.log("data more than 2 ", getid);
        setMultipleStores(getid);
        setShowMultipleStores(true);
      } else {
        alert("รหัสไม่ตรงกับระบบ");
        navigate("/");
      }
    } catch (error) {
      alert("Error fetching store data  " + error);
      console.error("Error fetching store data", error);
    }
  };

  const getStore = async () => {
    try {
      const token = localStorage.getItem("access_token");
      // const userId = localStorage.getItem("users_id");
      const userId = storeID;

      if (!token) {
        alert("กรุณาลอกอินใหม่อีกครั้ง");
        navigate("/");
        throw new Error("No token found");
      }

      if (!userId) {
        alert("User ID not found");
        console.error("User ID not found");
        return;
      }

      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/store/${userId}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const storeData = response.data;
      setstore(storeData);

      setStoreName(storeData.name_store || "");
      setHouseNumber(storeData.house_number || "");
      setAlley(storeData.alley || "");
      setRoad(storeData.road || "");
      setDistrict(storeData.district || "");
      setSubDistrict(storeData.sub_district || "");
      setProvince(storeData.province || "");

      setPhone(storeData.phone_number || "");
      setHousename(storeData.house_number || "");
      setAlley(storeData.alley || "");
      setRoad(storeData.road || "");
      setDistrict(storeData.district || "");
      setSubDistrict(storeData.sub_district || "");
      setProvince(storeData.province || "");

      console.log("store data fetched successfully", response.data);
    } catch (error) {
      alert("Error fetching store data  " + error);
      console.error("Error fetching store data", error);
    }
  };

  const getStoreAc = async () => {
    try {
      const token = localStorage.getItem("access_token");
      // const userId = localSstorage.getItem("users_id");
      const userId = storeID;

      if (!token) {
        alert("กรุณาลอกอินใหม่อีกครั้ง");
        navigate("/");
        throw new Error("No token found");
      }

      if (!userId) {
        alert("User ID not found");
        console.error("User ID not found");
        return;
      }

      const url = `https://dicedreams-backend-deploy-to-render.onrender.com/api/postActivity/store/${userId}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setstoreAc(response.data);
      console.log("StoreAc data fetched successfully", response.data);
    } catch (error) {
      alert("Error fetching StoreAc data  " + error);
      console.error("Error fetching StoreAc data", error);
    }
  };

  const handleCloseUploadBar = () => {
    setShowUploadBar(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploading(false);
  };

  const convertImageToBase64 = (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (file) => {
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setShowUploadBar(true);

    if (file.size > 3000000) {
      alert("ขนาดไฟล์เกิน 3 MB");
      setUploading(false);
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/svg+xml",
        "image/png",
        "image/jpg",
        "image/gif",
      ].includes(file.type)
    ) {
      alert("กรุณาเลือกไฟล์ตามนามสกุลที่ระบุ");
      setUploading(false);
      return;
    }

    try {
      const user_id = storeID;
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("กรุณาลอกอินใหม่อีกครั้ง");
        navigate("/");
        throw new Error("No token found");
      }

      const base64Image = await convertImageToBase64(file);

      const formData = {
        store_id: user_id,
        store_image: base64Image || "no_data_now",
      };

      console.log("formData-->", formData);

      const response = await axios.put(
        `https://dicedreams-backend-deploy-to-render.onrender.com/api/store/${user_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            let percentCompleted = Math.floor((loaded * 100) / total);
            setUploadProgress(percentCompleted);
          },
        }
      );

      setUploading(false);
      setUploadProgress(100);
      setUploadedImageUrl(response.data.user_image);

      console.log("File uploaded and user updated successfully", response.data);
      console.log("Uploaded Image URL:-->", uploadedImageUrl);

      setTimeout(() => {
        setUploadProgress(0);
        getStore();
      }, 2000);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      setUploadError("File upload failed");
      console.error("Error uploading file: ", error);
      alert("Error uploading file  " + error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;

    if (files.length > 0) {
      const file = files[0];
      console.log(files);
      handleFileUpload(file);
    }
  };

  const chooseFile = () => {
    fileInputRef.current.click();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    getStoreAll();
  }, []);

  useEffect(() => {
    if (storeID) {
      console.log("Updated storeID ==> ", storeID);
      getStore();
      getStoreAc();
      localStorage.setItem("store_id", storeID);
    }
  }, [storeID]);

  const textFieldStyles = {
    "& .MuiInputLabel-root": { color: "white" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "white" },
      "&:hover fieldset": { borderColor: "white" },
      "&.Mui-focused fieldset": {
        borderColor: "white",
      },
    },
    "& .MuiInputBase-input": { color: "white" },
  };

  return (
    <Box sx={{ marginTop: 8 }}>
      {store && (
        <>
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "black",
              padding: 8,
            }}
          >
            <Box sx={{ width: "80%", alignItems: "center" }}>
              <Avatar
                sx={{ width: 200, height: 200 }}
                aria-label="profile-picture"
                src={store.store_image || defaultImage}
              />
              <Typography variant="h5" sx={{ marginTop: 2 }}>
                {store.name_store}
              </Typography>

              <Box sx={{ marginTop: 2, width: "100%" }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label="POST" />
                  <Tab label="PROFILE EDIT" />
                </Tabs>

                <Box sx={{ marginTop: 4 }}>
                  {activeTab === 0 && (
                    <Box>
                      <Box>
                        <Button
                          sx={{
                            width: "100%",
                            margin: 4,
                            backgroundColor: "white",
                            color: "red",
                          }}
                          onClick={() => navigate("/store/createAc")}
                        >
                          + add New Activity
                        </Button>
                      </Box>
                      <Activity
                        data={storeAc}
                        storeImg={store.store_image}
                        storeName={store.name_store}
                      />
                    </Box>
                  )}
                  {activeTab === 1 && (
                    <Box>
                      {/* Store Name */}
                      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
                        <TextField
                          fullWidth
                          label="Store Name"
                          variant="outlined"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          sx={textFieldStyles}
                        />
                      </Box>

                      {/* Phone */}
                      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
                        <TextField
                          fullWidth
                          label="Phone"
                          variant="outlined"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          sx={{
                            "& .MuiInputLabel-root": { color: "white" },
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: "white" },
                              "&:hover fieldset": { borderColor: "white" },
                              "&.Mui-focused fieldset": {
                                borderColor: "white",
                              },
                            },
                            "& .MuiInputBase-input": { color: "white" },
                          }}
                        />
                      </Box>

                      {/* House Number, Alley, Road */}
                      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
                        <TextField
                          fullWidth
                          label="House Number"
                          variant="outlined"
                          value={houseNumber}
                          onChange={(e) => setHouseNumber(e.target.value)}
                          sx={textFieldStyles}
                        />
                        <TextField
                          fullWidth
                          label="Alley"
                          variant="outlined"
                          value={alley}
                          onChange={(e) => setAlley(e.target.value)}
                          sx={textFieldStyles}
                        />
                        <TextField
                          fullWidth
                          label="Road"
                          variant="outlined"
                          value={road}
                          onChange={(e) => setRoad(e.target.value)}
                          sx={textFieldStyles}
                        />
                      </Box>

                      {/* District, Sub-District, Province */}
                      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
                        <TextField
                          fullWidth
                          label="District"
                          variant="outlined"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          sx={textFieldStyles}
                        />
                        <TextField
                          fullWidth
                          label="Sub-District"
                          variant="outlined"
                          value={subDistrict}
                          onChange={(e) => setSubDistrict(e.target.value)}
                          sx={textFieldStyles}
                        />
                        <TextField
                          fullWidth
                          label="Province"
                          variant="outlined"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          sx={textFieldStyles}
                        />
                      </Box>

                      <Box
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragLeave={handleDragLeave}
                        sx={{
                          padding: 2,
                          backgroundColor: dragging
                            ? "rgba(255, 255, 255, 0.1)"
                            : "black",
                          border: "2px dashed white",
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                          cursor: "pointer",
                          marginBottom: 2,
                        }}
                        onClick={chooseFile}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              marginBottom: "10px",
                            }}
                          />
                        ) : (
                          <>
                            <UploadIcon sx={{ color: "white", fontSize: 40 }} />
                            <Typography sx={{ color: "white", marginTop: 1 }}>
                              Drag and drop an image here
                            </Typography>
                            <Typography sx={{ color: "white", marginTop: 1 }}>
                              Or click to select an image
                            </Typography>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                        />
                      </Box>
                      {showUploadBar && (
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={uploadProgress}
                              sx={{ flex: 1 }}
                            />
                            <IconButton onClick={handleCloseUploadBar}>
                              <CloseIcon sx={{ color: "white" }} />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                      {uploading && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 2,
                          }}
                        >
                          <CircularProgress sx={{ marginRight: 2 }} />
                          <Typography sx={{ color: "white" }}>
                            Uploading...
                          </Typography>
                        </Box>
                      )}
                      {uploadError && (
                        <Box sx={{ marginBottom: 2 }}>
                          <Typography sx={{ color: "red" }}>
                            {uploadError}
                          </Typography>
                        </Box>
                      )}

                      <Box>
                        <Button
                          onClick={handleSave}
                          sx={{
                            marginRight: 4,
                            color: "#fff",
                            backgroundColor: "#AB003B",
                            borderColor: "#AB003B",
                            "&:hover": {
                              backgroundColor: "#AB003B",
                            },
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancel}
                          sx={{
                            color: "#fff",
                            backgroundColor: "#444",
                            borderColor: "#555",
                            "&:hover": {
                              backgroundColor: "#555",
                            },
                            marginRight: 5,
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      )}

      {showMultipleStores && (
        <Box sx={{ margin: 8 }}>
          {multipleStores.map((store) => (
            <Box
              key={store.store_id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: 5,
                backgroundColor: "#444",
                borderRadius: "1rem",
                padding: 2,
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              {/* Avatar Image */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <img
                  src={store.store_image}
                  alt={store.name_store}
                  width={80}
                  height={80}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: "1rem",
                  }}
                />

                <Box>
                  <Typography variant="h6">{store.name_store}</Typography>
                  <Typography variant="body2">Road: {store.road}</Typography>
                  <Typography variant="body2">
                    Sub District: {store.sub_district}
                  </Typography>
                  <Typography variant="body2">Alley: {store.alley}</Typography>
                  <Typography variant="body2">
                    District: {store.district}
                  </Typography>
                  <Typography variant="body2">
                    Province: {store.province}
                  </Typography>
                </Box>
              </Box>

              <button
                onClick={() => setStoreID(store.store_id)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Select Store
              </button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Store;
