// app.js - Gerencia lista de compras com Supabase (usuários reais) ou localStorage (demo)
import { supabase } from './supabaseClient.js'

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

// ========== SUPABASE FUNCTIONS ==========
async function loadItemsFromSupabase() {
    const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('Erro ao carregar itens:', error);
        items = [];
    } else {
        items = data.map(item => ({
            id: item.id,
            name: item.name,
            completed: item.completed
        }));
    }
    renderList();
}

async function saveItemsToSupabase() {
    // Para simplificar, vamos recriar a lista no Supabase
    // Primeiro, deleta todos os itens do usuário
    const { error: deleteError } = await supabase
        .from('shopping_items')
        .delete()
        .eq('user_id', currentUser.id);
    
    if (deleteError) {
        console.error('Erro ao limpar lista:', deleteError);
        return;
    }
    
    // Insere os itens atuais
    if (items.length === 0) return;
    
    const itemsToInsert = items.map(item => ({
        user_id: currentUser.id,
        name: item.name,
        completed: item.completed,
        created_at: new Date().toISOString()
    }));
    
    const { error: insertError } = await supabase
        .from('shopping_items')
        .insert(itemsToInsert);
    
    if (insertError) {
        console.error('Erro ao salvar itens:', insertError);
    }
}

// Função mais eficiente: ao invés de recriar toda a lista, podemos fazer operações individuais
// Mas para manter a lógica simples e compatível com o código existente, usamos recriação total.
// Para produção, seria melhor usar upsert ou operações por item.

// ========== FUNÇÕES PRINCIPAIS (compatíveis com ambos modos) ==========
function loadItems() {
    if (currentUser.isDemo) {
        const key = `shoppingList_${currentUser.email}`;
        const stored = localStorage.getItem(key);
        items = stored ? JSON.parse(stored) : [];
        renderList();
    } else {
        loadItemsFromSupabase();
    }
}

function saveItems() {
    if (currentUser.isDemo) {
        const key = `shoppingList_${currentUser.email}`;
        localStorage.setItem(key, JSON.stringify(items));
        renderList();
    } else {
        saveItemsToSupabase().then(() => {
            renderList();
        });
    }
}

// Adicionar item
function addItem() {
    const name = newItemInput.value.trim();
    if (name === '') return;
    
    const newItem = {
        id: currentUser.isDemo ? Date.now() : crypto.randomUUID ? crypto.randomUUID() : Date.now(),
        name: name,
        completed: false
    };
    items.push(newItem);
    saveItems();
    newItemInput.value = '';
    newItemInput.focus();
}

function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveItems();
}

function toggleItem(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        item.completed = !item.completed;
        saveItems();
    }
}

function selectAllItems() {
    const allCompleted = items.every(item => item.completed === true);
    if (allCompleted) {
        items.forEach(item => item.completed = false);
    } else {
        items.forEach(item => item.completed = true);
    }
    saveItems();
}

function getSelectedCount() {
    return items.filter(item => item.completed).length;
}

function updateDeleteSelectedButtonVisibility() {
    if (!deleteSelectedBtn) return;
    const selectedCount = getSelectedCount();
    if (selectedCount >= 2) {
        deleteSelectedBtn.classList.remove('hidden');
    } else {
        deleteSelectedBtn.classList.add('hidden');
    }
}

function deleteSelectedItems() {
    const newItems = items.filter(item => !item.completed);
    if (newItems.length === items.length) return;
    items = newItems;
    saveItems();
}

// Edição inline
function startInlineEdit(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const li = document.querySelector(`li[data-id="${itemId}"]`);
    if (!li) return;
    
    const itemNameSpan = li.querySelector('.item-name');
    if (!itemNameSpan) return;
    
    const currentName = item.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.classList.add('inline-edit-input');
    
    itemNameSpan.replaceWith(input);
    input.focus();
    input.select();
    
    const finishEdit = () => {
        const newName = input.value.trim();
        if (newName !== '' && newName !== currentName) {
            item.name = newName;
            saveItems();
        } else {
            renderList();
        }
    };
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') finishEdit();
    });
    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const span = document.createElement('span');
            span.className = 'item-name';
            span.textContent = currentName;
            input.replaceWith(span);
        }
    });
}

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

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function logout() {
    supabase.auth.signOut().catch(console.error);
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