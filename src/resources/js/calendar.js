$(document).ready(() => {
  initCalendar();

  $("#event-info").on("click", "#backButton", function () {
    $(".calendar-container").toggleClass("flip");

    $("#event-info.back").fadeOut(900)
    $("#event-info.back").hide()
    $(".front").show()
  });

  // Onclick listener on View Full Info button
  $("#event-info").on("click", "button#open-info-btn", function (event) {
    event.preventDefault();
    let tmdbid = $(this).data("tmdbid")
    let title_type = $(this).data("title_type")
    openMovieInfo(tmdbid, title_type)
  });

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
    events: eventData, // Data to be sent which contains movie name along with its ID and release date
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

  $("#event-info.back").show();

  await getResponse(
    {
      path: `movie/${tmdbid}`,
      query_params: "language=en-US"
    }
  )
    .then(res => { // Received Response
      let $sampleNode = $($('#sampleTitleInfo').clone().html()); // Create a clone to edit and append each time

      let posterImg = (res.poster_path) ?
        "https://image.tmdb.org/t/p/w300" + res.poster_path : "/resources/images/imageNotFound.png";
      let movieName = res.title ? res.title : res.name;
      let rating = !(res.vote_average) ? "Unavailable" : res.vote_average + "/10";
      let releaseDate = moment(res.release_date).format("DD MMMM YYYY");
      let genres = commaSeparatedNames(res.genres);

      $sampleNode.find("img").attr("src", posterImg);

      $sampleNode.find(".movie-title > .title").text(movieName);

      $sampleNode.find(".movie-genre > .genre").text(genres);

      $sampleNode.find(".movie-rating > .rating").text(rating);

      $sampleNode.find(".movie-release-date > .release-date").text(releaseDate);

      $sampleNode.find("button#open-info-btn").data("tmdbid", res.id);
      $sampleNode.find("button#open-info-btn").data("title_type", "movie");

      $("#event-info.back").html($sampleNode); // Append edited
    })

}

function commaSeparatedNames(params) {
  var genString = ""

  params.forEach(function (i, idx, array) {
    if (idx === array.length - 1) {
      genString += `${i.name}`;
    } else {
      genString += `${i.name}, `;
    }
  });
  return genString;
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