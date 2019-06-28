const http = require('http');
const url = require('url');
const express = require('express');
const app = express();
const fs = require('fs');
const port = 8000;
const jsonPath = 'shortUris.json';

const server = app.listen(port, () => {
  let host = server.address().address;
  let port = server.address().port;
  console.log(`Your app is running at http://${host}:${port}`);
});

const generateShortUri = (length) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

app.get('/shorten', (request, response) => {
  console.log(request.query);
  if (request.query.uri) {
    fs.readFile(jsonPath, 'utf8', function (err, data) {
      if (err) {
        console.log(err);
        response.send('Hmmm not sure what went wrong there...try refreshing the page? code 1');
      }
      let shortUris = JSON.parse(data);
      let newShortUri = '';
      do {
        newShortUri = generateShortUri(5);
      } while(shortUris[newShortUri]);
      shortUris[newShortUri] = request.query.uri;
      fs.writeFile(jsonPath, JSON.stringify(shortUris), (err) => {
        if (err) {
          console.log(err);
          response.send('Hmmm not sure what went wrong there...try refreshing the page? code 2');
        }
        console.log('The file has been saved!');
        response.send(`{"short-uri": "http://localhost:8000/u/${newShortUri}"}`);
      });
    });
  } else {
    response.send('No uri found in query parameters!');
  }
});

app.get('/u/:shortUri', (request, response) => {
  console.log(request.params.shortUri);
  fs.readFile(jsonPath, 'utf8', function (err, data) {
    if (err) {
      console.log(err);
      response.send('Hmmm not sure what went wrong there...try refreshing the page? code 3');
    }
    let shortUris = JSON.parse(data);
    if (shortUris[request.params.shortUri]) {
      // Option 1 - Redirects to Uri
      response.redirect(shortUris[request.params.shortUri]);
      // Option 2 - returns html as response, currently crashes after most of the html is returned
      // http.get(shortUris[request.params.shortUri], function(res) {
      //   console.log("Got response: " + res);
      //   res.on('data', function (chunk) {
      //     //console.log('BODY: ' + chunk);
      //     response.send(chunk);
      //   });
      // }).on('error', function(e) {
      //   console.log("Got error: " + e.message);
      //   response.send('Error accessing external url!');
      // });
    } else {
      response.send('This short uri is not in our db!');
    }
  });
});