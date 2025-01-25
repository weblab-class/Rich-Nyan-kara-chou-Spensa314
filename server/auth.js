const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const socketManager = require("./server-socket");

// create a new OAuth client used to verify google sign-in
//    TODO: replace with your own CLIENT_ID
const CLIENT_ID = "556427429721-c6jrkk95p10b0491p13668k1agvv66oe.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

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
    .then((user) => {
      console.log("Verified user:", user);
      return getOrCreateUser(user);
    })
    .then((user) => {
      console.log("User retrieved or created:", user);
      req.session.user = user;
      res.send(user);
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
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }

  next();
}

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
