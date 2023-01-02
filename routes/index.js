const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderSchool!");
});

// USER
const userAPI = require("./user.api");
router.use("/users", userAPI);

// TASK
const taskAPI = require("./task.api");
router.use("/tasks", taskAPI);

module.exports = router;
