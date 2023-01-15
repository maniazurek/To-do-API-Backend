import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinaryFramework from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const cloudinary = cloudinaryFramework.v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

cloudinary.config({
  cloud_name: "dxoaijxeu",
  api_key: "234932964887826",
  api_secret: "txTyDzvgE6c6gmzSQfiSwnuQKB8",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "users",
    allowedFormats: ["jpg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const parser = multer({ storage });

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/todo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

// Schema & model

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  link: {
    type: String,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  dueDate: {
    type: Date,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Column",
  },
  comments: [
    {
      type: String,
    },
  ],
});

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

const Task = mongoose.model("Task", TaskSchema);
const User = mongoose.model("User", UserSchema);
const Tag = mongoose.model("Tag", TagSchema);
const Column = mongoose.model("Column", ColumnSchema);

// Endpoints

// TASKS

// taks get

app.get("/tasks", async (req, res) => {
  const { assignee, column, tags, page, perPage } = req.query;

  const query = {
    ...(assignee && { assignee: new RegExp(`^${assignee}`, "i") }),
    ...(column && { column: new RegExp(column, "i") }),
    ...(tags && { tags: new RegExp(tags, "i") }),
  };

  const pageParam = page || 1;
  const perPageParam = perPage || 100;

  try {
    const tasks = await Task.aggregate([
      {
        $match: query,
      },
      {
        $skip: (+pageParam - 1) * +perPageParam,
      },
      {
        $limit: +perPageParam,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "assignee",
        },
      },
      {
        $lookup: {
          from: "columns",
          localField: "column",
          foreignField: "_id",
          as: "column",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "tag",
          foreignField: "_id",
          as: "tags",
        },
      },
    ]);

    res.status(200).json({
      data: tasks,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// taks post

app.post("/tasks", async (req, res) => {
  const {
    title,
    description,
    link,
    tags,
    dueDate,
    assignee,
    column,
    comments,
  } = req.body;

  try {
    const task = await new Task({
      title,
      description,
      link,
      tags,
      dueDate,
      assignee,
      column,
      comments,
    }).save();
    res.status(201).json({
      data: task,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// taks put

app.put("/tasks/:taskID", async (req, res) => {
  const { taskID } = req.params;
  const {
    title,
    description,
    link,
    tags,
    dueDate,
    assignee,
    column,
    comments,
  } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(
      taskID,
      {
        title,
        description,
        link,
        tags,
        dueDate,
        assignee,
        column,
        comments,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      data: task,
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

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

// post user v1

// app.post("/users", async (req, res) => {
//   const { name, description, imageURL } = req.body;

//   try {
//     const user = await new User({ name, description, imageURL }).save();
//     res.status(201).json({
//       data: user,
//       success: true,
//     });
//   } catch (error) {
//     res.status(400).json({
//       data: error,
//       success: false,
//     });
//   }
// });

// post user v2

app.post("/users", parser.single("image"), async (req, res) => {
  const { name, description, imageURL } = req.body;

  try {
    const user = await new User({
      name,
      description,
      imageURL: req.file.path,
    }).save();
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

// app.post("/users", parser.single("image"), async (req, res) => {
//   res.json({ imageURL: req.file.path, imageId: req.file.filename });
// });

// put user v1

// app.put("/users/:userID", async (req, res) => {
//   const { userID } = req.params;
//   const { name, description, imageURL } = req.body;

//   try {
//     const user = await User.findByIdAndUpdate(
//       userID,
//       {
//         name,
//         description,
//         imageURL,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     res.status(200).json({
//       data: user,
//       success: true,
//     });
//   } catch (error) {
//     res.status(400).json({
//       data: error,
//       success: false,
//     });
//   }
// });

// put user v2

app.put("/users/:userID", parser.single("image"), async (req, res) => {
  const { userID } = req.params;
  const { name, description, imageURL } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userID,
      {
        name,
        description,
        imageURL: req.file.path,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
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

app.put("/tags/:tagID", async (req, res) => {
  const { tagID } = req.params;
  const { name, color } = req.body;

  try {
    const tag = await Tag.findByIdAndUpdate(
      tagID,
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

app.put("/columns/:columnID", async (req, res) => {
  const { name } = req.body;
  const { columnID } = req.params;

  try {
    const column = await Column.findByIdAndUpdate(
      columnID,
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
