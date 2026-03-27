import axios from "axios";
import { base_url } from "../utils/constant";

export const fetchComments = async (postId ) => {
  try {
    const res = await axios.get(
      `${base_url}/comments/get/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    console.log("Fetch comment response",res.data)
    return res.data;
  } catch (error) {
    console.error("Fetch Comment API Error:", error.response?.data || error.message);
    throw error;
  }
};