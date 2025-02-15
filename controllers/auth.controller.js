import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password, phoneNumber, address, city, country } = req.body;

  switch(true){
    case !name :
      return res.status(400).json({message:"name is required"})
    case !email:
      return res.status(400).json({message:"email is required"})
    case !password:
      return res.status(400).json({message:"password is required"})
    case !phoneNumber:
      return res.status(400).json({message:"Phoneno is required"})
    case !address:
      return res.status(400).json({message:"address is required"})
    case !city:
      return res.status(400).json({message:"city is required"})
    case !country:
      return res.status(400).json({message:"country is required"})
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      phoneNumber,
      address,
      city,
      country
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Plant Diaries",
      text: `Hello ${name}, welcome to Plant Diaries🌱! You have successfully registered🎉.`,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, userId: user._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: "An error occurred during login." });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Fix isAuthentication
export const isAuthentication = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ success: true, userId: decoded.id });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ✅ Fix sendResetOtp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Please provide an email address." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "No account found with this email address." });
    }

    user.resetOpt = "";
    user.resetOptExpiredAt = 0;
    await user.save();

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOpt = otp;
    user.resetOptExpiredAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hello, ${user.name}. Your OTP to reset your password is ${otp}. It is valid for 15 minutes.`,
    });

    return res.status(200).json({ success: true, message: "OTP has been sent to your registered email address." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "An error occurred. Please try again." });
  }
};

// ✅ Fix resetPassword
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.resetOpt !== otp || user.resetOptExpiredAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOpt = "";
    user.resetOptExpiredAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "An error occurred." });
  }
};
