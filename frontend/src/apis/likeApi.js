import axios from "axios";
import { base_url } from "../utils/constant";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api", // change to your backend URL
//   withCredentials: true, // if using cookies
// });

// 🔥 Toggle Like (Post / Comment / Recipe)
export const toggleLikeApi = async ({ targetId, targetType }) => {
  try {
    const res = await axios.post(
      `${base_url}/likes/toggle`,
      { targetId, targetType },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    return res.data;
  } catch (error) {
    console.error("Like API Error:", error.response?.data || error.message);
    throw error;
  }
};
