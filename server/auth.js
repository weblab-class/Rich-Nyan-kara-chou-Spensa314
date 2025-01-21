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

function getOrCreateUser(user) {
  return User.findOne({ googleid: user.sub })
    .then((existingUser) => {
      if (existingUser) {
        return existingUser;
      }

      const newUser = new User({
        name: user.name,
        googleid: user.sub,
      });
      console.log("Creating new user:", newUser);
      return newUser
        .save()
        .then((savedUser) => {
          console.log("New user saved:", savedUser);
          return savedUser;
        })
        .catch((err) => {
          console.error("Error saving new user:", err);
          throw new Error("Error saving new user: " + err.message);
        });
    })
    .catch((err) => {
      console.error("Error finding user:", err);
      throw new Error("Error finding user: " + err.message);
    });
}

function login(req, res) {
  console.log("Login attempt with token:", req.body.token);
  verify(req.body.token)
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
      console.error("Login error:", err.message || err); // Log the detailed error
      res.status(500).send({ err: err.message || err });
    });
}
// gets user from DB, or makes a new account if it doesn't exist yet
// function getOrCreateUser(user) {
//   // the "sub" field means "subject", which is a unique identifier for each user
//   return User.findOne({ googleid: user.sub }).then((existingUser) => {
//     if (existingUser) return existingUser;

//     const newUser = new User({
//       name: user.name,
//       googleid: user.sub,
//     });
//     console.log("Creating new user:", newUser);
//     return newUser
//       .save()
//       .then((savedUser) => {
//         console.log("New user saved:", savedUser);
//         return savedUser;
//       })
//       .catch((err) => {
//         console.error("Error saving new user:", err);
//         throw err; // Ensure we throw an error if saving fails
//       });
//   });
// }

// function login(req, res) {
//   console.log("Login attempt with token:", req.body.token); // Log the token received
//   verify(req.body.token)
//     .then((user) => {
//       console.log("Verified user:", user); // Log the verified user data
//       return getOrCreateUser(user);
//     })
//     .then((user) => {
//       console.log("User retrieved or created:", user); // Log the user data
//       req.session.user = user; // Store user in session
//       res.send(user); // Send response
//     })
//     .catch((err) => {
//       console.log("Login error:", err); // Log any errors that occur
//       res.status(500).send({ err });
//     });
// }

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
