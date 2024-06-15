// const launches = new Map();

const axios = require("axios");

const launchesModel = require("./launches.mongo");
const planets = require("./planets.mongo");

const Default_Flight_Number = 100;

// const launch = {
//     flightNumber: 100, // flight_number
//     mission: "Kepler Exploration X",// name
//     rocket: "Explorer IS1", // rocket.name
//     launchDate: new Date("December 27, 2030"), // date_local
//     target: "Kepler-442 b", // not applicaple
//     customers: ["ZTM", "NASA"], // payload.customers for each payload
//     upcoming: true, // upcoming
//     success: true, // success 
// };
// saveAllLaunches(launch);
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
    console.log("Downloading Launch Data...");
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options:{
            pagination: false,
            populate:[
                {
                    path:'rocket',
                    select:{
                        name:1
                    }
                },
                {
                    path:'payloads',
                    select:{
                        customers:1
                    }
                }
            ]
        }
});

if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw Error("Launch data download failed");
}

const launchDocs = response.data.docs;
for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload)=>{
        return payload["customers"];
    });
    const launch = {
        flightNumber: launchDoc["flight_number"],
        mission: launchDoc["name"],
        rocket: launchDoc["rocket"]["name"],
        launchDate: launchDoc["date_local"],
        upcoming: launchDoc["upcoming"],
        success: launchDoc["success"],
        customers,
    }
    console.log(`${launch.flightNumber} ${launch.mission}`);
    
    await saveAllLaunches(launch);
}
}
async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: "Falcon 1",
        mission: "FalconSat",
    });
    if(firstLaunch) {
        console.log("Launch data already loaded !!");
    }else{
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesModel.findOne(filter);
}

// launches.set(launch.flightNumber, launch);

async function getAllLaunches(skip, limit) {
    return await launchesModel.find({},{
        "_id": 0, "__v": 0
    }) 
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit)
}

async function saveAllLaunches(launch) {
    await launchesModel.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, 
    launch, 
    { upsert: true });
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    })

    if (!planet) {
        throw new Error("No matching planet found");
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ["Zero To Mastery", "NASA"],
        flightNumber: newFlightNumber,
    });
    await saveAllLaunches(newLaunch);
}

// function addNewLaunch(launch) {
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch, {
//             flightNumber: latestFlightNumber,
//             customers: ["Zero To Mastery", "NASA"], // in course customers.
//             upcoming: true,
//         })
//     );
// }

async function existsLaunchWithId(launchId) {
    return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesModel.findOne({}).sort("-flightNumber");
    return latestLaunch ? latestLaunch.flightNumber : Default_Flight_Number;  
}

async function abortLaunchById(launchId) {
    // const aborted = launches.get(launchId);
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;

    const aborted = await launchesModel.updateOne(
        { flightNumber: launchId }, {
        upcoming: false,
        success: false,
    });

    return aborted.modifiedCount === 1 && aborted.matchedCount === 1 && aborted.acknowledged === true;
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById,
    loadLaunchData
};