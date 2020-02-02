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
        "search": "https://api.themoviedb.org/3/search/multi?language=en-US&page=1&include_adult=true&region=IN&"
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
            } else if (params.type === "search" && params.query !== "" && params.query !== undefined) {

                var resp = await fetch(`${urls["search"]}api_key=${TMDB_API_KEY}&query=${params.query}`)
                .then(res => res.json())

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
        console.log(`Error occurred while processing request! ${params.type}:${params.query}`);
        console.log(error);

        return {
            statusCode: 500,
            body: JSON.stringify(`Error occurred while processing request! ${params.type}:${params.query}`)
        };
    }
}