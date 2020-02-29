const fetch = require('node-fetch');
const admin = require('firebase-admin');

exports.handler = async function (event, context) {

    console.log('Testing:FIRESTORE: +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-');

    // Get env var values defined in our Netlify site UI
    const FIRESTORE_ADMIN_SDK = JSON.parse(process.env.FIRESTORE_ADMIN_SDK)
    const FIRESTORE_DB_URL = process.env.FIRESTORE_DB_URL

    const { userID, operation, titleType, titleID } = JSON.parse(event.body)

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(FIRESTORE_ADMIN_SDK),
            databaseURL: FIRESTORE_DB_URL
        });
    }

    let db = admin.firestore();

    if (event.httpMethod === 'POST') {

        console.log('Operation: ', operation);

        if (operation === "add-to-favourites") {
            let docRef = db.collection('users').doc(userID);

            await docRef.update(
                {
                    favourites: admin.firestore.FieldValue.arrayUnion({ [titleType]: titleID })
                }
            );
        } else if (operation === "remove-from-favourites") {
            let docRef = db.collection('users').doc(userID);

            await docRef.update(
                {
                    favourites: admin.firestore.FieldValue.arrayRemove({ [titleType]: titleID })
                }
            );
        } else if (operation === "get-favourites") {
            let docRef = db.collection('users').doc(userID);

            let favourites_data = await docRef.get().then(snapshot => snapshot.data().favourites);
            
            return {
                statusCode: 200,
                body: JSON.stringify(favourites_data)
            }

        }

        return {
            statusCode: 200,
            body: JSON.stringify('action complete')
        }


    }
}