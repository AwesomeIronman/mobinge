const axios = require("axios")

exports.handler = function (event, context, callback) {

    // Get env var values defined in our Netlify site UI
    const {
        API_TOKEN,
        API_URL
    } = process.env

    // construct a base URL for OMDB API usage,
    // using set environment variables
    var URL = `${API_URL}?apikey=${API_TOKEN}&`;

    var titleID = ''+event.headers.id;

    URL = URL + 'i=' + titleID + '&';

    console.log('URL: ', URL)
    console.log('Title: ', titleID)

    // Here's a function we'll use to define how our response will look like when we call callback
    const pass = (body) => {
        callback(null, {
            statusCode: 200,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(body)
        })
    }

    // Perform the API call.
    const get = () => {
        axios.get(URL)
            .then((response) => {
                console.log(response.data)
                pass(response.data)
            })
            .catch(err => pass(err))
    }

    if (event.httpMethod == 'POST') {
        get();
    } else {
        callbac(null, {
            statusCode: 405
        })
    }
};