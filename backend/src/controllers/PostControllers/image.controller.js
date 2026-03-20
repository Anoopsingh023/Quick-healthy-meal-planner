import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { Image } from "../../models/PostModels/imagePost.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const createImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new apiError(400, "Image file is required");
  }

  const uploaded = await uploadOnCloudinary(req.file.path);

  const image = await Image.create({
    imageFile: uploaded.secure_url,
    owner: req.user._id,
    caption: req.body.caption || "",
  });

  return res
    .status(201)
    .json(new apiResponse(201, image, "Image uploaded successfully"));
});

const getAllImages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const aggregate = Image.aggregate([
    { $match: { isPublished: true } },

    { $sort: { createdAt: -1 } },

    {
      $lookup: {
        from: "users",
        let: { ownerId: "$owner" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$ownerId"] }
            }
          },
          {
            $project: {
              userName: 1,
              avatar: 1,
              fullName: 1
            }
          }
        ],
        as: "owner"
      }
    },

    { $unwind: "$owner" }
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const images = await Image.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new apiResponse(200, images, "Images fetched successfully"));
});

const getImageById = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id).populate(
    "owner",
    "userName avatar",
  );

  if (!image) throw new apiError(404, "Image not found");

  return res.status(200).json(new apiResponse(200, image, "Image fetched"));
});

const updateImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);

  if (!image) throw new apiError(404, "Image not found");

  if (image.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "Not authorized");
  }

  image.caption = req.body.caption || image.caption;

  await image.save();

  return res.status(200).json(new apiResponse(200, image, "Image updated"));
});

const deleteImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);

  if (!image) throw new apiError(404, "Image not found");

  if (image.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "Not authorized");
  }

  await image.deleteOne();

  return res.status(200).json(new apiResponse(200, {}, "Image deleted"));
});

const togglePublish = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);

  if (!image) throw new apiError(404, "Image not found");

  if (image.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "Not authorized");
  }

  image.isPublished = !image.isPublished;

  await image.save();

  return res
    .status(200)
    .json(new apiResponse(200, image, "Publish status updated"));
});

const incrementViews = asyncHandler(async (req, res) => {
  const image = await Image.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true },
  );

  if (!image) throw new apiError(404, "Image not found");

  return res
    .status(200)
    .json(new apiResponse(200, image.views, "View count updated"));
});

export {
  createImage,
  getAllImages,
  getImageById,
  updateImage,
  deleteImage,
  togglePublish,
  incrementViews,
};
