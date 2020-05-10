$(document).ready(() => {
   // Add event listener to search on pressing any key
   // Delay and search only once per 750ms
   $("#searchText").on('keyup', event => delay(partialSearch, 750)(event));

   // Add event listener to search on pressing Enter key
   $("#searchForm").on('submit', event => fullSearch(event));

   // Add event listener to search on pressing search button
   $("#search-btn").on('click', event => fullSearch(event));

   // search result posters, open title info page on click
   $("#search-box").on("click", "button.view-more-info__btn, #partial-info li", function (event) {
      let tmdbid = $(this).data("tmdbid")
      let title_type = $(this).data("title_type")
      openMovieInfo(tmdbid, title_type)
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

   loadAllCarousel()

});
// JQuery OnReady Close

$(document).ready(() => {
   $("#search-box > .col").mouseenter(() => {
      $(".fancy_search_container").addClass("open")
   })

   $("#search-box > .col").mouseleave(() => {
      $(".fancy_search_container").removeClass("open")
      $("#partial-search-result").css("display", "none")
   })

   $(".fancy_search_container").on("click", ".search", function (event) {
      if ($(event.currentTarget.parentElement).hasClass("open")) {
         $("#searchText").val("")   // Clear user search text
         $("#partial-search-result").css("display", "none");  // Hide any current partial search result
         $("#full-search-result").css("display", "none");  // Hide any current full search result
      }
   })
});

window.timer = 0  // Used to delay repititive keyboard searches

async function partialSearch(event) {
   let search_query = $('#searchText').val()
   let search_type = $('#searchType').val()

   if (search_query !== "") {  // Search only if user had typed something
      let response = await search_title(search_query, search_type)
      if (Array.isArray(response.results)) {
         showPartialResult(response.results)
      }
   }
}

async function fullSearch(event) {
   event.preventDefault();
   clearTimeout(window.timer)    // clear timeout for keyup search

   $("#searchText").blur()  // Lose search box focus to stop keypress events from getting triggered

   let search_query = $('#searchText').val()
   let search_type = $('#searchType').val()

   if (search_query !== "") {  // Search only if user had typed something
      let response = await search_title(search_query, search_type)
      if (Array.isArray(response.results)) {
         showFullResult(response.results)
      }
   }
}

function showPartialResult(searchResp) {
   let $sampleNode = $($('#partialSample').html());
   $('#partial-info .list-group').html("");     // Remove old search result

   if (searchResp.length > 0) {
      $.each(searchResp, (index, item) => {
         if (item.media_type !== "person") {    // Show info only if result is not of a person/actor
            let id = item.id;
            let name = item.title || item.name || "";
            let releaseDate = `(${new Date(item.release_date || item.first_air_date).getFullYear()})` || "";
            let rating = (item.vote_average && item.vote_average > 0) ? `${item.vote_average}/10` : "";
            let mediaType = item.media_type || $("#searchType").val();

            $sampleNode.find(".movie-title").text(name);
            $sampleNode.find(".movie-release-year").text(releaseDate);
            $sampleNode.find(".movie-rating").text(rating);
            $("#partial-info .list-group").append($sampleNode.clone()); // Append edited sample node

            $(`#partial-info .list-group li:nth-child(${index + 1})`).data("tmdbid", id);
            $(`#partial-info .list-group li:nth-child(${index + 1})`).data("title_type", mediaType);
            $(`#partial-info .list-group li:nth-child(${index + 1})`).on('click', { event: event }, toggleFavourite)
         }
      });
   } else {
      $sampleNode.html("No result found!");
      $("#partial-info .list-group").html($sampleNode); // Append edited sample node
      $("#partial-info .list-group li").css("color", "var(--dark)");
   }

   $("#full-search-result").css("display", "none");
   $("#partial-search-result").css("display", "block");
}

function showFullResult(searchResp) {
   let $sampleNode = $($('#fullSample').html());
   $('#full-info').html(""); // Remove old search result

   if (searchResp.length > 0) {
      $.each(searchResp, (index, item) => {
         if (item.media_type !== "person") { // Show info only if result is not of a person/actor
            let id = item.id;
            let mediaType = item.media_type || $("#searchType").val();
            let posterImg = item.poster_path;
            let backdropImg = item.backdrop_path;
            let name = item.title || item.name;
            let releaseDate = `(${new Date(item.release_date || item.first_air_date).getFullYear()})` || ""
            let rating = `${item.vote_average}` || "Unavailable";
            
            let localFavourites = JSON.parse(localStorage.getItem("user_favourites")) || []
            let localWatched = JSON.parse(localStorage.getItem("user_watched")) || []

            $sampleNode.find(".poster").css({
               "background-image": `url(
                  https://image.tmdb.org/t/p/w300${posterImg}
               )`
            });

            $sampleNode.find("header").css({
               "background-image": `url(
                  https://image.tmdb.org/t/p/w300${backdropImg}
               )`
            });

            $sampleNode.find(".info .name").text(name);

            $sampleNode.find(".info .year").text(releaseDate)

            $sampleNode.find(".info .rating").text(rating);

            // Set whether already favourite or not      
            let favouritesIndex = localFavourites.findIndex(i => i.movie === id);
            let watchedIndex = localWatched.findIndex(i => i.movie === id);
            if (favouritesIndex !== -1) {
               $sampleNode.find("button.toggle-favourites-btn i").css("color", "var(--primary)");
            }
            if (watchedIndex !== -1) {
               $sampleNode.find("button.toggle-watched-btn i").css("color", "#f5b50a");
            }

            $("#full-info").append($sampleNode.clone()); // Append edited sample node

            // Set id and type to use later for opening full title info page
            $(`#full-info > li:nth-child(${index + 1}) button.view-more-info__btn`).data("tmdbid", `${id}`);
            $(`#full-info > li:nth-child(${index + 1}) button.view-more-info__btn`).data("title_type", `${mediaType}`);

            // Set movie ID as data attribute on the button (to be reused later)
            $(".toggle-watched-btn, .toggle-favourites-btn",
               `#full-info > li:nth-child(${index + 1})`).data("title_type", mediaType);
            $(".toggle-watched-btn, .toggle-favourites-btn",
               `#full-info > li:nth-child(${index + 1})`).data("titleID", id);
            $("button.toggle-favourites-btn",
               `#full-info > li:nth-child(${index + 1})`).on('click', { event: event }, toggleFavourite)
            $("button.toggle-watched-btn",
               `#full-info > li:nth-child(${index + 1})`).on('click', { event: event }, toggleWatched)
         }
      });

   } else {
      $sampleNode.html("No result found!");
      $("#full-info").html($sampleNode); // Append edited sample node
   }

   $("#partial-search-result").css("display", "none");
   $("#full-search-result").css("display", "block");
}

async function toggleFavourite(event) {
   let title_type = $(this).data("title_type"), titleID = $(this).data("titleID");

   // Get favourites from localstorage
   let localFavourites = JSON.parse(localStorage.getItem("user_favourites")) || []

   // search for given title ID in localstorage
   let title_local_index = (title_type === "movie") ? localFavourites.findIndex(fav => fav.movie === titleID) : -1;

   // Remove from favourites, if it is already favourite
   if (title_local_index > -1) {
      firestore(title_type, titleID, "remove", "favourites")
         .then(res => {
            $(this).find("i").css("color", "inherit");
            localFavourites.splice(title_local_index, 1);
            localStorage.setItem("user_favourites", JSON.stringify(localFavourites));
         })
         .catch(error => console.error('Error:', error));

   } else {
      firestore(title_type, titleID, "add", "favourites")
         .then(res => {
            $(this).find("i").css("color", "var(--primary)");
            localFavourites.push({ [title_type]: titleID })
            localStorage.setItem("user_favourites", JSON.stringify(localFavourites));
         })
         .catch(error => { console.log('Error:'); console.error(error); });
   }
}

async function toggleWatched(event) {
   let title_type = $(this).data("title_type"), titleID = $(this).data("titleID");

   // Get favourites from localstorage
   let watchedList = JSON.parse(localStorage.getItem("user_watched"))

   // search for given title ID in localstorage
   let title_local_index = (title_type === "movie") ? watchedList.findIndex(fav => fav.movie === titleID) : -1;

   // Remove from watched list, if it is already watched
   if (title_local_index > -1) {
      firestore(title_type, titleID, "remove", "watchedlist")
         .then(res => {
            $(this).find("i").css("color", "inherit");
            watchedList.splice(title_local_index, 1);
            localStorage.setItem("user_watched", JSON.stringify(watchedList));
         })
         .catch(error => { console.log('Error:'); console.error(error); });

   } else {
      firestore(title_type, titleID, "add", "watchedlist")
         .then(res => {
            console.log(res);

            $(this).find("i").css("color", "#f5b50a");
            watchedList.push({ [title_type]: titleID });
            localStorage.setItem("user_watched", JSON.stringify(watchedList));
         })
         .catch(error => { console.log('Error:'); console.error(error); });
   }
}

async function loadAllCarousel() {
   get_tmdb_list("movie", "", true, "week")
      .then(response => carouselLoader(response.results, "#trending-movies-carousel > .carousel-container", "movie"))

   get_tmdb_list("tv", "", true, "week")
      .then(response => carouselLoader(response.results, "#trending-series-carousel > .carousel-container", "tv"))

   get_tmdb_list("movie", "top_rated")
      .then(response => carouselLoader(response.results, "#rated-movies-carousel > .carousel-container", "movie"))
}

function carouselLoader(data, containerRef, title_type) {
   $.each(data, (index, title) => {
      $(containerRef + " .carousel .wrap ul").append($("#carousel-poster-template").html())

      $(`${containerRef} .carousel .wrap ul > li:last-child > img`)
         .attr("src", `https://image.tmdb.org/t/p/w185${title.poster_path}`)

      $(`${containerRef} .carousel .wrap ul > li:last-child > img`).data("tmdbid", title.id)
      $(`${containerRef} .carousel .wrap ul > li:last-child > img`).data("title_type", title_type)
   })

   $(containerRef).parent().removeClass("d-none")
}

async function search_title(query, type, page = 1) {
   return fetch(`/.netlify/functions/search-title?query=${query}&type=${type}&page=${page}`)
      .then(res => res.json())
      .catch(error => console.log(error))
}

async function get_tmdb_list(mediaType, listType, isTrending = false, listTime = "", page = 1) {
   return fetch(`/.netlify/functions/tmdb-lists?isTrending=${isTrending}&mediaType=${mediaType}&listType=${listType}&listTime=${listTime}&page=${page}`)
      .then(res => res.json())
      .catch(error => console.log(error))
}

function delay(fn, ms) {
   return function (...args) {
      clearTimeout(window.timer)
      window.timer = setTimeout(fn.bind(this, ...args), ms || 0)
   }
}