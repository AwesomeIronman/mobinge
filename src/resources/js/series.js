$(document).ready(() => {
  let info_to_open = JSON.parse(localStorage.getItem("info_to_open"));

  if (!info_to_open || !(info_to_open.title_type === "tv")) {
    console.log("Unexpected title type found!");
    window.location.href = "/"
  }

  fetch_title_info(info_to_open.tmdbid, "tv")
    .then(data => {
      console.log('Data: ', data);
      showSeriesInfo(data);
    });

  $().fancybox({
    selector: '.media-img a:visible'
  });

  $().fancybox({
    selector: 'a.media-vd:visible'
  });

  // Open title info page on carousel images click
  $(".carousel-container").on("click", function (event) {
    var target = $(event.target);
    if (target.is("img")) {
      let tmdbid = $(target).data("tmdbid")
      let title_type = $(target).data("title_type")
      openTitleInfo(tmdbid, title_type)
    }
  });

  // Add view all info listener on various buttons
  $("a.view-all").on("click", function () {
    let tab_type = $(this).attr("data-tab_type")
    $(`.info-tabs .nav li a#${tab_type}-tab`).tab('show')
  })
});
// JQuery OnReady Close

async function fetch_title_info(tmdbid, title_type) {
  return fetch(`/.netlify/functions/title-info?title_type=${title_type}&tmdbid=${tmdbid}`)
    .then(res => res.json())
    .catch(error => console.log(error))
}

async function getResponse(request) {
  return await fetch('/.netlify/functions/tmdb-data',
    { method: 'POST', body: JSON.stringify(request) }
  )
    .then(res => res.json())

    .catch(error => {
      console.error('Error:', error);
      return error;
    });
}

