const express = require("express");
const launchesRouter = express.Router();
const launchesController = require("./launches.controller");

launchesRouter.get("/", launchesController.httpGetAllLaunches);
launchesRouter.post("/", launchesController.httpPostNewLaunch);
launchesRouter.delete("/:flightNumber", launchesController.httpAbortLaunch);

module.exports = launchesRouter;