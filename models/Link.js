var mongoose = require( "mongoose" );

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new LibrarySchema object
// This is similar to a Sequelize model
var LinkSchema = new Schema( {
  // `author` must be of type String
  title: String,
  // `title` must be of type String
  link: String
} );

// This creates our model from the above schema, using mongoose's model method
var Link = mongoose.model( "Links", LinkSchema );

// Export the Book model
module.exports = Link;
