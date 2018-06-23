const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = 3000;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// initialize handlebars
const exphbs = require("express-handlebars")


app.engine("handlebars", exphbs({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

// API Routes
app.get("/", function(req, res) {
    res.render("index")
})

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    axios.get("https://old.reddit.com/r/webdev/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("p.title").each(function(i, element) {
        // Save an empty result object
        console.log(element);
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.headline = $(this)
            .text();
        result.link = $(this)
            .children()
            .attr("href");
        result.summary = $(this)
            .find(".usertext-body")
            .text();
        // Create a new article using the `result` object built from scraping
        db.article.create(result)
          .then(function(dbarticle) {
            // View the added result in the console
            console.log(dbarticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
  
      // If we were able to successfully scrape and save an article, send a message to the client
      res.send("Scrape Complete");
    });
  });
  
  // Route for getting all articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the articles collection
    db.article.find({})
      .then(function(dbarticle) {
        // If we were able to successfully find articles, send them back to the client
        res.json(dbarticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for grabbing a specific article by id, populate it with it's comment
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.article.findOne({ _id: req.params.id })
      // ..and populate all of the comments associated with it
      .populate("comment")
      .then(function(dbarticle) {
        // If we were able to successfully find an article with the given id, send it back to the client
        res.json(dbarticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an article's associated comment
  app.post("/articles/:id", function(req, res) {
    // Create a new comment and pass the req.body to the entry
    db.comment.create(req.body)
      .then(function(dbcomment) {
        // If a comment was created successfully, find one article with an `_id` equal to `req.params.id`. Update the article to be associated with the new comment
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.article.findOneAndUpdate({ _id: req.params.id }, { comment: dbcomment._id }, { new: true });
      })
      .then(function(dbarticle) {
        // If we were able to successfully update an article, send it back to the client
        res.json(dbarticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
// Start the server

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});