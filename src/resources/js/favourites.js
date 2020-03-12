$(document).ready(() => {
   removeStoredFavourites()

   netlifyIdentity.on('login', storeFavourites);
   netlifyIdentity.on('logout', removeStoredFavourites);
});


$(document).ready(() => {

   loadFavourites();

   // Add event to show upcoming movies list
   $('#btn-upcoming').on('click', { event: event }, showUpcomingMovies);

   // Add event to show now-playing list
   $('#btn-now-playing').on('click', { event: event }, showNowPlayingMovies);

   // Add event to show popular list
   $('#btn-popular').on('click', { event: event }, showPopularMovies);

   // Add event to show trending list
   $('#btn-trending').on('click', { event: event }, showTrendingMovies);

});
// JQuery OnReady Close

async function loadFavourites() {
   // Get and store favourites only if user has logged in
   if (netlifyIdentity.currentUser() !== null) {
      await storeFavourites()
         .then(() => {
            let favourites = JSON.parse(localStorage.getItem("user_favourites"));
            console.log('favourites loaded');
            favourites.forEach(element => {
               // if movie
               let data = []
               if ("movie" in element) {
                  data = getResponse(
                     {
                        path: `movie/${element.movie}`,
                        query_params: "language=en-US"
                     }
                  )
                     .then(movie => {
                        console.log(movie);

                        let sampleNode = $('#fullSample')[0].cloneNode(true); // Create a clone to edit and append each time
                        sampleNode.removeAttribute("id")
                        sampleNode.removeAttribute("style")

                        sampleNode.querySelector("img.img-fluid").src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "#";
                        sampleNode.querySelector(".movie-title").textContent = movie.title ? movie.title : movie.name;
                        sampleNode.querySelector(".movie-release-year").textContent = movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : "";
                        sampleNode.querySelector(".movie-rating").textContent = movie.vote_average ? `${movie.vote_average}/10` : "";
                        sampleNode.querySelector(".overlay > .movie > a")
                           .setAttribute("onclick", `openMovieInfo('${movie.id}', 'movie')`);

                        $("#favourites_container")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node

                     })
               }
            });
         })
   } else {
      console.log('User not logged in!');
   }
}

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


