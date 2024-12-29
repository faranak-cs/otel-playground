const axios = require("axios");
const express = require("express");
const init = require("./instrumentation.js");
const api = require("@opentelemetry/api");

init("users-service", 8091);
const app = express();

const randomNumber = (max, min) => Math.floor(Math.random() * max + min);

app.get("/user", async (req, res) => {
  try {
    const apiResponse = await axios("https://jsonplaceholder.typicode.com/users");
    const randomIndex = randomNumber(apiResponse.data.length, 0);

    // Create a span
    const activeSpan = api.trace.getSpan(api.context.active());
    activeSpan.addEvent("A number is randomized", {
      randomIndex,
    });

    const randomUser = apiResponse.data[randomIndex];
    res.json(randomUser);
  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

const server = app.listen(8090, () => {
  console.log("Users service is listening at port 8090");
});
