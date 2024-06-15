const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });
  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
      expect((await response).statusCode).toBe(200); // another way
    });
  });
  
  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      launchDate: "December 27, 2030",
      target: "Kepler-442 b",
    };
    const launchDataWithoutDate = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      target: "Kepler-442 b",
    };
  
    const launchDataWithInvalidDate = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      launchDate: "blablabla",
      target: "Kepler-442 b",
    };
    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);
      const launchDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date((await response).body.launchDate).valueOf();
      expect(responseDate).toBe(launchDate);
      expect((await response).body).toMatchObject(launchDataWithoutDate);
    });
  
    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData.mission)
        .expect("Content-Type", /json/)
        .expect(400);
  
      expect((await response).body).toStrictEqual({
        error: "Missing required launch property",
      });
    });
  
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect((await response).body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});

// describe("Test DELETE /launches", () => {
//   test("It should respond with 200 success", async () => {
//     const response = await request(app)
//       .delete("/launches/114")
//       .expect("Content-Type", /json/)
//       .expect(200);
//     expect((await response).statusCode).toBe(200); // another way
//   });
// });
