import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
const port = 8000;

// Enable Cross-Origin Resource Sharing (CORS) and JSON parsing
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URL || "mongodb://localhost:27017";
const client = new MongoClient(mongoUri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

const mongodbClient = await connectToMongoDB();
const db = mongodbClient.db("knit-civic");
const eventsCollection = db.collection("events");
const registrationsCollection = db.collection("eventRegistrations");

// Helper function to safely convert ID to MongoDB _id query
function getMongoIdQuery(id) {
  if (ObjectId.isValid(id)) {
    return { _id: new ObjectId(id) };
  }
  return { _id: id };
}

// ==========================================
// JWT token verify
// ==========================================

const jwksUrl = new URL(`${process.env.CLIENT_URL}/api/auth/jwks`);
const JWKS = createRemoteJWKSet(jwksUrl);

const verifyApi = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).send({
        message: "Unauthorized: Token missing",
      });
    }

    const token = authHeader.split(" ")[1]?.trim();

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).send({
        message: "Unauthorized: Token missing or invalid",
      });
    }

    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;

    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    return res.status(401).send({
      message: "Invalid or expired token",
    });
  }
};

// ==========================================
// 1. CREATE EVENT
// ==========================================
app.post("/create-event", verifyApi, async (req, res) => {
  try {
    const eventData = req.body;

    // Basic validation
    if (!eventData.title || !eventData.date) {
      return res.status(400).send({
        success: false,
        message: "Event title and date are required.",
      });
    }

    const newEvent = {
      ...eventData,
      createdAt: eventData.createdAt || new Date().toISOString(),
    };

    const result = await eventsCollection.insertOne(newEvent);

    res.status(201).send({
      success: true,
      insertedId: result.insertedId,
      message: "Event created successfully!",
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).send({
      success: false,
      message: "Failed to create event. Please try again.",
    });
  }
});

// ==========================================
// 2. GET ALL EVENTS (UPCOMING OR BY EMAIL QUERY)
// ==========================================
app.get("/events", async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const decodedEmail = decodeURIComponent(String(email));
      const userEvents = await eventsCollection
        .find({ email: decodedEmail })
        .toArray();
      return res.send(userEvents);
    }

    const today = new Date().toISOString().split("T")[0];

    const upcomingEvents = await eventsCollection
      .find({
        date: { $gte: today },
      })
      .sort({ date: 1 })
      .toArray();
    res.send(upcomingEvents);
  } catch (error) {
    console.error("Error fetching all events:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch events.",
    });
  }
});
// ==========================================
// 2.1 GET six EVENT BY date
// ==========================================

app.get("/recentevents", async (req, res) => {
  try {
    const events = await eventsCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.send(events);
  } catch (error) {
    console.error("Error fetching recent events:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch recent events.",
    });
  }
});

// ==========================================
// 3. GET SINGLE EVENT BY ID (EXPLICIT)
// ==========================================
app.get("/events/single/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = getMongoIdQuery(id);
    const event = await eventsCollection.findOne(query);

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
      });
    }

    res.send(event);
  } catch (error) {
    console.error("Error fetching single event:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch event.",
    });
  }
});

// ==========================================
// 3.1 GET SINGLE EVENT OR DELEGATE TO EMAIL
// ==========================================
app.get("/events/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);

    // If param is an email address, pass to next route (verifyApi + email handler)
    if (decodedId.includes("@")) {
      return next();
    }

    const query = getMongoIdQuery(decodedId);
    const event = await eventsCollection.findOne(query);

    if (!event) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
      });
    }

    res.send(event);
  } catch (error) {
    console.error("Error fetching single event:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch event.",
    });
  }
});

// ==========================================
// 4. GET EVENTS BY CREATOR EMAIL
// ==========================================
app.get("/events/:email", verifyApi, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const events = await eventsCollection.find({ email: email }).toArray();
    res.send(events);
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch user events.",
    });
  }
});

// Alias for explicit user email route
app.get("/events/user/:email", verifyApi, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const events = await eventsCollection.find({ email: email }).toArray();
    res.send(events);
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch user events.",
    });
  }
});

// ==========================================
// 5. UPDATE EVENT
// ==========================================
app.put("/events/:id", verifyApi, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id; // Prevent updating the immutable _id field

    const query = getMongoIdQuery(id);
    const result = await eventsCollection.updateOne(query, {
      $set: updateData,
    });

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Event not found.",
      });
    }

    res.send({
      success: true,
      modifiedCount: result.modifiedCount,
      message: "Event updated successfully!",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send({
      success: false,
      message: "Failed to update event.",
    });
  }
});

// ==========================================
// 6. DELETE EVENT (BY EMAIL & ID)
// ==========================================
app.delete("/events/:email/:id", verifyApi, async (req, res) => {
  try {
    const { email, id } = req.params;
    const decodedEmail = decodeURIComponent(email);
    const query = {
      email: decodedEmail,
      ...getMongoIdQuery(id),
    };

    const result = await eventsCollection.deleteOne(query);

    // Also remove registrations related to this event
    await registrationsCollection.deleteMany({ eventId: id });

    res.send(result);
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).send({
      success: false,
      message: "Failed to delete event.",
    });
  }
});

