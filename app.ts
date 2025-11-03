
/**
 * app.ts - Final POE app
 * Requirements used:
 * - Use for, while, and for...of loops
 * - Use a global variable for menu array
 * - Separate screen for manager (add/remove menu items)
 * - Save menu items in an array and persist to localStorage
 * - Home shows average price per course
 */

type Course = 'Starter' | 'Main' | 'Dessert' | 'Drink' | 'Other';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  course: Course;
}

/* ---------- Global state ---------- */
const STORAGE_KEY = 'sweet_delights_menu_v2';
let menuItems: MenuItem[] = []; // explicit global variable

/* ---------- Utilities ---------- */
function getRandomId(prefix = 'id'): string {
  // demonstrate while loop to avoid collisions
  let id: string;
  do {
    id = prefix + '-' + Math.floor(Math.random() * 1000000);
  } while (menuItems.some(m => m.id === id));
  return id;
}

function saveToStorage(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems));
}

function loadFromStorage(): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as any[];
      const temp: MenuItem[] = [];
      // demonstrate for loop to rehydrate
      for (let i = 0; i < parsed.length; i++) {
        const p = parsed[i];
        temp.push({ id: String(p.id), name: String(p.name), price: Number(p.price), course: String(p.course) as Course });
      }
      menuItems = temp;
      return;
    } catch (e) {
      menuItems = [];
    }
  }
  // default seed
  menuItems = [
    { id: getRandomId('s'), name: 'Sourdough Starter', price: 45.00, course: 'Starter' },
    { id: getRandomId('s'), name: 'Signature Loaf', price: 55.00, course: 'Main' },
    { id: getRandomId('s'), name: 'Chocolate Tart', price: 35.00, course: 'Dessert' },
    { id: getRandomId('s'), name: 'Iced Coffee', price: 25.00, course: 'Drink' }
  ];
  saveToStorage();
}

/* ---------- Rendering ---------- */
function formatPrice(p: number): string {
  return `R ${p.toFixed(2)}`;
}

function renderAverages(containerId = 'averages'): void {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const courses: Course[] = ['Starter','Main','Dessert','Drink'];
  // use for loop
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    let sum = 0;
    let count = 0;
    // use for loop to compute
    for (let j = 0; j < menuItems.length; j++) {
      const it = menuItems[j];
      if (it.course === course) {
        sum += it.price;
        count++;
      }
    }
    const avg = count === 0 ? 0 : sum / count;
    const card = document.createElement('div');
    card.className = 'avg-card';
    card.innerHTML = `<strong>${course}</strong><div>${count === 0 ? '—' : formatPrice(avg)} <small>(${count} item${count===1?'':'s'})</small></div>`;
    container.appendChild(card);
  }
}

function renderMenu(listId = 'menu-list', filter: Course | 'all' = 'all'): void {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';
  const filtered = menuItems.filter(it => filter === 'all' ? true : it.course === filter);
  // use for...of to render
  for (const it of filtered) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div><strong>${it.name}</strong><div style="font-size:13px;color:#666">${it.course}</div></div><div>${formatPrice(it.price)}</div>`;
    list.appendChild(card);
  }
}

function renderManagerList(listId = 'manager-list'): void {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';
  for (const it of menuItems) {
    const card = document.createElement('div');
    card.className = 'card';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      removeItem(it.id);
    });
    card.innerHTML = `<div><strong>${it.name}</strong><div style="font-size:13px;color:#666">${it.course}</div></div>
                      <div style="display:flex;gap:10px;align-items:center"><div>${formatPrice(it.price)}</div></div>`;
    // append button
    card.querySelector('div:last-child')!.appendChild(removeBtn);
    list.appendChild(card);
  }
}

/* ---------- Actions ---------- */
function addItem(name: string, price: number, course: Course): void {
  const item: MenuItem = { id: getRandomId('item'), name: name.trim(), price: Number(price), course };
  menuItems.push(item);
  saveToStorage();
  refreshUI();
}

function removeItem(id: string): void {
  // use while loop to remove all occurrences (defensive)
  let idx = menuItems.findIndex(it => it.id === id);
  while (idx !== -1) {
    menuItems.splice(idx, 1);
    idx = menuItems.findIndex(it => it.id === id);
  }
  saveToStorage();
  refreshUI();
}

/* ---------- UI glue ---------- */
function refreshUI(): void {
  const filterSelect = document.getElementById('filterCourse') as HTMLSelectElement | null;
  const filter = filterSelect ? (filterSelect.value as Course | 'all') : 'all';
  renderAverages();
  renderMenu('menu-list', filter);
  renderManagerList('manager-list');
}

function showView(id: 'home-view' | 'manager-view'): void {
  const home = document.getElementById('home-view')!;
  const manager = document.getElementById('manager-view')!;
  if (id === 'home-view') {
    home.classList.remove('hidden');
    manager.classList.add('hidden');
    manager.setAttribute('aria-hidden', 'true');
    home.setAttribute('aria-hidden', 'false');
  } else {
    manager.classList.remove('hidden');
    home.classList.add('hidden');
    home.setAttribute('aria-hidden', 'true');
    manager.setAttribute('aria-hidden', 'false');
  }
}

function hookUI(): void {
  const navHome = document.getElementById('nav-home');
  const navManager = document.getElementById('nav-manager');
  if (navHome) navHome.addEventListener('click', () => showView('home-view'));
  if (navManager) navManager.addEventListener('click', () => showView('manager-view'));

  const form = document.getElementById('addForm') as HTMLFormElement | null;
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameEl = document.getElementById('itemName') as HTMLInputElement;
      const priceEl = document.getElementById('itemPrice') as HTMLInputElement;
      const courseEl = document.getElementById('itemCourse') as HTMLSelectElement;
      addItem(nameEl.value, Number(priceEl.value), courseEl.value as Course);
      form.reset();
      showView('manager-view');
    });
  }

  const filterSelect = document.getElementById('filterCourse') as HTMLSelectElement | null;
  if (filterSelect) filterSelect.addEventListener('change', () => refreshUI());
}

/* ---------- Init ---------- */
function init(): void {
  loadFromStorage();
  hookUI();
  refreshUI();
}

document.addEventListener('DOMContentLoaded', init);
