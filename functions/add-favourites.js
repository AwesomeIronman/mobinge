const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey.json')

// Get env var values defined in our Netlify site UI
const {
   FIREBASE_DB_URL
} = process.env


// Initialize Firebase Cloud Firestore
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
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
      if (!user.user_metadata) {
         return {
            statusCode: 401,
            body: JSON.stringify( "User not logged in?" )
         }
      }

      // Return error if required parameters not passed
      if (!imdb) {
         return {
            statusCode: 400,
            body: JSON.stringify('Required parameter IMDB not found')
         }
      }

      try {
         // Add a sample record
         await db.collection('favourites').add({
            id: `${user.sub}`,
            imdbid: `${user.user_metadata.full_name}`
         })

         // Return OK response
         return {
            statusCode: 200,
            body: JSON.stringify({
               data: 'Test data added successfully',
               user
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
