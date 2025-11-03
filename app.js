
// app.js - Transpiled from app.ts (hand-converted for this submission)
// This file implements the same logic as the TypeScript source.
(function(){
  function getRandomId(prefix) {
    var id;
    do { id = prefix + '-' + Math.floor(Math.random()*1000000); } while (window.menuItems && window.menuItems.some(function(m){return m.id===id;}));
    return id;
  }

  var STORAGE_KEY = 'sweet_delights_menu_v2';
  window.menuItems = window.menuItems || [];

  function saveToStorage(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(window.menuItems)); }
  function loadFromStorage(){
    var raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      try{
        var parsed = JSON.parse(raw);
        var temp = [];
        for(var i=0;i<parsed.length;i++){ var p = parsed[i]; temp.push({ id:String(p.id), name:String(p.name), price:Number(p.price), course:String(p.course)}); }
        window.menuItems = temp;
        return;
      }catch(e){ window.menuItems = []; }
    }
    // seed default
    window.menuItems = [
      { id: getRandomId('s'), name: 'Sourdough Starter', price:45.00, course:'Starter' },
      { id: getRandomId('s'), name: 'Signature Loaf', price:55.00, course:'Main' },
      { id: getRandomId('s'), name: 'Chocolate Tart', price:35.00, course:'Dessert' },
      { id: getRandomId('s'), name: 'Iced Coffee', price:25.00, course:'Drink' }
    ];
    saveToStorage();
  }

  function formatPrice(p){ return 'R ' + p.toFixed(2); }

  function renderAverages(containerId){
    containerId = containerId || 'averages';
    var container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    var courses = ['Starter','Main','Dessert','Drink'];
    for(var i=0;i<courses.length;i++){
      var course = courses[i];
      var sum=0, count=0;
      for(var j=0;j<window.menuItems.length;j++){
        var it = window.menuItems[j];
        if(it.course===course){ sum += it.price; count++; }
      }
      var avg = count===0?0:sum/count;
      var card = document.createElement('div');
      card.className = 'avg-card';
      card.innerHTML = '<strong>'+course+'</strong><div>'+(count===0?'—':formatPrice(avg))+' <small>('+count+' item'+(count===1?'':'s')+')</small></div>';
      container.appendChild(card);
    }
  }

  function renderMenu(listId, filter){
    listId = listId || 'menu-list'; filter = filter || 'all';
    var list = document.getElementById(listId); if(!list) return;
    list.innerHTML = '';
    var filtered = window.menuItems.filter(function(it){ return filter==='all'?true:it.course===filter; });
    for(var i=0;i<filtered.length;i++){
      var it = filtered[i];
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = '<div><strong>'+it.name+'</strong><div style="font-size:13px;color:#666">'+it.course+'</div></div><div>'+formatPrice(it.price)+'</div>';
      list.appendChild(card);
    }
  }

  function renderManagerList(listId){
    listId = listId || 'manager-list';
    var list = document.getElementById(listId); if(!list) return;
    list.innerHTML = '';
    for(var k=0;k<window.menuItems.length;k++){
      (function(it){
        var card = document.createElement('div'); card.className='card';
        var removeBtn = document.createElement('button'); removeBtn.className='btn remove-btn'; removeBtn.textContent='Remove';
        removeBtn.addEventListener('click', function(){ removeItem(it.id); });
        card.innerHTML = '<div><strong>'+it.name+'</strong><div style="font-size:13px;color:#666">'+it.course+'</div></div><div style="display:flex;gap:10px;align-items:center"><div>'+formatPrice(it.price)+'</div></div>';
        card.querySelector('div:last-child').appendChild(removeBtn);
        list.appendChild(card);
      })(window.menuItems[k]);
    }
  }

  function addItem(name, price, course){
    var item = { id: getRandomId('item'), name: String(name).trim(), price: Number(price), course: String(course) };
    window.menuItems.push(item); saveToStorage(); refreshUI();
  }

  function removeItem(id){
    var idx = window.menuItems.findIndex(function(it){ return it.id===id; });
    while(idx !== -1){ window.menuItems.splice(idx,1); idx = window.menuItems.findIndex(function(it){ return it.id===id; }); }
    saveToStorage(); refreshUI();
  }

  function refreshUI(){
    var filterSelect = document.getElementById('filterCourse');
    var filter = filterSelect ? filterSelect.value : 'all';
    renderAverages(); renderMenu('menu-list', filter); renderManagerList('manager-list');
  }

  function showView(id){
    var home = document.getElementById('home-view'); var manager = document.getElementById('manager-view');
    if(id==='home-view'){ home.classList.remove('hidden'); manager.classList.add('hidden'); manager.setAttribute('aria-hidden','true'); home.setAttribute('aria-hidden','false'); }
    else { manager.classList.remove('hidden'); home.classList.add('hidden'); home.setAttribute('aria-hidden','true'); manager.setAttribute('aria-hidden','false'); }
  }

  function hookUI(){
    var navHome = document.getElementById('nav-home'); var navManager = document.getElementById('nav-manager');
    if(navHome) navHome.addEventListener('click', function(){ showView('home-view'); });
    if(navManager) navManager.addEventListener('click', function(){ showView('manager-view'); });
    var form = document.getElementById('addForm');
    if(form){ form.addEventListener('submit', function(e){ e.preventDefault(); var nameEl = document.getElementById('itemName'); var priceEl = document.getElementById('itemPrice'); var courseEl = document.getElementById('itemCourse'); addItem(nameEl.value, Number(priceEl.value), courseEl.value); form.reset(); showView('manager-view'); }); }
    var filterSelect = document.getElementById('filterCourse');
    if(filterSelect) filterSelect.addEventListener('change', function(){ refreshUI(); });
  }

  function init(){ loadFromStorage(); hookUI(); refreshUI(); }
  window.addItem = addItem; window.removeItem = removeItem; window.refreshUI = refreshUI;
  document.addEventListener('DOMContentLoaded', init);
})();