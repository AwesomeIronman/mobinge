$(document).ready(() => {
   showFavourites();

   // Open full movie/series info page, when clicked on view-more-info button
   $("#favourites_container").on("click", "button.view-more-info__btn", function (event) {
      let tmdbid = $(this).data("tmdbid")
      let title_type = $(this).data("title_type")
      openMovieInfo(tmdbid, title_type)
   });
});
// JQuery OnReady Close

async function showFavourites() {
   let favourites = JSON.parse(localStorage.getItem("user_favourites"));
   favourites.forEach(element => {
      let data = [], isMovie = false;
      if ("movie" in element) {
         isMovie = true;
         data = fetch_title_info(element.movie, "movie")
      } else if ("tv" in element) {
         isMovie = false;
         data = fetch_title_info(element.movie, "tv")
      }
      data.then(title_data => {
         let $sampleNode = $($("#fullSample").html()); // Create a clone to edit and append each time

         let posterImg = title_data.poster_path ?
            `https://image.tmdb.org/t/p/w300${title_data.poster_path}` : "./resources/images/imageNotFound.png";
         let titleType = isMovie ? "Movie" : "Series";

         $sampleNode.find("img.img-fluid").attr("src", posterImg);
         $sampleNode.find("p.title-type").text(titleType);
         $sampleNode.find("p.title-type").css("background-color", `${isMovie ? "var(--primary)" : "#f5b50a"}`);
         $("#favourites_container").append($sampleNode.clone().get(0));

         // Set id and type to use later for opening full title info page
         $(`#favourites_container div.favourite__item:last-of-type button.view-more-info__btn`)
            .data("tmdbid", `${title_data.id}`);
         $(`#favourites_container div.favourite__item:last-of-type button.view-more-info__btn`)
            .data("title_type", `${isMovie ? "movie" : "tv"}`);
      })

   });
}