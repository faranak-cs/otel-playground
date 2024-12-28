import axios from "axios";
import express from "express";

const app = express();

const randomNumber = (max, min) => Math.floor(Math.random() * max + min);

app.get("/user", async (req, res) => {
  try {
    const apiResponse = await axios(
      "https://jsonplaceholder.typicode.com/users"
    );
    const randomIndex = randomNumber(apiResponse.data.length, 0);
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
