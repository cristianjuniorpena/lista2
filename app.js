let currentUser = null;
let items = [];

// Elementos DOM
const shoppingListEl = document.getElementById('shoppingList');
const newItemInput = document.getElementById('newItemInput');
const addBtn = document.getElementById('addItemBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userNameSpan = document.getElementById('userName');
const emptyMessageDiv = document.getElementById('emptyMessage');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const selectAllBtn = document.getElementById('selectAllBtn');

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

// Carregar itens do localStorage
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

// Remover item individual
function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveItems();
}

// Alternar status (marcar/desmarcar) de UM item
function toggleItem(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        item.completed = !item.completed;
        saveItems();
    }
}

// Selecionar todos / desmarcar todos (toggle)
function selectAllItems() {
    const allCompleted = items.every(item => item.completed === true);
    if (allCompleted) {
        // Desmarcar todos
        items.forEach(item => item.completed = false);
    } else {
        // Marcar todos
        items.forEach(item => item.completed = true);
    }
    saveItems(); // re-renderiza e atualiza visibilidade do botão excluir
}

// Conta quantos itens estão marcados
function getSelectedCount() {
    return items.filter(item => item.completed).length;
}

// Mostra ou esconde o botão "Excluir selecionados"
function updateDeleteSelectedButtonVisibility() {
    if (!deleteSelectedBtn) return;
    const selectedCount = getSelectedCount();
    if (selectedCount >= 2) {
        deleteSelectedBtn.classList.remove('hidden');
    } else {
        deleteSelectedBtn.classList.add('hidden');
    }
}

// Exclui todos os itens marcados
function deleteSelectedItems() {
    const newItems = items.filter(item => !item.completed);
    if (newItems.length === items.length) return;
    items = newItems;
    saveItems();
}

// Edição inline (substitui o prompt)
function startInlineEdit(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const li = document.querySelector(`li[data-id="${itemId}"]`);
    if (!li) return;
    
    const itemNameSpan = li.querySelector('.item-name');
    if (!itemNameSpan) return;
    
    const currentName = item.name;
    
    // Criar input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.classList.add('inline-edit-input');
    
    // Substituir span pelo input
    itemNameSpan.replaceWith(input);
    input.focus();
    input.select();
    
    // Função para finalizar edição
    const finishEdit = () => {
        const newName = input.value.trim();
        if (newName !== '' && newName !== currentName) {
            item.name = newName;
            saveItems(); // re-renderiza a lista inteira (mas perderia o foco, ok)
        } else {
            // Se não mudou ou vazio, apenas restaura o span sem alterar
            renderList(); // re-renderiza para voltar ao estado normal
        }
    };
    
    // Salvar ao pressionar Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            finishEdit();
        }
    });
    
    // Salvar ao perder o foco
    input.addEventListener('blur', finishEdit);
    
    // Cancelar com ESC (restaura sem salvar)
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Restaurar span original sem alterar
            const span = document.createElement('span');
            span.className = 'item-name';
            span.textContent = currentName;
            input.replaceWith(span);
        }
    });
}

// Renderizar lista
function renderList() {
    if (!shoppingListEl) return;
    
    if (items.length === 0) {
        shoppingListEl.innerHTML = '';
        emptyMessageDiv.style.display = 'block';
        updateDeleteSelectedButtonVisibility();
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
        btn.addEventListener('click', () => startInlineEdit(items[idx].id));
    });
    document.querySelectorAll('.delete-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => deleteItem(items[idx].id));
    });
    
    updateDeleteSelectedButtonVisibility();
}

// Função para escapar HTML
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
if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', deleteSelectedItems);
if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllItems);

// Inicializar
if (checkAuth()) {
    loadItems();
}