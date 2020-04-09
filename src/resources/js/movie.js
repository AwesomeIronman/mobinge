$(document).ready(() => {
  let tmdbid = JSON.parse(localStorage.getItem("info_to_open"));

  fetch_movie_info(tmdbid.id, "movie")
    .then(data => {
      console.log('Data: ', data);
      showMovieInfo(data);
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
      openMovieInfo(tmdbid, title_type)
    }
  });

  // Add view all info listener on various buttons
  $("a.view-all").on("click", function () {
    let tab_type = $(this).attr("data-tab_type")
    $(`.info-tabs .nav li a#${tab_type}-tab`).tab('show')
  })
});
// JQuery OnReady Close

async function fetch_movie_info(tmdbid, title_type) {
  return await fetch('/.netlify/functions/tmdb-data',
    {
      method: "POST",
      body: JSON.stringify({
        path: `${title_type}/${tmdbid}`,
        query_params: "language=en-US&append_to_response=videos,images,credits,reviews,recommendations,similar&include_image_language=en"
      })
    })
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

function showMovieInfo(movieData) {
  let cast = crew = []

  let backdropImg = `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}`
  let posterImg = `https://image.tmdb.org/t/p/w300${movieData.poster_path}`

  $(".hero-image").css({ "background-image": `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backdropImg})` })
  $(".movie-poster img.card-img-top").attr("src", posterImg)

  // For "Watch Trailer" button under movie poster
  let trailerVdIndex = movieData.videos.results.findIndex(vid => vid.type === "Trailer")
  let trailerYtKey = movieData.videos.results[trailerVdIndex].key;
  $(".trailer-btn").attr("data-fancybox", "")
  $(".trailer-btn").attr("data-src", `https://www.youtube.com/embed/${trailerYtKey}`)

  $('.trailer-btn').fancybox();

  // Show movie title/name
  $(".main-content > .movie-title").html(`${movieData.title ? movieData.title : movieData.name}
           <span class="text-muted">
            (${new Date(movieData.release_date).getFullYear()})
            </span>`);

  // Movie vote/rating
  $("span.rate-text").text(`${movieData.vote_average}`);

  // Draw the movie rating stars
  for (let i = 0; i < 10; i++) {
    if (i < Math.floor(movieData.vote_average)) {
      $(".rate-star > i").eq(i).css("color", "#f5b50a")
    }
  }

  // Add the movie overview/brief info text
  $(".overview-text").text(movieData.overview)

  // Add photos to the "Videos and Photos" line
  let sampleMediaImg = $("#sampleMovieMediaImg").clone();
  let postersArr = movieData.images.posters;
  $(sampleMediaImg).find("a").attr("href", `https://image.tmdb.org/t/p/original${postersArr[0].file_path}`)
  $(sampleMediaImg).find("img").attr("src", `https://image.tmdb.org/t/p/w92${postersArr[0].file_path}`)
  $(".movie-media").append($(sampleMediaImg).clone().find(".movie-media-item"))

  $(sampleMediaImg).find("a").attr("href", `https://image.tmdb.org/t/p/original${postersArr[1].file_path}`)
  $(sampleMediaImg).find("img").attr("src", `https://image.tmdb.org/t/p/w92${postersArr[1].file_path}`)
  $(".movie-media").append($(sampleMediaImg).clone().find(".movie-media-item"))

  $(sampleMediaImg).find("a").attr("href", `https://image.tmdb.org/t/p/original${postersArr[2].file_path}`)
  $(sampleMediaImg).find("img").attr("src", `https://image.tmdb.org/t/p/w92${postersArr[2].file_path}`)
  $(".movie-media").append($(sampleMediaImg).clone().find("div"))

  let sampleMediaVd = $("#sampleMovieMediaVd").clone();
  $(sampleMediaVd).find("a").attr("href", `https://www.youtube.com/embed/${movieData.videos.results[0].key}`)
  $(sampleMediaVd).find("img.vd-thumb").attr("src", `https://i.ytimg.com/vi/${movieData.videos.results[0].key}/mqdefault.jpg`)
  $(".movie-media").append($(sampleMediaVd).clone().find(".movie-media-item"))

  // Add Cast Info to the "Cast" line
  let sampleCastItem = $("#sampleCastItem").clone();
  cast = movieData.credits.cast.slice();
  let selectedCast = cast.filter(person => person.order <= 6)
  $.each(selectedCast, (index, person) => {
    $(sampleCastItem).find(".person > .info > a").attr("href", `https://image.tmdb.org/t/p/original${person.profile_path}`)
    $(sampleCastItem).find(".person > .info > a > img").attr("src", `https://image.tmdb.org/t/p/w45${person.profile_path}`)
    $(sampleCastItem).find(".person > .info > p").text(`${person.name}`)
    $(sampleCastItem).find(".person > p").text(`As ${person.character}`)

    $(".movie-cast").append($(sampleCastItem).clone().find(".cast-info"))
  })

  // Add to the "User Reviews" line
  let sampleReview = $("#sampleReviewItem").clone();
  let reviewsArr = movieData.reviews.results;
  $(sampleReview).find(".review-author").text(`By ${reviewsArr[0].author}`)
  $(sampleReview).find(".review-content").text(`${reviewsArr[0].content}`)
  $(".movie-reviews").append($(sampleReview).clone().find(".user-review"))

  $(sampleReview).find(".review-author").text(`By ${reviewsArr[1].author}`)
  $(sampleReview).find(".review-content").text(`${reviewsArr[1].content}`)
  $(".movie-reviews").append($(sampleReview).clone().find(".user-review"))

  $(sampleReview).find(".review-author").text(`By ${reviewsArr[2].author}`)
  $(sampleReview).find(".review-content").text(`${reviewsArr[2].content}`)
  $(".movie-reviews").append($(sampleReview).clone().find(".user-review"))

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

  // // Movie tagline
  // $("#movie_tagline")[0].textContent = `Tagline: ${movieData.tagline}`;

  // $("#imdb_button")[0].href = `http://imdb.com/title/${movieData.imdb_id}`;

  // Add to favourites movies list
  // Set movie ID as data attribute on the button (to be reused later)
  $(".toggle-favourites-btn").data("title_type", "movie");
  $(".toggle-favourites-btn").data("titleID", movieData.id);
  $(".toggle-favourites-btn").on('click', { event: event }, toggleFavourite)

  // Set whether already favourite or not
  let localFavourites = JSON.parse(localStorage.getItem("user_favourites"))
  let favouritesIndex = localFavourites.findIndex(i => i.movie === movieData.id)
  if (favouritesIndex !== -1) {
    $(".toggle-favourites-btn").find("i").css("color", "var(--primary)");
  }

  // Add to watched movies list
  // Set movie ID as data attribute on the button (to be reused later)
  $(".toggle-watched-btn").data("title_type", "movie");
  $(".toggle-watched-btn").data("titleID", movieData.id);
  $(".toggle-watched-btn").on('click', { event: event }, toggleWatched)

  // Set whether already watched or not
  let localWatched = JSON.parse(localStorage.getItem("user_watched"))
  let watchedIndex = localWatched.findIndex(j => j.movie === movieData.id)
  if (watchedIndex !== -1) {
    $(".toggle-watched-btn").find("i").css("color", "#f5b50a");
  }

  $(".movie-name").text(`${movieData.title ? movieData.title : movieData.name}`)

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
  let sampleReview = $("#sampleReviewItem").clone();

  $.each(reviewsArr, (index, review) => {
    $(sampleReview).find(".review-author").text(`By ${review.author}`)
    $(sampleReview).find(".review-content").text(`${review.content}`)

    $(".reviews-container").append($(sampleReview).clone().find(".user-review"))
  })
}

function showCredits(creditsArr) {
  let sampleCastItem = $("#sampleCastItem").clone();

  $.each(creditsArr.cast, (index, person) => {
    $(sampleCastItem).find(".person .info a.media-img").attr("href", `https://image.tmdb.org/t/p/original${person.profile_path}`)
    $(sampleCastItem).find(".person .info a.media-img img").attr("src", `https://image.tmdb.org/t/p/w92${person.profile_path}`)
    $(sampleCastItem).find(".person .info p").text(person.name)
    $(sampleCastItem).find(".person .role").text(person.character)

    $(".cast-container").append($(sampleCastItem).clone().find(".cast-info"))
  })

  let crewArrCopy = creditsArr.crew.slice()

  let selectedCrew = crewArrCopy.filter(person => person.department === "Directing")
  $.each(selectedCrew, (index, person) => {
    $(sampleCastItem).find(".person .info a.media-img").attr("href", `https://image.tmdb.org/t/p/original${person.profile_path}`)
    $(sampleCastItem).find(".person .info a.media-img img").attr("src", `https://image.tmdb.org/t/p/w92${person.profile_path}`)
    $(sampleCastItem).find(".person .info p").text(person.name)
    $(sampleCastItem).find(".person .role").text(person.job)

    $(".crew-container").append($(sampleCastItem).clone().find(".cast-info"))
  })

  selectedCrew = crewArrCopy.filter(person => person.department === "Production")
  $.each(selectedCrew, (index, person) => {
    $(sampleCastItem).find(".person .info a.media-img").attr("href", `https://image.tmdb.org/t/p/original${person.profile_path}`)
    $(sampleCastItem).find(".person .info a.media-img img").attr("src", `https://image.tmdb.org/t/p/w92${person.profile_path}`)
    $(sampleCastItem).find(".person .info p").text(person.name)
    $(sampleCastItem).find(".person .role").text(person.job)

    $(".crew-container").append($(sampleCastItem).clone().find(".cast-info"))
  })

  selectedCrew = crewArrCopy.filter(person => person.department === "Writing")
  $.each(selectedCrew, (index, person) => {
    $(sampleCastItem).find(".person .info a.media-img").attr("href", `https://image.tmdb.org/t/p/original${person.profile_path}`)
    $(sampleCastItem).find(".person .info a.media-img img").attr("src", `https://image.tmdb.org/t/p/w92${person.profile_path}`)
    $(sampleCastItem).find(".person .info p").text(person.name)
    $(sampleCastItem).find(".person .role").text(person.job)

    $(".crew-container").append($(sampleCastItem).clone().find(".cast-info"))
  })
}

function showMediaInfo(movieData) {
  $(".no-of-videos").text(`(${movieData.videos.results.length})`)
  $(".no-of-images").text(`(${movieData.images.backdrops.length})`)

  let sampleMediaVd = $("#sampleMediaVd").clone();
  $.each(movieData.videos.results, (index, yt_video) => {
    $(sampleMediaVd).find("a").attr("href", `https://www.youtube.com/embed/${yt_video.key}`)
    $(sampleMediaVd).find("img.vd-thumb").attr("src", `https://i.ytimg.com/vi/${yt_video.key}/mqdefault.jpg`)

    $(".media-vd-container").append($(sampleMediaVd).clone().find(".vd-item"))
  })

  let sampleMediaImg = $("#sampleMediaImg").clone();
  $.each(movieData.images.backdrops, (index, movieImg) => {
    $(sampleMediaImg).find("a").attr("href", `https://image.tmdb.org/t/p/original${movieImg.file_path}`)
    $(sampleMediaImg).find("img").attr("src", `https://image.tmdb.org/t/p/w300${movieImg.file_path}`)

    $(".media-img-container").append($(sampleMediaImg).clone().find("a"))
  })
}

function showRecommendations(data) {
  let containerRef = "#recommendations-container";
  $.each(data.recommendations.results, (index, title) => {
    $(`${containerRef} .carousel .wrap ul`).append($("#carousel-poster-template").html())

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`)
      .attr("src", `https://image.tmdb.org/t/p/w185${title.poster_path}`)

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("tmdbid", title.id)
    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("title_type", "movie")
  })

  containerRef = "#similar-movies-container";
  $.each(data.similar.results, (index, title) => {
    $(`${containerRef} .carousel .wrap ul`).append($("#carousel-poster-template").html())

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`)
      .attr("src", `https://image.tmdb.org/t/p/w185${title.poster_path}`)

    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("tmdbid", title.id)
    $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("title_type", "movie")
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
    { id: tmdbid }
  ))
  if (title_type === "tv") {
    window.location.href = "/series"
  } else {
    window.location.href = "/movie"
  }
}