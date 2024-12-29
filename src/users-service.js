const axios = require("axios");
const express = require("express");
const init = require("./otel.js");
const api = require("@opentelemetry/api");

const { tracer } = init("users-service", 8091);
const app = express();

const randomNumber = (max, min) => Math.floor(Math.random() * max + min);

app.route("/user").get(async (req, res) => {
  try {
    const apiResponse = await axios("https://jsonplaceholder.typicode.com/users");
    const randomIndex = randomNumber(apiResponse.data.length, 0);

    // Get active span
    const activeSpan = api.trace.getSpan(api.context.active());
    if (activeSpan) {
      activeSpan.addEvent("A number is randomized", { randomIndex });
    } else {
      console.warn("No active span found");
    }

    // Create a span
    const span = tracer.startSpan("users-service");
    span.addEvent("A number is randomized", { randomIndex });
    span.end();

    const randomUser = apiResponse.data[randomIndex];
    res.json(randomUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

const server = app.listen(8090, () => {
  console.log("Users service is listening at port 8090");
});
