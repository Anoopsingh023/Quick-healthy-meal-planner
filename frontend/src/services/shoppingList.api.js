import axios from "axios";
import { base_url } from "../utils/constant";

const API = `${base_url}/shopinglists`;

export const getShoppingList = () =>
  axios.get(API, { withCredentials: true });

export const addItem = (data) =>
  axios.post(`${API}/add`, data, { withCredentials: true });

export const updateItem = (itemId, data) =>
  axios.patch(`${API}/update/${itemId}`, data, {
    withCredentials: true,
  });

export const togglePurchased = (itemId) =>
  axios.patch(`${API}/toggle/${itemId}`, {}, {
    withCredentials: true,
  });

export const removeItem = (itemId) =>
  axios.delete(`${API}/remove/${itemId}`, {
    withCredentials: true,
  });

export const generateFromRecipe = (recipeId) =>
  axios.post(
    `${API}/generate`,
    { recipeId },
    { withCredentials: true }
  );

export const smartGenerate = (recipeId, budget) =>
  axios.post(
    `${API}/smart-generate`,
    { recipeId, budget },
    { withCredentials: true }
  );

export const clearShoppingList = () =>
  axios.delete(`${API}/clear`, {
    withCredentials: true,
  });