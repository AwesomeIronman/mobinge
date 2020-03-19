const fetch = require('node-fetch-npm');

exports.handler = async function (event, context) {

    console.log('Testing: +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');

    // Get env var values defined in our Netlify site UI
    const { TMDB_API_KEY, TMDB_API_URL } = process.env
    const params = JSON.parse(event.body);

    if (event.httpMethod === 'POST') {

        let URL = `${TMDB_API_URL}/${params.path}?api_key=${TMDB_API_KEY}&${params.query_params}`

        var options = { timeout: 4500 };

        if (params.method && params.method !== "") {

            options = {
                method: params.method,
                timeout: 4500
            };

            if (params.body && Object.keys(params.body).length !== 0
                && params.headers && Object.keys(params.headers).length !== 0) {

                options = {
                    method: params.method,
                    headers: params.headers,
                    body: JSON.stringify(params.body),
                    timeout: 4500
                }

            } else if (params.body && Object.keys(params.body).length !== 0) {

                options = {
                    method: params.method,
                    body: JSON.stringify(params.body),
                    timeout: 4500
                }
                
            }
        }

        let status, data;

        data = await fetch(URL, options)
            .then((res) => {
                status = res.status;
                return res.json();
            })
            .catch((error) => {
                console.log(error);
            })

        // if response received with ok status
        if (status === 200) {
            // Sort search results according to their poularity
            if (data.results) {
                data.results.sort((a, b) => (a.popularity > b.popularity) ? -1 : 1)
            }
            
            return {
                statusCode: 200,
                body: JSON.stringify(data)
            }
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify('Error occurred while fetching data')
            }
        }
    }
}