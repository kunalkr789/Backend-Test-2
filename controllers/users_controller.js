const User = require("../models/user");
const ResetPassword = require("../models/reset_password");
const crypto = require("crypto");
const resetPasswordMailer = require("../mailers/reset_password_mailer");
const queue = require("../config/kue");
const resetPasswordWorker = require("../workers/reset_password_worker");

module.exports.profile = function (req, res) {
  return res.end("<h1>Profile</h1>");
};
module.exports.resetPasswordEmail = async function (req, res) {
  try {
    // find user by email
    let user = await User.findOne({ email: req.body.email });
    console.log("user found ", user);

    let resetDb = await ResetPassword.create({
      user: user.id,
      key: crypto.randomBytes(20).toString("hex"),
      isvalid: true,
    });

    let resetuser = {
      resetdb: resetDb,
      user: user,
    };
    let job = queue.create("resetpassword", resetuser).save((err) => {
      if (err) {
        console.log("error in queuing job", err);
        return;
      }
      console.log("job enqued ", job.id);
    });
    req.flash("success", "Reset link is send to Your Email");
    return res.redirect("back");
  } catch (err) {
    console.log("error in processing reset request", err);
    return res.redirect("back");
  }
};

module.exports.resetPasswodUpdatePage = async function (req, res) {
  try {
    console.log("id  ", req.query.id);
    let resetuserdb = await ResetPassword.findOne({ key: req.query.id });
    console.log("reset user db id", resetuserdb);

    if (resetuserdb.isvalid == true) {
      resetuserdb.isvalid = false;
      resetuserdb.save();
      console.log(resetuserdb.isvalid);

      return res.render("update_password", {
        title: "Update Password",
      });
    } else {
      req.flash("error", "You link is expired directing you to homepage");
      res.render("sign_in", {
        title: "sign in",
      });
    }
  } catch (err) {
    console.log("error in loading update page", err);
    return res.redirect("back");
  }
};
module.exports.resetPassword = async function (req, res) {
  // find user by email
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "password confirm password mismatch");
    return res.redirect("back");
  }

  let user = await User.findOne({ email: req.body.email });

  user.password = req.body.password;
  user.save();
  req.flash("success", "Your password is changed successfully");
  return res.render("sign_in", {
    title: "sign in",
  });
};

// render the sign in page
module.exports.signIn = function (req, res) {
  let user = User.findOne({ email: req.body.email });
  if (req.body.password != user.password) {
    req.flash("error", "Wrong Password");
    //return res.redirect("back");
  }
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
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
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "password confirm password mismatch");
    return res.redirect("back");
  }
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return res.render("sign_up", {
    title: "Sign In",
  });
};
module.exports.resetpasswordpage = function (req, res) {
  return res.render("reset_password", {
    title: "Reset Password",
  });
};
// sign in and create a session for the user
module.exports.createSession = function (req, res) {
  req.flash("success", "Logged in Successfully");
  return res.redirect("/");
};

module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "You have logged out!");

  return res.redirect("/");
};
