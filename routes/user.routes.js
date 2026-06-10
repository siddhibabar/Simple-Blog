const express =
  require("express");

const router =
  express.Router();

const {
  getUserProfile,
  updateProfile,
  updateProfilePicture
} = require(
  "../controllers/userControllers"
);

const protect =
  require(
    "../middleware/auth"
  );

const upload = require("../middleware/multer");



router.get( "/:id",getUserProfile);

router.put("/update",protect,updateProfile);

router.put("/profile-picture",protect,upload.single("profilePic"),updateProfilePicture);

module.exports = router;