var Step = require('step')
  , request = require('request')
  , config = require('./test-config')
  , models = require('../lib/models')
  , mongoose = require('mongoose')
  , mongodbUrl = config.db_uri
  , async = require('async')

console.log("Connecting to MongoDB URL: %s", mongodbUrl);
mongoose.connect(mongodbUrl);

var TEST_USERS = [
  {email: "test1@example.com", password: "open-sesame", jar: request.jar()}
, {email: "test2@example.com", password: "test", jar: request.jar()}
, {email: "test3@example.com", password: "password", jar: request.jar()}
];


var importUsers = function(cb){
  console.log("dropping existing users table")
  models.User.remove({}, function(err){
    if (err) throw err;

    console.log("dropped")

    async.eachSeries(TEST_USERS, function(u, done){
      var user = new models.User();
      user.email = u.email
      user.set('password', u.password)

      return user.save(done);
    }, function(err){
      cb(err, null)
    })
  })

}

var importJobs = function(cb){
  console.log("dropping existing jobs table")
  models.Job.remove({}, function(err){
    cb(null)
  })
}

var importProjects = function(cb){
  cb(null)
}

var importSettings = function(cb){
  models.Config.remove({}, function(err){
    if (err) throw err
    new models.Config({version: 1}).save(cb)
  })
}

module.exports = function(cb){
  async.series([
      importSettings
    , importUsers
    , importJobs
    , importProjects
    ]
    , function(err, stdout, stderr) {
      if (err) {throw err;}
      cb(null, config)
    })
}

module.exports(function(){
  console.log("!!", arguments)
  process.exit(0)
})

