var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var request = require('request');
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var redirectUri = 'http://emotype.herokuapp.com/callback';
var clientId = 'd5bd1bf929d44bb3ac0221465aea3639';
var clientSecret = '9b1da54cbe6f445cba564f4f3738a3d5';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
// var spotifyApi = new SpotifyWebApi({
//   clientId : clientId,
//   clientSecret : clientSecret
// });

// var myText = "Whoa, AlchemyAPI's Node.js SDK is really great, I can't wait to build my app!";
var alchemyurl = 'http://gateway-a.watsonplatform.net/'
var spotifyurl = 'https://api.spotify.com/v1/users/'
var key = '73fdf24054081a04c8778d53196c022aac5195b8'

app.use(express.static(__dirname + '/public'))

// app.get('/', function (req, res) {
//   res.send("hello");
// });

app.get('/login', function(req,res) {
  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
    })
  );
});

app.get('/callback', function(req, res) {

  var code = req.query.code || null;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
});


app.get('/spotify', function(req,res) {
    //getAccessToken(function(){});
    spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      //console.log('The access token expires in ' + data.body['expires_in']);
      //console.log('The access token is ' + data.body['access_token']);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
          var params = {
        "playlist":null,
        "user":null
    };
    text = req.query.emotion;
    if(text==="joy") {
        params["playlist"]='6uTuhSs7qiEPfCI3QDHXsL';
        params["user"]='spotify';
    } else if(text==="sadness") {
        params["playlist"]='6ejgjp55cJWGzcDOp4HpGC';
        params["user"]='spotify';
    } else if(text==="disgust") {
        params["playlist"]='4GxkvXNhNxX6qxLqNNjg9D';
        params["user"]='happy_psycho';
    } else if(text==="anger") {
        params["playlist"]='1xTwVvC5y0I4NNdQPowOdh';
        params["user"]='dero.spencer';
    } else if(text==="fear") {
        //TODO find a better fear playlist
        params["playlist"]='5wiHHPmokzB3xNxsB1Gzs9';
        params["user"]='spotify';
    } else {
        params["playlist"]='4hOKQuZbraPDIfaGbM3lKI';
        params["user"]='spotify';
    }

    //get Tracks
    spotifyApi.getPlaylistTracks(params["user"], params["playlist"], { 'offset' : 1, 'limit' : 100, 'fields' : 'items' })
      .then(function(data) {
        var items = data.body['items'];
        var randVal = Math.floor(Math.random() * items.length);
        elm=items[randVal];
          var trk = elm.track;
          //console.log(trk.id);
          res.send(trk.id);
      }, function(err) {
        console.log('Something went wrong!', err);
    });
    }, function(err) {
          console.log('Something went wrong when retrieving an access token', err);
    });
});

app.get('/emotion', function(req, res) {
  text = req.query.text;
  var params = {
        "apikey": key,
        "text": text,
        "outputMode": "json",
        "showSourceText": 1
      };
  request({url:alchemyurl + 'calls/text/TextGetEmotion', qs:params}, function(err, response, body) {
    var data = JSON.parse(body);
    console.log(data.docEmotions);
    res.send(data);
    res.status(200);
  });
});


function getAccessToken(callback) {
  // Retrieve an access token.
  spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
          console.log('Something went wrong when retrieving an access token', err);
    });
}

app.listen(port, function() {
    console.log('Listening on port ' + port);
});
