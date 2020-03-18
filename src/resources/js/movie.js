$(document).ready(() => {

  let tmdbid = JSON.parse(localStorage.getItem("info_to_open"));

  let movie_info = fetch_movie_info(tmdbid.id, "movie")
    .then(data => {
      console.log('Data: ', data);
      showMovieInfo(data);
    });

});
// JQuery OnReady Close

async function fetch_movie_info(tmdbid, title_type) {
  return await fetch('/.netlify/functions/tmdb-data',
    {
      method: "POST",
      body: JSON.stringify({
        path: `${title_type}/${tmdbid}`,
        query_params: "language=en-US&append_to_response=videos,images"
      })
    })
    .then(res => res.json())
    .catch(error => console.log(error))
}

function showMovieInfo(movieData) {
  // $("#backdrop_img")[0].src = `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}`;

  $("#poster_image")[0].src = `https://image.tmdb.org/t/p/w342${movieData.poster_path}`;

  $("#movie_title")[0].textContent = movieData.title ? movieData.title : movieData.name;

  // Movie vote/rating
  $("#movie_rating > span")[0].textContent = `${movieData.vote_average}/10`;

  // To create date string in format: 30th April 2008
  var monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  var date = new Date(movieData.release_date);
  var dateStr = date.getDate() + "th " + monthName[date.getMonth()] + " " + date.getFullYear();

  $("#movie_release_date > span#release_status")[0].textContent = (date >= new Date()) ? "Releasing on: " : "Released on: ";
  $("#movie_release_date > span#release_date")[0].textContent = dateStr;

  // Movie runtime
  let hours = Math.floor(movieData.runtime / 60);
  let minutes = movieData.runtime % 60;
  $("#movie_runtime > span#runtime")[0].textContent = `${hours} hours and ${minutes} minutes`;

  // Generate movie string i.e. add "," and "." from genres array
  let genres = "";
  (movieData.genres).forEach(function (i, idx, array) {
    if (idx === array.length - 1) {
      genres += `${i.name}.`;
    } else {
      genres += `${i.name}, `;
    }
  });
  $("#movie_genres > span#genres")[0].textContent = genres;

  // Movie tagline
  $("#movie_tagline")[0].textContent = `Tagline: ${movieData.tagline}`;

  $("#movie_overview")[0].textContent = movieData.overview ? movieData.overview : "Unavailable";

  $("#imdb_button")[0].href = `http://imdb.com/title/${movieData.imdb_id}`;

  // Set movie ID as data attribute on the button (to be reused later)
  $("#movie_favourite > button").data("title_type", "movie");
  $("#movie_favourite > button").data("titleID", movieData.id);
  $("#movie_favourite > button").on('click', { event: event }, toggleFavourite)

  // Set whether already favourite or not
  let localFavourites = JSON.parse(localStorage.getItem("user_favourites"))
  let favouritesIndex = localFavourites.findIndex(i => i.movie === movieData.id)
  if (favouritesIndex !== -1) {
    $("#movie_favourite span.non_favourite").toggleClass("d-none")
    $("#movie_favourite span.favourite").toggleClass("d-none")
    $("#movie_favourite > button > i").css("color", "pink");
  }


  // Add to watched movies list
  // Set movie ID as data attribute on the button (to be reused later)
  $("#movie_watched > button").data("title_type", "movie");
  $("#movie_watched > button").data("titleID", movieData.id);
  $("#movie_watched > button").on('click', { event: event }, toggleWatched)

  // Set whether already watched or not
  let localWatched = JSON.parse(localStorage.getItem("user_watched"))
  let watchedIndex = localWatched.findIndex(j => j.movie === movieData.id)
  if (watchedIndex !== -1) {
    $("#movie_watched span.non_watched").toggleClass("d-none")
    $("#movie_watched span.watched").toggleClass("d-none")
    $("#movie_watched > button > i").css("color", "cornflowerblue");
  }

  // Get videos which are Youtube trailers of the movie
  let trailerKeys = movieData.videos.results.filter(v => v.type === "Trailer" && v.site === "YouTube").map(v => v.key)
  let sampleTrailer = $("#sample-embed-container")[0].cloneNode(true); // Create a clone to edit and append each time
  $(sampleTrailer).removeAttr('id')
  $(sampleTrailer).removeClass("d-none")

  trailerKeys.forEach(keys => {
    console.log(`https://www.youtube.com/embed/${keys}`);
    $(sampleTrailer).find("iframe")[0].src = `https://www.youtube.com/embed/${keys}`;
    $(".trailers")[0].innerHTML += sampleTrailer.outerHTML;
  })

  $(".trailers")[0].classList.remove("d-none")

}