function showSeriesInfo(seriesData) {
  if (seriesData.constructor !== Object) {
    console.log('Received invalid data: ', seriesData);
    return false;
  }

  let cast = crew = []

  let backdropImg = `https://image.tmdb.org/t/p/w1280${seriesData.backdrop_path}`
  let posterImg = `https://image.tmdb.org/t/p/w300${seriesData.poster_path}`

  $(".hero-image").css({ "background-image": `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backdropImg})` })
  $(".series-poster img.card-img-top").attr("src", posterImg)

  // For "Watch Trailer" button under series poster
  let trailerVdIndex = seriesData.videos.results.findIndex(vid => vid.type === "Trailer")
  if (trailerVdIndex > -1) {
    let trailerYtKey = seriesData.videos.results[trailerVdIndex].key;
    $(".trailer-btn").attr("data-fancybox", "")
    $(".trailer-btn").attr("data-src", `https://www.youtube.com/embed/${trailerYtKey}`)
    $('.trailer-btn').fancybox();
  }

  // Show series title/name
  let seriesName = seriesData.title ? seriesData.title : seriesData.name;
  let startYear = new Date(seriesData.first_air_date).getFullYear();
  let endYear = new Date(seriesData.last_air_date).getFullYear();
  let releaseYear = `${startYear}-${(seriesData.in_production) ? "" : endYear}`;
  $(".main-content > .series-title > .name").text(seriesName);
  $(".main-content > .series-title > .year").text(releaseYear);

  // Series votes/rating
  let seriesRating = seriesData.vote_average;
  $("span.rate-text").text(seriesRating);

  // Draw the series rating stars
  for (let i = 0; i < 10; i++) {
    if (i < Math.floor(seriesData.vote_average)) {
      $(".rate-star > i").eq(i).css("color", "#f5b50a")
    }
  }

  // Add the series overview/brief info text
  $(".overview-text").text(seriesData.overview)

  // Add photos to the "Videos and Photos" line
  let $sampleMediaImg = $($("#sampleSeriesMediaImg").html());  // JQuery object of template to use
  let postersArr = seriesData.images.posters;
  for (let index = 0; index < postersArr.length && index < 3; index++) {  // Add maximum of only 3 photos to the line
    $sampleMediaImg.find("a").attr("href", `https://image.tmdb.org/t/p/original${postersArr[index].file_path}`)
    $sampleMediaImg.find("img").attr("src", `https://image.tmdb.org/t/p/w92${postersArr[index].file_path}`)
    $(".series-media").append($sampleMediaImg.clone())
  }
  if (seriesData.videos.results && seriesData.videos.results.length > 0) {
    let $sampleMediaVd = $($("#sampleSeriesMediaVd").html());
    $sampleMediaVd.find("a").attr("href", `https://www.youtube.com/embed/${seriesData.videos.results[0].key}`)
    $sampleMediaVd.find("img.vd-thumb").attr("src", `https://i.ytimg.com/vi/${seriesData.videos.results[0].key}/mqdefault.jpg`)
    $(".series-media").append($sampleMediaVd.clone())
  }


  // Add Cast Info to the "Cast" line
  let $sampleCastItem = $($("#sampleCastItem").html());
  cast = seriesData.credits.cast.slice();
  let selectedCast = cast.filter(person => person.order <= 6)
  $.each(selectedCast, (index, person) => {
    let originalProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/original${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let thumbnailProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/w92${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let name = person.name;
    let character = person.character;

    $sampleCastItem.find(".person .info a.media-img").attr("href", originalProfilePic)
    $sampleCastItem.find(".person .info a.media-img img").attr("src", thumbnailProfilePic)
    $sampleCastItem.find(".person .info p").text(name)
    $sampleCastItem.find(".person .role").text(character)

    $(".series-cast").append($sampleCastItem.clone())
  })

  // Add to the "User Reviews" line
  let $sampleReview = $($("#sampleReviewItem").html());
  let reviewsArr = seriesData.reviews.results;
  for (let index = 0; index < reviewsArr.length && index < 3; index++) {
    $sampleReview.find(".review-author").text(`By ${reviewsArr[index].author}`)
    $sampleReview.find(".review-content").text(`${reviewsArr[index].content}`)
    $(".series-reviews").append($sampleReview.clone())
  }

  // To create release date string in format: April 30, 2008
  var monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  var date = new Date(seriesData.first_air_date);
  var dateStr = monthName[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

  $("p.release-date").text(dateStr);

  // episode runtime - How long each episode is
  let episode_runtime = seriesData.episode_run_time[0];
  $("p.runtime").text(`${episode_runtime} minutes`);

  // Total No of Seasons and episodes Released
  $(".total-seasons-number").text(seriesData.number_of_seasons)
  $(".total-episodes-number").text(seriesData.number_of_episodes)

  // Show series creators names
  let creatorsNamesArr = seriesData.created_by.slice();
  let creatorsNames = commaSeparatedNames(creatorsNamesArr)
  $("p.creators").text(creatorsNames)

  // Show series directors names
  crew = seriesData.credits.crew.slice();
  let directorInfo = crew.filter(person => person.job === "Director")
  let directorNames = commaSeparatedNames(directorInfo)
  $("p.directors").text(directorNames)

  // Show series writers names
  crew = seriesData.credits.crew.slice();
  let writersInfo = crew.filter(person => person.department === "Writing")
  let writersNames = commaSeparatedNames(writersInfo)
  $("p.writers").text(writersNames)

  // Create series genres string for eg. "action, comedy, drama"
  let genres = commaSeparatedNames(seriesData.genres);
  $("p.genre").text(genres)

  // $("#imdb_button")[0].href = `http://imdb.com/title/${seriesData.imdb_id}`;

  // Add to favourites series list
  // Set series ID as data attribute on the button (to be reused later)
  $(".toggle-favourites-btn").data("title_type", "tv");
  $(".toggle-favourites-btn").data("titleID", seriesData.id);
  $(".toggle-favourites-btn").on('click', { event: event }, toggleFavourite)

  // Set whether already favourite or not
  let localFavourites = JSON.parse(localStorage.getItem("user_favourites"))
  if (localFavourites && localFavourites.length !== 0) {
    let favouritesIndex = localFavourites.findIndex(i => i.tv === seriesData.id)
    if (favouritesIndex !== -1) {   // If series is found in favourites array then,
      $(".toggle-favourites-btn i", "div.btn-container").css("color", "var(--primary)");
    }
  }

  // Add to watched series list
  // Set series ID as data attribute on the button (to be reused later)
  $(".toggle-watched-btn").data("title_type", "tv");
  $(".toggle-watched-btn").data("titleID", seriesData.id);
  $(".toggle-watched-btn", "div.series_info").on('click', { event: event }, toggleWatched)

  // Set whether already watched or not
  let localWatched = JSON.parse(localStorage.getItem("user_watched"))
  if (localWatched && localWatched.length !== 0) {
    let watchedIndex = localWatched.findIndex(j => j.tv === seriesData.id)
    if (watchedIndex !== -1) {
      $(".toggle-watched-btn i", "div.main-content").css("color", "#f5b50a");
    }
  }

  $(".series-name").text(`${seriesData.title ? seriesData.title : seriesData.name}`)

  showReviews(seriesData.reviews.results.slice())

  showCredits(seriesData.credits)

  showMediaInfo(seriesData)

  showRecommendations(seriesData)

  // Show whole review on read-more-btn click
  $("button.read-more-btn").on("click", function () {
    if ($(this).text("Read more")) {
      $(this).text("Read less")
    } else {
      $(this).text("Read more")
    }
    $(this).closest(".user-review").find(".review-content").toggleClass("hide-extra-lines")
  })
}

async function toggleFavourite(event) {
  if (netlifyIdentity.currentUser() === null) {
    console.log("User not logged in");
    return false;
  }
  let title_type = $(this).data("title_type"), titleID = $(this).data("titleID");
  console.log(title_type);
  console.log(titleID);

  // Get favourites from localstorage
  let localFavourites = JSON.parse(localStorage.getItem("user_favourites"))

  // search for given title ID in localstorage
  let title_local_index
  if (title_type === "tv") {
    title_local_index = localFavourites.findIndex(fav => fav.tv === titleID)
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
        $(".toggle-favourites-btn").find("i").css("color", "inherit");
        $(".toggle-favourites-btn").find("span").text("Add to Favourites");
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
        $(".toggle-favourites-btn").find("i").css("color", "var(--primary)");
        $(".toggle-favourites-btn").find("span").css("Added to Favourites");
      })

      .catch(error => { console.log('Error:'); console.error(error); });

    localFavourites.push({ [title_type]: titleID })

    localStorage.setItem("user_favourites", JSON.stringify(localFavourites));
  }
}

async function toggleWatched(event) {
  if (netlifyIdentity.currentUser() === null) {
    console.log("User not logged in");
    return false;
  }

  let title_type = $(this).data("title_type"), titleID = $(this).data("titleID");
  console.log(title_type);
  console.log(titleID);

  // Get favourites from localstorage
  let watchedList = JSON.parse(localStorage.getItem("user_watched"))

  // search for given title ID in localstorage
  let title_local_index
  if (title_type === "tv") {
    title_local_index = watchedList.findIndex(fav => fav.tv === titleID)
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
        $(".toggle-watched-btn").find("i").css("color", "inherit");
        $(".toggle-watched-btn").find("span").text("Add to Watchedlist");
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
        $(".toggle-watched-btn").find("i").css("color", "#f5b50a");
        $(".toggle-watched-btn").find("span").text("Added to Watchedlist");
      })

      .catch(error => { console.log('Error:'); console.error(error); });

    watchedList.push({ [title_type]: titleID })

    localStorage.setItem("user_watched", JSON.stringify(watchedList));
  }
}

