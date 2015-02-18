var pass = require('pwd')
var mongoose = require('mongoose')
var User = mongoose.model('User')

var users = {
	getAll : function (req, res, next) {
		User.find(function (err, users) {
			if (err) { return next(err) };
      if (!users) { return next(new Error('No users exist')) };
      res.json(users)
		})
	}
  , getOne : function (req, res, next) {
    var id = req.params.id || req.self
    User.findById(id, function (err, user) {
      if (err) { return next(err) };
      if (!user) { return next(new Error('Cannot find user: ' + id)) };
      res.json(user)
    })
  }
  , create : function (req, res, next) {
    // here is where the validate user is called
    users.validateNewUser(req.body, function (err, validUser) {
      // and this is the function that is called when you call next
      var newUser = new User(validUser)
      if (err) { next(err) };
      
      pass.hash(validUser.password, function (err, salt, hash) {
        newUser.salt = salt
        newUser.hash = hash
        newUser.save(function (err, user) {
          if (err) { return next(err) };
          res.json(user)
        })
      })
    })
  }
  , update : function (req, res, next) {
    var updateUser = req.body
    var id = req.params.id

    User.findByIdAndUpdate(id, updateUser, function (err, user) {
      if (err) { return next(err) };
      if (!user) { return next(new Error('Cannot find user: ' + id)) };
      res.json(user)
    })
  }
  , delete : function (req, res, next) {
    var id = req.params.id

    User.findByIdAndRemove(id, function (err, user) {
      if (err) { return next(err) };
      if (!user) { return next(new Error('Cannot find user: ' + id)) };
      res.json(true)
    })
  }
  // function to aggregate all the users followed by a specific user
  , getOneFollows : function (req, res, next) {
    var id = req.params.id || req.self
    
    User.findById(id, function (err, user) {
      var followsIdList = user.follows

      if (err) { return next(err) };
      if (!user) { return next(new Error('Cannot find user: ' + id)) };
      makeUserList(followsIdList, [], function (userList) {
        res.json(userList)
      })
    })
  }
  , validateNewUser : function (newUser, next) {
    /* Here is where your code for assignment #1 will go */

    // right now this line is included so that it just goes on to the next function
    // with whatever object was passed in
    return next(false, newUser)
  }
}

// private methods


// makeUserList Recursive Function
function makeUserList (userIdList, userList, next) {
  // if we are at the end of userIdList return our userList
  if (!userIdList.length) { return next(userList) };
  // Grab last userId
  var userId = userIdList.pop()
  console.log(userId)
  // find the associated user in DB
  User.findById(userId, function (err, user) {
    if (err) { return next(err) };
    if (!user) { return next(new Error('Cannot find user: ' + userId))};
    var userObj = {}
    // create an object that has the data we want to share
    userObj.username = user.username
    userObj.id = user.id
    userObj.fullName = user.name.first + ' ' + user.name.last
    userObj.counts = {}
    userObj.counts.follows = user.follows.length
    userObj.counts.followers = user.followers.length
    // and push it onto userList array
    userList.push(userObj)
    console.log(userObj)
    // recursively call this function to process the next element
    makeUserList(userIdList, userList, next)
  })
}

module.exports = users