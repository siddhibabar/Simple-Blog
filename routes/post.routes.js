const express =
  require("express");

const router =
  express.Router();

const protect =
  require("../middleware/auth");

const upload = require("../middleware/multer");

const {
  createPost,
  getPosts,
  getPost,
  deletePost,
  toggleLike
} = require(
  "../controllers/postControllers"
);



router.post("/",protect,upload.single("image"),createPost);

router.get("/",getPosts);

router.get("/:id",getPost);

router.delete("/:id",protect,deletePost);

router.post("/:id/like",protect,toggleLike);

module.exports =router;