// DELETE EVENT (BY ID ONLY)
app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = getMongoIdQuery(id);

    const result = await eventsCollection.deleteOne(query);
    await registrationsCollection.deleteMany({ eventId: id });

    res.send(result);
  } catch (error) {
    console.error("Error deleting event by id:", error);
    res.status(500).send({
      success: false,
      message: "Failed to delete event.",
    });
  }
});

// ==========================================
// 7. JOIN EVENT (REGISTER)
// ==========================================
app.post("/join-event", verifyApi, async (req, res) => {
  try {
    const joinData = req.body;

    if (!joinData.eventId || !joinData.email) {
      return res.status(400).send({
        success: false,
        message: "Event ID and user email are required.",
      });
    }

    // Prevent duplicate registrations
    const existing = await registrationsCollection.findOne({
      eventId: joinData.eventId,
      email: joinData.email,
    });

    if (existing) {
      return res.status(409).send({
        success: false,
        message: "You have already joined this event.",
      });
    }

    const registration = {
      ...joinData,
      status: joinData.status || "upcoming",
      joinedAt: new Date().toISOString(),
    };

    const result = await registrationsCollection.insertOne(registration);

    // Increment joined count in event document if possible
    try {
      const eventQuery = getMongoIdQuery(joinData.eventId);
      await eventsCollection.updateOne(eventQuery, {
        $inc: { joined: 1 },
      });
    } catch (countErr) {
      console.warn("Could not increment event joined count:", countErr);
    }

    res.status(201).send({
      success: true,
      message: "Successfully joined the event!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).send({
      success: false,
      message: "Failed to join the event.",
    });
  }
});

// ==========================================
// 8. CHECK JOIN STATUS
// ==========================================
app.get("/join-event/status", async (req, res) => {
  try {
    const { eventId, userEmail } = req.query;

    if (!eventId || !userEmail) {
      return res.status(400).send({
        success: false,
        message: "eventId and userEmail are required query parameters.",
      });
    }

    const existing = await registrationsCollection.findOne({
      eventId: String(eventId),
      email: String(userEmail),
    });

    res.send({
      joined: Boolean(existing),
    });
  } catch (error) {
    console.error("Error checking registration status:", error);
    res.status(500).send({
      joined: false,
      message: "Failed to check registration status.",
    });
  }
});

// ==========================================
// 9. LEAVE EVENT (DELETE REGISTRATION)
// ==========================================
// Leave by body: { eventId, userEmail }
app.delete("/join-event", verifyApi, async (req, res) => {
  try {
    const { eventId, userEmail } = req.body;

    if (!eventId || !userEmail) {
      return res.status(400).send({
        success: false,
        message: "eventId and userEmail are required in the request body.",
      });
    }

    const result = await registrationsCollection.deleteOne({
      eventId: eventId,
      email: userEmail,
    });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "You are not registered for this event.",
      });
    }

    // Decrement joined count in event document
    try {
      const eventQuery = getMongoIdQuery(eventId);
      await eventsCollection.updateOne(eventQuery, {
        $inc: { joined: -1 },
      });
    } catch (countErr) {
      console.warn("Could not decrement event joined count:", countErr);
    }

    res.send({
      success: true,
      message: "You have left the event.",
    });
  } catch (error) {
    console.error("Error leaving event:", error);
    res.status(500).send({
      success: false,
      message: "Failed to leave the event.",
    });
  }
});

// Leave by registration document ID
app.delete("/join-event/:id", verifyApi, async (req, res) => {
  try {
    const { id } = req.params;
    const query = getMongoIdQuery(id);

    const registration = await registrationsCollection.findOne(query);
    const result = await registrationsCollection.deleteOne(query);

    if (registration?.eventId) {
      try {
        const eventQuery = getMongoIdQuery(registration.eventId);
        await eventsCollection.updateOne(eventQuery, {
          $inc: { joined: -1 },
        });
      } catch (countErr) {
        console.warn("Could not decrement event joined count:", countErr);
      }
    }

    res.send(result);
  } catch (error) {
    console.error("Error leaving event by id:", error);
    res.status(500).send({
      success: false,
      message: "Failed to leave the event.",
    });
  }
});

// ==========================================
// 10. GET JOINED EVENTS FOR A USER
// ==========================================
app.get("/join-event/:email", verifyApi, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const joinedEvents = await registrationsCollection
      .find({ email: email })
      .toArray();
    res.send(joinedEvents);
  } catch (error) {
    console.error("Error fetching joined events:", error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch joined events.",
    });
  }
});

// ==========================================
// ROOT & HEALTH CHECK
// ==========================================
app.get("/", (req, res) => {
  res.send("KnitCivic Server  is running ");
});

app.listen(port, () => {
  console.log(`KnitCivic Server is running on http://localhost:${port}`);
});

export default app;
