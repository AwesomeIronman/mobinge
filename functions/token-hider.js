const fetch = require('node-fetch');
const qs = require("qs");

exports.handler = async function (event, context) {

    // Get env var values defined in our Netlify site UI
    const { TMDB_API_KEY, TMDB_API_URL } = process.env
    const params = qs.parse(event.body);

    const urls = {
        "upcoming": "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1&region=IN&",
        "now-playing": "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1&region=IN&",
        "popular": "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&region=IN&",
        "trending": "https://api.themoviedb.org/3/trending/movie/week?",
        "search": "https://api.themoviedb.org/3/search/multi?language=en-US&page=1&include_adult=true&region=IN&append_to_response=videos,images&",
        "searchTvShows": "https://api.themoviedb.org/3/search/tv?language=en-US&page=1&include_adult=true&region=IN&append_to_response=videos,images&",
        "searchMovies": "https://api.themoviedb.org/3/search/movie?language=en-US&page=1&include_adult=true&region=IN&append_to_response=videos,images&"
    }

    try {
        if (event.httpMethod === 'POST') {

            if (params.type === "upcoming") {

                var resp = await fetch(`${urls["upcoming"]}api_key=${TMDB_API_KEY}`)
                    .then(res => res.json())

                return {
                    statusCode: 200,
                    body: JSON.stringify(resp.results)
                }
            } else if (params.type === "now-playing") {

                var resp = await fetch(`${urls["now-playing"]}api_key=${TMDB_API_KEY}`)
                    .then(res => res.json())

                return {
                    statusCode: 200,
                    body: JSON.stringify(resp.results)
                }
            } else if (params.type === "popular") {

                var resp = await fetch(`${urls["popular"]}api_key=${TMDB_API_KEY}`)
                    .then(res => res.json())

                return {
                    statusCode: 200,
                    body: JSON.stringify(resp.results)
                }
            } else if (params.type === "trending") {

                var resp = await fetch(`${urls["trending"]}api_key=${TMDB_API_KEY}`)
                    .then(res => res.json())

                return {
                    statusCode: 200,
                    body: JSON.stringify(resp.results)
                }
            } else if (params.type === "search" &&
                params.query !== undefined && params.searchType !== undefined &&
                params.query !== "" && params.searchType !== "") {

                var resp = {}   // Define variable early

                if (params.searchType === "all") {

                    resp = await fetch(`${urls["search"]}api_key=${TMDB_API_KEY}&query=${params.query}`)
                        .then(res => res.json())

                } else if (params.searchType === "movies") {

                    resp = await fetch(`${urls["searchMovies"]}api_key=${TMDB_API_KEY}&query=${params.query}`)
                        .then(res => res.json())

                } else if (params.searchType === "tv-show") {

                    resp = await fetch(`${urls["searchTvShows"]}api_key=${TMDB_API_KEY}&query=${params.query}`)
                        .then(res => res.json())
                }

                return {
                    statusCode: 200,
                    body: JSON.stringify(resp.results)
                }

            } else {
                return {
                    statusCode: 405,
                    body: JSON.stringify(`Request type not supported or invalid data: ${params.type}`)
                }
            }


        } else {
            return {
                statusCode: 405,
                body: JSON.stringify(`Method not allowed: ${event.httpMethod}`)
            };
        }
    } catch (error) {
        let errorMessage = `Error occurred while processing request!`;
        console.log(errorMessage + "\n" + error);

        return {
            statusCode: 500,
            body: JSON.stringify(`${errorMessage}`)
        };
    }
}