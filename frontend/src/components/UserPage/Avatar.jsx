import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { base_url } from "../../utils/constant";
import useToast from "../../hooks/useToast";

export default function Avatar({ user, onUpdate }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(user?.avatar || "");
  const [uploading, setUploading] = useState(false);
  const { showToast, showErrorToast } = useToast();

  useEffect(() => setPreview(user?.avatar || ""), [user]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await axios.put(`${base_url}/users/me/avatar`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.data?.avatar || res.data?.avatar || localUrl;
      console.log("Avatar update ", res.data);
      const message = res.data.message || "Avatar updated!"
      showToast(message);
      setPreview(url);
      onUpdate?.({ avatar: url });
    } catch (err) {
      setPreview(user?.avatar || "");
      const errorMessage = err?.response.data.message || "Avatar update failed"
      showErrorToast(errorMessage);
      console.log("Error avatar update", err?.response.data);
      //   alert("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  }

  const initials = (user?.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="avatar-wrap">
      {preview ? (
        <img src={preview} alt="avatar" className="avatar-img" />
      ) : (
        <div className="avatar-fallback">{initials}</div>
      )}
      <button
        className="avatar-edit-btn"
        onClick={() => fileRef.current?.click()}
        title="Change photo"
      >
        {uploading ? (
          <span className="spinner" />
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}
