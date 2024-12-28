import axios from "axios";
import express from "express";
import bodyParser from "body-parser";

const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.get("/data", async (req, res) => {
  try {
    if (req.query["fail"]) {
      throw new Error("A really bad error :/");
    }
    const apiResponse = await axios.get("http://localhost:8090/user");
    res.json(apiResponse.data);
  } catch (error) {
    console.error(`Critical error: ${error}`);
    res.sendStatus(500);
  }
});

const server = app.listen(8080, () => {
  console.log("Items service is listening at port 8080");
});
