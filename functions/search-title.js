const mdb = require("moviedb")(process.env.TMDB_API_KEY);
const qs = require("qs");

exports.handler = function (event, context, callback) {

    const title = qs.parse(event.body).title;

    // Here's a function we'll use to define how our response will look like when we call callback
    const pass = (body) => {
        callback(null, {
            statusCode: 200,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ data: body })
        })
    }

    if (event.httpMethod == 'POST') {
        mdb.searchMulti({ query: title }, (err, res) => {
            if (err === null) {
                pass(res);
            } else {
                callback(err);
            }
        });
    } else {
        callback(null, {
            statusCode: 405
        })
    }
};
