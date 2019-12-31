console.log('JS is working!');

$(document).ready(function () {
    $("button").click(function () {
        $.ajax({
            url: "/.netlify/functions/token-hider"
        }).done(response => handleData(response))

    });

    function handleData(data) {
        $(".title")[0].innerHTML = data.Title
        $(".year")[0].innerHTML = data.Year
        $(".rated")[0].innerHTML = data.Rated
        $(".imdbRating")[0].innerHTML = data.imdbRating
        $(".imdbVotes")[0].innerHTML = data.imdbVotes
        $(".poster")[0].innerHTML = `<img src='${data.Poster}'>`
        $(".genre")[0].innerHTML = data.Genre
        $(".director")[0].innerHTML = data.Director
        $(".actors")[0].innerHTML = data.Actors
        $(".plot")[0].innerHTML = data.Plot
        $(".runtime")[0].innerHTML = data.Runtime
        $(".imdbButton")[0].innerHTML = `<button type="button">` +
            `<a href='https://www.imdb.com/title/${data.imdbID}/'>` +
            `View on IMDB</a>` +
            `</button>`
    }

});
