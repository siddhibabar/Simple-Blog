const Comment =
  require("../models/Comment");

const Post =
  require("../models/Post");



  const addComment =
  async (req, res) => {
    try {

      const {
        text
      } = req.body;

      if (!text) {
        return res
          .status(400)
          .json({
            message:
              "Comment required"
          });
      }

      const post =
        await Post.findById(
          req.params.postId
        );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              "Post not found"
          });
      }

      const comment =
        await Comment.create({
          text,

          user:
            req.user._id,

          post:
            req.params.postId
        });

      const populatedComment =
        await Comment.findById(
          comment._id
        ).populate(
          "user",
          "name profilePic"
        );

      res.status(201).json(
        populatedComment
      );

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };

  const getComments =
  async (req, res) => {
    try {

      const comments =
        await Comment.find({
          post:
            req.params.postId
        })
          .populate(
            "user",
            "name profilePic"
          )
          .sort({
            createdAt: -1
          });

      res.json(comments);

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };




  const deleteComment =
  async (req, res) => {
    try {

      const comment =
        await Comment.findById(
          req.params.id
        );

      if (!comment) {
        return res
          .status(404)
          .json({
            message:
              "Comment not found"
          });
      }

      if (
        comment.user.toString() !==
        req.user._id.toString()
      ) {
        return res
          .status(401)
          .json({
            message:
              "Unauthorized"
          });
      }

      await comment.deleteOne();

      res.json({
        success: true,
        message:
          "Comment deleted"
      });

    } catch (error) {
      res.status(500).json({
        message:
          error.message
      });
    }
  };


  module.exports = {
  addComment,
  getComments,
  deleteComment
};