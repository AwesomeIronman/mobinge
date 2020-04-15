$(document).ready(() => {
   // Add event listener to search on pressing any key
   // Delay and search only once per 750ms
   $("#searchText").on('keyup', event => delay(partialSearch, 750)(event));

   // Add event listener to search on pressing Enter key
   $("#searchForm").on('submit', event => fullSearch(event));

   // Add event listener to search on pressing search button
   $("#search-btn").on('click', event => fullSearch(event));

   // From full search result posters, open title info page on btn click
   $("ul#full-info").on("click", ".movie", function (event) {
      var target = $(event.target);
      if (target.is("button.more_info") || target.parent().is("button.more_info")) {
         let tmdbid = $(this).find("button.more_info").data("tmdbid")
         let title_type = $(this).find("button.more_info").data("title_type")
         openMovieInfo(tmdbid, title_type)
      }
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
      $("#partial-search-result").addClass("d-none")
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
   event.preventDefault();

   let search = $('#searchText').val()
   let searchType = $('#searchType')[0].value

   if (search !== "") {  // Search only if user had typed something
      let response = await getResponse({
         path: `search/${searchType}`,
         query_params: `language=en-US&region=IN&include_adult=true&query=${search}&page=1`
      })

      if (Array.isArray(response.results)) {
         let filteredResults = filterTitles(response.results);
         showPartialResult(await filteredResults)
      } else {
         console.log(response);
      }

   }
}

async function fullSearch(event) {
   event.preventDefault();
   clearTimeout(window.timer)

   $("#searchText").blur()  // Lose search box focus to stop keypress events from getting triggered

   let search = $('#searchText').val()
   let searchType = $('#searchType')[0].value

   if (search !== "") {  // Search only if user had typed something

      let response = await getResponse({
         path: `search/${searchType}`,
         query_params: `language=en-US&region=IN&include_adult=true&query=${search}&page=1`
      })

      if (Array.isArray(response.results)) {
         let filteredResult = filterTitles(response.results);
         showFullResult(await filteredResult)
      } else {
         console.log(response);
      }
   }
}

function showPartialResult(result) {
   let sampleNode = $('#partialSample')[0].cloneNode(true); // Create a clone to edit and append each time
   sampleNode.removeAttribute("id")
   sampleNode.removeAttribute("style")

   $('#partial-info .list-group')[0].innerHTML = ""; // Remove old search result

   if (result !== undefined && result.length > 0) {
      // Show basic information of each search result
      $.each(result, (index, movie) => {
         if (movie.media_type !== "person") { // Show info only if result is not of a person/actor

            sampleNode.querySelector(".movie-title").textContent = movie.title ? movie.title : movie.name;
            sampleNode.querySelector(".movie-release-year").textContent = movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : "";
            sampleNode.querySelector(".movie-rating").textContent = movie.vote_average ? `${movie.vote_average}/10` : "";
            sampleNode.setAttribute("onclick", `openMovieInfo('${movie.id}', '${movie.media_type ? movie.media_type : $('#searchType')[0].value}')`);

            $("#partial-info .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
         }
      });

   } else {
      sampleNode.innerHTML = "No result found!";
      $(sampleNode).css("color", "var(--dark)");
      $("#partial-info .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
   }

   $("#full-search-result").css("display", "none");
   $("#partial-search-result").css("display", "block");
   $("#partial-search-result").removeClass("d-none");
}

function showFullResult(result) {
   let sampleNode = $('#fullSample')[0].cloneNode(true); // Create a clone to edit and append each time
   sampleNode.removeAttribute("id")
   sampleNode.removeAttribute("style")

   $('#full-info')[0].innerHTML = ""; // Remove old search result

   if (result !== undefined && result.length > 0) {
      // Show basic information of each search result
      $.each(result, (index, info) => {
         if (info.media_type !== "person") { // Show info only if result is not of a person/actor

            $(sampleNode).find(".scene .movie .poster").css({
               "background-image": `url(
                  https://image.tmdb.org/t/p/w300${info.poster_path}
               )`
            });

            $(sampleNode).find(".scene .movie header").css({
               "background-image": `url(
                  https://image.tmdb.org/t/p/w300${info.backdrop_path}
               )`
            });

            $(sampleNode).find(".info header h1").text(info.title ? info.title : info.name);

            $(sampleNode).find(".info header .year").text(info.release_date ? `(${new Date(info.release_date).getFullYear()})` : "");

            $(sampleNode).find(".info header .rating").text(info.vote_average ? `${info.vote_average}/10` : "");

            $("#full-info").append($(sampleNode).html()); // Append edited sample node

            // Set id and type to use later for opening full title info page
            $(`#full-info > li:nth-child(${index + 1}) button.more_info`).data("tmdbid", `${info.id}`);
            $(`#full-info > li:nth-child(${index + 1}) button.more_info`).data("title_type", `${info.media_type}`);
         }
      });

   } else {
      sampleNode.innerHTML = "No result found!";
      $("#full-info")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
   }

   $("#partial-search-result").css("display", "none");
   $("#full-search-result").css("display", "block");
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

async function loadAllCarousel() {
   getResponse({
      path: `trending/movie/week`,
      query_params: `language=en-US&region=IN&include_adult=true`
   }).then(response => carouselLoader(response.results, "#trending-movies-carousel > .carousel-container"))

   getResponse({
      path: `trending/tv/week`,
      query_params: `language=en-US&region=IN&include_adult=true`
   }).then(response => carouselLoader(response.results, "#trending-series-carousel > .carousel-container"))

   getResponse({
      path: `movie/top_rated`,
      query_params: `language=en-US&region=IN&include_adult=true`
   }).then(response => carouselLoader(response.results, "#rated-movies-carousel > .carousel-container"))
}

function carouselLoader(data, containerRef) {
   $.each(data, (index, title) => {
      $(containerRef + " .carousel .wrap ul").append($("#carousel-poster-template").html())

      $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`)
         .attr("src", `https://image.tmdb.org/t/p/w185${title.poster_path}`)

      $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("tmdbid", title.id)
      $(`${containerRef} .carousel .wrap ul > li:nth-child(${index}) > img`).data("title_type", "movie")
   })

   $(containerRef).parent().removeClass("d-none")
}

function delay(fn, ms) {

   return function (...args) {
      clearTimeout(window.timer)
      window.timer = setTimeout(fn.bind(this, ...args), ms || 0)
   }
}

function filterTitles(data) {
   // Remove regional movies
   return data.filter(movie => movie.original_language === "en" || movie.original_language === "hi")
}