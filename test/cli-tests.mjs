require('../src/db.js');
const auth = require('../src/auth.js');

/*
// create a user
auth.register('qwerty12', 'querty@test.test', 'testtest',
  function(err) {console.log(err);},
  function(user) {console.log(user);}
);
*/

/*
// create same user as above! should get error...
auth.register('qwerty12', 'querty@test.test', 'testtest',
  function(err) {console.log(err);},
  function(user) {console.log(user);}
);
*/

/*
// login with correct password
auth.login('qwerty12', 'testtest',
  function(err) {console.log(err);},
  function(user) {console.log(user);}
);
*/

/*
// login with user that doesn't exist
auth.login('dne', 'testtest',
  function(err) {console.log(err);},
  function(user) {console.log(user);}
);
*/

/*
// login error: incorrect password
auth.login('qwerty12', 'nogood',
  function(err) {console.log(err);},
  function(user) {console.log(user);}
);
*/
