const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const api = require("./routes/api");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(morgan("combined"));

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

// // Planets Router

// app.use("/planets", planetsRouter);

// // Launches Router
// app.use("/launches", launchesRouter);

app.use("/v1", api); // versioning

app.get("/*", (req, res) => {
  return res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
