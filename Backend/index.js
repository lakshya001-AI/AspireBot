const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const connectMongoDB = require("./Database/connectDB");
const userModel = require("./Database/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Import jwt
const bodyParser = require("body-parser");
const axios  = require("axios");
const { CohereClient } = require("cohere-ai"); // Import CohereClient
dotenv.config();
connectMongoDB();



app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey12345!@";



// Root Route
app.get("/", (req, res) => {
  res.send("Hello, this is the Backend");
});

// Create Account Route
app.post("/createAccount", async (req, res) => {
  try {
    const { firstName, lastName, emailAddress, password } = req.body;

    // Check if user already exists
    const userExists = await userModel.findOne({ emailAddress });
    if (userExists) {
      return res.status(400).send({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await userModel.create({
      firstName,
      lastName,
      emailAddress,
      password: hashedPassword,
    });

    console.log(newUser);
    res.status(201).send({ message: "Account created successfully" });
  } catch (error) {
    console.error("Error creating account:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
});

// Login Route with JWT Token Generation
app.post("/loginUser", async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ emailAddress });
    if (!user) {
      return res.status(401).send({ message: "User not found!" });
    }

    // Verify password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(401).send({ message: "Invalid credentials!" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.emailAddress },
      JWT_SECRET,
      {
        expiresIn: "1h", // Token validity
      }
    );

    res.status(200).send({
      message: "Logged in successfully!",
      token, // Send the token to the client
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).send({ message: "An error occurred" });
  }
});

// Middleware to Verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Store decoded data in request object
    next();
  } catch (error) {
    return res.status(401).send({ message: "Invalid or expired token!" });
  }
};

// Example of a Protected Route
app.get("/protectedRoute", verifyToken, (req, res) => {
  res.status(200).send({
    message: "Access granted to protected route!",
    user: req.user, // Return user data from token
  });
});



// for the langchain

// API Keys
const COHERE_API_KEY = "BBK74cEhpbUdIj0gyOiSIEeg6F0L9ISHe6Bfo9HF";
const GEMINI_API_KEY = "AIzaSyAuVwzksyAl-eATP99mxACJq1Z1MLOscZc";

// Initialize CohereClient with your API key
const cohere = new CohereClient({
  token: COHERE_API_KEY,
});


// Helper Function to Call APIs
// Helper Function to Call APIs
const generateResponse = async (platform, template) => {
  try {
    if (platform === "cohere") {
      // Cohere API Integration
      const response = await cohere.chat({
        model: "command", // Specify the model to use (e.g., 'command')
        message: template, // Pass the user's message to the AI model
      });
      return response.text.trim();
    } else if (platform === "gemini") {
      // Gemini API Integration
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: template,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.candidates[0]?.content.parts[0]?.text.trim();
    }
  } catch (error) {
    console.error(`Error with ${platform}:`, error.message, error.response?.data);
    return `Error generating recommendations from ${platform}.`;
  }
};




// Endpoint for Career Counseling
app.post("/counsel", async (req, res) => {
  const { interests, skills_to_learn, career_goals } = req.body;
  console.log(interests, skills_to_learn, career_goals);
  

  const template = `
  User Interests:
  - ${interests}

  Skills they want to learn:
  - ${skills_to_learn}

  Career goals:
  - ${career_goals}

  Based on these inputs, suggest:
  1. Three career paths that align with their interests and goals.
  2. Three skills they should focus on learning.
  3. Three learning resources (courses, books, websites) to get started.
  `;

  try {
    const cohereResponse = await generateResponse("cohere", template);
    const geminiResponse = await generateResponse("gemini", template);

    res.json({
      cohere_recommendation: cohereResponse,
      gemini_recommendation: geminiResponse,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
});





// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
