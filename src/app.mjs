import './db.mjs';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';

import path from 'path';
import url from 'url';
import * as auth from './auth.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

const Task = mongoose.model('Task');
const Friend = mongoose.model('Friend');

const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

// require authenticated user for /article/add path
app.use(auth.authRequired(['/add']));
app.use(auth.authRequired(['/addFriends']));
app.use(auth.authRequired(['/friendsDetails']));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// logging
app.use((req, res, next) => {
  console.log(req.method, req.path, req.body);
  next();
});
app.get('/', (req, res) => {
  Task.find({}).sort('-createdAt').exec((err, tasks) => {
    res.render('index', {user: req.session.user, tasks: tasks});
  });
});


app.get('/friendsDetails', (req, res) => {
  Friend.find({}).sort('-createdAt').exec((err, friends) => {
    res.render('friendsDetails', {user: req.session.user, friends: friends});
  });
});

app.get('/add', (req, res) => {
  if (!req.session.user){
    res.redirect("/login");
  }else{
    res.render('add');
  }
});

app.get('/addFriends', (req, res) => {
  if (!req.session.user){
    res.redirect("/login");
  }else{
    res.render('addFriends');
  }
});



app.post('/add', (req, res) => {
  if (!req.session.user){
    res.redirect("/login");
  }else{
    const newTask = new Task({
      title: req.body.title,
      dueDate: req.body.dueDate,
      description: req.body.description,
      done: false,
      user: req.session.user._id
    });
    newTask.save(err => {
      if (err){
        console.log(err);
        res.render('add', {error: err});
      }else{
        res.redirect("/");
      }
    });
  }
});

app.post('/addFriends', (req, res) => {
  if (!req.session.user){
    res.redirect("/login");
  }else{
    const newFriend = new Friend({
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      user: req.session.user._id
    });
    newFriend.save(err => {
      if (err){
        console.log(err);
        res.render('addFriends', {error: err});
      }else{
        res.redirect("/");
      }
    });
  }
});

app.get('/tasks/:slug', (req, res) => {
  //complete GET /article/slug
  Task.findOne({slug: req.params.slug})
  .populate("user")
  .exec((err, result) => {
    if (err){
      res.render('error', {message: "error"});
    }else{
      res.render('detail', {task: result});
    }
  });
});

app.get('/friends/:slug', (req, res) => {
  Friend.findOne({slug: req.params.slug})
  .populate("user")
  .exec((err, result) => {
    if (err){
      res.render('error', {message: "error"});
    }else{
      res.render('friendsDetails', {friends: result});
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  function success(newUser) {
    auth.startAuthenticatedSession(req, newUser, (err) => {
        if (!err) {
            res.redirect('/');
        } else {
            res.render('error', {message: 'err authing???'}); 
        }
    });
  }

  function error(err) {
    res.render('register', {message: registrationMessages[err.message] ?? 'Registration error'}); 
  }
  auth.register(req.body.username, req.body.email, req.body.password, error, success);
});
        

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
  function success(user) {
    auth.startAuthenticatedSession(req, user, (err) => {
      if(!err) {
        res.redirect('/'); 
      } else {
        res.render('error', {message: 'error starting auth sess: ' + err}); 
      }
    }); 
  }

  function error(err) {
    res.render('login', {message: loginMessages[err.message] || 'Login unsuccessful'}); 
  }
  auth.login(req.body.username, req.body.password, error, success);
});

server.listen(3000);

let left1 = 0,
    left2 = 0;
const off = 10;
io.on('connection', (socket) => {

    if (left1 >= 500 ) {
        left1 = 0;
    }

    socket.emit('update', { left1, left2 });
    

    socket.on('move1', () => {
        console.log('move1');
        left1 += off;
        io.emit('update', { left1, left2 });
        
        if (left1 >= 500) {
            io.emit('over');
        }
    });

    socket.on('move2', () => {
      console.log('move2');
      left1 -= off;
      io.emit('update', { left1, left2 });
      
      if (left1 >= 500) {
          io.emit('over');
      }
  });
});