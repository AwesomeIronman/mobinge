const fetch = require('node-fetch-npm');

exports.handler = async function (event, context) {
   // Get environment variables defined from our Netlify site's dashboard
   const { TMDB_API_KEY, TMDB_API_URL } = process.env

   const request_params = new URLSearchParams(`api_key=${TMDB_API_KEY}&language=en-US&region=IN&include_adult=true`);

   const { isTrending, mediaType, listType, listTime, page } = event.queryStringParameters;

   let status, data, url;
   
   if (isTrending === "true") {
      url = new URL(`${TMDB_API_URL}/trending/${mediaType}/${listTime}`)  // Requests for trending list from TMDB
   } else if (isTrending === "false") {
      url = new URL(`${TMDB_API_URL}/${mediaType}/${listType}`);  // Requests for popular, top-rated, etc., lists
   }
   request_params.set("page", page)
   url.search = request_params;     // add query parameters to the url
   
   data = await fetch(url)
      .then((res) => {
         status = res.status;
         return res.json();
      })
      .catch((error) => {
         console.log(error);
      })

   // if response received with ok status
   if (status === 200)
      return {
         statusCode: 200,
         body: JSON.stringify(data)
      }
   else
      return {
         statusCode: 500,
         body: JSON.stringify('Error occurred while fetching data')
      }
}