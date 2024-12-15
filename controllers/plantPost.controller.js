import PlantPost from "../models/plantPost.models.js";
import cloudinary from 'cloudinary';

const uploadImage = async (file) => {
  try {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString('base64');
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;  
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error.message);
    throw new Error('Error uploading image');
  }
};

export const createPlantPost = async (req, res) => {
  try {
    const { plantName, aboutPlant, placeName, latitude, longitude, category, contactEmail, tags } = req.body;
    switch (true) {
      case !plantName:
        return res.status(400).json({ message: "Plant name is required" });
  
      case !aboutPlant:
        return res.status(400).json({ message: "About plant information is required" });
  
      case !placeName:
        return res.status(400).json({ message: "Place name is required" });
  
      case !latitude:
        return res.status(400).json({ message: "Latitude is required" });
  
      case !longitude:
        return res.status(400).json({ message: "Longitude is required" });
  
      case !category:
        return res.status(400).json({ message: "Category is required" });
  
      case !contactEmail:
        return res.status(400).json({ message: "Contact email is required" });

    }
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: "User not authenticated" });
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }
      const plantPost = await PlantPost.create({
        createdBy: userId,
        plantName,
        aboutPlant,
        image: imageUrl,
        placeName,
        location: {
          type: "Point",
          coordinates: [longitude, latitude], // Longitude first
        },
        category,
        tags,
        contactEmail,
      });
      return res.status(201).json({
        message: "Plant post created successfully",
        post: plantPost,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getAllPlantPosts = async (req, res) => {
  try {
    const posts = await PlantPost.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPlantPostById = async (req, res) => {
  try {
    const post = await PlantPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePlantPost = async (req, res) => {
  try {
    const {
      plantName,
      aboutPlant,
      userId,
      placeName,
      longitude,
      latitude,
    } = req.body;
    const { id: postId } = req.params;
    const post = await PlantPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this post." });
    }
    if (plantName) post.plantName = plantName;
    if (aboutPlant) post.aboutPlant = aboutPlant;
    if (placeName) post.placeName = placeName;
    if (req.file) {
      let newImageUrl = await uploadImage(req.file); 
      post.image = newImageUrl;
    }
    if (latitude && longitude) {
      post.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }
    const updatedPost = await post.save();
    res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deletePlantPost = async (req, res) => {
  try {
    const post = await PlantPost.findByIdAndDelete(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
