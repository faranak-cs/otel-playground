const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const init = require("./otel.js");
const api = require("@opentelemetry/api");

const { meter, tracer } = init("items-service", 8081);
const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// Define prometheus counter
const httpCounter = meter.createCounter("http_calls");

app.use((req, res, next) => {
  httpCounter.add(1);
  next();
});

app.route("/data").get(async (req, res) => {
  try {
    if (req.query["fail"]) {
      throw new Error("A really bad error :/");
    }
    const apiResponse = await axios.get("http://localhost:8090/user");
    res.json(apiResponse.data);
  } catch (error) {
    // Get active span
    const activeSpan = api.trace.getSpan(api.context.active());

    if (activeSpan) {
      const traceId = activeSpan.spanContext().traceId;
      // Combine log  with trace
      console.error(`Critical Error, traceId: ${traceId}`);
      activeSpan.recordException(error);
    } else {
      console.warn("No active span found");
    }

    // Create a span
    const span = tracer.startSpan("items-service");
    span.addEvent("An error has occurred");
    span.end();
    console.error(`Critical Error, traceId: ${span.spanContext().traceId}`);

    res.sendStatus(500);
  }
});

const server = app.listen(8080, () => {
  console.log("Items service is listening at port 8080");
});
