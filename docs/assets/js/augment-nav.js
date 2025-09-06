// Ensure a "物件一覧" link exists in the header nav on pages built
// without the shared partial header. Harmless if already present.
(function(){
  function ensurePropertiesLink(){
    try {
      var nav = document.querySelector('header nav');
      if(!nav) return;
      var hasLink = !!nav.querySelector('a[href$="/properties/index.html"], a[href$="./properties/index.html"], a[href*="properties/index.html"]');
      if(hasLink) return;
      var a = document.createElement('a');
      a.href = './properties/index.html';
      a.textContent = '物件一覧';
      a.className = 'text-gray-700 hover:text-blue-900 font-medium transition-colors';
      nav.appendChild(a);
    } catch (e) {
      // no-op
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensurePropertiesLink);
  } else {
    ensurePropertiesLink();
  }
})();

