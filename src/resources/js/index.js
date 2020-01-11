console.log('JS is working!');

$(document).ready(() => {

  // Add event listener to search on pressing enter in search box
  $('#searchForm').on('submit', (event) => {
    event.preventDefault();
    let searchText = $('#searchText').val();
    getSearchData(searchText);
  });

});

function getSearchData(searchText) {

  $.ajax({
    url: "/.netlify/functions/search-title",
    type: "POST",
    data: {
      title: searchText
    }
  })

    .then((response) => {
      console.log('getSearchData response: ', response);

      showSearchResult(response);
    })

    .catch((err) => {
      console.log(err);
      return false;
    });

}


function showSearchResult(response) {
  let movies = JSON.parse(response)
  window.custom1 = movies // Variable declared in browser window for debugging

  if (movies.length > 0) {
    let output = '';

    // Create a card/Show basic information of each search result
    $.each(movies, (index, movie) => {
      if (movie.media_type !== "person") { // Show info only if result is not of a person/actor

        output += `
          <div class="col-md-3">
            <div class="well text-center">
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="img-fluid">
              <h5>${movie.title ? movie.title : movie.name}</h5>
              <a onclick="getTitleInfo('${movie.id}')" class="btn btn-primary" href="#">Movie Details</a>
            </div>
          </div>
        `;
      }
    });
    $('#movies').html(output);
    $("#search-info").css("display", "none"); // Do not display selected title information
    $("#search-result").css("display", "block"); // Display search results
  }
}

function getTitleInfo(tmdbid) {

  $.ajax({
    url: "/.netlify/functions/get-title-info",
    type: "POST",
    data: {
      id: tmdbid
    }
  })

    .then((response) => {
      console.log('getTitleInfo response: ', response);

      showTitleInfo(response);
    })

    .catch((err) => {
      console.log(err);
      return false;
    });
}


function showTitleInfo(response) {

  let info = JSON.parse(response)
  window.custom2 = info // Variable declared in browser window for debugging

  $("#search-info #movie .row .img-fluid")[0].src = `https://image.tmdb.org/t/p/w400${info.poster_path}`;
  $("#search-info #movie div:nth-child(2) #title-name")[0].textContent = info.title ? info.title : info.name;
  $("#search-info #movie div:nth-child(2) #title-imdb-rating")[0].textContent = info.vote_average;
  $("#search-info #movie #title-overview")[0].textContent = info.overview;
  $("#search-info #movie div.row div.well a.btn.btn-primary")[0].href = `http://imdb.com/title/${info.imdb_id}`;

  $("#search-box").css("display", "none"); // Do not display search box
  $("#search-result").css("display", "none"); // Do not display search result div
  $("#search-info").css("display", "block"); // Display selected titles information
}