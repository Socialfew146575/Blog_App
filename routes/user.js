const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/user");
const path = require('path')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/avatar`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/signin", (req, res) => {
  return res.render("signin", {
    currURL: "/user/signin",
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", {
    currURL: "/user/signup",
  });
});

router.post("/signup", upload.single("avatar"), async (req, res) => {
  const { fullName, email, password } = req.body;

  if (req.file) {
    await User.create({
      fullName,
      email,
      password,
      profileImageURL: `/avatar/${req.file.filename}`,
    });
  } else {
    await User.create({
      fullName,
      email,
      password,
    });
  }


  return res.redirect("signin");
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await User.matchPasswordAndGenerateToken(email, password);

    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
