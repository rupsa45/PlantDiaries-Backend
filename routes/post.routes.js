import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createPlantPost,
  deletePlantPost,
  getAllPlantPosts,
  getPlantPostById,
  updatePlantPost,
} from "../controllers/plantPost.controller.js";

const router = express.Router();

router
  .route("/plant-posts")
  .post(userAuth, createPlantPost)
  .get(userAuth, getAllPlantPosts);

router
  .route("/plant-posts/:id")
  .get(userAuth,getPlantPostById)
  .put(userAuth, updatePlantPost)
  .delete(userAuth,deletePlantPost)

export default router;