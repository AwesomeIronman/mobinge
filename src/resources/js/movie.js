$(document).ready(() => {
  let info_to_open = JSON.parse(localStorage.getItem("info_to_open"));

  if (!info_to_open || !(info_to_open.title_type === "movie")) {
    window.location.assign("/");
  }

  fetch_title_info(info_to_open.tmdbid, info_to_open.title_type)
    .then(data => showMovieInfo(data, info_to_open.title_type));

  $().fancybox({
    selector: '.media-img a:visible'
  });

  $().fancybox({
    selector: 'a.media-vd:visible'
  });

  // Add view all info listener on various buttons
  $("a.view-all").on("click", function () {
    let tab_type = $(this).attr("data-tab_type")
    $(`.info-tabs .nav li a#${tab_type}-tab`).tab('show')
  })
});
// JQuery OnReady Close


function showMovieInfo(movieData, title_type) {
  if (typeof(movieData) === "string" || movieData.constructor !== Object) {
    console.log('Received invalid data: ', movieData);
    return false;
  }

  let cast = crew = []

  let backdropImg = `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}`
  let posterImg = `https://image.tmdb.org/t/p/w300${movieData.poster_path}`

  $(".hero-image").css({ "background-image": `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backdropImg})` })
  $(".movie-poster img.card-img-top").attr("src", posterImg)

  // For "Watch Trailer" button under movie poster
  let trailerVdIndex = movieData.videos.results.findIndex(vid => vid.type === "Trailer")
  let trailerYtKey = movieData.videos.results[trailerVdIndex].key;
  if (trailerVdIndex > -1) {
    $(".trailer-btn").attr("data-fancybox", "")
    $(".trailer-btn").attr("data-src", `https://www.youtube.com/embed/${trailerYtKey}`)
    $('.trailer-btn').fancybox();
  }

  // Show movie title/name
  let movieName = movieData.title || movieData.name;
  let releaseYear = new Date(movieData.release_date).getFullYear();
  let movieRating = movieData.vote_average;
  let movieOverview = movieData.overview;

  $(".main-content > .movie-title > .name").text(movieName);
  $(".main-content > .movie-title > .year").text(releaseYear);
  $("span.rate-text").text(movieRating);  // Movie vote/rating
  $(".overview-text").text(movieOverview);   // Add the movie overview/brief info text

  // Draw the movie rating stars
  for (let i = 0; i < 10; i++) {
    if (i < Math.floor(movieData.vote_average)) {
      $(".rate-star > i").eq(i).css("color", "#f5b50a")
    }
  }

  // Add photos to the "Videos and Photos" line
  let $sampleMediaImg = $($("#sampleMovieMediaImg").html());  // JQuery object of template to use
  let postersArr = movieData.images.posters;
  for (let index = 0; index < postersArr.length && index < 3; index++) {  // Add maximum of only 3 photos to the line
    $sampleMediaImg.find("a").attr("href", `https://image.tmdb.org/t/p/original${postersArr[index].file_path}`)
    $sampleMediaImg.find("img").attr("src", `https://image.tmdb.org/t/p/w92${postersArr[index].file_path}`)
    $(".movie-media").append($sampleMediaImg.clone())
  }
  if (movieData.videos.results && movieData.videos.results.length > 0) {
    let $sampleMediaVd = $($("#sampleMovieMediaVd").html());
    $sampleMediaVd.find("a").attr("href", `https://www.youtube.com/embed/${movieData.videos.results[0].key}`)
    $sampleMediaVd.find("img.vd-thumb").attr("src", `https://i.ytimg.com/vi/${movieData.videos.results[0].key}/mqdefault.jpg`)
    $(".movie-media").append($sampleMediaVd.clone())
  }


  // Add Cast Info to the "Cast" line
  let $sampleCastItem = $($("#sampleCastItem").html());
  cast = movieData.credits.cast.slice();  // Make a copy of credits cast array
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

    $(".movie-cast").append($sampleCastItem.clone())
  })

  // Add to the "User Reviews" line
  let $sampleReview = $($("#sampleReviewItem").html());
  let reviewsArr = movieData.reviews.results;
  for (let index = 0; index < reviewsArr.length && index < 3; index++) {
    $sampleReview.find(".review-author").text(`By ${reviewsArr[index].author}`)
    $sampleReview.find(".review-content").text(`${reviewsArr[index].content}`)
    $(".movie-reviews").append($sampleReview.clone())
  }

  // To create release date string in format: April 30, 2008
  var monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  var date = new Date(movieData.release_date);
  var dateStr = monthName[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

  $("p.release-date").text(dateStr);

  // Movie runtime - How long movie is
  let hours = Math.floor(movieData.runtime / 60);
  let minutes = movieData.runtime % 60;
  $(".runtime").text(`${hours} hours and ${minutes} minutes`);

  // Show movie tagline
  let tagline = movieData.tagline;
  $(".tagline").text(tagline)

  // Show movie directors names
  crew = movieData.credits.crew.slice();
  let directorInfo = crew.filter(person => person.job === "Director")
  let directorNames = commaSeparatedNames(directorInfo)
  $("p.directors").text(directorNames)

  // Show movie writers names
  crew = movieData.credits.crew.slice();
  let writersInfo = crew.filter(person => person.department === "Writing")
  let writersNames = commaSeparatedNames(writersInfo)
  $("p.writers").text(writersNames)

  // Create movies genres string for eg. "action, comedy, drama"
  let genres = commaSeparatedNames(movieData.genres);
  $("p.genre").text(genres)

  // Set title ID and type as data attribute on watchelist and add-to-favourite button
  $(".toggle-favourites-btn, .toggle-watched-btn").data("title_type", title_type);
  $(".toggle-favourites-btn, .toggle-watched-btn").data("titleID", movieData.id);

  $(".toggle-favourites-btn", "div.movie_info").on('click', { event: event }, toggleFavourite)
  $(".toggle-watched-btn", "div.movie_info").on('click', { event: event }, toggleWatched)

  // Set whether already favourite or not
  let localFavourites = JSON.parse(localStorage.getItem("user_favourites"))
  if (localFavourites && localFavourites.length !== 0) {
    let favouritesIndex = localFavourites.findIndex(i => i.movie === movieData.id)
    if (favouritesIndex !== -1) {   // If movie/series is found in favourites array then,
      $(".toggle-favourites-btn i", "div.btn-container").css("color", "var(--primary)");
    }
  }

  // Set whether already watched or not
  let localWatched = JSON.parse(localStorage.getItem("user_watched"))
  if (localWatched && localWatched.length !== 0) {
    let watchedIndex = localWatched.findIndex(j => j.movie === movieData.id)
    if (watchedIndex !== -1) {   // If movie/series is found in favourites array then,
      $(".toggle-watched-btn i", "div.main-content").css("color", "#f5b50a");
    }
  }

  $(".movie-name").text(`${movieData.title || movieData.name}`)

  showReviews(movieData.reviews.results.slice())

  showCredits(movieData.credits)

  showMediaInfo(movieData)

  showRecommendations(movieData)

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

  // Get favourites from localstorage
  let localFavourites = JSON.parse(localStorage.getItem("user_favourites"))

  // search for given title ID in localstorage
  let title_local_index = -1;
  if (title_type === "movie") {
    title_local_index = localFavourites.findIndex(fav => fav.movie === titleID)
  } else {
    title_local_index = localFavourites.findIndex(fav => fav.tv === titleID)
  }

  // Remove from favourites, if it is already favourite
  if (title_local_index > -1) {
    firestore(title_type, titleID, "remove", "favourites")

      .then(res => {
        $(".toggle-favourites-btn").find("i").css("color", "inherit");
        $(".toggle-favourites-btn").find("span").text("Add to Favourites");
        localFavourites.splice(title_local_index, 1);
        localStorage.setItem("user_favourites", JSON.stringify(localFavourites));
      })

      .catch(error => { console.error('Error:', error); });

  } else {
    firestore(title_type, titleID, "add", "favourites")

      .then(res => {
        $(".toggle-favourites-btn").find("i").css("color", "var(--primary)");
        $(".toggle-favourites-btn").find("span").css("Added to Favourites");
        localFavourites.push({ [title_type]: titleID })
        localStorage.setItem("user_favourites", JSON.stringify(localFavourites));
      })

      .catch(error => { console.log('Error:'); console.error(error); });
  }
}

