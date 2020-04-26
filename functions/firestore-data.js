const firebase = require('firebase-admin');
var qs = require('querystring');

exports.handler = async function (event, context) {

    // Get env var values defined in our Netlify site UI
    const FIRESTORE_ADMIN_SDK = JSON.parse(process.env.FIRESTORE_ADMIN_SDK)
    const FIRESTORE_DB_URL = process.env.FIRESTORE_DB_URL

    const { userID, list, titleType, titleID } = qs.parse(event.body)

    if (!firebase.apps.length) {
        firebase.initializeApp({
            credential: firebase.credential.cert(FIRESTORE_ADMIN_SDK),
            databaseURL: FIRESTORE_DB_URL
        });
    }

    let db = firebase.firestore();

    try {
        let docRef = db.collection('users').doc(userID);

        if (event.httpMethod === "GET") {
            docRef.set({}, { merge: true });

            let data = await docRef.get()
                .then(snapshot => snapshot.data());

            if (data) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ favourites: data.favourites, watchedlist: data.watchedlist })
                }
            } else {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ favourites: [], watchedlist: [] })
                }
            }
        } else if (event.httpMethod === "POST") {
            if (list === "watchedlist") {
                await docRef.update(
                    {
                        watchedlist: firebase.firestore.FieldValue.arrayUnion({ [titleType]: titleID })
                    }
                );
            } else if (list === "favourites") {
                await docRef.update(
                    {
                        favourites: firebase.firestore.FieldValue.arrayUnion({ [titleType]: titleID })
                    }
                );
            }
        } else if (event.httpMethod === "DELETE") {
            if (list === "watchedlist") {
                await docRef.update(
                    {
                        watchedlist: firebase.firestore.FieldValue.arrayRemove({ [titleType]: titleID })
                    }
                );
            } else if (list === "favourites") {
                await docRef.update(
                    {
                        favourites: firebase.firestore.FieldValue.arrayRemove({ [titleType]: titleID })
                    }
                );
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify('Operation Successful')
        }
        
    }
    catch (error) {
        console.log(error.errorType)
        return {
            statusCode: 500,
            body: JSON.stringify('Error')
        }
    }
}