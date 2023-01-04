const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const { sendResponse, AppError } = require("../helpers/utils.js");
const taskController = {};
let taskStatus = ["pending", "working", "review", "done", "archive"];

const ObjectId = require("mongoose").Types.ObjectId;
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}

taskController.createTask = async (req, res, next) => {
  const info = req.body;
  try {
    // YOUR CODE HERE
    if (!info.name || !info.description || !info.status)
      throw new AppError(
        402,
        "Bad Request",
        "Create Task Error. Missing required data."
      );
    if (!taskStatus.includes(info.status)) {
      throw new AppError(
        402,
        "Bad Request",
        "Create Task Error. The task's status is not allowed."
      );
    }
    const foundAll = await User.find({});
    if (foundAll.filter((item) => (item.name = info.name))) {
      const error = new Error("Task existed. Please change task's name.");
      error.statusCode = 404;
      throw error;
    }

    const created = await Task.create(info);

    await User.findByIdAndUpdate(info.user_name, {
      $addToSet: { tasks: created._id },
    });

    sendResponse(
      res,
      200,
      true,
      { task: created },
      null,
      "Create Task Success"
    );
  } catch (err) {
    // YOUR CODE HERE
    next(err);
  }
};

taskController.getTasks = async (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  const filter = req.query.filter ? req.query.filter : {};
  const limit = req.params.limit ? req.params.limit : 10;

  try {
    // YOUR CODE HERE
    let skip = (Number(page) - 1) * Number(limit);

    //mongoose query
    const listOfFound = await Task.find(filter).populate("user_name");
    const result = listOfFound
      .filter((item) => item.isDeleted != true)
      .slice(skip, Number(limit) + skip);

    sendResponse(
      res,
      200,
      true,
      { task: result, page: page, total: result.length },
      null,
      "Get Task List Successfully!"
    );
  } catch (err) {
    // YOUR CODE HERE
    next(err);
  }
};

taskController.getSingleTask = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication

  // empty target mean delete nothing
  const targetId = req.params.id;

  try {
    //mongoose query
    if (!targetId) {
      const error = new Error("Missing required data.");
      error.statusCode = 404;
      throw error;
    }

    if (!isValidObjectId(targetId)) {
      const error = new Error("Id must be ObjectID");
      error.statusCode = 400;
      throw error;
    }

    const findID = await Task.findById(targetId).populate("user_name");

    if (!findID || findID.isDeleted) {
      const error = new Error("Task does not exist.");
      error.statusCode = 500;
      throw error;
    }

    sendResponse(
      res,
      200,
      true,
      { task: findID },
      null,
      "Get Single Task Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

taskController.editTask = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication
  //you will also get updateInfo from req
  // empty target and info mean update nothing

  const targetId = req.params.id;
  const updateInfo = req.body;

  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  try {
    if (!targetId) {
      const error = new Error("Missing required data.");
      error.statusCode = 404;
      throw error;
    }
    if (!isValidObjectId(targetId)) {
      const error = new Error("Id must be ObjectID");
      error.statusCode = 400;
      throw error;
    }
    const findID = await Task.findById(targetId);

    //mongoose query

    if (!findID || findID.isDeleted) {
      const error = new Error("Task does not exist.");
      error.statusCode = 500;
      throw error;
    }

    if (!taskStatus.includes(updateInfo.status)) {
      throw new Error("The task's status is not allowed.");
    }
    if (findID.status === "done" && updateInfo.status !== "archive") {
      const error = new Error("Task has done and can be only archive.");
      error.statusCode = 500;
      throw error;
    }

    const updated = await Task.findByIdAndUpdate(targetId, updateInfo, options);

    sendResponse(
      res,
      200,
      true,
      { task: updated },
      null,
      "Update Task Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

taskController.assignTask = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication
  //you will also get updateInfo from req
  // empty target and info mean update nothing

  const targetId = req.params.id;
  const updateInfo = req.body.user_name;

  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  try {
    if (!targetId) {
      const error = new Error("Missing required data.");
      error.statusCode = 404;
      throw error;
    }
    if (!isValidObjectId(targetId)) {
      const error = new Error("Id must be ObjectID");
      error.statusCode = 400;
      throw error;
    }

    const findID = await Task.findById(targetId);

    //mongoose query

    if (!findID || findID.isDeleted) {
      const error = new Error("Task does not exist.");
      error.statusCode = 500;
      throw error;
    }

    const updated = await Task.findByIdAndUpdate(
      targetId,
      { user_name: updateInfo },
      options
    );

    sendResponse(
      res,
      200,
      true,
      { task: updated },
      null,
      "Update Task Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

taskController.deleteTask = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication

  // empty target mean delete nothing
  const targetId = req.params.id;

  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  try {
    //mongoose query

    if (!targetId) {
      const error = new Error("Missing required data.");
      error.statusCode = 404;
      throw error;
    }
    if (!isValidObjectId(targetId)) {
      const error = new Error("Id must be ObjectID");
      error.statusCode = 400;
      throw error;
    }

    const findID = await Task.findById(targetId);

    if (!findID || findID.isDeleted) {
      const error = new Error("Task does not exist.");
      error.statusCode = 500;
      throw error;
    }

    const updated = await Task.findByIdAndUpdate(
      targetId,
      { isDeleted: true },
      options
    );

    sendResponse(
      res,
      200,
      true,
      { task: updated },
      null,
      "Delete Task Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = taskController;