async function toggleWatched(event) {
  if (netlifyIdentity.currentUser() === null) {
    console.log("User not logged in");
    return false;
  }
  let title_type = $(this).data("title_type"), titleID = $(this).data("titleID");

  let watchedList = JSON.parse(localStorage.getItem("user_watched"))

  let title_local_index = -1;
  if (title_type === "movie") {
    title_local_index = watchedList.findIndex(fav => fav.movie === titleID)
  } else {
    title_local_index = watchedList.findIndex(fav => fav.tv === titleID)
  }

  // Remove from watched list, if it is already watched
  if (title_local_index > -1) {
    firestore(title_type, titleID, "remove", "watchedlist")

      .then(res => {
        $(".toggle-watched-btn").find("i").css("color", "inherit");
        $(".toggle-watched-btn").find("span").text("Add to Watchedlist");
        watchedList.splice(title_local_index, 1);
        localStorage.setItem("user_watched", JSON.stringify(watchedList));
      })

      .catch(error => { console.error('Error:', error); });

  } else {
    firestore(title_type, titleID, "add", "watchedlist")

      .then(res => {
        $(".toggle-watched-btn").find("i").css("color", "#f5b50a");
        $(".toggle-watched-btn").find("span").text("Added to Watchedlist");
        watchedList.push({ [title_type]: titleID })
        localStorage.setItem("user_watched", JSON.stringify(watchedList));
      })

      .catch(error => { console.log('Error:'); console.error(error); });
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

  let crewArrCopy = creditsArr.crew.slice();

  let selectedCrew = crewArrCopy.filter(person => person.department === "Directing");
  appendCrew(selectedCrew, $sampleCastItem);
  
  selectedCrew = crewArrCopy.filter(person => person.department === "Production");
  appendCrew(selectedCrew, $sampleCastItem);
  
  selectedCrew = crewArrCopy.filter(person => person.department === "Writing");
  appendCrew(selectedCrew, $sampleCastItem);

  $(".view-more-cast-btn").on("click", function () {
    if ($(this).text() === "View More") {
      $(this).text("View Less")
    } else {
      $(this).text("View More")
    }
    $(this).parent().find("div[class^='extra']").toggleClass("d-none")
  })
}

function showMediaInfo(movieData) {
  let $sampleMediaVd = $($("#sampleMediaVd").html());

  $.each(movieData.videos.results, (index, yt_video) => {
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
  $.each(movieData.images.backdrops, (index, backdropImg) => {
    $sampleMediaImg.find("a").attr("href", `https://image.tmdb.org/t/p/original${backdropImg.file_path}`)
    $sampleMediaImg.find("img").attr("src", `https://image.tmdb.org/t/p/w300${backdropImg.file_path}`)

    $sampleMediaImg.find("img").attr("width", "300px")   // Specify width and height for performant lazy loading
    $sampleMediaImg.find("img").attr("height", "169px")

    if (!($(".backdrops-container .media-img").length > 0)) {
      $(".backdrops-container").append(`<h5>Backdrop images: </h5>`)
    }

    $(".backdrops-container").append($sampleMediaImg.clone())
  })

  $.each(movieData.images.posters, (index, posterImg) => {
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
  populateCarousel(data.recommendations.results, "movie", containerRef)

  containerRef = "#similar-movies-container";
  populateCarousel(data.similar.results, "movie", containerRef)
  
  addCarouselClickListener();
}

function populateCarousel(data, title_type, containerRef) {
  $.each(data, (index, title) => {
    let { id, poster_path } = title;
    let posterImg = "https://image.tmdb.org/t/p/w185" + poster_path;

    $(`${containerRef} .carousel .wrap ul`).append($("#carousel-poster-template").html())

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).attr("src", posterImg)
    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("tmdbid", id)
    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("title_type", title_type)
  })
}

function appendCrew(crew, $sampleCrewItem) {
  $.each(crew, (index, person) => {
    let originalProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/original${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let thumbnailProfilePic = (person.profile_path !== null) ?
      `https://image.tmdb.org/t/p/w92${person.profile_path}` : `./resources/images/imageNotFound.png`;

    let name = person.name;
    let job = person.job;

    $sampleCrewItem.find(".person .info a.media-img").attr("href", originalProfilePic)
    $sampleCrewItem.find(".person .info a.media-img img").attr("src", thumbnailProfilePic)
    $sampleCrewItem.find(".person .info p").text(name)
    $sampleCrewItem.find(".person .role").text(job)

    if ($(".start-crew .cast-info").length >= 6) {
      $(".extra-crew").append($sampleCrewItem.clone())
    } else {
      $(".start-crew").append($sampleCrewItem.clone())
    }
  })
}

function addCarouselClickListener() {
  // Open title info page on carousel images click
  $(".carousel-container").on("click", "img", function () {
    let tmdbid = $(this).data("tmdbid")
    let title_type = $(this).data("title_type")
    openMovieInfo(tmdbid, title_type)
  });
}