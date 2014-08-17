var env = require('./env.js');

exports.config = function() {
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
};