const User = require("../models/user");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateTokens");


// REGISTER USER

const registerUser = async (
  req,
  res
) => {
  try {

    const {
      name,
      email,
      password
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields required"
      });
    }

    const userExists =
      await User.findOne({
        email
      });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    const user =
      await User.create({
        name,
        email,
        password: hashedPassword
      });

    const token =
      generateToken(user._id);

    res.cookie(
      "token",
      token,
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    
        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000
      }
    );

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



// LOGIN USER

const loginUser = async (
  req,
  res
) => {
  try {

    const {
      email,
      password
    } = req.body;

    const user =
      await User.findOne({
        email
      });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid credentials"
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid credentials"
      });
    }

    const token =
      generateToken(user._id);

    res.cookie(
      "token",
      token,
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000
      }
    );

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic:
          user.profilePic
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



// LOGOUT

const logoutUser = async (
  req,
  res
) => {
  try {

    res.cookie(
      "token",
      "",
      {
        expires: new Date(0)
      }
    );

    res.status(200).json({
      success: true,
      message:
        "Logged out successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



// CURRENT USER

const getMe = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.user._id
      ).select("-password");

    res.status(200).json(
      user
    );

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe
};