import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// assumes that User was registered in `./db.mjs`
const User = mongoose.model('User');

const startAuthenticatedSession = (req, user, cb) => {
  req.session.regenerate((err) => {
    if (!err) {
      req.session.user = user;
    } else {
    console.log(err);
    }
    cb(err);
  });
};

const endAuthenticatedSession = (req, cb) => {
  req.session.destroy((err) => { cb(err); });
};

const register = (username, email, password, errorCallback, successCallback) => {
    const errorObj = {};
    if (username.length < 8 || password.length < 8){
      console.log("USERNAME PASSWORD TOO SHORT");
      errorObj.message = "USERNAME PASSWORD TOO SHORT";
      errorCallback(errorObj);
    }else{
      User.findOne({username: username}, (err, result) =>{
        if (err){
          console.log(err);
          errorObj.message = err.toString();
          errorCallback(errorObj);
        }else if (result){
          console.log("USERNAME ALREADY EXISTS");
          errorObj.message = "USERNAME ALREADY EXISTS";
          errorCallback(errorObj);
        }else{
            // you can use a default value of 10 for salt rounds 
            bcrypt.hash(password, 10, function(err, hash) {
              if (err){
                console.log(err);
                errorObj.message = err.toString();
                errorCallback(errorObj);
              }else{
                const newUser = new User({
                  username: username,
                  password: hash,
                  email: email
                });
                newUser.save(err => {
                  if (err){
                    console.log(err);
                    errorObj.message = "DOCUMENT SAVE ERROR";
                    errorCallback(errorObj);
                  }else{
                    successCallback(newUser);
                  }
                })
              };
            });
        }
      })
    };
};

const login = (username, password, errorCallback, successCallback) => {
  const errorObj = {};
  User.findOne({username: username}, (err, user) => {
    if (!err && user) {
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if (passwordMatch){
          successCallback(user);
        }else if (!passwordMatch){
          console.log("PASSWORDS DO NOT MATCH");
          errorObj.message = "PASSWORDS DO NOT MATCH";
          errorCallback(errorObj);
        }else{
          console.log(err);
          errorObj.message = err.toString();
          errorCallback(errorObj);
        }
       });
    }else if (err){
      console.log(err);
      errorObj.message = err.toString();
      errorCallback(errorObj);}
    else{
      console.log("USER NOT FOUND");
      errorObj.message = "USER NOT FOUND";
      errorCallback(errorObj);
      }
   });
};

const authRequired = authRequiredPaths => {
  return (req, res, next) => {
    if(authRequiredPaths.includes(req.path)) {
      if(!req.session.user) {
        res.redirect('/login'); 
      } else {
        next(); 
      }
    } else {
      next(); 
    }
  };
};

export {
  startAuthenticatedSession,
  endAuthenticatedSession,
  register,
  login,
  authRequired
};
