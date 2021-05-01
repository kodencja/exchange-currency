const express = require("express");
const path = require("path");
const cors = require("cors");

const routes = require("./routes/routes");

// Create a new express application named 'app'
const app = express();

// Set our backend port to be either an environment variable or port 5000
const port = process.env.PORT || 5000;

// This application level middleware prints incoming requests to the servers console, useful to see incoming requests
app.use((req, res, next) => {
  console.log(`Request_Endpoint : ${req.method} ${req.url}`);
  next();
});

// direct request through routes
app.use("/api", routes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// This middleware informs the express application to serve our compiled React files
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static(path.join(__dirname, "./client/build")));

  // All other GET requests not handled before will return our React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  });
  console.log("Use other paths!");
}

// Catch any bad requests
app.get("*", (req, res) => {
  res.status(200).json({
    msg: "Catch All",
  });
});

app.use((req, res) => {
  res.status(404).json({ msg: "404" });
});

app.listen(port, () => {
  console.log("Server is running at port: " + port);
});
