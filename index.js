import express from "express";
import { MongoClient } from "mongodb";
import "dotenv/config";
import cors from "cors";

const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());

const client = new MongoClient(
  process.env.MONGODB_URL || "mongodb://localhost:27017",
);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongodbClient = await connectToMongoDB();
const db = mongodbClient.db("knit-civic");
const eventsCollection = db.collection("events");

app.post("/create-event", async (req, res) => {
  const eventData = req.body;
  const result = await eventsCollection?.insertOne(eventData);
  console.log("api called");
  res.send(result);
});

app.get("/events", async (req, res) => {
  const events = await eventsCollection?.find().toArray();
  res.send(events);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
