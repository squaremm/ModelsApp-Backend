var db = require('../config/connection');
var fs = require('fs');
var path = require('path');
var http = require('http');

var User;
db.getInstance(function (p_db) {
  User = p_db.collection('users');
});

module.exports = function (app) {
    app.get('/accept', async (req, res) => {
        var filePath = path.join(__dirname, '../htmltemplates/userAccepted.html')
        res.sendFile(filePath);
    });
}