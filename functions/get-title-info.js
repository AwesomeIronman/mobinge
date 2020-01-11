const axios = require("axios");
const qs = require("qs");

exports.handler = async function (event, context) {

    // Get env var values defined in our Netlify site UI
    const { TMDB_API_KEY, TMDB_API_URL } = process.env
    const tmdb_id = qs.parse(event.body).id;

    // In this example, the API Key needs to be passed in the params with a key of key.
    // We're assuming that the ApiParams var will contain the initial ?
    var URL = `${TMDB_API_URL}/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&language=en-US`

    if (event.httpMethod === 'POST') {

        return axios.get(URL)
            .then((response) => {

                return {
                    statusCode: 200,
                    body: JSON.stringify(response.data)
                }

            }, (error) => {

                return {
                    statusCode: error.status,
                    body: JSON.stringify(error.data)
                }
            });

    } else {
        return {
            statusCode: 405,
            body: JSON.stringify(`Method not allowed: ${event.httpMethod}`)
        };
    }
}