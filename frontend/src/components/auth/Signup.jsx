// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// // import { toast } from "react-toastify";
// import { base_url } from "../../utils/constant";
// import logo from "../../assets/logo.jpg";

// function Signup() {
//   const [username, setUsername] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [password, setPassword] = useState("");
//   const [email, setEmail] = useState("");
//   const [phoneNo, setPhoneNo] = useState("")
//   const [avatar, setAvatar] = useState(null);
//   const [avatarUrl, setAvatarUrl] = useState("");
//   const [isLoading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const avatarFileHandler = (e) => {
//     setAvatar(e.target.files[0]);
//     setAvatarUrl(URL.createObjectURL(e.target.files[0]));
//   };

//   const navigate = useNavigate();

//   const submitHandler = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     const formData = new FormData();
//     formData.append("userName", username);
//     formData.append("fullName", fullName);
//     formData.append("email", email);
//     formData.append("phoneNo", phoneNo)
//     formData.append("password", password);
//     formData.append("avatar", avatar);
//     // formData.append("coverImage", coverImage);

//     axios
//       .post(`${base_url}/users/register`, formData)
//       .then((res) => {
//         console.log("Signup",res.data)
//         setLoading(false);
//         navigate("/login");
//         // toast("Account created Successfully");
//       })
//       .catch((error) => {
//         console.error("Signup error",error)
//         setLoading(false);
//         // toast.error(error.response?.statusText || "Something went wrong");
//       });
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen w-full bg-gray-900 px-4">
//       <div className="flex flex-col justify-center items-center gap-4 w-full max-w-md md:max-w-lg lg:max-w-xl shadow-xl shadow-gray-700 bg-gray-700 py-8 px-6 rounded-lg">

//         {/* Logo and title */}
//         <div className="flex gap-3 justify-center items-center">
//           <img className="w-16 h-10 rounded-lg" src={logo} alt="logo" />
//           <h2 className="text-2xl md:text-3xl text-white font-semibold">Signup</h2>
//         </div>

//         {/* Form */}
//         <form
//           className="flex flex-col gap-4 w-full"
//           onSubmit={submitHandler}
//         >
//           <input
//             className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-4 py-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
//             type="text"
//             id="user-name"
//             placeholder="Username"
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />

//           <input
//             className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-4 py-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
//             type="text"
//             id="full-name"
//             placeholder="Full Name"
//             onChange={(e) => setFullName(e.target.value)}
//             required
//           />

//           <input
//             className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-4 py-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
//             id="user-email"
//             type="email"
//             placeholder="Email"
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <input
//             className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-4 py-2 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
//             type="text"
//             id="phone-number"
//             placeholder="Mobile Number"
//             onChange={(e) => setPhoneNo(e.target.value)}
//             required
//           />

//           {/* Password with toggle */}
//           <div className="relative w-full">
//             <input
//               className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-5 w-full h-10 shadow-xl pr-10"
//               type={showPassword ? "text" : "password"} // 👈 Toggle here
//               placeholder="Password"
//               id="user-password"
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-2 text-gray-600 cursor-pointer"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? "🙈" : "👁️"} {/* Icon changes */}
//             </button>
//           </div>

//           {/* Avatar Upload */}
//           <div className="flex items-center gap-3 text-white">
//             <label htmlFor="avatar" className="cursor-pointer text-sm font-medium">
//               Avatar Image
//             </label>
//             <input
//               id="avatar"
//               required
//               accept="image/*"
//               type="file"
//               className="hidden"
//               onChange={avatarFileHandler}
//             />
//             {avatarUrl && (
//               <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-md" />
//             )}
//           </div>

//           {/* Submit button */}
//           <button
//             className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 mt-2 w-full shadow-md font-medium transition-all duration-200 cursor-pointer"
//             type="submit"
//             id="signup"
//           >
//             {isLoading && (
//               <i className="fa-solid fa-spinner fa-spin-pulse mr-2"></i>
//             )}
//             Submit
//           </button>

//           {/* Login link */}
//           <Link className="text-sm text-center text-blue-300 hover:underline" to={"/login"}>
//             Login with your account
//           </Link>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Signup;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { base_url } from "../../utils/constant";
import logo from "../../assets/logo.jpg";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    userName: "",
    fullName: "",
    email: "",
    phoneNo: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- INPUT ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ---------------- AVATAR ----------------
  const handleAvatar = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // 🔥 Validation
    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ---------------- VALIDATION ----------------
  const validate = () => {
    if (
      !form.userName ||
      !form.fullName ||
      !form.email ||
      !form.phoneNo ||
      !form.password
    ) {
      return "All fields are required";
    }

    if (form.userName.length < 3) {
      return "Username must be at least 3 characters";
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email)) {
      return "Invalid email format";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(form.phoneNo)) {
      return "Invalid phone number";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (!avatar) {
      return "Avatar is required";
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

      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key].trim());
      });

      formData.append("avatar", avatar);

      const res = await axios.post(`${base_url}/users/register`, formData, {
        withCredentials: true,
      });

      setUser(res.data.data.user);
      const user = res.data.data.user;
      localStorage.setItem("userName", user.userName);
      localStorage.setItem("avatar", user.avatar);

      // redirect directly
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message || "Signup failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gray-900 px-4">
      <div className="flex flex-col items-center gap-5 w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <img className="w-14 h-10 rounded-lg" src={logo} alt="logo" />
          <h2 className="text-2xl text-white font-semibold">Signup</h2>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full bg-red-500/20 text-red-400 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submitHandler} className="flex flex-col gap-3 w-full">
          <input
            name="userName"
            placeholder="Username"
            onChange={handleChange}
            className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-5 w-full h-10 shadow-xl pr-10"
            // className="input"
          />

          <input
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-5 w-full h-10 shadow-xl pr-10"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-5 w-full h-10 shadow-xl pr-10"
          />

          <input
            name="phoneNo"
            placeholder="Mobile Number"
            onChange={handleChange}
            className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-5 w-full h-10 shadow-xl pr-10"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="bg-amber-50 rounded-lg placeholder:text-slate-400 text-slate-700 px-5 w-full h-10 shadow-xl pr-10"
          />

          {/* Avatar */}
          <div className="flex items-center gap-3 text-white">
            <label className="cursor-pointer text-sm">
              Upload Avatar
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatar}
              />
            </label>

            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="preview"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`py-2 rounded-lg text-white font-medium ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

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

          <Link
            to="/login"
            className="text-sm text-center text-blue-300 hover:underline"
          >
            Already have an account?
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Signup;
