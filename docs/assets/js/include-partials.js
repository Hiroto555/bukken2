// Simple partials loader: replace {{BASE}} token with element's data-base
// Usage:
// <div data-include="../partials/header.html" data-base=".."></div>
// <div data-include="../partials/footer.html" data-base=".."></div>

(function(){
  function load(el){
    var url = el.getAttribute('data-include');
    var base = el.getAttribute('data-base') || '.';
    if(!url){ return; }
    fetch(url).then(function(r){ return r.text(); }).then(function(html){
      html = html.replace(/\{\{BASE\}\}/g, base);
      el.outerHTML = html;
      // Notify listeners that a partial was injected
      try {
        document.dispatchEvent(new CustomEvent('partial:loaded', { detail: { url: url, base: base } }));
      } catch (e) {
        console.warn('partial:loaded dispatch failed', e);
      }
    }).catch(function(err){
      console.error('Partial load failed:', url, err);
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      document.querySelectorAll('[data-include]').forEach(load);
    });
  } else {
    document.querySelectorAll('[data-include]').forEach(load);
  }
})();
