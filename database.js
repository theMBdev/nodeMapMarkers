const mongoose = require("mongoose");

// passwords
// username and password imported
var config = require('./config');
mongodbUser = config.mongodbUser;
mongodbPassword = config.mongodbPassword;
dbString = config.dbString;
cloudinaryName = config.cloudinaryName;
cloudinaryApiKey = config.cloudinaryApiKey;
cloudinaryApiSecret = config.cloudinaryApiSecret;

const dbPath = 'mongodb://' + mongodbUser + ':' + mongodbPassword + '@ds147213.mlab.com:47213/node-map-markers';
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