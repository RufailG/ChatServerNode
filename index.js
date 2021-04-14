const cors = require('cors'); 
const express = require('express');
const app = express();
app.use(cors());


const port = 3000;
const socketIo = require('socket.io');
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://TripNav:tripnavigation@Primo.jweu5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var channel = "chat0";


//////OLD MESSAGE////////////
app.get('/requestoldmsg', function (req, res){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("TripNav");
        dbo.collection(channel).find().toArray(function(err, results) {
        if (err) throw err;
        this.result = results;
        res.send(result)
        db.close();
        });
    });
});




//////LOGIN////////////
app.get('/login/:nick/:pass', function (req, res){
    nick = req.params.nick;
    pass = req.params.pass;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("TripNav");
        dbo.collection('users').find({$and:[{"nickname":nick},{"password":pass}]}).toArray(function(err, results) {
        if (err) throw err;
        this.result = results;
        if(results.length == 1)
        {
            var log = {"logedin" : true}
            result = log;
            res.send(result);
        }else
        {
            var log = {"logedin" : true}
            result = log;
            res.send(result);
        }
        db.close();
        });
    });
});

//////Sign Up////////////
app.get('/signup/:nick/:pass', function (req, res){
    nick = req.params.nick;
    pass = req.params.pass;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("TripNav");
        dbo.collection("users").find({"nickname":nick}).toArray(function(err, results) {
            if (err) throw err;
            this.result = results;
          if (result.length === 0)
          {
            var myobj = { "nickname": nick , "password":pass };
            dbo.collection("users").insertOne(myobj, function(err, res) {
            if (err) throw err;
            this.result = results;
            result = "user added";
            });
            var reg = {"SingUped" : false}
            result = reg;
            res.send(result);
          }else
          {
            var reg = {"SingUped" : true}
            result = reg;
            res.send(result);
          }
        db.close();
        });
    });
});










// Send Notification API
app.get('/send-notification', (req, res) => {
    const notify = {data: req.body};
    socketServer.emit('notification', notify); // Updates Live Notification
    res.send(notify);
});

const server = app.listen(port, () => {
  console.log(`Server connection on  http://127.0.0.1:${port}`);  // Server Connnected
});
// Socket Layer over Http Server
socketServer = socketIo(server);






// On every Client Connection
socketServer.on('connection', socket => {

    console.log('Socket: client connected');

    socket.on('new-message', (nick, message, cnl) => {
      socketServer.emit('resp-message', message);
      socketServer.emit('resp-cnl', cnl);
      socketServer.emit('resp-usr', nick);
      channel = "chat" + cnl;
      
    
      //save msg on mongoDB
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("TripNav");
        var myobj = { "nickname": nick, "messaggio": message };
        dbo.collection(channel).insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted " + "in " + channel + " by " + nick);
            db.close();
        });
    });

    });

    socket.on('Channel', (cnl) => {
      channel = "chat" + cnl
      console.log(channel);

      app.get('/requestoldmsg', function (req, res){
        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("TripNav");
        dbo.collection(channel).find().toArray(function(err, results) {
        if (err) throw err;
        console.log(results);
        this.result = results;
        console.log(result);
        res.send(result)
        db.close();
        });
    });
});
        


    });

});