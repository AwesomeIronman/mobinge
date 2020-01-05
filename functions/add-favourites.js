const admin = require('firebase-admin')

// Get env var values defined in our Netlify site UI
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL;
const FIREBASE_CONFIG = JSON.parse(process.env.FIREBASE_CONFIG);


// Initialize Firebase Cloud Firestore
admin.initializeApp({
   credential: admin.credential.cert(FIREBASE_CONFIG),
   databaseURL: FIREBASE_DB_URL
})

const db = admin.firestore()

exports.handler = async (event, context) => {

   // Is User logged in?
   if (!context.clientContext && !context.clientContext.identity) {
      return {
         statusCode: 500,
         body: JSON.stringify({
            msg: 'No identity instance detected. Did you enable it?'
         })
      }
   }

   if (event.httpMethod === 'POST') {

      // Collect user information and required parameters
      const { user } = context.clientContext;
      const imdb = event.headers.imdb

      // Return error if user not logged in
      if (!user) {
         return {
            statusCode: 401,
            body: JSON.stringify({ message: "User not logged in?", userObj: user})
         }
      }

      // Return error if required parameters not passed
      if (!imdb) {
         return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Required parameter IMDB not found', imdbObj: imdb})
         }
      }

      try {
         // Add a title to user's favourites list
         var cus = await db.collection('favourites').add({
            id: `${user.sub}`,
            imdbid: `${imdb}`
         })

         // Return OK response
         return {
            statusCode: 200,
            body: JSON.stringify({
               data: 'Test data added successfully',
               cus
            })
         };

      } catch (err) {
         // Return error messages instead if any exist
         console.log(err) // output to netlify function log
         return {
            statusCode: 500,
            body: JSON.stringify({ msg: err.message })
         }
      }

   } else {
      return {
         statusCode: 405
      }
   }

}
