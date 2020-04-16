$(document).ready(() => {
   netlifyIdentity.on('login', () => {
      loadUserData();
   });

   netlifyIdentity.on('logout', () => {
      removeUserData();
   });

});

async function loadUserData() {
   fetch('/.netlify/functions/firestore-data',
      {
         method: 'POST', body: JSON.stringify({
            userID: netlifyIdentity.currentUser().id,
            operation: "get-data"
         })
      }
   )
      .then(res => res.json())

      .then(res => {
         console.log('Retrieved Userdata: '); console.log(res);

         if (Array.isArray(res.favourites) && Array.isArray(res.watchedlist)) {
            localStorage.setItem("user_favourites", JSON.stringify(res.favourites));
            localStorage.setItem("user_watched", JSON.stringify(res.watchedlist));
         } else {
            localStorage.setItem("user_favourites", JSON.stringify([]));
            localStorage.setItem("user_watched", JSON.stringify([]));
         }

      })

      .catch(error => {
         console.error('Error:'); console.error(error);
      });
}

async function removeUserData() {
   localStorage.setItem("user_favourites", JSON.stringify([]))
   localStorage.setItem("user_watched", JSON.stringify([]))
}