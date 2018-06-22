var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var articleSchema = new Schema({
  // `title` is required and of type String
  headline: {
    type: String,
    required: true
  },
  author : {
    type: String
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the article with an associated Note
  comment: {
    type: Schema.Types.ObjectId,
    ref: "comment"
  }
});

// This creates our model from the above schema, using mongoose's model method
var article = mongoose.model("article", articleSchema);

// Export the article model
module.exports = article;