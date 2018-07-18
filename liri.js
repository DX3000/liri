const dotenv = require("dotenv").config();
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const request = require("request");
const keys = require("./keys");
const fs = require("fs");

const spotify = new Spotify(keys.spotify)
const client = new Twitter(keys.twitter);

let tweet_limit = 40;

let commandObj = {
    command: process.argv[2],
    name: process.argv[3]
};
doCommand();

function doCommand() {
    switch (commandObj.command) {
        case "my-tweets":
            client.get('statuses/user_timeline', { count: tweet_limit }, (err, tweets, resp) => {
                if (err) throw err;
                console.log(`Last ${tweet_limit} tweets:`);
                for (let i = 0; i < tweets.length; i++) {
                    console.log(`${tweets[i].text} | ${tweets[i]["created_at"]}`);
                }
            })
            break;
        case "spotify-this-song":
            spotify.search({ type: "track", query: commandObj.name ? commandObj.name : "Holy Wars" })
                .then((resp) => {
                    let track = resp.tracks.items[0]
                    let music = {
                        artist: track.album.artists[0].name,
                        name: track.name,
                        preview: track.external_urls.spotify,
                        album: track.album.name
                    }
                    console.log(music);
                })
                .catch((err) => {
                    throw err;
                });
            break;
        case "movie-this":
            request.get(`http://www.omdbapi.com/?apikey=trilogy&r=json&t=${commandObj.name ? commandObj.name : "Mr.Nobody"}`,
                (err, res, bodyString) => {
                    if (err) throw err;
                    let body = JSON.parse(bodyString);
                    let movie = {
                        title: body.Title,
                        year: body.Year,
                        imdbRating: body.Ratings[0].Value,
                        rottenRating: body.Ratings[1].Value,
                        country: body.Country,
                        language: body.Language,
                        plot: body.Plot,
                        actors: body.Actors
                    }
                    console.log(movie);
                });
            console.log("movie");
            break;
        case "do-what-it-says":
            fs.readFile('random.txt', { encoding: "utf-8" }, (err, data) => {
                data = data.split(",");
                commandObj.command = data[0];
                commandObj.name = data[1];
                doCommand();
            });
            break;
    }
}