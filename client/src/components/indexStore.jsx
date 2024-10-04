import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";

const IndexStore = ({ data, imgS , nameS }) => {
  const [storeData, setStore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) {
      setStore(data);
    } else {
      setError("No data available");
    }
  }, [data]);

  const formatDateToThai = (isoDateString) => {
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
    const minutes = date.getMinutes().toString().padStart(2, "0"); // Ensure two digits for minutes
    const formattedTime = `${hours}:${minutes} น.`;
    return `${weekday} ${day} ${
      thaiMonths[month]
    } ${date.getFullYear()} เวลา ${formattedTime}`;
  };

  const formatDateAc = (thaiDateString, timeString) => {
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

    if (!thaiDateString || !timeString) {
      return "Invalid date";
    }

    const [yearBE, month, day] = thaiDateString.split("-").map(Number);

    if (isNaN(yearBE) || isNaN(month) || isNaN(day)) {
      return "Invalid date";
    }

    const date = new Date(yearBE - 543, month - 1, day);
    const weekday = thaiDays[date.getDay()];

    let formattedTime = "";
    if (timeString) {
      const [hours, minutes] = timeString.split(":");
      formattedTime = `เวลา ${parseInt(hours, 10)}.${minutes} น.`;
    }

    return `${weekday}ที่ ${day} ${
      thaiMonths[month - 1]
    } พ.ศ. ${yearBE} ${formattedTime}`;
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

  if (!storeData) {
    return (
      <Box sx={{ bgcolor: "#222", margin: 20, p: 2, borderRadius: 2 }}>
        <Typography variant="h6">Loading store data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {storeData.map((store, index) => (
        <Box
          key={index}
          sx={{
            bgcolor: "#222",
            margin: "20px auto",
            p: 2,
            borderRadius: 2,
            width: "60%",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: 2,
              gap: 1,
            }}
          >
            {/* topper */}
            <Avatar
              sx={{ bgcolor: "red" }}
              aria-label="profile-picture"
              src={imgS}
            />
            <Box>
              <Typography variant="h6" sx={{ color: "white" }}>
                {nameS} 
              </Typography>
              <Typography variant="body2" sx={{ color: "lightgray" }}>
                {formatDateToThai(store.creation_date)}
              </Typography>
            </Box>


          </Box>

          <img
            src={store?.post_activity_image }
            alt="Activity"
            style={{ width: "100%", borderRadius: 4 }}
          />

          <Box
            sx={{
              textAlign: "left",
              marginLeft: 10,
              marginRight: 10,
              marginBottom: 1,
            }}
          >
            <Typography variant="h6" sx={{ color: "white", marginTop: 2 }}>
              {store.name_activity || "Event name"}
            </Typography>
            <Typography variant="body1" sx={{ color: "white", marginTop: 2 }}>
              {formatDateAc(store.date_activity, store.time_activity) ||
                "Event date"}
            </Typography>
            <Typography variant="body2" sx={{ color: "white", marginTop: 2 }}>
              {store.detail_post || "Event announce"}
            </Typography>
            <Typography variant="body2" sx={{ color: "white", marginTop: 2 }}>
              {"สถานที่: "}{store.post_position || "Outcast Gaming"}
            </Typography>
            <Typography variant="body2" sx={{ color: "white", marginTop: 2 }}>
            {"จำนวนคนที่จะไป: "}{store.amout_player || "1/5"}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default IndexStore;
