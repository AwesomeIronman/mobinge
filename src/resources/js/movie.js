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

  let genres = "";
  (movieData.genres).forEach(element => {
    genres += `${element.name}, `;
  });
  $("#movie_genres > span#genres")[0].textContent = genres;

  // $("#imdb_button > a")[0].href = `http://imdb.com/title/${movieData.imdb_id}`;

  $("#movie_title")[0].textContent = movieData.title ? movieData.title : movieData.name;

  $("#movie_overview")[0].textContent = movieData.overview ? movieData.overview : "Unavailable";

  $("#poster_image")[0].src = `https://image.tmdb.org/t/p/w342${movieData.poster_path}`;

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
  $("#movie_runtime > span#runtime")[0].textContent = `${hours} hours and ${minutes} minutes`

  // Movie tagline
  $("#movie_tagline")[0].textContent = `Tagline: ${movieData.tagline}`;
  // Movie vote/rating
  $("#movie_rating > span")[0].textContent = `${movieData.vote_average}/10`;
}

function populateTopList(data) {
  $("#top-list .list-group").empty();

  let sampleNode = $('#fullSample')[0].cloneNode(true); // Create a clone to edit and append each time
  sampleNode.removeAttribute("id")
  sampleNode.removeAttribute("style")
  sampleNode.removeAttribute("class")

  $.each(data, (index, movie) => {
    if (movie.media_type !== "person") { // Show info only if result is not of a person/actor

      sampleNode.setAttribute("onclick", `getTitleInfo('${movie.id}', '${movie.media_type}')`);
      sampleNode.querySelector("img.img-fluid").src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "#";
      sampleNode.querySelector(".movie-title").textContent = movie.title ? movie.title : movie.name;
      sampleNode.querySelector(".movie-release-year").textContent = movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : "";
      sampleNode.querySelector(".movie-rating").textContent = movie.vote_average ? `${movie.vote_average}/10` : "";

      $("#top-list .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
    }
  });

  $("#top-list").css("display", "block"); // Display search results
}

function handleData(data) {
  console.log('Data: ', data);

  $("#search-box").removeClass("col-md-12");
  $("#search-box").addClass("col-md-9");
  $("#carousel-effect").removeClass("col-md-12");
  $("#carousel-effect").addClass("col-md-9");

  populateTopList(data);
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

async function openMovieInfo(tmdbid, title_type) {
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