// app.js - Gerencia a lista de compras (localStorage)
let currentUser = null;
let items = [];

// Elementos DOM
const shoppingListEl = document.getElementById('shoppingList');
const newItemInput = document.getElementById('newItemInput');
const addBtn = document.getElementById('addItemBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');
const emptyMessageDiv = document.getElementById('emptyMessage');

// Verificar autenticação
function checkAuth() {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        window.location.href = 'login.html';
        return false;
    }
    currentUser = JSON.parse(userJson);
    userNameSpan.textContent = currentUser.name || currentUser.email.split('@')[0];
    return true;
}

// Carregar itens do localStorage (chave específica por usuário)
function loadItems() {
    const key = `shoppingList_${currentUser.email}`;
    const stored = localStorage.getItem(key);
    items = stored ? JSON.parse(stored) : [];
    renderList();
}

// Salvar itens
function saveItems() {
    const key = `shoppingList_${currentUser.email}`;
    localStorage.setItem(key, JSON.stringify(items));
    renderList();
}

// Adicionar item
function addItem() {
    const name = newItemInput.value.trim();
    if (name === '') return;
    
    const newItem = {
        id: Date.now(),
        name: name,
        completed: false
    };
    items.push(newItem);
    saveItems();
    newItemInput.value = '';
    newItemInput.focus();
}

// Remover item
function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveItems();
}

// Alternar status (marcar/desmarcar)
function toggleItem(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        item.completed = !item.completed;
        saveItems();
    }
}

// Editar item (simples: prompt)
function editItem(id) {
    const item = items.find(item => item.id === id);
    if (!item) return;
    const newName = prompt('Editar item:', item.name);
    if (newName && newName.trim() !== '') {
        item.name = newName.trim();
        saveItems();
    }
}

// Renderizar lista
function renderList() {
    if (!shoppingListEl) return;
    
    if (items.length === 0) {
        shoppingListEl.innerHTML = '';
        emptyMessageDiv.style.display = 'block';
        return;
    }
    emptyMessageDiv.style.display = 'none';
    
    shoppingListEl.innerHTML = items.map(item => `
        <li class="${item.completed ? 'completed' : ''}" data-id="${item.id}">
            <div class="item-content">
                <input type="checkbox" class="item-checkbox" ${item.completed ? 'checked' : ''}>
                <span class="item-name">${escapeHtml(item.name)}</span>
            </div>
            <div class="item-actions">
                <button class="edit-btn" title="Editar"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-btn" title="Remover"><i class="fas fa-trash-alt"></i></button>
            </div>
        </li>
    `).join('');
    
    // Adicionar eventos
    document.querySelectorAll('.item-checkbox').forEach((cb, idx) => {
        cb.addEventListener('change', () => toggleItem(items[idx].id));
    });
    document.querySelectorAll('.edit-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => editItem(items[idx].id));
    });
    document.querySelectorAll('.delete-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => deleteItem(items[idx].id));
    });
}

// Função simples para escapar HTML
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Event listeners
if (addBtn) addBtn.addEventListener('click', addItem);
if (newItemInput) newItemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
});
if (logoutBtn) logoutBtn.addEventListener('click', logout);

// Inicializar
if (checkAuth()) {
    loadItems();
}