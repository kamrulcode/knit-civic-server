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

app.get("/events/:email", async (req, res) => {
  const email = req.params.email;
  const events = await eventsCollection?.find({ email: email }).toArray();
  res.send(events);
});

const registrationsCollection = db.collection("eventRegistrations");

// JOIN EVENT
app.post("/join-event", async (req, res) => {
  try {
    const { event, user } = req.body;

    if (!event?.id || !user?.email) {
      return res.status(400).send({
        message: "Event and user details are required.",
      });
    }

    // Prevent duplicate registrations
    const existing = await registrationsCollection.findOne({
      eventId: event.id,
      userEmail: user.email,
    });

    if (existing) {
      return res.status(409).send({
        message: "You have already joined this event.",
      });
    }

    const result = await registrationsCollection.insertOne({
      eventId: event.id,
      event,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      userEmail: user.email,
      joinedAt: new Date(),
    });

    res.status(201).send({
      success: true,
      message: "Successfully joined the event!",
      registrationId: result.insertedId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to join the event.",
    });
  }
});

// LEAVE EVENT
app.delete("/join-event", async (req, res) => {
  try {
    const { eventId, userEmail } = req.body;

    if (!eventId || !userEmail) {
      return res.status(400).send({
        message: "Event ID and user email are required.",
      });
    }

    const result = await registrationsCollection.deleteOne({
      eventId,
      userEmail,
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        message: "You have not joined this event.",
      });
    }

    res.status(200).send({
      success: true,
      message: "You have left the event.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to leave the event.",
    });
  }
});

app.get("/joined-events/:email", async (req, res) => {
  const email = req.params.email;
  const joinedEvents = await registrationsCollection
    .find({ userEmail: email })
    .toArray();
  res.send(joinedEvents);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
