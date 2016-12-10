// callback functions
var error = function (err, response, body) {
  console.log('ERROR [%s]', err);
};
var success = function (data) {
  console.log('Data [%s]', data);
};

var Twitter = require('twitter-node-client').Twitter;

var config = require('./twitter_config');

var twitter = new Twitter(config);


var path = require('path')

var express = require('express');

var app = express();

app.use('/static', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', function(req, res) {
  renderIndexWithTwitterData('maymillerricci', res);
});

app.listen(3000, function() {
  console.log('The frontend server is running on port 3000.');
})


function renderIndexWithTwitterData(screen_name, res) {
  
  twitter.getUser({ screen_name: screen_name }, error, function(data) {
    var user = JSON.parse(data);

    twitter.getUserTimeline({ screen_name: screen_name, count: 5 }, error, function(data) {
      var tweets = JSON.parse(data);

      twitter.getCustomApiCall('/friends/list.json', { screen_name: screen_name, count: 5 }, error, function(data) {
        var friends = JSON.parse(data).users;

        twitter.getCustomApiCall('/direct_messages.json', { count: 3 }, error, function(data) {
          var messages_to = JSON.parse(data);

          twitter.getCustomApiCall('/direct_messages/sent.json', { count: 3 }, error, function(data) {
            var messages_from = JSON.parse(data);

            var messages = messages_to.concat(messages_from);
            var sorted_messages = sortBy(messages, 'created_at');

            res.render('index', { user: user, tweets: tweets, friends: friends, messages: sorted_messages });

          });
        });
      });
    });
  });
}

function sortBy(array, key) {
  return array.sort(function(a, b) {
    var x = a[key];
    var y = b[key];

    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}
