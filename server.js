import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinaryFramework from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import crypto from "crypto";
import bcrypt from "bcrypt";

dotenv.config();

const cloudinary = cloudinaryFramework.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/todo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

// Schema & model

const LogSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
});

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  dueDate: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Column",
  },
  comments: [String],
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
const Log = mongoose.model("Log", LogSchema);

// Endpoints

// LOG

app.post("/signup", async (req, res) => {
  const { login, password } = req.body;
  try {
    const passwordRegex = new RegExp(/^(?=.*\d.*\d)(?=.*[^A-Za-z\d]).{6,}/i);

    if (passwordRegex.test(password)) {
      const salt = bcrypt.genSaltSync();
      const hashedPassword = bcrypt.hashSync(password, salt);
      const log = await new Log({
        login,
        password: hashedPassword,
      }).save();

      res.status(201).json({
        data: {
          _id: log._id,
          login: log.login,
          password: log.password,
        },
        success: true,
      });
    } else {
      throw {
        message:
          "Password must be at least 6 characters long and consist of at least 2 numbers and one special characters",
      };
    }
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

app.post("/signin", async (req, res) => {
  const { login, password } = req.body;

  try {
    const log = await Log.findOne({ login });

    if (log) {
      if (bcrypt.compareSync(password, log.password)) {
        res.status(200).json({
          data: {
            _id: log._id,
            login: log.login,
            accessToken: log.accessToken,
          },
          success: true,
        });
      } else {
        res.status(404).json({
          data: {
            message: "User not found. Invalid password",
          },
          success: false,
        });
      }
    } else {
      res.status(404).json({
        data: {
          message: "User not found. Invalid login",
        },
        success: false,
      });
    }
  } catch (error) {
    res.status(400).json({
      data: error,
      success: false,
    });
  }
});

// TASKS

app.get("/tasks", async (req, res) => {
  const { user, column, tags, page, perPage } = req.query;

  const query = {
    ...(user && { user: mongoose.Types.ObjectId(user) }),
    ...(column && { column: mongoose.Types.ObjectId(column) }),
    ...(tags && { tags: mongoose.Types.ObjectId(tags) }),
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
          as: "user",
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
          localField: "tags",
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

app.post("/tasks", async (req, res) => {
  const {
    title,
    description,
    link,
    tags,
    dueDate,
    userID,
    columnID,
    comments,
  } = req.body;

  try {
    const user = await User.findById(userID);
    const column = await Column.findById(columnID);
    const queriedTags = await Tag.find({ _id: { $in: tags } });
    const task = await new Task({
      title,
      description,
      link,
      dueDate,
      user,
      column,
      tags: queriedTags,
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

app.put("/tasks/:taskID", async (req, res) => {
  const { taskID } = req.params;
  const {
    title,
    description,
    link,
    tags,
    dueDate,
    userID,
    columnID,
    comments,
  } = req.body;

  try {
    const user = await User.findById(userID);
    const column = await Column.findById(columnID);
    const queriedTags = await Tag.find({ _id: { $in: tags } });
    const task = await Task.findByIdAndUpdate(
      taskID,
      {
        title,
        description,
        link,
        tags: queriedTags,
        dueDate,
        user,
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