async function toggleFavourite(event) {
  let title_type = $(this).data("title_type"), titleID = $(this).data("titleID");
  console.log(title_type);
  console.log(titleID);

  // Get favourites from localstorage
  let localFavourites = JSON.parse(localStorage.getItem("user_favourites"))

  // search for given title ID in localstorage
  let title_local_index
  if (title_type === "movie") {
    title_local_index = localFavourites.findIndex(fav => fav.movie === titleID)
  }

  // Remove from favourites, if it is already favourite
  if (title_local_index > -1) {
    console.log('Removing from favourites');

    fetch('/.netlify/functions/firestore-data',
      {
        method: 'POST', body: JSON.stringify({
          userID: netlifyIdentity.currentUser().id,
          operation: "remove-from-favourites",
          titleType: title_type,
          titleID: titleID
        })
      }
    )

      .then(res => {
        $("#movie_favourite span.non_favourite").toggleClass("d-none")
        $("#movie_favourite span.favourite").toggleClass("d-none")
        $("#movie_favourite > button > i").css("color", "#6c757d");
      })

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
          titleType: title_type,
          titleID: titleID
        })
      }
    )
      .then(res => {
        $("#movie_favourite span.non_favourite").toggleClass("d-none")
        $("#movie_favourite span.favourite").toggleClass("d-none")
        $("#movie_favourite > button > i").css("color", "pink");
      })

      .catch(error => { console.log('Error:'); console.error(error); });

    localFavourites.push({ [title_type]: titleID })

    localStorage.setItem("user_favourites", JSON.stringify(localFavourites));
  }
}

async function toggleWatched(event) {
  let title_type = $(this).data("title_type"), titleID = $(this).data("titleID");
  console.log(title_type);
  console.log(titleID);

  // Get favourites from localstorage
  let watchedList = JSON.parse(localStorage.getItem("user_watched"))

  // search for given title ID in localstorage
  let title_local_index
  if (title_type === "movie") {
    title_local_index = watchedList.findIndex(fav => fav.movie === titleID)
  }

  // Remove from watched list, if it is already watched
  if (title_local_index > -1) {
    console.log('Removing from watched list');

    fetch('/.netlify/functions/firestore-data',
      {
        method: 'POST', body: JSON.stringify({
          userID: netlifyIdentity.currentUser().id,
          operation: "remove-from-watched-list",
          titleType: title_type,
          titleID: titleID
        })
      }
    )

      .then(res => {
        $("#movie_watched span.non_watched").toggleClass("d-none")
        $("#movie_watched span.watched").toggleClass("d-none")
        $("#movie_watched > button > i").css("color", "#6c757d");
      })

      .catch(error => {
        console.error('Error:', error);
      });

    watchedList.splice(title_local_index, 1);

    localStorage.setItem("user_watched", JSON.stringify(watchedList));


  } else {
    console.log('Adding to watched list');

    fetch('/.netlify/functions/firestore-data',
      {
        method: 'POST', body: JSON.stringify({
          userID: netlifyIdentity.currentUser().id,
          operation: "add-to-watched-list",
          titleType: title_type,
          titleID: titleID
        })
      }
    )
      .then(res => {
        $("#movie_watched span.non_watched").toggleClass("d-none")
        $("#movie_watched span.watched").toggleClass("d-none")
        $("#movie_watched > button > i").css("color", "cornflowerblue");
      })

      .catch(error => { console.log('Error:'); console.error(error); });

    watchedList.push({ [title_type]: titleID })

    localStorage.setItem("user_watched", JSON.stringify(watchedList));
  }
}

function openMovieInfo(tmdbid, title_type) {
  // Set the ID of the movie/series user clicked in localstorage to use it later
  localStorage.setItem("info_to_open", JSON.stringify(
    { tmdbid: tmdbid }
  ))
  if (title_type === "tv") {
    window.location.href = "/series"
  } else {
    window.location.href = "/movie"
  }
}