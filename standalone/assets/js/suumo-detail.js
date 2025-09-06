// Populate SUUMO-like property detail from localStorage draft (demo)
(function(){
  function qs(sel, el){ return (el||document).querySelector(sel); }
  function set(id, val){ var el = qs('#'+id); if(el) el.textContent = val || '未入力'; }
  function comma(n){ var x = parseFloat(n); return isFinite(x) ? x.toLocaleString('ja-JP') : ''; }
  function loadDraft(){
    try{ return JSON.parse(localStorage.getItem('suumoDemoDraft')||'{}'); }catch(e){ return {}; }
  }
  function init(){
    var d = loadDraft();
    var addr = [d.fld_pref, d.fld_city, d.fld_town, d.fld_addr_no].filter(Boolean).join(' ');
    if(d.fld_addr_display) addr += (addr?' ':'') + d.fld_addr_display;
    var madori = [d.fld_rooms_num, d.fld_rooms_type, d.fld_rooms_type2].filter(Boolean).join('');

    set('propTitle', d.fld_property_name || '（物件名未入力）');
    set('propPrice', d.fld_price ? comma(d.fld_price)+'万円' : '価格未入力');
    set('propAddress', addr);
    set('propMadori', madori);
    set('propMainCatch', d.fld_main_catch || '');
    set('propSubCatch', d.fld_sub_catch || '');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

