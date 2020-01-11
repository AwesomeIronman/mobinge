const axios = require("axios");
const qs = require("qs");

exports.handler = async function (event, context) {

    // Get env var values defined in our Netlify site UI
    const { TMDB_API_KEY, TMDB_API_URL } = process.env
    const title = qs.parse(event.body).title;

    // In this example, the API Key needs to be passed in the params with a key of key.
    // We're assuming that the ApiParams var will contain the initial ?
    var URL = `${TMDB_API_URL}/search/multi?api_key=${TMDB_API_KEY}&language=en-US&page=1&include_adult=true`

    if (event.httpMethod === 'POST') {

        URL = `${URL}&query=${title}`;

        return axios.get(URL)
            .then((response) => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(response.data.results)
                }

            }, (error) => {
                
                return {
                    statusCode: error.response.status,
                    body: JSON.stringify(error.response.data)
                }
            });

    } else {
        return {
            statusCode: 405,
            body: JSON.stringify(`Method not allowed: ${event.httpMethod}`)
        };
    }
}
