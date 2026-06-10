const Post =
  require("../models/post");

const cloudinary =
  require(
    "../config/cloudinary"
  );

const streamifier =
  require("streamifier");


  const createPost =
  async (req, res) => {
    
    try {

      if (!req.file) {
        return res
          .status(400)
          .json({
            message:
              "Image required"
          });
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
                        "storyhub/posts"
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

              streamifier
                .createReadStream(
                  req.file.buffer
                )
                .pipe(
                  stream
                );
            }
          );

      const result =
        await uploadImage();

     

      const post =
        await Post.create({
          caption:
            req.body.caption,

          image: {
            url:
              result.secure_url,

            publicId:
              result.public_id
          },

          user:
            req.user._id
        });

      res.status(201).json(
        post
      );

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };

  const getPosts =
  async (req, res) => {
    try {

      const posts =
        await Post.find()
          .populate(
            "user",
            "name profilePic"
          )
          .sort({
            createdAt: -1
          });

      res.json(posts);

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };



  const getPost =
  async (req, res) => {
    try {

      const post =
        await Post.findById(
          req.params.id
        ).populate(
          "user",
          "name profilePic"
        );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              "Post not found"
          });
      }

      res.json(post);

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };

  const deletePost =
  async (req, res) => {
    try {

      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              "Post not found"
          });
      }

      if (
        post.user.toString() !==
        req.user._id.toString()
      ) {
        return res
          .status(401)
          .json({
            message:
              "Unauthorized"
          });
      }

      if (
        post.image.publicId
      ) {
        await cloudinary
          .uploader
          .destroy(
            post.image
              .publicId
          );
      }

      await post.deleteOne();

      res.json({
        success: true,
        message:
          "Post deleted"
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };



  const toggleLike =
  async (req, res) => {
    try {

      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              "Post not found"
          });
      }

      const alreadyLiked =
        post.likes.includes(
          req.user._id
        );

      if (
        alreadyLiked
      ) {
        post.likes =
          post.likes.filter(
            (
              like
            ) =>
              like.toString() !==
              req.user._id.toString()
          );
      } else {
        post.likes.push(
          req.user._id
        );
      }

      await post.save();

      res.json({
        success: true,
        likes:
          post.likes.length
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };




  module.exports = {
  createPost,
  getPosts,
  getPost,
  deletePost,
  toggleLike
};