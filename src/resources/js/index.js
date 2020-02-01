console.log('JS is working!');

$(document).ready(() => {

  // Add event listener to search on pressing any key
  $("#searchText").keyup(event => partialSearch(event));

  // Add event listener to search on pressing any key
  $("#searchForm").on('submit', event => fullSearch(event));

  // Add event listener to search on pressing search button
  $("#search-btn").on('click', event => fullSearch(event));

  // Add event to show upcoming movies list
  $('#btn-upcoming').on('click', (event) => {
    event.preventDefault()
    if ($("#root-div").hasClass("align-root-div")) {
      hideTopList()
    } else {

      fetch('/.netlify/functions/token-hider',
        { method: 'POST', body: 'type=upcoming' })
        .then(res => res.json())
        .then(resp => {
          console.info('Upcoming movies response: ', resp);
          handleData(resp)
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  });

  // Add event to show now-playing list
  $('#btn-now-playing').on('click', (event) => {
    event.preventDefault()
    if ($("#root-div").hasClass("align-root-div")) {
      hideTopList()
    } else {

      fetch('/.netlify/functions/token-hider',
        { method: 'POST', body: 'type=now-playing' })
        .then(res => res.json())
        .then(resp => {
          console.info('Now playing response: ', resp);
          handleData(resp)
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  });

  // Add event to show popular list
  $('#btn-popular').on('click', (event) => {
    event.preventDefault()
    if ($("#root-div").hasClass("align-root-div")) {
      hideTopList()
    } else {

      fetch('/.netlify/functions/token-hider',
        { method: 'POST', body: 'type=popular' })
        .then(res => res.json())
        .then(resp => {
          console.info('Popular response: ', resp);
          handleData(resp)
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  });

  // Add event to show trending list
  $('#btn-trending').on('click', (event) => {
    event.preventDefault()
    if ($("#root-div").hasClass("align-root-div")) {
      hideTopList()
    } else {

      fetch('/.netlify/functions/token-hider',
        { method: 'POST', body: 'type=trending' })
        .then(res => res.json())
        .then(resp => {
          console.info('Trending response: ', resp);
          handleData(resp)
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  });

});
// JQuery OnReady Close

async function getSearchData(searchText) {
  return await fetch('/.netlify/functions/token-hider',
    { method: 'POST', body: `type=search&query=${searchText}` })

    .then(res => res.json())

    .catch((err) => console.debug('debug: ', err))
}

async function partialSearch(event) {
  event.preventDefault()
  let search = $('#searchText').val()
  if (search !== "") {  // Search only if user had typed something
    let result = await getSearchData(search)

    if (Array.isArray(result)) {
      console.info('Partial search: ', result);
      
      showPartialResult(result)
    }

  }
}

async function fullSearch(event) {
  event.preventDefault()
  $("body").focus()
  $("body").select()

  let search = $('#searchText').val()

  if (search !== "") {  // Search only if user had typed something
    let result = await getSearchData(search)

    if (Array.isArray(result)) {
      console.info('Full search: ', result);

      showFullResult(result)  
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
        sampleNode.setAttribute("onclick", `getTitleInfo('${movie.id}')`);

        $("#partial-info .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
      }
    });

  } else {

    sampleNode.innerHTML = "No result found!";

    $("#partial-info .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
  }

  $("#full-search-result").css("display", "none");
  $("#partial-search-result").css("display", "block");
}

function showFullResult(result) {
  let sampleNode = $('#fullSample')[0].cloneNode(true); // Create a clone to edit and append each time
  sampleNode.removeAttribute("id")
  sampleNode.removeAttribute("style")

  $('#full-info')[0].innerHTML = ""; // Remove old search result

  if (result !== undefined && result.length > 0) {
    // Show basic information of each search result
    $.each(result, (index, movie) => {
      if (movie.media_type !== "person") { // Show info only if result is not of a person/actor

        sampleNode.querySelector(".well img.img-fluid").src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "#";
        sampleNode.querySelector(".movie-title").textContent = movie.title ? movie.title : movie.name;
        sampleNode.querySelector(".movie-release-year").textContent = movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : "";
        sampleNode.querySelector(".movie-rating").textContent = movie.vote_average ? `${movie.vote_average}/10` : "";
        sampleNode.setAttribute("onclick", `getTitleInfo('${movie.id}')`);

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


function showSearchResult(movies) {
  let sampleNode = $('#sampleNode')[0].cloneNode(true); // Create a clone to edit and append each time
  sampleNode.removeAttribute("id")
  sampleNode.removeAttribute("style")

  $('#partial-info .list-group')[0].innerHTML = ""; // Remove old search result

  if (movies.length > 0) {
    // Show basic information of each search result
    $.each(movies, (index, movie) => {
      if (movie.media_type !== "person") { // Show info only if result is not of a person/actor

        sampleNode.querySelector(".movie-poster img").src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "#";
        sampleNode.querySelector(".movie-title .movie-title-link").textContent = movie.title ? movie.title : movie.name;
        sampleNode.querySelector(".movie-title .movie-title-link").setAttribute("onclick", `getTitleInfo('${movie.id}')`);
        sampleNode.querySelector(".movie-release").textContent = movie.release_date ? movie.release_date : "UNSET";
        sampleNode.querySelector(".movie-rating").textContent = movie.vote_average ? movie.vote_average : "UNSET";

        $("#partial-info .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
      }
    });

    $("#search-info").css("display", "none"); // Do not display selected title information
    $("#partial-search-result").css("display", "block"); // Display search results

  } else {

    sampleNode.querySelector(".movie-poster img").src = "#";
    sampleNode.querySelector(".movie-title").textContent = "Type movie/series title name";
    sampleNode.querySelector(".movie-release").textContent = "";
    sampleNode.querySelector(".movie-rating").textContent = "";

    $("#partial-info .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
  }
}

function getTitleInfo(tmdbid) {

  fetch('/.netlify/functions/get-title-info',
    { method: "POST", body: `id=${tmdbid}` })

    .then(resp => resp.json())
    .then(resp => showTitleInfo(resp))

    .catch((err) => {
      console.log(err);
      return false;
    });
}


function showTitleInfo(info) {

  $("#search-info #movie .row .img-fluid")[0].src = `https://image.tmdb.org/t/p/w400${info.poster_path}`;
  $("#search-info #movie div:nth-child(2) #title-name")[0].textContent = info.title ? info.title : info.name;
  $("#search-info #movie div:nth-child(2) #title-imdb-rating")[0].textContent = info.vote_average;
  $("#search-info #movie #title-overview")[0].textContent = info.overview;
  $("#search-info #movie div.row div.well a.btn.btn-primary")[0].href = `http://imdb.com/title/${info.imdb_id}`;

  hideTopList();
  $("#search-box").css("display", "none"); // Hide search-box along with partial-search-result
  $("#full-search-result").css("display", "none"); // Hide full-search-result
  $("#search-info").css("display", "block"); // Display selected titles information
}

function populateTopList(data) {
  $("#top-list .list-group").empty();

  let sampleNode = $('#fullSample')[0].cloneNode(true); // Create a clone to edit and append each time
  sampleNode.removeAttribute("id")
  sampleNode.removeAttribute("style")

  $.each(data, (index, movie) => {
    if (movie.media_type !== "person") { // Show info only if result is not of a person/actor

      sampleNode.setAttribute("onclick", `getTitleInfo('${movie.id}')`);
      sampleNode.querySelector(".well img.img-fluid").src = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "#";
      sampleNode.querySelector(".movie-title").textContent = movie.title ? movie.title : movie.name;
      sampleNode.querySelector(".movie-release-year").textContent = movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : "";
      sampleNode.querySelector(".movie-rating").textContent = movie.vote_average ? `${movie.vote_average}/10` : "";

      $("#top-list .list-group")[0].innerHTML += sampleNode.outerHTML; // Append edited sample node
    }
  });

  $("#top-list").css("display", "block"); // Display search results
}

function hideTopList() {
  $("#top-list .list-group").empty();
  $("#root-div").removeClass("align-root-div");
  $("#top-list").css("display", "none");
}

function handleData(data) {
  $("#root-div").addClass("align-root-div");
  $("#top-list").css("display", "block");
  populateTopList(data);
}