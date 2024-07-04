const { mongoose } = require("mongoose");

const connectToDB = async (uri) => {
  await mongoose
    .connect(uri)
    .then(() => {
      console.log("Connected to Database");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectToDB;
