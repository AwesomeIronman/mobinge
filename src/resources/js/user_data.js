$(document).ready(() => {
   removeStoredFavourites()

   netlifyIdentity.on('login', storeFavourites);
   netlifyIdentity.on('logout', removeStoredFavourites);

   // Get and store favourites only if user has logged in
   if (netlifyIdentity.currentUser() !== null) {
      storeFavourites()
   }

});

async function storeFavourites() {
   console.log('Gettings stored favourites from firestore');

   let user_data = await fetch('/.netlify/functions/firestore-data',
      {
         method: 'POST', body: JSON.stringify({
            userID: netlifyIdentity.currentUser().id,
            operation: "get-data"
         })
      }
   )
      .then(res => res.json())

      .catch(error => {
         console.error('Error:', error);
      });

   console.log('StoreFavourites():user_data: ', user_data);

   localStorage.setItem("user_favourites", JSON.stringify(user_data.favourites))
   
}

async function removeStoredFavourites() {
   console.log('Removing favourites from localstorage');

   localStorage.setItem("user_favourites", JSON.stringify([]))
}