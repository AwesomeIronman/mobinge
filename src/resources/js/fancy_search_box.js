$(document).ready(() => {
  $("#search-box > .col").mouseenter(() => {
    $(".fancy_search_container > input").addClass("open")
    $(".fancy_search_container > .search").addClass("open")
  })

  $("#search-box > .col").mouseleave(() => {
    $(".fancy_search_container > input").removeClass("open")
    $(".fancy_search_container > .search").removeClass("open")
    $("#partial-search-result").addClass("d-none")
  })
});