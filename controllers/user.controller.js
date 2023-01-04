const mongoose = require("mongoose");
const User = require("../models/User");
const { sendResponse, AppError } = require("../helpers/utils.js");
const { validationResult } = require("express-validator");
const userController = {};
const util = require("util");
// const { body, validationResult } = require('express-validator');
let roleType = ["employee", "manager"];

const ObjectId = require("mongoose").Types.ObjectId;
function isValidObjectId(id) {
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) return true;
    return false;
  }
  return false;
}

userController.createUser = async (req, res, next) => {
  const info = req.body;
  const errors = validationResult(req);
  try {
    // YOUR CODE HERE
    if (!errors.isEmpty()) {
      throw new AppError(
        402,
        "Bad Request. Missing name of user.",
        "Create User Error. Missing required data."
      );
    }

    const foundAll = await User.find({});
    if (foundAll.filter((item) => (item.name = info.name))) {
      const error = new Error("User existed. Please change user's name.");
      error.statusCode = 404;
      throw error;
    }

    // if (!info.name || !util.isString(info.name))
    //   throw new AppError(
    //     402,
    //     "Bad Request name",
    //     "Create User Error. Missing required data."
    //   );

    if (!info.role) {
      info.role = "employee";
    }

    if (!roleType.includes(info.role)) {
      throw new AppError(
        402,
        "Bad Request",
        "Create User Error. The role of user is not allowed."
      );
    }

    const created = await User.create(info);
    sendResponse(
      res,
      200,
      true,
      { user: created },
      null,
      "Create User Success"
    );
  } catch (err) {
    // YOUR CODE HERE
    next(err);
  }
};

userController.getUsers = async (req, res, next) => {
  const page = req.query.page ? req.query.page : 1;
  const filter = {};
  const limit = req.query.limit ? req.query.limit : 10;

  try {
    // YOUR CODE HERE
    let skip = (Number(page) - 1) * Number(limit);

    //mongoose query
    const listOfFound = await User.find(filter).populate("tasks");
    const result = listOfFound
      .filter((item) => item.isDeleted != true)
      .slice(skip, Number(limit) + skip);

    sendResponse(
      res,
      200,
      true,
      { user: result, page: page, total: result.length },
      null,
      "Get User List Successfully!"
    );
  } catch (err) {
    // YOUR CODE HERE
    next(err);
  }
};

userController.getSingleUserByName = async (req, res, next) => {
  const targetName = req.params.name.toLowerCase();

  try {
    // YOUR CODE HERE
    if (!targetName) {
      const error = new Error("Missing required data.");
      error.statusCode = 404;
      throw error;
    }
    //mongoose query
    const foundAll = await User.find({}).populate("tasks");

    const found = foundAll.filter(
      (user) => user.name.toLowerCase() === targetName
    );

    if (!found || found.isDeleted) {
      const error = new Error("User does not exist.");
      error.statusCode = 500;
      throw error;
    }
    sendResponse(
      res,
      200,
      true,
      { user: found },
      null,
      "Get User Successfully!"
    );
  } catch (err) {
    // YOUR CODE HERE
    next(err);
  }
};

// userController.getSingleUserById = async (req, res, next) => {
//   const targetId = req.params.id;

//   try {
//     // YOUR CODE HERE
//     if (!targetId) {
//       const error = new Error("Missing required data.");
//       error.statusCode = 404;
//       throw error;
//     }
//     //mongoose query
//     const found = await User.findOne({ targetId });

//     if (!found || found.isDeleted) {
//       const error = new Error("User does not exist.");
//       error.statusCode = 500;
//       throw error;
//     }
//     sendResponse(
//       res,
//       200,
//       true,
//       { user: found },
//       null,
//       "Get User Successfully!"
//     );
//   } catch (err) {
//     // YOUR CODE HERE
//     next(err);
//   }
// };

userController.editUser = async (req, res, next) => {
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
    const findID = await User.findById(targetId);
    //mongoose query
    if (!updateInfo.name || !updateInfo.role) {
      const error = new Error("Missing required data.");
      error.statusCode = 404;
      throw error;
    }

    if (!findID || findID.isDeleted) {
      const error = new Error("User does not exist.");
      error.statusCode = 500;
      throw error;
    }

    if (!roleType.includes(updateInfo.role)) {
      throw new Error("The role of user is not allowed.");
    }

    const updated = await User.findByIdAndUpdate(targetId, updateInfo, options);

    sendResponse(
      res,
      200,
      true,
      { user: updated },
      null,
      "Update User Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

userController.deleteUser = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication

  // empty target mean delete nothing
  const targetId = req.params.id;

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
    const findID = await User.findById(targetId);
    //mongoose query

    if (!findID || findID.isDeleted) {
      const error = new Error("User does not exist.");
      error.statusCode = 500;
      throw error;
    }

    const updated = await User.findByIdAndUpdate(
      targetId,
      { isDeleted: true },
      options
    );

    sendResponse(
      res,
      200,
      true,
      { user: updated },
      null,
      "Delete User Successfully!"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = userController;
