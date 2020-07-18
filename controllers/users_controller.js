const User = require("../models/user");

module.exports.profile = function (req, res) {
  return res.end("<h1>Profile</h1>");
};

// render the sign in page
module.exports.signIn = function (req, res) {
  return res.render("sign_in", {
    title: "Sign In",
  });
};

// get the sign up data
module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "Passwords do not match");
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      req.flash("error", err);
      return;
    }

    if (!user) {
      User.create(req.body, function (err, user) {
        if (err) {
          req.flash("error", err);
          return;
        }

        return res.redirect("/users/sign-in");
      });
    } else {
      req.flash("success", "You have signed up, login to continue!");
      return res.redirect("back");
    }
  });
};

// render the sign up page
module.exports.signUp = function (req, res) {
  return res.render("sign_up", {
    title: "Sign In",
  });
};

// sign in and create a session for the user
module.exports.createSession = function (req, res) {
  //req.flash("success", "Logged in Successfully");
  return res.redirect("/");
};
