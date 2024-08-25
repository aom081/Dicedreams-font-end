import React from "react";
import { Box, Typography, Button, Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import UserPosts from "./UPost";

const IndexCom = ({ data, tag }) => {
  // Default values
  const defaultImage = "../../public/Necrons2.jpg";

  if (!data) {
    return (
      <Box sx={{ bgcolor: "#222", margin: 20, p: 2, borderRadius: 2 }}>
        <Typography variant="h6">No data available</Typography>
      </Box>
    );
  }

  // Extract values with null checks
  const profileImage = tag == "store" ? data.store_image : data.user_image;
  const name = tag == "store" ? data.name_store : data.username;
  const fullName =
    tag == "store" ? data.name_store : data.first_name + " " + data.last_name;
  const phoneNumber = tag == "store" ? data.phone_number : data.phone_number;
  const address =
    tag === "store"
      ? `${data.house_number}, ${data.road}, ${data.sub_district}, ${data.district}, ${data.province}`
      : null;
  const altText = tag === "store" ? data.name_store : data.username;

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
    const minutes = date.getMinutes();
    const formattedTime = `${hours}:${minutes} น.`;

    return `${day} ${thaiMonths[month]} เวลา ${formattedTime}`;
  };

  const dateth = formatDateToThai(data.updatedAt || data.createdAt);

  console.log("data-->", data);
  console.log("tag-->", tag);
  console.log("profileImage-->", profileImage);

  return (
    <Box>
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
          src={profileImage || defaultImage}
          alt={altText || "No Image"}
        />
        <Typography variant="h5">{fullName || "No Name"}</Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/profile/${data.users_id}`}
          sx={{
            color: "white",
            backgroundColor: "#00BFFF",
            "&:hover": {
              backgroundColor: "#115293",
            },
          }}
        >
          View Profile
        </Button>
      </Box>

      {tag === "store" ? (
        <Box
          sx={{
            bgcolor: "#222",
            margin: "20px auto",
            p: 2,
            borderRadius: 2,
            width: "60%",
            alignItems: "center",
          }}
        >
          <div>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: 2,
                gap: 1,
              }}
            >
              <Avatar
                sx={{ bgcolor: "red" }}
                aria-label="profile-picture"
                src={profileImage || defaultImage}
                alt={altText || "No Image"}
              />
              <Box>
                <Typography variant="h6" sx={{ color: "white" }}>
                  {fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: "lightgray" }}>
                  {dateth}
                </Typography>
              </Box>
            </Box>

            <img
              //   src={data.store_image || defaultImage} // real
              src={defaultImage} // test
              alt={data.name_store || "Store Image"}
              style={{ width: "100%", borderRadius: 4 }}
            />

            <Box
              sx={{
                textAlign: "Left",
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 1,
              }}
            >
              <Typography variant="h6" sx={{ color: "white", marginTop: 2 }}>
                {/* {event} */} event name what API?
              </Typography>
              <Typography variant="body1" sx={{ color: "white", marginTop: 2 }}>
                {/* {formattedDate} */} event date
              </Typography>
              <Typography
                variant="body2"
                sx={{ marginTop: 1, color: "white", marginTop: 2 }}
              >
                {/* {post.detail_post} */} event announce
              </Typography>
              <Typography variant="body2" sx={{ color: "white", marginTop: 2 }}>
                {/* {`สถานที่: ${post.loaction ? post.loaction : "เดี๋ยวบอก"}`} */}
                สถานที่เดี๋ยวบอก
              </Typography>
            </Box>
          </div>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", p: 2 }}>
          <Typography
            variant="h5"
            sx={{ fontSize: "30px", fontWeight: "bold" }}
          >
            What API
          </Typography>
          <UserPosts user={data} />
        </Box>
      )}
    </Box>
  );
};

export default IndexCom;
