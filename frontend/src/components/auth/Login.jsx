import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { base_url } from "../../utils/constant";
import logo from "../../assets/logo.jpg";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const navigate = useNavigate();
  const { login,setUser } = useAuth();


  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ---------------- INPUT HANDLER ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ---------------- VALIDATION ----------------
  const validate = () => {
    if (!form.email || !form.password) {
      return "All fields are required";
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) {
      return "Invalid email format";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    return null;
  };

  // ---------------- SUBMIT ----------------
  const submitHandler = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await login(form);

      // Optional: store minimal non-sensitive data
      const user = res.data.data.user;
      localStorage.setItem("userName", user.userName);
      localStorage.setItem("avatar", user.avatar);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message || "Login failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-black px-4">
      <div className="flex flex-col justify-center items-center gap-6 w-full max-w-md shadow-xl bg-gray-800 py-10 px-6 rounded-lg">
        {/* Logo */}
        <div className="flex gap-3 items-center">
          <img className="w-16 h-10 rounded-lg" src={logo} alt="logo" />
          <h2 className="text-3xl font-semibold text-white">Login</h2>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full bg-red-500/20 text-red-400 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4 w-full" onSubmit={submitHandler}>
          {/* Email */}
          <input
            id="user-email"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="bg-amber-50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* Password */}
          <div className="relative w-full">
            <input
              id="user-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-amber-50 rounded-lg px-4 py-2 w-full pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`rounded-lg py-2 text-white font-medium transition-all cursor-pointer ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Links */}
          <Link
            className="text-sm text-center text-blue-300 hover:underline"
            to="/signup"
          >
            Create your account
          </Link>

          <Link
            className="text-sm text-center text-gray-400 hover:underline"
            to="/dashboard"
          >
            Continue as Guest
          </Link>

          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const res = await axios.post(
                  `${base_url}/users/google-login`,
                  { credential: credentialResponse.credential },
                  { withCredentials: true },
                );
                setUser(res.data.data.user);

                navigate("/dashboard");
              } catch (err) {
                console.error("Google login failed");
              }
            }}
            onError={() => console.log("Login Failed")}
          />

          <div className="flex flex-col gap-3 text-white">
            <p className="text-2xl">For testing</p>{" "}
            <div>
              {" "}
              <div className="flex flex-row gap-1">
                {" "}
                <h2 className="font-medium">Email:</h2>{" "}
                <span>ironman123@gmail.com</span>{" "}
              </div>{" "}
              <div className="flex flex-row gap-1">
                {" "}
                <h3 className="font-medium">Password:</h3>{" "}
                <span>ironman123</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
