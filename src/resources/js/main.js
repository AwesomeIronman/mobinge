scrollToTop()

$(document).ready(() => {
   /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
   particlesJS.load('particles-js', './resources/particlesjs-config.json', function () {
      console.log('callback - particles.js config loaded');
   });
})

function scrollToTop() {
   // This prevents the page from scrolling down to where it was previously.
   if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
   }
   // This is needed if the user scrolls down during page load and you want to make sure the page is scrolled to the top once it's fully loaded.
   window.scrollTo(0, 0);
}