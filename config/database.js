const mongoose = require("mongoose");


// DEV
// var config = require('./config');

// Heroku
var config = require('./configForHeroku');

mongodbUser = config.mongodbUser;
mongodbPassword = config.mongodbPassword;
dbString = config.dbString;
cloudinaryName = config.cloudinaryName;
cloudinaryApiKey = config.cloudinaryApiKey;
cloudinaryApiSecret = config.cloudinaryApiSecret;

const dbPath = 'mongodb://' + mongodbUser + ':' + mongodbPassword + dbString;
mongoose.connect(dbPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", () => {
    console.log("> error occurred from the database");
});
db.once("open", () => {
    console.log("> successfully opened the database");
});

module.exports = mongoose;