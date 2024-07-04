const express = require("express");
const router = express.Router();

const multer = require("multer");

const path = require("path");
const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
    currURL: "/blog/add-new",
  });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, blogContent } = req.body;
    const blog = await Blog.create({
      title,
      body: blogContent,
      createdBy: req.user._id,
      coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId).populate("createdBy");
    const comments = await Comment.find({ blogId }).populate("createdBy");
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    return res.render("blog", {
      blog: blog,
      user: req.user,
      comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/comment/:blogId", async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });

  return res.redirect(`/blog/${req.params.blogId}`);
});

router.get("/edit/:blogId", async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);

  return res.render("editBlog", {
    user: req.user,
    blog,
  });
});

router.patch("/edit/:blogId", upload.single("coverImage"), async (req, res) => {
  const { title, blogContent } = req.body;
  const updateFields = {
    title,
    body: blogContent,
  };

  if (req.file) {
    updateFields.coverImageURL = `/uploads/${req.file.filename}`;
  }

  await Blog.findByIdAndUpdate(req.params.blogId, { $set: updateFields });

  res.redirect(`/blog/${req.params.blogId}`);
});

router.delete("/delete/:blogId", async (req, res) => {
  try {
    // Delete the blog
    await Blog.findByIdAndDelete(req.params.blogId);

    // Delete associated comments
    await Comment.deleteMany({ blogId: req.params.blogId });

    console.log("Blog and associated comments deleted successfully");
  } catch (error) {
    console.log("Error deleting blog:", error);
  }

  // Redirect to the home page after successful deletion or in case of an error
  return res.redirect("/");
});

router.delete("/comment/delete/:blogId/:commentId", async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.commentId);
  } catch (error) {
    console.log("Error while deleting comment:", error);
  }

  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
