const {
    getAllLaunches,
    existsLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,
} = require("../../models/launches.model");

const {getPagination} = require("../../services/query")

async function httpGetAllLaunches(req, res) {
    const {limit, skip} = getPagination(req.query);

    return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpPostNewLaunch(req, res) {
    const launch = {
        mission: req.body.mission,
        rocket: req.body.rocket,
        launchDate: new Date(req.body.launchDate),
        target: req.body.target,
    };
    if (!launch.target ||
        !launch.launchDate ||
        !launch.mission ||
        !launch.rocket
    ) {
        return res.status(400).json({
            error: "Missing required launch property",
        });
    }
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: "Invalid launch date",
        });
    }
    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const id = Number(req.params.flightNumber);
    const existsLaunch = await existsLaunchWithId(id);
    if (!existsLaunch) {
        return res.status(404).json({
            error: "Launch not found",
        });
    }

    const aborted = await abortLaunchById(id);

    if (!aborted) {
        return res.status(400).json({
            error: "Launch not aborted",
        });
    }

    return res.status(200).json({
        ok: true,});
}

module.exports = {
    httpGetAllLaunches,
    httpPostNewLaunch,
    httpAbortLaunch,
};