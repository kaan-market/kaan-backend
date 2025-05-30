var express = require("express");
const { dot } = require("node:test/reporters");
var router = express.Router();
dotenv = require("dotenv");
dotenv.config();
var passport = require("passport");

var GoogleStrategy = require("passport-google-oauth20").Strategy;

// Store user information in memory for this test application
const users = {};

// Configure passport
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  done(null, users[id] || null);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // Save user profile to memory store
      users[profile.id] = profile;
      return done(null, profile);
    }
  )
);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("google");
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/success");
  }
);

router.get("/success", (req, res) => {
  res.render("success");
});
router.get("/error", (req, res) => {
  res.render("failure");
});

module.exports = router;
