import express from "express";
import {
  isAuthentication,
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
} from "../controllers/auth.controller.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);


router.post("/is-auth", userAuth, isAuthentication);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;
