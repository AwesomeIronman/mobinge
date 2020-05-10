scrollToTop()

$(document).ready(() => {
   particlesJS.load('particles-js', './resources/particlesjs-config.json', function () {
      console.log('callback - particles.js config loaded');
   });
   netlifyIdentity.on('login', loadUserData);
   netlifyIdentity.on('logout', removeUserData);
   // If User has logged in and data is unavailable - load user data:
   if (localStorage.getItem("user_favourites") === null ||
       localStorage.getItem("user_watched") === null &&
       netlifyIdentity.currentUser() !== null) {
      loadUserData()
   }
})

// *** Functions reusable across various pages: ***
function scrollToTop() {
   // This prevents the page from scrolling down to where it was previously.
   if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
   }
   // This is needed if the user scrolls down during page load and you want to make sure the page is scrolled to the top once it's fully loaded.
   window.scrollTo(0, 0);
}

function openMovieInfo(tmdbid, title_type) {
   // Save the info of movie/series user clicked, in browser to use it later in corresponding page
   localStorage.setItem("info_to_open", JSON.stringify(
      {
         title_type: title_type,
         tmdbid: tmdbid
      }
   ))
   if (title_type === "tv") {
      window.location.assign("/series");
   } else {
      window.location.assign("/movie");
   }
}

function commaSeparatedNames(params) {
   var genString = ""

   params.forEach(function (i, idx, array) {
      if (idx === array.length - 1) {
         genString += `${i.name}`;
      } else {
         genString += `${i.name}, `;
      }
   });
   return genString;
}

async function firestore(title_type, title_id, action, list) {
   return fetch('/.netlify/functions/firestore-data',
      {
         method: (action === "remove") ? "DELETE" : "POST",
         body: JSON.stringify({
            list: list,
            titleType: title_type,
            titleID: title_id
         }),
         headers: new Headers({
            'Authorization': `Bearer ${netlifyIdentity.currentUser().token.access_token}`
         })
      })
      .then(data => data.json())
      .catch(error => error);
}

async function fetch_title_info(tmdbid, title_type) {
   return fetch(`/.netlify/functions/title-info?title_type=${title_type}&tmdbid=${tmdbid}`)
      .then(res => res.json())
      .catch(error => console.error(error))
}

async function loadUserData() {
   fetch('/.netlify/functions/firestore-data', {
      method: 'GET',
      headers: new Headers({
         'Authorization': `Bearer ${netlifyIdentity.currentUser().token.access_token}`
      })
   })
      .then(res => res.json())

      .then(res => {
         localStorage.setItem("user_favourites",
            (Array.isArray(res.favourites)) ? JSON.stringify(res.favourites) : JSON.stringify([])
         );

         localStorage.setItem("user_watched",
            (Array.isArray(res.watched)) ? JSON.stringify(res.watchedlist) : JSON.stringify([])
         );
      })

      .catch(error => {
         console.error('Error:'); console.error(error);
      });
}

function removeUserData() {
   localStorage.setItem("user_favourites", JSON.stringify([]))
   localStorage.setItem("user_watched", JSON.stringify([]))
}