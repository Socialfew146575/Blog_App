const express = require("express");
const app = express();
const path = require("path");
const PORT = 8000;

require("dotenv").config();

const connectToDB = require("./db/config");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override')
const { checkForAuthenticationCookie } = require("./middlewares/auth");

const Blog = require("./models/blog");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.use(express.static(path.resolve("./public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });

  return res.render("home", {
    user: req.user,
    blogs: allBlogs,
    currURL:'/'
  });
});

connectToDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening at PORT : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Something went wrong while connection to Database");
  });
