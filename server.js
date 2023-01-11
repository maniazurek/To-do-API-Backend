import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/todo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

// Schema & model

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 13,
  },
  description: {
    type: String,
  },
  imageURL: {
    type: String,
  },
});

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
});

const ColumnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const User = mongoose.model("User", UserSchema);
const Tag = mongoose.model("Tag", TagSchema);
const Column = mongoose.model("Column", ColumnSchema);

// Endpoints

// USERS

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      data: users,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.post("/users", async (req, res) => {
  const { name, description, imageURL } = req.body;

  try {
    const user = await new User({ name, description, imageURL }).save();
    res.status(201).json({
      data: user,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// TAGS

app.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find({});
    res.status(200).json({
      data: tags,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.post("/tags", async (req, res) => {
  const { name, color } = req.body;

  try {
    const tag = await new Tag({ name, color }).save();
    res.status(201).json({
      data: tag,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.put("/tags/:tagId", async (req, res) => {
  const { tagId } = req.params;
  const { name, color } = req.body;

  try {
    const tag = await Tag.findByIdAndUpdate(
      tagId,
      {
        name,
        color,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      data: tag,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// COLUMNS

app.get("/columns", async (req, res) => {
  try {
    const columns = await Column.find({});
    res.status(200).json({
      data: columns,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.post("/columns", async (req, res) => {
  const { name } = req.body;

  try {
    const column = await new Column({ name }).save();
    res.status(201).json({
      data: column,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.put("/columns/:columnId", async (req, res) => {
  const { name } = req.body;
  const { columnId } = req.params;

  try {
    const column = await Column.findByIdAndUpdate(
      columnId,
      {
        name,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      data: column,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
