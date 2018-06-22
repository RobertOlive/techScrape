// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].headline + "<br />" + data[i].link + "</p>");
    }
  });
  
  
  // Whenever someone clicks a p tag
  $(document).on("click", "p", function() {
    // Empty the comments from the comment section
    $("#comments").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the comment information to the page
      .then(function(data) {
        console.log(data);
        // The headline of the article
        $("#comments").append("<h2>" + data.headline + "</h2>");
        // An input to enter a new headline
        $("#comments").append("<input id='headlineinput' name='headline' >");
        // A textarea to add a new comment body
        $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new comment, with the id of the article saved to it
        $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save comment</button>");
  
        // If there's a comment in the article
        if (data.comment) {
          // Place the headline of the comment in the headline input
          $("#headlineinput").val(data.comment.headline);
          // Place the body of the comment in the body textarea
          $("#bodyinput").val(data.comment.body);
        }
      });
  });
  
  // When you click the savecomment button
  $(document).on("click", "#savecomment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the comment, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from headline input
        headline: $("#headlineinput").val(),
        // Value taken from comment textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the comments section
        $("#comments").empty();
      });
  
    // Also, remove the values entered in the input and textarea for comment entry
    $("#headlineinput").val("");
    $("#bodyinput").val("");
  });