import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { apiError } from "./apiError.js";
import { extractPublicId } from 'cloudinary-build-url'


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, 
        {
            resource_type: "auto",
        }
    );
    fs.unlinkSync(localFilePath);
    return response;
  }
    catch (error) {
    fs.unlinkSync(localFilePath); 
    return null;
  }
};

const deleteImageFromCloudinary = async(fileUrl) =>{
  try {
    const publicId = extractPublicId(fileUrl) 
    const deleteResponse = await cloudinary.uploader.destroy(publicId, {invalidate: true})
  } catch (error) {
    throw new apiError(400, error?.message || "unable to delete image")
  }
}

const deleteVideoFromCloudinary = async(fileUrl) =>{
  try {
    const publicId = extractPublicId(fileUrl) 
    const deleteResponse = await cloudinary.uploader.destroy(publicId,{resource_type: "video"})
  } catch (error) {
    throw new apiError(400, error?.message || "unable to delete image")
  }
}

export {uploadOnCloudinary, deleteImageFromCloudinary, deleteVideoFromCloudinary}