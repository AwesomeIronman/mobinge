$(document).ready(async () => {
  const moviesArr = getInTheatorMovies();

  let eventData = moviesArr.then(data => getReleaseEvents(data));

  initCalendar(await eventData, await moviesArr);

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

async function getInTheatorMovies() {
  // Get all upcoming, now-playing-in-theator movies from serverless function
  return await fetch('/.netlify/functions/tmdb-all-in-theators')
    .then(res => res.json())
    .catch(err => err);
}

async function getReleaseEvents(movies) {
  // Create an array of objects containing data for fullCalendar libraries event source
  let arr = []

  Array.prototype.forEach.call(movies, movie => {
    arr.push({
      title: movie.title,
      start: moment(movie.release_date).format("YYYY-MM-DD"),
      allDay: true,
      id: movie.id
    });
  });

  return arr;
}

async function initCalendar(eventData, moviesInfo) {
  let calendarEl = document.getElementById("calendar");

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
    eventLimit: true,
    eventClick: function (info) {
      let clickedMovieInfo = moviesInfo.find(movie => movie.id === Number(info.event.id));
      $(".calendar-container").toggleClass('flip');
      $(".front").fadeOut(900);
      $(".front").hide();
      showTitleClickedInfo(clickedMovieInfo)
    }
  });

  calendar.render();
}

function showTitleClickedInfo(info) {
  $("#event-info.back").show();

  let $sampleNode = $($('#sampleTitleInfo').clone().html()); // Create a clone to edit and append each time

  let id = info.id;
  let posterImg = (info.poster_path) ?
    "https://image.tmdb.org/t/p/w300" + info.poster_path : "/resources/images/imageNotFound.png";
  let movieName = info.title ? info.title : info.name;
  let rating = !(info.vote_average) ? "Unavailable" : info.vote_average + "/10";
  let releaseDate = moment(info.release_date).format("DD MMMM YYYY");
  let genres = info.genres ? commaSeparatedNames(info.genres) : "";

  $sampleNode.find("img").attr("src", posterImg);

  $sampleNode.find(".movie-title > .title").text(movieName);

  $sampleNode.find(".movie-genre > .genre").text(genres);

  $sampleNode.find(".movie-rating > .rating").text(rating);

  $sampleNode.find(".movie-release-date > .release-date").text(releaseDate);

  $sampleNode.find("button#open-info-btn").data("tmdbid", id);
  $sampleNode.find("button#open-info-btn").data("title_type", "movie");

  $("#event-info.back").html($sampleNode); // Append edited
  // })

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