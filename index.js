const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Database
const usersDB = [];

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const user = {
    username,
    _id: String(usersDB.length + 1),
  };
  usersDB.push(user);
  return res.json(user);
});

app.get("/api/users", (req, res) => {
  let newUsers = JSON.parse(JSON.stringify(usersDB));
  newUsers = newUsers.map((user) => ({
    username: user.username,
    _id: user._id,
  }));
  return res.json(newUsers);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description } = req.body;
  let { date, duration } = req.body;
  duration = parseInt(duration);
  if (!date) {
    date = new Date().toDateString();
  } else {
    date = new Date(date).toDateString();
  }
  const user = usersDB.filter((user) => user._id === _id)[0];
  user.description = description;
  user.duration = duration;
  user.date = date;
  const exercise = {
    description,
    duration,
    date,
  };

  // Add the exercise
  if (user.log && Array.isArray(user.log)) {
    user.log.push(exercise);
  } else {
    user.log = [exercise];
  }

  // Increase the count
  if (user.count) {
    user.count += 1;
  } else {
    user.count = 1;
  }

  let obj = {
    username: user.username,
    _id: user._id,
    description,
    duration,
    date,
  };
  return res.json(obj);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = usersDB.filter((user) => user._id === _id)[0];
  if (!user) {
    return res.json({ error: "No user with specified id found" });
  }
  let newUser = JSON.parse(JSON.stringify(user));

  if (from) {
    const fromDate = Date.parse(from);
    newUser.log = newUser.log.filter((log) => {
      let date = Date.parse(log.date);
      return date >= fromDate;
    });
  }

  if (to) {
    const toDate = Date.parse(to);
    newUser.log = newUser.log.filter((log) => {
      let date = Date.parse(log.date);
      return date <= toDate;
    });
  }

  if (limit) {
    newUser.log = newUser.log.slice(0, parseInt(limit));
  }

  newUser.count = newUser.log.length;
  let obj = {
    username: newUser.username,
    _id: newUser._id,
    count: newUser.count,
    log: newUser.log,
  };

  return res.json(obj);
});

const listener = app.listen(process.env.PORT || 3000, () => {});
