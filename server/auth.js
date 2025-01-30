const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const socketManager = require("./server-socket");
require("dotenv").config();

// create a new OAuth client used to verify google sign-in
//    TODO: replace with your own CLIENT_ID
const CLIENT_ID = "556427429721-c6jrkk95p10b0491p13668k1agvv66oe.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
const jwt = require("jsonwebtoken");

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: user.sub })
    .then((existingUser) => {
      if (existingUser) {
        console.log("Existing user fetched from DB:", existingUser);
        return existingUser;
      } else {
        // If the user doesn't exist, create a new user
        const newUser = new User({
          name: user.name,
          googleid: user.sub,
          email: user.email,
          profilePicture: user.picture,
          singlePlayerScores: [],
          multiPlayerScores: [],
        });

        return newUser.save(); // Save the new user to the database
      }
    })
    .catch((err) => {
      console.error("Error finding or saving user:", err);
      throw new Error("Error finding or saving user: " + err.message);
    });
}

function login(req, res) {
  const { token, userId, username, profilepicture } = req.body;

  if (userId && userId.startsWith("Guest")) {
    // Handle guest user login
    console.log("Guest login detected:", { userId, username });
    req.session.user = { userId, username, profilepicture }; // Set session for guest
    return res.send(req.session.user); // Respond with the session user
  }

  console.log("Login attempt with token:", token);

  // Handle Google user login
  verify(token)
    .then((user) => getOrCreateUser(user))
    .then((user) => {
      req.session.user = user;
      const jwtToken = jwt.sign({ id: user._id, googleid: user.googleid, name: user.name }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      res.send({ user, token: jwtToken });
    })
    .catch((err) => {
      console.error("Login error:", err.message || err);
      res.status(500).send({ err: err.message || err });
    });
}

function logout(req, res) {
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}

function ensureLoggedIn(req, res, next) {
  // if (req.user) {
  //   return next();
  // }

  const isGuest = req.user?.isGuest;
  if (isGuest === true) { 
    return next();
  }

  // Check if JWT token is present in Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ err: "Not logged in" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload to req.user
    next();
  } catch (err) {
    return res.status(401).send({ err: "Invalid or expired token" });
  }
}

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
