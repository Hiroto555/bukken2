// SUUMO-like entry UI helpers (demo only)
(function(){
  function qs(sel, el){ return (el||document).querySelector(sel); }
  function qsa(sel, el){ return Array.from((el||document).querySelectorAll(sel)); }

  function initTabs(){
    var tabs = qsa('[data-tab-target]');
    if(!tabs.length) return;
    function activate(id){
      qsa('[data-tab-target]').forEach(function(t){
        var active = t.getAttribute('data-tab-target') === id;
        t.classList.toggle('bg-blue-600', active);
        t.classList.toggle('text-white', active);
        t.classList.toggle('bg-white', !active);
        t.classList.toggle('text-blue-700', !active);
      });
      qsa('[data-tab]').forEach(function(p){
        p.classList.toggle('hidden', p.getAttribute('data-tab') !== id);
      });
      // scroll to top of form when switching
      var top = qs('#suumoFormTop');
      if(top) top.scrollIntoView({behavior:'smooth', block:'start'});
    }
    tabs.forEach(function(t){
      t.addEventListener('click', function(e){
        e.preventDefault();
        activate(t.getAttribute('data-tab-target'));
      });
    });
    // default first
    activate(tabs[0].getAttribute('data-tab-target'));
  }

  function initCounters(){
    qsa('[data-count-max]').forEach(function(el){
      var max = parseInt(el.getAttribute('data-count-max'),10) || 0;
      var outId = el.getAttribute('data-count-out');
      var out = outId ? document.getElementById(outId) : null;
      function update(){
        var len = (el.value || '').length;
        if(out) out.textContent = len + (max?'/'+max:'');
        if(max){ el.classList.toggle('ring-2', len>max); el.classList.toggle('ring-red-500', len>max); }
      }
      el.addEventListener('input', update);
      update();
    });
  }

  function init(){ initTabs(); initCounters(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Draft + Preview (demo only)
(function(){
  function qs(sel, el){ return (el||document).querySelector(sel); }
  function qsa(sel, el){ return Array.from((el||document).querySelectorAll(sel)); }
  var ROOT = document;
  function getValById(id){ var el = qs('#'+id, ROOT); return el ? el.value : ''; }
  function getRadio(name){ var el = qs('input[type="radio"][name="'+name+'"]:checked', ROOT); return el ? el.value || '選択済' : ''; }
  function getChecksIn(containerSel){
    return qsa(containerSel+' input[type="checkbox"]:checked', ROOT).map(function(c){
      var label = c.closest('label');
      return label ? label.textContent.trim().replace(/^\s+|\s+$/g,'') : '選択';
    });
  }
  function comma(n){
    var x = parseFloat(n); if(!isFinite(x)) return '';
    return x.toLocaleString('ja-JP');
  }

  function collectChecked(container){
    return qsa(container+' input[type="checkbox"]:checked', ROOT).map(function(e){
      var l = e.closest('label'); return l ? l.textContent.trim() : '';
    }).filter(Boolean);
  }

  function buildPreview(){
    var name = getValById('fld_property_name');
    var pref = getValById('fld_pref');
    var city = getValById('fld_city');
    var town = getValById('fld_town');
    var addrNo = getValById('fld_addr_no');
    var addrDisp = getValById('fld_addr_display');
    var price = getValById('fld_price');
    var roomsNum = getValById('fld_rooms_num');
    var roomsType = getValById('fld_rooms_type');
    var roomsType2 = getValById('fld_rooms_type2');
    var mainCatch = getValById('fld_main_catch');
    var subCatch = getValById('fld_sub_catch');
    // structures (主要構造)
    var structures = getChecksIn('[data-tab="building"]');

    var addr = [pref, city, town, addrNo].filter(Boolean).join(' ');
    if(addrDisp) addr += (addr? ' ' : '') + addrDisp;
    var madori = [roomsNum, roomsType, roomsType2].filter(Boolean).join('');

    var html = ''+
      '<div class="border rounded-lg p-4">'+
      '  <div class="flex items-center justify-between">'+
      '    <h4 class="text-xl font-bold text-blue-900">'+(name||'（物件名未入力）')+'</h4>'+
      '    <div class="text-red-600 font-bold text-2xl">'+(price? (comma(price)+'万円'):'価格未入力')+'</div>'+
      '  </div>'+
      '  <div class="mt-2 text-gray-700">所在地: '+(addr||'未入力')+'</div>'+
      '  <div class="mt-1 text-gray-700">間取り: '+(madori||'未入力')+'</div>'+
      '  <div class="mt-1 text-gray-700">主要構造: '+(structures.length? structures.join('・'):'未選択')+'</div>'+
      '</div>'+
      (mainCatch? '<div class="mt-4"><div class="font-semibold text-blue-900">メインキャッチ</div><div class="mt-1 whitespace-pre-wrap">'+escapeHtml(mainCatch)+'</div></div>':'')+
      (subCatch? '<div class="mt-4"><div class="font-semibold text-blue-900">サブキャッチ</div><div class="mt-1 whitespace-pre-wrap">'+escapeHtml(subCatch)+'</div></div>':'');

    // features summary
    var featCats = [
      {title:'立地・土地', sel:'[data-tab="features"] h3:contains("立地・土地特徴") ~ div'},
    ];
    var allFeatures = collectChecked('[data-tab="features"]');
    if(allFeatures.length){
      html += '<div class="mt-6">'+
        '<div class="font-semibold text-blue-900">特徴設備（抜粋）</div>'+
        '<div class="mt-2 text-sm text-gray-800">'+ allFeatures.slice(0,12).join('・') + (allFeatures.length>12?' ほか…':'') +'</div>'+
      '</div>';
    }
    return html;
  }

  function escapeHtml(s){
    return (s||'').replace(/[&<>"']/g,function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[ch];
    });
  }

  function saveDraft(){
    // save by element ids
    var ids = ['fld_property_name','fld_pref','fld_city','fld_town','fld_addr_no','fld_addr_display','fld_price','fld_rooms_num','fld_rooms_type','fld_rooms_type2','fld_main_catch','fld_sub_catch'];
    var data = {};
    ids.forEach(function(id){ var el = qs('#'+id); if(el) data[id]=el.value; });
    try{ localStorage.setItem('suumoDemoDraft', JSON.stringify(data)); alert('下書きを保存しました（デモ）'); }catch(e){ console.warn(e); }
  }

  function loadDraft(){
    try{
      var raw = localStorage.getItem('suumoDemoDraft');
      if(!raw) return;
      var data = JSON.parse(raw||'{}');
      Object.keys(data).forEach(function(id){ var el = qs('#'+id); if(el) el.value = data[id]; });
    }catch(e){ console.warn(e); }
  }

  function openPreview(){
    var modal = qs('#previewModal');
    var body = qs('#previewBody');
    if(!modal || !body) return;
    var warns = validate();
    if(warns.length){
      body.innerHTML = '<div class="p-3 bg-red-50 text-red-700 rounded border border-red-200 mb-4">'+warns.join('<br>')+'</div>' + buildPreview();
    } else {
      body.innerHTML = buildPreview();
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  function closePreview(){
    var modal = qs('#previewModal');
    if(!modal) return; modal.classList.add('hidden'); modal.classList.remove('flex');
  }

  function init(){
    var btnSave = qs('#btnSaveDraft');
    var btnPrev = qs('#btnPreview');
    var btnClose = qs('#btnClosePreview');
    var btnClose2 = qs('#btnClosePreview2');
    var btnPrint = qs('#btnPrintPreview');
    if(btnSave) btnSave.addEventListener('click', function(e){ e.preventDefault(); saveDraft(); });
    if(btnPrev) btnPrev.addEventListener('click', function(e){ e.preventDefault(); openPreview(); });
    if(btnClose) btnClose.addEventListener('click', function(e){ e.preventDefault(); closePreview(); });
    if(btnClose2) btnClose2.addEventListener('click', function(e){ e.preventDefault(); closePreview(); });
    if(btnPrint) btnPrint.addEventListener('click', function(e){ e.preventDefault(); window.print(); });
    loadDraft();
  }

  function validate(){
    var req = qsa('[data-required]');
    var warns = [];
    req.forEach(function(el){
      var ok = !!(el.value && el.value.trim());
      el.classList.toggle('ring-2', !ok);
      el.classList.toggle('ring-red-500', !ok);
      if(!ok){
        var label = el.closest('div');
        warns.push('未入力: ' + (label ? (label.querySelector('label')?.textContent.trim() || el.id) : el.id));
      }
    });
    return warns;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
