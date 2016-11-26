var express = require("express"),
    fs = require('fs'),
    app = express();

var config = JSON.parse(fs.readFileSync('config.cnf'));

app.use(express.static(__dirname + "/frontend/dist"));

app.listen(config.port, () => {
    console.log("Server listening on port: "+ config.port);
});