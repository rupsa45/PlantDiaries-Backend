import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createPlantPost,
  deletePlantPost,
  getAllPlantPosts,
  getPlantPostById,
  updatePlantPost,
} from "../controllers/plantPost.controller.js";
import multer from "multer";
const upload=multer();
const router = express.Router();

router
  .route("/plant-posts")
  .post(upload.single('image'), userAuth, createPlantPost)
  .get(userAuth, getAllPlantPosts);

router
  .route("/plant-posts/:id")
  .get(userAuth, getPlantPostById)
  .put(userAuth, upload.single("image"), updatePlantPost)
  .delete(userAuth, deletePlantPost);

export default router;