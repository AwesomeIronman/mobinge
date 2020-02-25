const fetch = require('node-fetch');
const admin = require('firebase-admin');

exports.handler = async function (event, context) {

    console.log('Testing:FIRESTORE: +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');

    // Get env var values defined in our Netlify site UI
    const FIRESTORE_ADMIN_SDK = JSON.parse(process.env.FIRESTORE_ADMIN_SDK)
    const FIRESTORE_DB_URL = process.env.FIRESTORE_DB_URL

    const { userID, titleID } = JSON.parse(event.body)

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(FIRESTORE_ADMIN_SDK),
            databaseURL: FIRESTORE_DB_URL
        });
    }

    let db = admin.firestore();

    if (event.httpMethod === 'POST') {

        let docRef = db.collection('users').doc(userID);

        let resp = await docRef.update(
            {
                favourites: admin.firestore.FieldValue.arrayUnion(titleID)
            }
        );

        console.log(resp);
        return {
            statusCode: 200,
            body: JSON.stringify('ok response')
        }


    }
}