import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
// import { toast } from "react-toastify";
// import { base_url } from "../utils/constant";
import { base_url } from "../../utils/constant";
import logo from "../../assets/logo.jpg";

function Signup() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const avatarFileHandler = (e) => {
    setAvatar(e.target.files[0]);
    setAvatarUrl(URL.createObjectURL(e.target.files[0]));
  };

  const coverImageFileHandler = (e) => {
    setCoverImage(e.target.files[0]);
    setCoverImageUrl(URL.createObjectURL(e.target.files[0]));
  };

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("username", username);
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("avatar", avatar);
    formData.append("coverImage", coverImage);

    axios
      .post(`${base_url}/api/v1/users/register`, formData)
      .then((res) => {
        setLoading(false);
        navigate("/login");
        // toast("Account created Successfully");
      })
      .catch((error) => {
        setLoading(false);
        // toast.error(error.response?.statusText || "Something went wrong");
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gray-900 px-4">
      <div className="flex flex-col justify-center items-center gap-4 w-full max-w-md md:max-w-lg lg:max-w-xl shadow-xl shadow-gray-700 bg-gray-700 py-8 px-6 rounded-lg">
        
        {/* Logo and title */}
        <div className="flex gap-3 justify-center items-center">
          <img className="w-16 h-10 rounded-lg" src={logo} alt="logo" />
          <h2 className="text-2xl md:text-3xl text-white font-semibold">My YouTube</h2>
        </div>

        {/* Form */}
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={submitHandler}
        >
          <input
            className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-4 py-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-4 py-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
            type="text"
            placeholder="Full Name"
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-4 py-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password with toggle */}
          <div className="relative w-full">
            <input
              className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-5 w-full h-10 shadow-xl pr-10"
              type={showPassword ? "text" : "password"} // 👈 Toggle here
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"} {/* Icon changes */}
            </button>
          </div>

          {/* Avatar Upload */}
          <div className="flex items-center gap-3 text-white">
            <label htmlFor="avatar" className="cursor-pointer text-sm font-medium">
              Avatar Image
            </label>
            <input
              id="avatar"
              required
              accept="image/*"
              type="file"
              className="hidden"
              onChange={avatarFileHandler}
            />
            {avatarUrl && (
              <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-md" />
            )}
          </div>

          {/* Cover Image Upload */}
          <div className="flex items-center gap-3 text-white">
            <label htmlFor="coverImage" className="cursor-pointer text-sm font-medium">
              Cover Image
            </label>
            <input
              id="coverImage"
              accept="image/*"
              type="file"
              className="hidden"
              onChange={coverImageFileHandler}
            />
            {coverImageUrl && (
              <img src={coverImageUrl} alt="Cover" className="w-12 h-12 rounded object-cover shadow-md" />
            )}
          </div>

          {/* Submit button */}
          <button
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 mt-2 w-full shadow-md font-medium transition-all duration-200 cursor-pointer"
            type="submit"
          >
            {isLoading && (
              <i className="fa-solid fa-spinner fa-spin-pulse mr-2"></i>
            )}
            Submit
          </button>

          {/* Login link */}
          <Link className="text-sm text-center text-blue-300 hover:underline" to={"/login"}>
            Login with your account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Signup;