import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import axios from "axios";
import { base_url } from "../../utils/constant";

export default function ProfileHeader({ user }) {
  // avatar preview + file selection
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(""); // local object URL for selected file
  const [preview, setPreview] = useState(user?.avatar || "");

  // crop modal state
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1); // square avatar
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    userName: user?.userName || "",
  });

  useEffect(() => {
    setPreview(user?.avatar || "");
  }, [user]);

  // Save username and fullname updates
  async function saveProfile() {
    try {
      const res = await axios.put(
        `${base_url}/users/me/account`,
        { fullName: form.fullName, userName: form.userName },
        {
          withCredentials: true
        }
      );
      console.log("Update user data", res.data);
      // onEdit(res.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  }

  // When user selects a file, read it and open cropper
  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
    setIsCropOpen(true);
  }

  // Cropper callback
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Utility: create an HTMLImageElement from a src
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.setAttribute("crossOrigin", "anonymous"); // for CORS-safe canvas export
      img.src = url;
    });

  // Utility: given an image and crop area, return a blob of the cropped image
  async function getCroppedImg(imageSrc, pixelCrop, outputSize = 512) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    // make canvas square for avatar, optionally scale to outputSize
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    // draw the cropped portion of the source image onto the canvas,
    // mapping pixelCrop (relative to source image) to full canvas size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // compute actual crop coordinates in source image pixels
    const sx = pixelCrop.x * scaleX;
    const sy = pixelCrop.y * scaleY;
    const sWidth = pixelCrop.width * scaleX;
    const sHeight = pixelCrop.height * scaleY;

    // draw image portion to canvas and scale to full canvas size
    ctx.drawImage(
      image,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    });
  }

  // Upload cropped image to server
  async function uploadCroppedImage() {
    if (!croppedAreaPixels || !imageSrc) {
      return alert("No crop selected");
    }
    setUploading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, 512);
      // convert blob to File (some servers prefer a file name)
      const fileName = `avatar_${Date.now()}.jpg`;
      const croppedFile = new File([blob], fileName, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("avatar", croppedFile);

      const res = await axios.put(`${base_url}/users/me/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // assume server responds with { avatar: "<url>" }
      const updatedAvatarUrl = res.data.avatar || res.data.url || null;
      if (updatedAvatarUrl) {
        setPreview(updatedAvatarUrl);
        onUserUpdate({ ...user, avatar: updatedAvatarUrl });
      } else {
        // fallback: create a local preview url in case server returns nothing
        setPreview(URL.createObjectURL(croppedFile));
      }

      setIsCropOpen(false);
      setFile(null);
      setImageSrc("");
      alert("Avatar uploaded successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // Optionally allow user to cancel cropping
  function cancelCrop() {
    setIsCropOpen(false);
    // revoke object URL
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setFile(null);
    setImageSrc("");
  }

  // small helper: trigger hidden file input
  const fileInputRef = React.useRef();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={preview || "/placeholder-avatar.png"}
            alt="avatar"
            className="w-40 h-40 rounded-full object-cover border shadow-sm"
          />
          <label
            htmlFor="avatarUpload"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 text-white text-xl bg-[#00000070] w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-[#00000090]"
          >
            <i className="fa-regular fa-pen-to-square"></i>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        <div>
          {!editing ? (
            <>
              <div className="flex flex-row items-center gap-3">
                <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                <p
                  onClick={() => setEditing(true)}
                  className="cursor-pointer text-slate-600"
                  title="Edit profile"
                >
                  <i className="fa-solid fa-user-pen"></i>
                </p>
              </div>
              <p className="text-sm text-slate-500">@{user?.userName}</p>
              <p className="text-sm text-slate-600 mt-2">{user?.email}</p>
              <p className="text-sm text-slate-600 mt-2">{user?.phoneNo}</p>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                className="border rounded px-3 py-2"
                placeholder="Full Name"
              />
              <input
                type="text"
                name="userName"
                value={form.userName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, userName: e.target.value }))
                }
                className="border rounded px-3 py-2"
                placeholder="Username"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveProfile}
                  className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="border px-3 py-1 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Crop modal (simple overlay) */}
      {isCropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Crop & Upload Avatar</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelCrop}
                  className="px-3 py-1 rounded border"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadCroppedImage}
                  disabled={uploading}
                  className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            <div className="relative" style={{ height: 500 }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
              <div className="ml-auto text-sm text-slate-500">
                Preview size: 512×512
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
