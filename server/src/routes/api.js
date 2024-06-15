const express = require("express");

const api = express.Router();

const launchesRouter = require("../routes/launches/launches.router");
const planetsRouter = require("../routes/planets/planets.router");

api.use("/launches", launchesRouter);

api.use("/planets", planetsRouter);

module.exports = api;