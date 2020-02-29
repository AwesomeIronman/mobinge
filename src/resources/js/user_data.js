$(document).ready(() => {

   netlifyIdentity.on('login', storeFavourites);
   netlifyIdentity.on('logout', removeStoredFavourites);

   // Get and store favourites only if user has logged in
   if (netlifyIdentity.currentUser() !== null) {
      storeFavourites()
   }

});

async function storeFavourites() {
   console.log('Gettings stored favourites from firestore');

   fetch('/.netlify/functions/firestore-data',
      {
         method: 'POST', body: JSON.stringify({
            userID: netlifyIdentity.currentUser().id,
            operation: "get-favourites"
         })
      }
   )
      .then(res => res.json())
      .then(res => localStorage.setItem("user_favourites", JSON.stringify(res)))

      .catch(error => {
         console.error('Error:', error);
      });
}

async function removeStoredFavourites() {
   console.log('Removed favourites from localstorage');

   localStorage.removeItem("user_favourites")
}