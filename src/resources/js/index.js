console.log('JS is working!');

$(document).ready(() => {
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
    body: {
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

function titleSelected(id) {
  let IMDBID = JSON.stringify(id);
  sessionStorage.setItem('titleID', IMDBID);
  window.location = 'movie.html';
  return false;
}

function getTitleInfo() {
  // First get the stored/selected title IMDB ID
  let title = JSON.parse(sessionStorage.getItem('titleID'));

  $.ajax({
    url: "/.netlify/functions/get-title-info",
    type: "POST",
    headers: {
      id: title
    }
  })
    .then(info => {
      console.log('Title response: ', info);
      showTitleInfo(info);
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

function addToFavourites(id) {

  let user = netlifyIdentity.currentUser();
  if (!user) {
    alert("You need to log-in first!");
    return false;
  }
  let token = user.token.access_token;

  // Make request to function to add id to user's favourites
  $.ajax({
    url: "/.netlify/functions/add-favourites",
    type: "POST",
    headers: {
      imdb: id,
      Authorization: `Bearer ${token}`
    }
  })

    .then(response => {
      // If successfully added title to favourites, then reflect success message in HTML
      console.log('Successfully added to favourites: ', response);
      $(`.${id}`)[0].textContent = "Favourite"
      return true;
    })

    .catch((err) => {
      console.log('Failed to add to favourites: ', err);
      return false;
    });

}

function showSearchResult(response) {

  if (response.data.total_results > 0) {
    let output = '';
    $.each(results, (index, movie) => {
      if (movie.poster_path !== "N/A" || movie.poster_path !== null || movie.poster_path !== undefined) {
        output += `
          <div class="col-md-3">
            <div class="well text-center">
              <img src="http://image.tmdb.org/t/p${movie.poster_path}" class="img-fluid">
              <h5>${movie.title || movie.original_title}</h5>
              <a onclick="titleSelected('${movie.imdbID}')" class="btn btn-primary" href="#">Movie Details</a>
              <a onclick="addToFavourites('${movie.imdbID}')" class="btn btn-info ${movie.imdbID}"  id="fav-btn" href="#">Add favourites</a>
            </div>
          </div>
        `;
      }
    });

    $('#movies').html(output);
  }
}

function showTitleInfo(movie) {
  // Show received info to user
  if (movie) {
    let output = `
        <div class="row">
          <div class="col-md-4">
            <img src="${movie.Poster}" class="thumbnail">
          </div>
          <div class="col-md-8">
            <h2>${movie.Title}</h2>
            <ul class="list-group">
              <li class="list-group-item"><strong>Genre:</strong> ${movie.Genre}</li>
              <li class="list-group-item"><strong>Released:</strong> ${movie.Released}</li>
              <li class="list-group-item"><strong>Rated:</strong> ${movie.Rated}</li>
              <li class="list-group-item"><strong>IMDB Rating:</strong> ${movie.imdbRating}</li>
              <li class="list-group-item"><strong>Director:</strong> ${movie.Director}</li>
              <li class="list-group-item"><strong>Writer:</strong> ${movie.Writer}</li>
              <li class="list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>
            </ul>
          </div>
        </div>
        <div class="row">
          <div class="well">
            <h3>Plot</h3>
            ${movie.Plot}
            <hr>
            <a href="http://imdb.com/title/${movie.imdbID}" target="_blank" class="btn btn-primary">View IMDB</a>
            <a href="index.html" class="btn btn-default">Go Back To Search</a>
          </div>
        </div>
      `;

    $('#movie').html(output);
  }
}