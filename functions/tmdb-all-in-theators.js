const fetch = require('node-fetch');

exports.handler = async function (event, context) {

    console.log('TMDB_ALL-MOVIES-IN-THEATORS: +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');

    // Get env var values defined in our Netlify site UI
    const { TMDB_API_KEY, TMDB_API_URL } = process.env

    if (event.httpMethod === 'POST') {

        let URL = `${TMDB_API_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1&region=IN`

        let status, data, result;

        data = await fetch(URL)
            .then((res) => {
                status = res.status;
                return res.json();
            })
            .catch((error) => {
                console.log('Error: ', error.code);
            })

        // Send data only if response is OK
        if (status === 200 && data.total_pages > 1) {
            
            let total_pages = data.total_pages;
            result = [...data.results];

            for (let index = 2; index <= total_pages; index++) {
                URL = `${TMDB_API_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${index}&region=IN`

                data = await fetch(URL)
                    .then((res) => {
                        status = res.status;
                        return res.json();
                    })
                    .catch((error) => {
                        console.log('Error: ', error.code);
                        index--;
                    })

                if (status === 200) {
                    result = [...result, ...data.results];
                }


            }

        }

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }


    }
}