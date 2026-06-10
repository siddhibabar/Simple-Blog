const User = require("../models/user");
const cloudinary = require(
  "../config/cloudinary"
);

const streamifier =
  require("streamifier");



// GET USER PROFILE

const getUserProfile =
  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.params.id
        ).select("-password");

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found"
          });
      }

      res.json(user);

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };



// UPDATE PROFILE

const updateProfile =
  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found"
          });
      }

      user.name =
        req.body.name ||
        user.name;

      user.bio =
        req.body.bio ||
        user.bio;

      await user.save();

      res.status(200).json({
        success: true,
        user
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };



// UPDATE PROFILE IMAGE

const updateProfilePicture =
  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found"
          });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({
            message:
              "Image required"
          });
      }

      if (
        user.profilePic
          ?.publicId
      ) {
        await cloudinary
          .uploader
          .destroy(
            user.profilePic
              .publicId
          );
      }

      const uploadImage =
        () =>
          new Promise(
            (
              resolve,
              reject
            ) => {
              const stream =
                cloudinary
                  .uploader
                  .upload_stream(
                    {
                      folder:
                        "storyhub/profile"
                    },
                    (
                      error,
                      result
                    ) => {
                      if (
                        result
                      ) {
                        resolve(
                          result
                        );
                      } else {
                        reject(
                          error
                        );
                      }
                    }
                  );

              streamifier.createReadStream(
                req.file.buffer
              ).pipe(
                stream
              );
            }
          );

      const result =
        await uploadImage();

      user.profilePic = {
        url:
          result.secure_url,

        publicId:
          result.public_id
      };

      await user.save();

      res.status(200).json({
        success: true,
        profilePic:
          user.profilePic
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };



module.exports = {
  getUserProfile,
  updateProfile,
  updateProfilePicture
};