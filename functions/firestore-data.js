const firebase = require('firebase-admin');

exports.handler = async function (event, context) {

    // Get env var values defined in our Netlify site UI
    const FIRESTORE_ADMIN_SDK = JSON.parse(process.env.FIRESTORE_ADMIN_SDK)
    const FIRESTORE_DB_URL = process.env.FIRESTORE_DB_URL

    const { list, titleType, titleID } = JSON.parse(event.body)
    const userID = context.clientContext.user.sub;      // Get verified user ID provided by netlify identity

    if (!firebase.apps.length) {
        firebase.initializeApp({
            credential: firebase.credential.cert(FIRESTORE_ADMIN_SDK),
            databaseURL: FIRESTORE_DB_URL
        });
    }

    let db = firebase.firestore();

    try {
        let docRef = db.collection('users').doc(userID);
        // Create document (User Record) if it doesn't already exist:
        docRef.set({}, { merge: true });

        switch (event.httpMethod) {
            case "GET":
                let data = await docRef.get()
                    .then(snapshot => snapshot.data());

                return {
                    statusCode: 200,
                    body: JSON.stringify({ favourites: data.favourites, watchedlist: data.watchedlist })
                }

            case "POST":
                if (!validInput(list, titleType, titleID)) {
                    throw "Invalid Input Fields Detected!"
                }
                await docRef.update(
                    {
                        [list]: firebase.firestore.FieldValue.arrayUnion({ [titleType]: titleID })
                    }
                );

            case "DELETE":
                if (!validInput(list, titleType, titleID)) {
                    throw "Invalid Input Fields Detected!"
                }
                await docRef.update(
                    {
                        [list]: firebase.firestore.FieldValue.arrayRemove({ [titleType]: titleID })
                    }
                );
        }

        return {
            statusCode: 200,
            body: JSON.stringify('Operation Successful')
        }

    }
    catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: JSON.stringify('Error')
        }
    }
}

function validInput(list, titleType, titleID) {
    if (list === "watchedlist" || list === "favourites" &&
        titleType === "movie" || titleType === "tv" &&
        titleID !== "" && typeof Number(titleID) === "number"
    ) {
        return true;
    }
    return false;
}