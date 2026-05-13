const { body } = require("express-validator");

exports.commentValidator = [
  body("content")
    .notEmpty()
    .withMessage("Comment content is required"),

  body("post")
    .notEmpty()
    .withMessage("Post ID is required"),
];