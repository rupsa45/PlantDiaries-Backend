import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createPlantPost,
  deletePlantPost,
  getAllPlantPosts,
  getPlantPostById,
  getPlantPostByUser,
  searchPlantPostsByPlaceName,
  updatePlantPost,
} from "../controllers/plantPost.controller.js";
import multer from "multer";
const upload = multer();
const router = express.Router();

router
  .route("/plant-posts")
  .post(upload.single("image"), userAuth, createPlantPost)
  .get(userAuth, getPlantPostByUser);

router.get("/all-posts", getAllPlantPosts);

router
  .route("/plant-posts/:id")
  .get(userAuth, getPlantPostById)
  .put(userAuth, upload.single("image"), updatePlantPost)
  .delete(userAuth, deletePlantPost);

router
  .route("/plant-posts/search/:placeName")
  .get(searchPlantPostsByPlaceName);

export default router;