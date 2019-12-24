fetch("/.netlify/functions/get-info")
    .then(result => console.log(result))
    .catch(err => console.log(err))