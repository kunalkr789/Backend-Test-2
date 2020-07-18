const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/nodejs_auth");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error connecting to mongoDB"));

db.once("open", function () {
  console.log("connected to database");
});

module.exports = db;
