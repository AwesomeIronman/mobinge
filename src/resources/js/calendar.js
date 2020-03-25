$(document).ready(() => {
  initCalendar()

});
// JQuery OnReady Close

async function getResponse(request) {
  return await fetch('/.netlify/functions/tmdb-data',
    { method: 'POST', body: JSON.stringify(request) }
  )
    .then(res => res.json())

    .catch(error => {
      console.error('Error:', error);
    });
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
  let calendarEl = document.getElementById("calendar");

  let filteredMovies = await getInTheatorMovies()
    .then(data => filterTitles(data))

  let eventData = await getReleaseEvents(filteredMovies)

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ['interaction', 'dayGrid', 'list'],
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay,listMonth'
    },
    events: eventData,
    editable: false,
    eventStartEditable: false,
    showNonCurrentDates: false,
    fixedWeekCount: false,
    eventLimit: true, // allow "more" link when too many events
    dateClick: function (e) {
      console.log(e);
    },
    eventClick: function (info) {
      console.log(info.event.id, "movie");
      $(".calendar-container").toggleClass('flip');

      $(".front").fadeOut(900);
      $(".front").hide();

      showTitleClickedInfo(info.event.id)
    }
  });

  calendar.render();
}

async function showTitleClickedInfo(tmdbid) {
  await getResponse(
    {
      path: `movie/${tmdbid}`,
      query_params: "language=en-US"
    }
  )
    .then(res => { // Received Response
      let sampleNode = $('.sampleTitleInfo')[0].cloneNode(true); // Create a clone to edit and append each time

      $(sampleNode).find("img")[0].src = res.poster_path ?
        `https://image.tmdb.org/t/p/w300${res.poster_path}` : "../resources/images/imageNotFound.png";

      $(sampleNode).find(".movie-title > .title")[0].textContent = res.title ? res.title : res.name;

      $(sampleNode).find(".movie-rating > .rating")[0].textContent = `${res.vote_average} / 10`;

      $(sampleNode).find(".movie-release-date > .release-date")[0].textContent = res.release_date;

      $(sampleNode).find("a")[0].setAttribute("onclick", `openMovieInfo('${res.id}', 'movie')`);

      $(".back").append($(sampleNode).html()); // Append edited 

      $(".back").show();

    })

}

function openMovieInfo(tmdbid, title_type) {
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