import axios from "axios";
import { base_url } from "../utils/constant";

// const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/recipes`;

export const fetchSuggestions = async (query) => {
  try {
    const res = await axios.get(`${base_url}/recipes/search`, {
      params: { query },
      headers: {
        Authorization: "Bearer "+ localStorage.getItem("token")
      }
    });

    // backend returns new apiResponse(200, { count, data }, message)
    console.log("Search recipe assistant",res.data)
    return res.data.data.data
    // if (res.data?.data?.data) {
    //   return res.data.data.data; // adjust to your controller's structure
    // } else if (res.data?.data) {
    //   return res.data.data; // fallback
    // } else {
    //   return [];
    // }
  } catch (err) {
    console.error("Suggestion fetch failed:", err);
    return [];
  }
};
