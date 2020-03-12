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

   await fetch('/.netlify/functions/firestore-data',
      {
         method: 'POST', body: JSON.stringify({
            userID: netlifyIdentity.currentUser().id,
            operation: "get-data"
         })
      }
   )
      .then(res => res.json())

      .then(res => {
         console.log('StoreFavourites():retrieved: '); console.log(res);

         if (Array.isArray(res.favourites)) {
            localStorage.setItem("user_favourites", JSON.stringify(res.favourites));
         } else {
            localStorage.setItem("user_favourites", JSON.stringify([]));
         }

      })

      .catch(error => {
         console.error('Error:'); console.error(error);
      });
}

async function removeStoredFavourites() {
   console.log('Removing favourites from localstorage');

   localStorage.setItem("user_favourites", JSON.stringify([]))
}