function showReviews(reviewsArr) {
  let $sampleReview = $($("#sampleReviewItem").html());

  $.each(reviewsArr, (index, review) => {
    $sampleReview.find(".review-author").text(`By ${review.author}`)
    $sampleReview.find(".review-content").text(`${review.content}`)

    $(".reviews-container").append($sampleReview.clone())
  })
}

function showCredits(creditsArr) {
  let $sampleCastItem = $($("#sampleCastItem").html());

  $.each(creditsArr.cast, (index, person) => {
    let originalProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/original${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let thumbnailProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/w92${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let name = person.name;
    let character = person.character;

    $sampleCastItem.find(".person .info a.media-img").attr("href", originalProfilePic)
    $sampleCastItem.find(".person .info a.media-img img").attr("src", thumbnailProfilePic)
    $sampleCastItem.find(".person .info p").text(name)
    $sampleCastItem.find(".person .role").text(character)

    if (index >= 6) {
      $(".extra-cast").append($sampleCastItem.clone())
    } else {
      $(".start-cast").append($sampleCastItem.clone())
    }
  })

  let crewArrCopy = creditsArr.crew.slice()

  let selectedCrew = crewArrCopy.filter(person => person.department === "Directing")
  $.each(selectedCrew, (index, person) => {
    let originalProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/original${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let thumbnailProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/w92${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let name = person.name;
    let job = person.job;

    $sampleCastItem.find(".person .info a.media-img").attr("href", originalProfilePic)
    $sampleCastItem.find(".person .info a.media-img img").attr("src", thumbnailProfilePic)
    $sampleCastItem.find(".person .info p").text(name)
    $sampleCastItem.find(".person .role").text(job)

    if ($(".start-crew .cast-info").length >= 6) {
      $(".extra-crew").append($sampleCastItem.clone())
    } else {
      $(".start-crew").append($sampleCastItem.clone())
    }
  })

  selectedCrew = crewArrCopy.filter(person => person.department === "Production")
  $.each(selectedCrew, (index, person) => {
    let originalProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/original${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let thumbnailProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/w92${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let name = person.name;
    let job = person.job;

    $sampleCastItem.find(".person .info a.media-img").attr("href", originalProfilePic)
    $sampleCastItem.find(".person .info a.media-img img").attr("src", thumbnailProfilePic)
    $sampleCastItem.find(".person .info p").text(name)
    $sampleCastItem.find(".person .role").text(job)

    if ($(".start-crew .cast-info").length >= 6) {
      $(".extra-crew").append($sampleCastItem.clone())
    } else {
      $(".start-crew").append($sampleCastItem.clone())
    }
  })

  selectedCrew = crewArrCopy.filter(person => person.department === "Writing")
  $.each(selectedCrew, (index, person) => {
    let originalProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/original${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let thumbnailProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/w92${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let name = person.name;
    let job = person.job;

    $sampleCastItem.find(".person .info a.media-img").attr("href", originalProfilePic)
    $sampleCastItem.find(".person .info a.media-img img").attr("src", thumbnailProfilePic)
    $sampleCastItem.find(".person .info p").text(name)
    $sampleCastItem.find(".person .role").text(job)

    if ($(".start-crew .cast-info").length >= 6) {
      $(".extra-crew").append($sampleCastItem.clone())
    } else {
      $(".start-crew").append($sampleCastItem.clone())
    }
  })

  $(".view-more-cast-btn").on("click", function () {
    if ($(this).text() === "View More") {
      $(this).text("View Less")
    } else {
      $(this).text("View More")
    }
    $(this).parent().find("div[class^='extra']").toggleClass("d-none")
  })
}

function showMediaInfo(seriesData) {
  let $sampleMediaVd = $($("#sampleMediaVd").html());

  $.each(seriesData.videos.results, (index, yt_video) => {
    $sampleMediaVd.find("a").attr("href", `https://www.youtube.com/embed/${yt_video.key}`)
    $sampleMediaVd.find("img.vd-thumb").attr("src", `https://i.ytimg.com/vi/${yt_video.key}/mqdefault.jpg`)

    if (yt_video.type === "Trailer") {
      if (!($(".trailer-container .vd-item").length > 0)) {
        $(".trailer-container").append(`<h5>Trailers: </h5>`)
      }
      $(".trailer-container").append($sampleMediaVd.clone())
    } else if (yt_video.type === "Teaser") {
      if (!($(".teaser-container .vd-item").length > 0)) {
        $(".teaser-container").append(`<h5>Teasers: </h5>`)
      }
      $($sampleMediaVd).find("a.media-vd").attr("title", `${yt_video.name}`)
      $(".teaser-container").append($sampleMediaVd.clone())
    }
  })

  let $sampleMediaImg = $($("#sampleMediaImg").html());
  $.each(seriesData.images.backdrops, (index, backdropImg) => {
    $sampleMediaImg.find("a").attr("href", `https://image.tmdb.org/t/p/original${backdropImg.file_path}`)
    $sampleMediaImg.find("img").attr("src", `https://image.tmdb.org/t/p/w300${backdropImg.file_path}`)

    $sampleMediaImg.find("img").attr("width", "300px")   // Specify width and height for performant lazy loading
    $sampleMediaImg.find("img").attr("height", "169px")

    if (!($(".backdrops-container .media-img").length > 0)) {
      $(".backdrops-container").append(`<h5>Backdrop images: </h5>`)
    }

    $(".backdrops-container").append($sampleMediaImg.clone())
  })

  $.each(seriesData.images.posters, (index, posterImg) => {
    $sampleMediaImg.find("a").attr("href", `https://image.tmdb.org/t/p/original${posterImg.file_path}`)
    $sampleMediaImg.find("img").attr("src", `https://image.tmdb.org/t/p/w154${posterImg.file_path}`)

    $sampleMediaImg.find("img").attr("width", "154px")   // Specify width and height for performant lazy loading
    $sampleMediaImg.find("img").attr("height", "231px")

    if (!($(".posters-container .media-img").length > 0)) {
      $(".posters-container").append(`<h5>Posters: </h5>`)
    }

    $(".posters-container").append($($sampleMediaImg).clone())
  })

  // Initialize bootstrap tooltips
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
}

function showRecommendations(data) {
  let containerRef = "#recommendations-container";
  $.each(data.recommendations.results, (index, title) => {
    $(`${containerRef} .carousel .wrap ul`).append($("#carousel-poster-template").html())

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`)
      .attr("src", `https://image.tmdb.org/t/p/w185${title.poster_path}`)

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("tmdbid", title.id)
    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("title_type", "tv")
  })

  containerRef = "#similar-series-container";
  $.each(data.similar.results, (index, title) => {
    $(`${containerRef} .carousel .wrap ul`).append($("#carousel-poster-template").html())

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`)
      .attr("src", `https://image.tmdb.org/t/p/w185${title.poster_path}`)

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("tmdbid", title.id)
    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("title_type", "tv")
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

function openTitleInfo(tmdbid, title_type) {
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