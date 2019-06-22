var express = require( "express" );
var logger = require( "morgan" );
var mongoose = require( "mongoose" );

const PORT = process.env.PORT || 3000;

// Require all models
var db = require( "./models" );

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use( logger( "dev" ) );
// Parse request body as JSON
app.use( express.urlencoded( { extended: true } ) );
app.use( express.json() );
// Make public a static folder
app.use( express.static( "public" ) );

// Connect to the Mongo DB
mongoose.connect( "mongodb://localhost/populate" ).then( () => {
  console.log( "Connected to Database" );
} ).catch( ( err ) => {
  console.log( "Not Connected to Database ERROR! ", err );
} );
;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/NewsScraper";

mongoose.connect( MONGODB_URI );

// When the server starts, create and save a new Library document to the db
// The "unique" rule in the Library model's schema will prevent duplicate libraries from being added to the server

app.get( "/", function ( req, res ) {
  axios.get( "https://www.liverpoolecho.co.uk/all-about/liverpool-fc" ).then( function ( response ) {
    var $ = cheerio.load( response.data );

    var results = [];

    $( ".teaser" ).each( function ( i, element ) {

      var title = $( element ).children( "a.headline" ).text();

      var summary = $( element ).children( "a.description" ).text()

      var link = $( element ).find( "a.headline" ).attr( "href" );

      results.push( {
        title: title,
        summary: summary,
        link: link

      } )


    } )
    res.send( results )
  } )
  db.Article.create( { name: "Liverpool FC Articles" } )
    .then( function ( dbArticle ) {
      // If saved successfully, print the new Library document to the console
      console.log( dbArticle );
    } )
    .catch( function ( err ) {
      // If an error occurs, print it to the console
      console.log( err.message );
    } );
} );


// Routes

// POST route for saving a new Link to the db and associating it with a Library
app.post( "/submit", function ( req, res ) {
  // Create a new Link in the database
  db.Link.create( req.body )
    .then( function ( dbLink ) {
      // If a Book was created successfully, find one library (there's only one) and push the new Book's _id to the Library's `books` array
      // { new: true } tells the query that we want it to return the updated Library -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate( {}, { $push: { links: dbLink._id } }, { new: true } );
    } )
    .then( function ( dbArticle ) {
      // If the Library was updated successfully, send it back to the client
      res.json( dbArticle );
    } )
    .catch( function ( err ) {
      // If an error occurs, send it back to the client
      res.json( err );
    } );
} );

// Route for getting all links from the db
app.get( "/links", function ( req, res ) {
  // Using our Link model, "find" every book in our db
  db.Link.find( {} )
    .then( function ( dbLink ) {
      // If any Links are found, send them to the client
      res.json( dbLink );
    } )
    .catch( function ( err ) {
      // If an error occurs, send it back to the client
      res.json( err );
    } );
} );

// Route for getting all libraries from the db
app.get( "/articles", function ( req, res ) {
  // Using our Library model, "find" every library in our db
  db.Article.find( {} )
    .then( function ( dbArticle ) {
      // If any Libraries are found, send them to the client
      res.json( dbArticle );
    } )
    .catch( function ( err ) {
      // If an error occurs, send it back to the client
      res.json( err );
    } );
} );

// Route to see what library looks like WITH populating
app.get( "/populated", function ( req, res ) {
  // Using our Library model, "find" every library in our db and populate them with any associated books
  db.Article.find( {} )
    // Specify that we want to populate the retrieved libraries with any associated books
    .populate( "links" )
    .then( function ( dbArticle ) {
      // If any Libraries are found, send them to the client with any associated Books
      res.json( dbArticle );
    } )
    .catch( function ( err ) {
      // If an error occurs, send it back to the client
      res.json( err );
    } );
} );


// Start the server
app.listen( PORT, function () {
  console.log( "App running on port " + PORT + "!" );
} );
