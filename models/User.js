const mongoose = require("mongoose");
const Task = require("./Task");
const { Schema } = mongoose;
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["manager", "employee"],
      default: "employee",
    },
    tasks: [{ type: Schema.Types.ObjectId, ref: Task }], //reference to Task Collection
    isDeleted: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

// userSchema.virtual("tasks", {
//   ref: "Task",
//   localField: "abc",
//   foreignField: "user_name",
// });

// userSchema.pre(/^find/, function (next) {
//   if (!("_conditions" in this)) return next();
//   if (!("isDeleted" in userSchema.paths)) {
//     delete this["_conditions"]["all"];
//     return next();
//   }
//   if (!("all" in this["_conditions"])) {
//     //@ts-ignore
//     this["_conditions"].isDeleted = false;
//   } else {
//     delete this["_conditions"]["all"];
//   }
//   next();
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
