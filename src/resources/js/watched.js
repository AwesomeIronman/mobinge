$(document).ready(() => {
   removeUserData()

   netlifyIdentity.on('login', loadUserData);
   netlifyIdentity.on('logout', removeUserData);
});


$(document).ready(() => {

   showFavourites();

});
// JQuery OnReady Close

async function showFavourites() {
   // Get and store favourites only if user has logged in
   if (netlifyIdentity.currentUser() !== null) {
      await loadUserData()
         .then(() => {
            let favourites = JSON.parse(localStorage.getItem("user_watched"));
            favourites.forEach(element => {
               let data = [], isMovie = false;
               if ("movie" in element) {
                  isMovie = true;
                  data = getResponse(
                     {
                        path: `movie/${element.movie}`,
                        query_params: "language=en-US"
                     }
                  )
               } else if ("tv" in element) {
                  isMovie = false;
                  data = getResponse(
                     {
                        path: `tv/${element.tv}`,
                        query_params: "language=en-US"
                     }
                  )
               }
               data.then(title_data => {
                  let $sampleNode = $($("#fullSample").html()); // Create a clone to edit and append each time

                  let posterImg = title_data.poster_path ?
                     `https://image.tmdb.org/t/p/w300${title_data.poster_path}` : "./resources/images/imageNotFound.png";
                  let titleType = isMovie ? "Movie" : "Series";

                  $sampleNode.find("img.img-fluid").attr("src", posterImg);
                  $sampleNode.find("p.title-type").text(titleType);
                  $sampleNode.find("p.title-type").css("background-color", `${isMovie ? "var(--primary)" : "#f5b50a"}`);
                  $("#favourites_container").append($sampleNode.clone().get(0));

                  $("#favourites_container div.favourite__item:last-of-type")
                     .find("button.view-more-info__btn").attr("onclick", `openMovieInfo('${title_data.id}', '${
                        isMovie ? "movie" : "tv"}')`);
               })

            });
         })
   } else {
      console.log('User not logged in!');
   }
}

async function loadUserData() {
   console.log('Gettings userdata from firestore');

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
         console.log('Retrieved userdata: '); console.log(res);

         if (Array.isArray(res.favourites)) {
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

function removeUserData() {
   console.log('Removing userdata from localstorage');

   localStorage.setItem("user_favourites", JSON.stringify([]))
   localStorage.setItem("user_watched", JSON.stringify([]))
}

async function getResponse(request) {
   return await fetch('/.netlify/functions/tmdb-data',
      { method: 'POST', body: JSON.stringify(request) }
   )
      .then(res => res.json())

      .catch(error => {
         console.error('Error:', error);
      });
}

function openMovieInfo(tmdbid, title_type) {
   // Set the ID of the movie/series user clicked in localstorage to use it later
   localStorage.setItem("info_to_open", JSON.stringify(
      {
         title_type: title_type,
         tmdbid: tmdbid
      }
   ))
   if (title_type === "tv") {
      window.location.href = "/series"
   } else {
      window.location.href = "/movie"
   }
}