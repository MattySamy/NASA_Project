const http = require("http");
const app = require("./app");
require("dotenv").config();

const {mongoConnect} = require("./services/mongo");

const { loadPlanetsData } = require("./models/planets.model");

const {loadLaunchData} = require("./models/launches.model");

const server = http.createServer(app); // Separation of concerns with express and http.

const PORT = process.env.PORT || 8080;



async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT} for URL http://localhost:${PORT}/v1`);
  });
}

startServer();
