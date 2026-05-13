const { body } = require("express-validator");

exports.postValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required"),

  body("community")
    .notEmpty()
    .withMessage("Community is required"),
];