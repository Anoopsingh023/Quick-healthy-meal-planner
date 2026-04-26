import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { base_url } from "../utils/constant";
import { initSavedStore } from "../store/savedStore";
import { clearAllCache } from "../store/recipeCache";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- AXIOS GLOBAL CONFIG ----------------
  axios.defaults.withCredentials = true;

  // ---------------- FETCH CURRENT USER ----------------
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${base_url}/users/me`);
      setUser(res.data.data);
      const userData = res.data.data;
      // 🔥 Seed the global saved store with user's saved recipe IDs
      initSavedStore(userData.savedRecipes);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOGIN ----------------
  const login = async (formData) => {
    const res = await axios.post(`${base_url}/users/login`, formData, {
      withCredentials: true,
    });

    setUser(res.data.data.user);
    return res;
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    try {
      await axios.post(
        `${base_url}/users/logout`,
        {},
        { withCredentials: true },
      );
      initSavedStore([]);
      clearAllCache();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  // ---------------- AUTO REFRESH TOKEN ----------------
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await axios.post(`${base_url}/users/refresh-token`);
            return axios(originalRequest);
          } catch (refreshErr) {
            setUser(null);
          }
        }

        return Promise.reject(err);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------- CUSTOM HOOK ----------------
export const useAuth = () => useContext(AuthContext);
