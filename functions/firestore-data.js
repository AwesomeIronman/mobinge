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

        if (operation === "add-to-watched-list") {
            let docRef = db.collection('users').doc(userID);

            let response = await docRef.update(
                {
                    watchedlist: admin.firestore.FieldValue.arrayUnion({ [titleType]: titleID })
                }
            );

            console.log('add-to-watched-list: ', response);

        } else if (operation === "remove-from-watched-list") {
            let docRef = db.collection('users').doc(userID);

            let response = await docRef.update(
                {
                    watchedlist: admin.firestore.FieldValue.arrayRemove({ [titleType]: titleID })
                }
            );
            console.log('remove-from-watched-list: ', response);

        } else if (operation === "add-to-favourites") {
            let docRef = db.collection('users').doc(userID);

            let response = await docRef.update(
                {
                    favourites: admin.firestore.FieldValue.arrayUnion({ [titleType]: titleID })
                }
            );

            console.log('add-to-favourites: ', response);

        } else if (operation === "remove-from-favourites") {
            let docRef = db.collection('users').doc(userID);

            let response = await docRef.update(
                {
                    favourites: admin.firestore.FieldValue.arrayRemove({ [titleType]: titleID })
                }
            );
            console.log('remove-from-favourites: ', response);

        } else if (operation === "get-data") {

            let docRef = db.collection('users').doc(userID);
            docRef.set({}, { merge: true });

            let data = await docRef.get()
                .then(snapshot => snapshot.data());

            console.log('get-data: ', data);

            if (data) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(data)
                }
            } else {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ favourites: [], watchedlist: [] })
                }
            }

        }

        return {
            statusCode: 200,
            body: JSON.stringify('action complete')
        }


    }
}