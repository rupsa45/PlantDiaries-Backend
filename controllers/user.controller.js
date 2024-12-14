import User from "../models/user.models.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      succes: true,
      userData: {
        name: user.name,
        email: user.email,
        phoneNumber:user.phoneNumber,
        address:user.address,
        city:user.city,
        country:user.country,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
