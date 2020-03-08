const fetch = require('node-fetch');

// Get env var values defined in our Netlify site UI
const { TMDB_API_KEY, TMDB_API_URL } = process.env

exports.handler = async function (event, context) {
    console.log('TMDB_ALL-MOVIES-IN-THEATORS: +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');

    var result = [];
    var sub_urls = [];

    if (event.httpMethod === 'POST') {

        let urls = [
            `${TMDB_API_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&region=IN&page=1`,
            `${TMDB_API_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&region=IN&page=1`
        ];

        // map every url to the promise of the fetch
        let requests = urls.map(url => fetch_data(url));

        // Promise.all waits until all jobs are resolved
        await Promise.all(requests)
            .then(responses => {

                responses.forEach(response => {
                    // If we received movies list/result add it to the final result array we would
                    // be returning to the user
                    result = [...result, ...response.results];

                    console.log('No of movies added: ', response.results.length);

                    for (let i = ++(response.page); i <= response.total_pages; i++) {
                        sub_urls.push(
                            `${TMDB_API_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&region=IN&page=${i}`
                        )
                    }
                })
            })

        // map every url to the promise of the fetch
        let sub_requests = sub_urls.map(url => fetch_data(url));

        await Promise.all(sub_requests)
            .then(responses => {

                // If we received movies list/result add it to the final result array we would
                // be returning to the user
                responses.forEach(response => {
                    result = [...result, ...response.results];
                    console.log('No of movies added: ', response.results.length);
                })
            })

        console.log('Total no of movies: ', result.length);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }


    }
}

async function fetch_data(URL) {
    return await fetch(URL)
        .then((res) => {
            return res.json();
        })
        .catch((error) => {
            console.log('fetch-data: ', error.code);
            return error;
        })
}