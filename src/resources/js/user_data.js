$(document).ready(() => {
   netlifyIdentity.on('login', () => {
      storeFavourites();
      storeWatched();
   });

   netlifyIdentity.on('logout', () => {
      removeStoredFavourites();
      removeStoredWatched();
   });

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

async function storeWatched() {
   console.log('Gettings stored watched list from firestore');

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
         console.log('StoreWatched():retrieved: '); console.log(res);

         if (Array.isArray(res.watchedlist)) {
            localStorage.setItem("user_watched", JSON.stringify(res.watchedlist));
         } else {
            localStorage.setItem("user_watched", JSON.stringify([]));
         }

      })

      .catch(error => {
         console.error('Error:'); console.error(error);
      });
}

async function removeStoredWatched() {
   console.log('Removing watched list from localstorage');

   localStorage.setItem("user_watched", JSON.stringify([]))
}