function showFullResult(result) {
   let sampleNode = $('#fullSample')[0].cloneNode(true); // Create a clone to edit and append each time
   sampleNode.removeAttribute("id")
   sampleNode.removeAttribute("style")

   $('#full-info')[0].innerHTML = ""; // Remove old search result

   if (result !== undefined && result.length > 0) {
      // Show basic information of each search result
      $.each(result, (index, movie) => {
         if (movie.media_type !== "person") { // Show info only if result is not of a person/actor

            sampleNode.querySelector("img.img-fluid").src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "#";
            sampleNode.querySelector(".movie-title").textContent = movie.title ? movie.title : movie.name;
            sampleNode.querySelector(".movie-release-year").textContent = movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : "";
            sampleNode.querySelector(".movie-rating").textContent = movie.vote_average ? `${movie.vote_average}/10` : "";
            sampleNode.querySelector(".overlay > .movie > a")
               .setAttribute("onclick", `openMovieInfo('${movie.id}', '${movie.media_type ? movie.media_type : $('#searchType')[0].value}')`);

            $("#full-info")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
         }
      });

   } else {
      sampleNode.innerHTML = "No result found!";

      $("#partial-info .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
   }

   $("#partial-search-result").css("display", "none");
   $("#full-search-result").css("display", "block");
}


function populateTopList(data) {
   $("#top-list .list-group").empty();

   let sampleNode = $('#fullSample')[0].cloneNode(true); // Create a clone to edit and append each time
   sampleNode.removeAttribute("id")
   sampleNode.removeAttribute("style")
   sampleNode.removeAttribute("class")

   $.each(data, (index, movie) => {
      if (movie.media_type !== "person") { // Show info only if result is not of a person/actor

         sampleNode.setAttribute("onclick", `openMovieInfo('${movie.id}', '${movie.media_type}')`);
         sampleNode.querySelector("img.img-fluid").src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "#";
         sampleNode.querySelector(".movie-title").textContent = movie.title ? movie.title : movie.name;
         sampleNode.querySelector(".movie-release-year").textContent = movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : "";
         sampleNode.querySelector(".movie-rating").textContent = movie.vote_average ? `${movie.vote_average}/10` : "";

         $("#top-list .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
      }
   });

   $("#top-list").css("display", "block"); // Display search results
}

function hideTopList() {
   console.log('Hiding top list');

   $("#top-list .list-group").empty();

   $("#search-box").removeClass("col-md-9");
   $("#search-box").addClass("col-md-12");
   $("#carousel-effect").removeClass("col-md-9");
   $("#carousel-effect").addClass("col-md-12");

   $("#top-list").css("display", "none");
}

function handleData(data) {
   console.log('Data: ', data);

   $("#search-box").removeClass("col-md-12");
   $("#search-box").addClass("col-md-9");
   $("#carousel-effect").removeClass("col-md-12");
   $("#carousel-effect").addClass("col-md-9");

   populateTopList(data);
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

async function showNowPlayingCarousel() {
   let nowPlayingData = await getResponse({
      path: "movie/now_playing",
      query_params: "language=en-US&page=1&region=IN"
   })
   console.log('Testing:now-playing-carousel: ', nowPlayingData)

   // Act only if we receive data
   if (nowPlayingData && nowPlayingData.results) {

      $.each(nowPlayingData.results, (index, movie) => {
         $(".image-rotator > ul")[0].innerHTML += `<li><img class="img-fluid" alt="${movie.title ? movie.title : movie.name}" 
          src="https://image.tmdb.org/t/p/w185${movie.poster_path}" onclick="openMovieInfo('${movie.id}', 'movie')"  /></li>`
      });

      // Enable carousel effect
      $('.image-rotator').hiSlide({
         interval: 3000,
         speed: 900
      });

   } else {
      console.log('Carousel: Didn\'t receive any data!');
      console.log('Carousel:data: ' + nowPlayingData);
   }
}

async function showUpcomingMovies(event) {
   event.preventDefault()
   if ($("#search-box").hasClass("col-md-9")) {
      hideTopList()
   } else {

      let data = await getResponse({
         path: "movie/upcoming",
         query_params: "language=en-US&page=1&region=IN"
      })

      console.log('Testing:upcoming: ', data)

      handleData(data.results)
   }
}

async function showNowPlayingMovies(event) {
   event.preventDefault()
   if ($("#search-box").hasClass("col-md-9")) {
      hideTopList()
   } else {

      let data = await getResponse({
         path: "movie/now_playing",
         query_params: "language=en-US&page=1&region=IN"
      })

      console.log('Testing:now-playing: ', data)

      handleData(data.results)
   }
}

async function showPopularMovies(event) {
   event.preventDefault()
   if ($("#search-box").hasClass("col-md-9")) {
      hideTopList()
   } else {

      let data = await getResponse({
         path: "movie/popular",
         query_params: "language=en-US&page=1&region=IN"
      })

      console.log('Testing:now-playing: ', data)

      handleData(data.results)
   }
}

async function showTrendingMovies(event) {
   event.preventDefault()
   if ($("#search-box").hasClass("col-md-9")) {
      hideTopList()
   } else {

      let data = await getResponse({
         path: "trending/movie/week",
         query_params: ""
      })

      console.log('Testing:now-playing: ', data)

      handleData(data.results)
   }
}

async function toggleFavourite(event) {
   let titleType = $(this).data("titleType")
   let titleID = $(this).data("titleID")

   console.log(titleType);
   console.log(titleID);

   // Get favourites from localstorage
   let localFavourites = JSON.parse(localStorage.getItem("user_favourites"))

   // search for given title ID in localstorage
   let title_local_index
   if (titleType === "movie") {
      title_local_index = localFavourites.findIndex(fav => fav.movie === titleID)
   } else {
      title_local_index = localFavourites.findIndex(fav => fav.tv === titleID)
   }

   // If it is already favourite
   if (title_local_index > -1) {
      console.log('Removing from favourites');

      fetch('/.netlify/functions/firestore-data',
         {
            method: 'POST', body: JSON.stringify({
               userID: netlifyIdentity.currentUser().id,
               operation: "remove-from-favourites",
               titleType: $(this).data("titleType"),
               titleID: $(this).data("titleID")
            })
         }
      )
         .then($("#search-info #movie #add-to-favourites").text("Favourite"))

         .catch(error => {
            console.error('Error:', error);
         });

      localFavourites.splice(title_local_index, 1);

      localStorage.setItem("user_favourites", JSON.stringify(localFavourites));


   } else {
      console.log('Adding to favourites');

      fetch('/.netlify/functions/firestore-data',
         {
            method: 'POST', body: JSON.stringify({
               userID: netlifyIdentity.currentUser().id,
               operation: "add-to-favourites",
               titleType: $(this).data("titleType"),
               titleID: $(this).data("titleID")
            })
         }
      )
         .then($("#search-info #movie #add-to-favourites").text("Added to favourites"))

         .catch(error => {
            console.error('Error:', error);
         });

      localFavourites.push({ [titleType]: titleID })

      localStorage.setItem("user_favourites", JSON.stringify(localFavourites));
   }


}

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

async function openMovieInfo(tmdbid, title_type) {
   // Set the ID of the movie/series user clicked in localstorage to use it later
   localStorage.setItem("info_to_open", JSON.stringify(
      { id: tmdbid }
   ))
   if (title_type === "tv") {
      window.location.href = "/series"
   } else {
      window.location.href = "/movie"
   }
}

function delay(fn, ms) {

   return function (...args) {
      clearTimeout(window.timer)
      window.timer = setTimeout(fn.bind(this, ...args), ms || 0)
   }
}