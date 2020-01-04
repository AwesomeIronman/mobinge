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
    headers: {
      title: searchText,
      Authorization: `Bearer ${ netlifyIdentity.currentUser().token }`
    }
  })
    .then((response) => {
      console.log('getSearchData response: ', response);
      console.log('getSearchData response clientContext: ', response.clientContext);

      if (response.data.Search) {
        let movies = response.data.Search;
        console.log('getSearchData movies: ', movies);
        let output = '';
        $.each(movies, (index, movie) => {
          if (movie.Poster !== "N/A") {
            output += `
          <div class="col-md-3">
            <div class="well text-center">
              <img src="${movie.Poster}">
              <h5>${movie.Title}</h5>
              <a onclick="titleSelected('${movie.imdbID}')" class="btn btn-primary" href="#">Movie Details</a>
            </div>
          </div>
        `;
          }
        });

        $('#movies').html(output);
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

function titleSelected(id) {
  let IMDBID = JSON.stringify(id);
  console.debug('titleSelected IMDBID: ', IMDBID);
  sessionStorage.setItem('titleID', IMDBID);
  window.location = 'movie.html';
  return false;
}

function getTitleInfo() {
  let title = JSON.parse(sessionStorage.getItem('titleID'));
  console.debug('getTitleInfo storage title: ', title);

  $.ajax({
    url: "/.netlify/functions/get-title-info",
    type: "POST",
    headers: {
      id: title
    }
  })
    .then(movie => {
      console.log('Title response: ', movie);
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
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}