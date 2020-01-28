const fetch = require('node-fetch');
const qs = require("qs");

exports.handler = async function (event, context) {

    // Get env var values defined in our Netlify site UI
    const { TMDB_API_KEY, TMDB_API_URL } = process.env
    const params = qs.parse(event.body);

    var URL = `${TMDB_API_URL}/movie/${params.id}?language=en-US&api_key=${TMDB_API_KEY}`

    if (event.httpMethod === 'POST') {

        var resp = await fetch(URL)
            .then(res => res.json())

        return {
            statusCode: 200,
            body: JSON.stringify(resp)
        }

    } else {
        return {
            statusCode: 405,
            body: JSON.stringify(`Method not allowed: ${event.httpMethod}`)
        };
    }
}