const fetch = require('node-fetch');

exports.handler = async function (event, context) {
   // Get env var values defined in our Netlify site UI
   const { TMDB_API_KEY, TMDB_API_URL } = process.env

   const { query, type, page } = event.queryStringParameters;

   const request_params = new URLSearchParams("language=en-US&region=IN&include_adult=true");
   request_params.set("api_key", TMDB_API_KEY)
   request_params.set("query", query)
   request_params.set("page", page)

   let url = new URL(`${TMDB_API_URL}/search/${type}`);
   url.search = request_params;

   let status, data;
   data = await fetch(url).then((res) => {
      status = res.status;
      return res.json();
   }).catch((error) => {
      console.log(error);
   })

   // if response received with ok status
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