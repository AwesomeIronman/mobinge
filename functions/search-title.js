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

    var title = event.headers.title;

    URL = URL + 's=' + title + '&';

    console.log('URL: ', URL)
    console.log('Title: ', title)

    // Here's a function we'll use to define how our response will look like when we call callback
    const pass = (body) => {
        callback(null, {
            statusCode: 200,
<<<<<<< HEAD:functions/token-hider/token-hider.js
			headers: {
				'content-type': 'application/json'
			},
=======
            headers: {
                'content-type': 'application/json'
            },
>>>>>>> dev:functions/search-title.js
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

<<<<<<< HEAD:functions/token-hider/token-hider.js
    if (event.httpMethod == 'GET') {
        get()
    };
=======
    if (event.httpMethod == 'POST') {
        get();
    } else {
        callbac(null, {
            statusCode: 405
        })
    }
>>>>>>> dev:functions/search-title.js
};
