$(document).ready(() => {
  initCalendar()

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
          .setAttribute("onclick", `getTitleInfo('${movie.id}', '${movie.media_type ? movie.media_type : $('#searchType')[0].value}')`);

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

async function getTitleInfo(tmdbid, title_type) {
  let titleData = await getResponse({
    path: `${title_type}/${tmdbid}`,
    query_params: "language=en-US&append_to_response=videos,images"
  })

  console.log('Testing:title-info: ', titleData)

  showTitleInfo(titleData, title_type)
}


function showTitleInfo(info, title_type) {
  $("#search-info #movie .row .img-fluid")[0].src = `https://image.tmdb.org/t/p/w400${info.poster_path}`;
  $("#search-info #movie div:nth-child(2) #title-name")[0].textContent = info.title ? info.title : info.name;
  $("#search-info #movie div:nth-child(2) #title-imdb-rating")[0].textContent = info.vote_average;
  $("#search-info #movie div:nth-child(2) #title-release-date")[0].textContent = info.release_date;
  $("#search-info #movie div:nth-child(2) #title-runtime")[0].textContent = info.runtime + ' minutes';
  $("#search-info #movie div:nth-child(2) #title-tagline")[0].textContent = info.tagline ? info.tagline : "UNSET";


  $("#search-info #movie #add-to-favourites").data("titleType", title_type)
  $("#search-info #movie #add-to-favourites").data("titleID", info.id)

  $("#search-info #movie #add-to-favourites").on('click', { event: event }, toggleFavourite);

  $("#search-info #movie #title-overview")[0].textContent = info.overview;
  $("#search-info #movie div.row div.well a.btn.btn-primary")[0].href = `http://imdb.com/title/${info.imdb_id}`;

  hideTopList();
  $("#search-box").css("display", "none"); // Hide search-box along with partial-search-result
  $("#full-search-result").css("display", "none"); // Hide full-search-result
  $("#carousel-effect").css("display", "none"); // Hide now-playing carousel effect
  $("#search-info").css("display", "block"); // Display selected titles information
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
      sampleNode.querySelector(".well > img.img-fluid").src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "#";
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

async function getInTheatorMovies() {
  // Get all upcoming, now-playing-in-theator movies from serverless function
  return await fetch('/.netlify/functions/tmdb-all-in-theators', { method: 'POST' })
    .then(res => res.json())

    .catch(err => {
      console.log(err);
      return err;
    });
}

async function filterTitles(data) {
  // Remove regional movies
  return data.filter(movie => movie.original_language === "en" || movie.original_language === "hi")
}

async function getReleaseEvents(filteredMovies) {
  // Create an array of objects containing data for fullCalendar libraries event source
  let arr = []

  Array.prototype.forEach.call(filteredMovies, movie => {
    arr = [...arr, {
      title: movie.title.substr(0, 32),
      start: moment(movie.release_date).format("YYYY-MM-DD"),
      allDay: true,
      id: movie.id
    }];
  });

  return arr;
}

async function initCalendar() {
  let calendarEl = document.getElementById('calendar');

  let filteredMovies = await getInTheatorMovies().then(data => filterTitles(data))

  let eventData = await getReleaseEvents(filteredMovies)

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ['bootstrap', 'interaction', 'dayGrid', 'list'],
    themeSystem: 'bootstrap',
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay,listMonth'
    },
    events: eventData,
    editable: false,
    eventStartEditable: false,
    eventLimit: true, // allow "more" link when too many events
    dateClick: function (e) {
      console.log(e);
    },
    eventClick: function (info) {
      console.log(info.event.id, "movie");
      showMovieInfo(info.event.id);
    }
  });

  calendar.render();
}

async function showMovieInfo(tmdbid) {
  await getResponse(
    {
      path: `movie/${tmdbid}`,
      query_params: "language=en-US"
    }
  )
    .then(res => {
      console.log('showMovieInfo response: ');
      console.log(res);


      $("#mega > div > img")[0].src = res.poster_path ?
        `https://image.tmdb.org/t/p/w300${res.poster_path}` : "../resources/images/imageNotFound.png";

      $("#mega > div > div > div > p:nth-child(1) > span > span")[0].textContent = res.title ? res.title : res.name;

      $("#mega > div > div > div > p:nth-child(2) > span > span")[0].textContent = `${res.vote_average} / 10`;

      $("#mega > div > div > div > p:nth-child(3) > span > span")[0].textContent = res.release_date;

      $("#mega > div > div > div > a")[0].setAttribute("onclick", `openMovieInfo('${res.id}', 'movie')`);

    })

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