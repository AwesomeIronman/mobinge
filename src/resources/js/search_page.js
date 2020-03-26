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
         let tmdbid = $(this).data("tmdbid")
         let title_type = $(this).data("title_type")
         openMovieInfo(tmdbid, title_type)
      }
   });

   loadTrendingMoviesCarousel()

});
// JQuery OnReady Close

window.timer = 0
var mockData = { "page": 1, "results": [{ "id": 338762, "video": false, "vote_count": 463, "vote_average": 7.1, "title": "Bloodshot", "release_date": "2020-02-20", "original_language": "en", "original_title": "Bloodshot", "genre_ids": [28, 878], "backdrop_path": "/lP5eKh8WOcPysfELrUpGhHJGZEH.jpg", "adult": false, "overview": "After he and his wife are murdered, marine Ray Garrison is resurrected by a team of scientists. Enhanced with nanotechnology, he becomes a superhuman, biotech killing machineâ'Bloodshot'. As Ray first trains with fellow super-soldiers, he cannot recall anything from his former life. But when his memories flood back and he remembers the man that killed both him and his wife, he breaks out of the facility to get revenge, only to discover that there's more to the conspiracy than he thought.", "poster_path": "/8WUVHemHFH2ZIP6NWkwlHWsyrEL.jpg", "popularity": 508.967, "media_type": "movie" }, { "id": 495764, "video": false, "vote_count": 1862, "vote_average": 7, "title": "Birds of Prey (and the Fantabulous Emancipation of One Harley Quinn)", "release_date": "2020-02-05", "original_language": "en", "original_title": "Birds of Prey (and the Fantabulous Emancipation of One Harley Quinn)", "genre_ids": [28, 35, 80], "backdrop_path": "/pbOOOT0ASXjP4aJZr5NyOjK9qix.jpg", "adult": false, "overview": "After her breakup with the Joker, Harley Quinn joins forces with singer Black Canary, assassin Huntress, and police detective Renee Montoya to help a young girl named Cassandra, who had a hit placed on her after she stole a rare diamond from crime lord Roman Sionis.", "poster_path": "/h4VB6m0RwcicVEZvzftYZyKXs6K.jpg", "popularity": 386.416, "media_type": "movie" }, { "id": 570670, "video": false, "vote_count": 722, "vote_average": 7.1, "title": "The Invisible Man", "release_date": "2020-02-26", "original_language": "en", "original_title": "The Invisible Man", "genre_ids": [27, 878, 53], "backdrop_path": "/uZMZyvarQuXLRqf3xdpdMqzdtjb.jpg", "adult": false, "overview": "When Cecilia's abusive ex takes his own life and leaves her his fortune, she suspects his death was a hoax. As a series of coincidences turn lethal, Cecilia works to prove that she is being hunted by someone nobody can see.", "poster_path": "/4U7hpTK0XTQBKT5X60bKmJd05ha.jpg", "popularity": 290.19, "media_type": "movie" }, { "id": 508439, "video": false, "vote_count": 377, "vote_average": 7.9, "title": "Onward", "release_date": "2020-02-29", "original_language": "en", "original_title": "Onward", "genre_ids": [12, 16, 35, 14, 10751], "backdrop_path": "/xFxk4vnirOtUxpOEWgA1MCRfy6J.jpg", "adult": false, "overview": "In a suburban fantasy world, two teenage elf brothers embark on an extraordinary quest to discover if there is still a little magic left out there.", "poster_path": "/3VqDLgKLfNYSQYEGC5sjGhcPhn7.jpg", "popularity": 237.286, "media_type": "movie" }, { "id": 181812, "video": false, "vote_count": 3510, "vote_average": 6.5, "title": "Star Wars: The Rise of Skywalker", "release_date": "2019-12-18", "original_language": "en", "original_title": "Star Wars: The Rise of Skywalker", "genre_ids": [28, 12, 878], "backdrop_path": "/jOzrELAzFxtMx2I4uDGHOotdfsS.jpg", "adult": false, "overview": "The surviving Resistance faces the First Order once again as the journey of Rey, Finn and Poe Dameron continues. With the power and knowledge of generations behind them, the final battle begins.", "poster_path": "/db32LaOibwEliAmSL2jjDF6oDdj.jpg", "popularity": 225.453, "media_type": "movie" }, { "adult": false, "backdrop_path": "/hreiLoPysWG79TsyQgMzFKaOTF5.jpg", "genre_ids": [28, 12, 35, 14], "id": 512200, "original_language": "en", "original_title": "Jumanji: The Next Level", "overview": "As the gang return to Jumanji to rescue one of their own, they discover that nothing is as they expect. The players will have to brave parts unknown and unexplored in order to escape the worldâs most dangerous game.", "poster_path": "/bB42KDdfWkOvmzmYkmK58ZlCa9P.jpg", "release_date": "2019-12-04", "title": "Jumanji: The Next Level", "video": false, "vote_average": 6.8, "vote_count": 2591, "popularity": 188.325, "media_type": "movie" }, { "id": 454626, "video": false, "vote_count": 1523, "vote_average": 7.3, "title": "Sonic the Hedgehog", "release_date": "2020-02-12", "original_language": "en", "original_title": "Sonic the Hedgehog", "genre_ids": [28, 35, 878, 10751], "backdrop_path": "/stmYfCUGd8Iy6kAMBr6AmWqx8Bq.jpg", "adult": false, "overview": "Based on the global blockbuster videogame franchise from Sega, Sonic the Hedgehog tells the story of the worldâs speediest hedgehog as he embraces his new home on Earth. In this live-action adventure comedy, Sonic and his new best friend team up to defend the planet from the evil genius Dr. Robotnik and his plans for world domination.", "poster_path": "/aQvJ5WPzZgYVDrxLX4R6cLJCEaQ.jpg", "popularity": 172.042, "media_type": "movie" }, { "id": 39538, "video": false, "vote_count": 2901, "vote_average": 6.4, "title": "Contagion", "release_date": "2011-09-08", "original_language": "en", "original_title": "Contagion", "genre_ids": [18, 878, 53], "backdrop_path": "/57kqAPdVJTAJ4rnDTSVDx0f1JBu.jpg", "adult": false, "overview": "As an epidemic of a lethal airborne virus - that kills within days - rapidly grows, the worldwide medical community races to find a cure and control the panic that spreads faster than the virus itself.", "poster_path": "/kbC6I0AOSLTHFA2dieyat9h8QHP.jpg", "popularity": 167.199, "media_type": "movie" }, { "id": 330457, "video": false, "vote_count": 3226, "vote_average": 7.1, "title": "Frozen II", "release_date": "2019-11-20", "original_language": "en", "original_title": "Frozen II", "genre_ids": [12, 16, 10751], "backdrop_path": "/xJWPZIYOEFIjZpBL7SVBGnzRYXp.jpg", "adult": false, "overview": "Elsa, Anna, Kristoff and Olaf head far into the forest to learn the truth about an ancient mystery of their kingdom.", "poster_path": "/zHQFqG0e5p9Fwhv5v6XIP9fLtYk.jpg", "popularity": 144.989, "media_type": "movie" }, { "id": 546554, "video": false, "vote_count": 2987, "vote_average": 7.8, "title": "Knives Out", "release_date": "2019-11-27", "original_language": "en", "original_title": "Knives Out", "genre_ids": [35, 9648], "backdrop_path": "/cjTQSwcsfVdirSFSHNBXRGkxmWa.jpg", "adult": false, "overview": "When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Benoit Blanc is mysteriously enlisted to investigate. From Harlan's dysfunctional family to his devoted staff, Blanc sifts through a web of red herrings and self-serving lies to uncover the truth behind Harlan's untimely death.", "poster_path": "/pThyQovXQrw2m0s9x82twj48Jq4.jpg", "popularity": 135.85, "media_type": "movie" }, { "id": 475557, "video": false, "vote_count": 10353, "vote_average": 8.2, "title": "Joker", "release_date": "2019-10-02", "original_language": "en", "original_title": "Joker", "genre_ids": [80, 18, 53], "backdrop_path": "/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg", "adult": false, "overview": "During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure.", "poster_path": "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", "popularity": 132.89, "media_type": "movie" }, { "id": 514847, "video": false, "vote_count": 124, "vote_average": 6.2, "title": "The Hunt", "release_date": "2020-03-11", "original_language": "en", "original_title": "The Hunt", "genre_ids": [28, 27, 53], "backdrop_path": "/naXUDz0VGK7aaPlEpsuYW8kNVsr.jpg", "adult": false, "overview": "Twelve strangers wake up in a clearing. They don't know where they are -- or how they got there. In the shadow of a dark internet conspiracy theory, ruthless elitists gather at a remote location to hunt humans for sport. But their master plan is about to be derailed when one of the hunted, Crystal, turns the tables on her pursuers.", "poster_path": "/rmflsMjk4lxx2foNUtd1OKWv6vB.jpg", "popularity": 131.847, "media_type": "movie" }, { "id": 530915, "video": false, "vote_count": 3633, "vote_average": 8, "title": "1917", "release_date": "2019-12-25", "original_language": "en", "original_title": "1917", "genre_ids": [28, 18, 53, 10752], "backdrop_path": "/cqa3sa4c4jevgnEJwq3CMF8UfTG.jpg", "adult": false, "overview": "At the height of the First World War, two young British soldiers must cross enemy territory and deliver a message that will stop a deadly attack on hundreds of soldiers.", "poster_path": "/AuGiPiGMYMkSosOJ3BQjDEAiwtO.jpg", "popularity": 129.406, "media_type": "movie" }, { "id": 496243, "video": false, "vote_count": 5601, "vote_average": 8.5, "title": "Parasite", "release_date": "2019-05-30", "original_language": "ko", "original_title": "ê¸°ìì¶©", "genre_ids": [35, 18, 53], "backdrop_path": "/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg", "adult": false, "overview": "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.", "poster_path": "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", "popularity": 120.781, "media_type": "movie" }, { "id": 359724, "video": false, "vote_count": 2036, "vote_average": 7.8, "title": "Ford v Ferrari", "release_date": "2019-11-13", "original_language": "en", "original_title": "Ford v Ferrari", "genre_ids": [28, 18], "backdrop_path": "/n3UanIvmnBlH531pykuzNs4LbH6.jpg", "adult": false, "overview": "American car designer Carroll Shelby and the British-born driver Ken Miles work together to battle corporate interference, the laws of physics, and their own personal demons to build a revolutionary race car for Ford Motor Company and take on the dominating race cars of Enzo Ferrari at the 24 Hours of Le Mans in France in 1966.", "poster_path": "/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg", "popularity": 84.503, "media_type": "movie" }, { "id": 619264, "video": false, "vote_count": 640, "vote_average": 7.1, "title": "The Platform", "release_date": "2019-11-08", "original_language": "es", "original_title": "El hoyo", "genre_ids": [18, 27, 878, 53], "backdrop_path": "/uNiTCaBIpw4vrRGEFKFm3VSt8Sm.jpg", "adult": false, "overview": "A mysterious place, an indescribable prison, a deep hole. Two inmates living on each level. An unknown number of levels. A descending platform containing food for all of them. An inhuman fight for survival, but also an opportunity for solidarityâ¦", "poster_path": "/8ZX18L5m6rH5viSYpRnTSbb9eXh.jpg", "popularity": 75.187, "media_type": "movie" }, { "id": 581600, "video": false, "vote_count": 556, "vote_average": 6.6, "title": "Spenser Confidential", "release_date": "2020-03-06", "original_language": "en", "original_title": "Spenser Confidential", "genre_ids": [28, 35, 53], "backdrop_path": "/ftODZXaXpWtV5XFD8gS9n9KwLDr.jpg", "adult": false, "overview": "Spenser, a former Boston patrolman who just got out from prison, teams up with Hawk, an aspiring fighter, to unravel the truth behind the death of two police officers.", "poster_path": "/fePczipv6ZzDO2uoww4vTAu2Sq3.jpg", "popularity": 66.193, "media_type": "movie" }, { "id": 522627, "video": false, "vote_count": 472, "vote_average": 7.9, "title": "The Gentlemen", "release_date": "2019-12-16", "original_language": "en", "original_title": "The Gentlemen", "genre_ids": [28, 35, 80], "backdrop_path": "/9Qfawg9WT3cSbBXQgDRuWbYS9lj.jpg", "adult": false, "overview": "American expat Mickey Pearson has built a highly profitable marijuana empire in London. When word gets out that heâs looking to cash out of the business forever it triggers plots, schemes, bribery and blackmail in an attempt to steal his domain out from under him.", "poster_path": "/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg", "popularity": 61.758, "media_type": "movie" }, { "id": 627725, "video": false, "vote_count": 45, "vote_average": 7.7, "title": "The Banker", "release_date": "2020-03-06", "original_language": "en", "original_title": "The Banker", "genre_ids": [18], "backdrop_path": "/jqz8FwISQfyum47PUqgPTGtmiMk.jpg", "adult": false, "overview": "In the 1960s, two entrepreneurs hatch an ingenious business plan to fight for housing integrationâand equal access to the American Dream.", "poster_path": "/2K8Lbz0Rtl7HjbojQlrEGg6Fy4y.jpg", "popularity": 60.239, "media_type": "movie" }, { "id": 458897, "video": false, "vote_count": 811, "vote_average": 6.5, "title": "Charlie's Angels", "release_date": "2019-11-14", "original_language": "en", "original_title": "Charlie's Angels", "genre_ids": [28, 12, 35], "backdrop_path": "/a0xTB1vBxMGt6LGG4N7k1wO9lfL.jpg", "adult": false, "overview": "When a systems engineer blows the whistle on a dangerous technology, Charlie's Angels from across the globe are called into action, putting their lives on the line to protect society.", "poster_path": "/1DPUFG6QnGqzpvEaDEv7TaepycM.jpg", "popularity": 51.79, "media_type": "movie" }], "total_pages": 1000, "total_results": 20000 };

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
         return mockData;
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
      { id: `${tmdbid}` }
   ))
   if (title_type === "tv") {
      window.location.href = "/series"
   } else {
      window.location.href = "/movie"
   }
}

async function loadTrendingMoviesCarousel() {
   // Load images in carousel

   // 1. clone node
   let sample = $(".sample-carousel")[0].cloneNode(true)
   $(sample).removeClass("d-none")
   $(sample).removeClass("sample-carousel")

   // 2. get trending movies list
   getResponse({
      path: `trending/movie/week`,
      query_params: `language=en-US&region=IN&include_adult=true`
   })

      // 3. append movies poster image
      .then(resp => {
         debugger;
         $.each(resp.results, (index, movie) => {
            $(sample).find("img").attr('src', `https://image.tmdb.org/t/p/w185${movie.poster_path}`)
            $(".carousel > .wrap > ul").append(sample.outerHTML)

            $(`.carousel > .wrap > ul > li:nth-child(${index})`).find("img").data("tmdbid", movie.id)
            $(`.carousel > .wrap > ul > li:nth-child(${index})`).find("img").data("title_type", "movie")
         })

      })


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