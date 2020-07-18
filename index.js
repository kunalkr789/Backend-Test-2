const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 8000;
const db = require("./config/mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");

app.use(express.urlencoded());
app.use(cookieParser());

app.use(express.static("./assets"));
app.use("/", require("./routes"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(
  session({
    name: "authentication",
    secret: "abcd1234",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
  })
);

app.listen(port, function (err) {
  if (err) {
    console.log("Error in running the server: ", err);
  }
  console.log("Server is running on port:", port);
});
