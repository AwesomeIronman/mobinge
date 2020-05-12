const fetch = require('node-fetch');

// Get env var values defined in our Netlify site UI
const { TMDB_API_KEY, TMDB_API_URL } = process.env

exports.handler = async function (event, context) {
    var result = [], sub_urls = [];

    var urls = [
        `${TMDB_API_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&region=IN&page=1`,
        `${TMDB_API_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&region=IN&page=1`
    ];

    // map every url to the promise of the fetch
    let requests = urls.map(url => fetch_data(url));

    // Promise.all waits until all jobs are resolved
    await Promise.all(requests)
        .then(responses => {

            responses.forEach((response, index) => {
                if (response && response.results) {
                    result.push(...response.results);
                    for (let i = (response.page + 1); i <= response.total_pages && i <= 5; i++) {
                        // Access the url for which this response is received and request for its further pages
                        sub_urls.push(`${urls[index]}&page=${i}`);
                    }
                }
            })

        })
        .catch(error => console.log(error))

    // map every url to the promise of the fetch
    let sub_requests = sub_urls.map(url => fetch_data(url));

    await Promise.all(sub_requests)
        .then(responses => {
            responses.forEach(response => {
                if (response && response.results) {
                    result.push(...response.results);
                }
            })
        })
        .catch(error => console.log(error))

    var seen = new Set();

    // Filter out duplicate and non-english-hindi movies
    var filteredArr = result.filter(el => {
        const duplicate = seen.has(el.id);
        const isNonRegional = (el.original_language === "en" || el.original_language === "hi")
        seen.add(el.id);
        return (!duplicate && isNonRegional);
    });

    return {
        statusCode: 200,
        body: JSON.stringify(filteredArr)
    }

}

async function fetch_data(URL) {
    return fetch(URL).then(res => res.json()).catch(error => error)
}