const fetch = require('node-fetch');

exports.handler = async function (event, context) {

   // Get env var values defined in our Netlify site UI
   const { TMDB_API_KEY, TMDB_API_URL } = process.env

   const { title_type, tmdbid } = event.queryStringParameters;

   const request_params = "language=en-US&append_to_response=videos,images,credits,reviews,recommendations,similar&include_image_language=en";

   let URL = `${TMDB_API_URL}/${title_type}/${tmdbid}?api_key=${TMDB_API_KEY}&${request_params}`;

   let status, data;

   data = await fetch(URL).then((res) => {
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