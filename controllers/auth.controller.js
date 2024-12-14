import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password, phoneNumber,address, city,country } = req.body;
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
      return res.json({
        success: false,
        message: "Email already in use",
      });
    }
    const hasedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hasedPassword,
      phoneNumber,
      address,
      city,
      country
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to the Plant Diaries",
      text: `Hello ${name}, welcome to Plant Diaries🌱! You have successfully registered🎉. 
      We're excited to have you as part of our community.🤗`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res
      .status(401)
      .json({
        success: false,
        message: "Invalid passsoword",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      success: true,
      userId: user._id, // Include userId for frontend use
      isAccountVerified: user.isAccountVerified, // Include verification status
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during login.",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({
      success: true,
      message: "Loggged out",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//send verification OTP to the User's email
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account Already verified",
      });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOpt = otp;
    user.verifyOptExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your Plant Diaries activation code is ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Verification OTP sent on Email",
    });
  } catch (error) {
    res.json({
      sucess: true,
      measage: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({
      success: false,
      message: "Invalid Request",
    });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User Not Found",
      });
    }
    if (user.verifyOpt === "" || user.verifyOpt !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    
    if (user.verifyOptExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP Expired",
      });
    }
    user.isAccountVerified = true;
    user.verifyOpt = "";
    user.verifyOptExpireAt = 0;
    await user.save();
    res.json({
      success: true,
      message: "Email Verified Successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


//check user if user is authenticate
export const isAuthentication = async(req,res)=>{
   try {
    return res.json({
      success:true
    })
   } catch (error) {
    res
    .status(500)
    .json({
      success:false,
      message:error.message
    })
   }
}

export const sendResetOtp = async(req,res)=>{
  const {email}= req.body;
  if(!email){
    return res
      .status(400)
      .json({success:false,message:"Please provide an email address."})
  }
   
  try {
    const user = await User.findOne({email});
    if(!user){
      return res.json({
        success:false,
        message:"No account found with this email address."
      })
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOpt= otp;
    user.resetOptExpiredAt= Date.now() + 15  * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hello, ${user.name}. Your OTP to reset your password is ${otp}. It is valid for 15 minutes.`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your registered email address.",
    });

  } catch (error) {
    return res
    .status(500)
    .json({
      success:false,
      message: "An error occurred while processing your request. Please try again later."    
    })
  }
}

export const resetPassword = async(req,res)=>{
  const {email,otp,newPassword} = req.body;
  if(!email || !otp || !newPassword){
    return res
    .status(400)
    .json({
      success:false,
      message:"Please provide all the required fields."
    })
  }
  
  try {
    const user = await User.findOne({email});
    if(!user){
      return res.json({
        success:false,
        message:"No account found with this email address."
      })
    }
    if(user.resetOpt ==="" || user.resetOpt !== otp ){
      return res.json({
        success:false,
        message:"Invalid OTP. Please try again."
      })
    }
    if(user.resetOptExpiredAt < Date.now()){
      return res
      .json({
        success:false,
        message:"Your OTP has expired. Please request for a new OTP."
      })
    }
    const hashedpassword = await bcrypt.hash(newPassword,10);
    
    user.password = hashedpassword;
    user.resetOpt = "";
    user.resetOptExpiredAt = 0;
    await user.save();
    return res.json({
      success:true,
      message:"Passowrd has been reset successfully"
    })
  } catch (error) {
    return res
    .status(500)
    .json({
      success:false,
      message: "OTP is wrong"    
    })
  }
}