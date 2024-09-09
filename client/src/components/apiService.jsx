import axios from "axios";

const API_URL = "https://dicedreams-backend-deploy-to-render.onrender.com/api/postGame/get_postGame_search";

export const getPostGames = async (status) => {
  try {
    const response = await axios.get(API_URL, {
      params: { status_post: status }, // Add the status parameter
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching post games:", error);
    throw error;
  }
};
