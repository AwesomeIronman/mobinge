const fetch = require('node-fetch');

exports.handler = async function (event, context) {

    console.log('Testing: +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');

    // Get env var values defined in our Netlify site UI
    const { TMDB_API_KEY, TMDB_API_URL } = process.env
    const params = JSON.parse(event.body);

    // var data;


    if (event.httpMethod === 'POST') {

        let URL = `${TMDB_API_URL}/${params.path}?api_key=${TMDB_API_KEY}&${params.query_params}`

        console.log('Testing:URL: ', URL);
        console.log('Testing:method: ', params.method);
        console.log('Testing:body: ', params.body);
        console.log('Testing:header: ', params.headers);

        var options;

        if (params.method && params.method !== "") {

            options = { method: params.method }

            if (params.body && Object.keys(params.body).length !== 0
                && params.headers && Object.keys(params.headers).length !== 0) {

                options = {
                    method: params.method,
                    headers: params.headers,
                    body: JSON.stringify(params.body)
                }

            } else if (params.body && Object.keys(params.body).length !== 0) {
                options = {
                    method: params.method,
                    body: JSON.stringify(params.body)
                }
            }
        }

        let status;
        let data = await fetch(URL, options)
            .then((res) => {
                status = res.status;
                return res.json();
            })

        console.log('Testing:status: ', status);
        console.log('Testing:no of items in result: ', Object.keys(data).length);

        // Send data only if response is OK
        if (status === 200) {
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