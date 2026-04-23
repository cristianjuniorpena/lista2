// auth.js - Autenticação real com Supabase + modo demo
import { supabase } from './supabaseClient.js'

// Elementos DOM
const btnEntrar = document.getElementById('btnEntrar');
const btnCadastrar = document.getElementById('btnCadastrar');
const btnDemo = document.getElementById('btnDemo');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const emailError = document.getElementById('emailError');
const senhaError = document.getElementById('senhaError');

// Toggle mostrar senha
const toggleBtn = document.getElementById('toggleSenha');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
        senhaInput.setAttribute('type', type);
        const icon = toggleBtn.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
}

// Função de login real via Supabase
async function realizarLogin(email, senha) {
    emailError.innerText = '';
    senhaError.innerText = '';
    
    if (!email || !email.includes('@')) {
        emailError.innerText = 'Digite um e-mail válido';
        return false;
    }
    if (!senha || senha.length < 6) {
        senhaError.innerText = 'A senha deve ter pelo menos 6 caracteres';
        return false;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha,
        });
        
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                senhaError.innerText = 'E-mail ou senha incorretos';
            } else {
                senhaError.innerText = error.message;
            }
            return false;
        }
        
        // Salvar dados do usuário no localStorage (para o app.js reconhecer)
        localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email.split('@')[0],
            isDemo: false
        }));
        return true;
    } catch (err) {
        senhaError.innerText = 'Erro de conexão. Tente novamente.';
        return false;
    }
}

// Login
btnEntrar.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    
    // Mostrar loading
    const originalText = btnEntrar.querySelector('span').innerText;
    const spinner = btnEntrar.querySelector('.fa-spinner');
    btnEntrar.disabled = true;
    spinner.style.display = 'inline-block';
    btnEntrar.querySelector('span').innerText = 'Entrando';
    
    const success = await realizarLogin(email, senha);
    
    if (success) {
        window.location.href = 'index.html';
    } else {
        btnEntrar.disabled = false;
        spinner.style.display = 'none';
        btnEntrar.querySelector('span').innerText = originalText;
    }
});

// Redirecionar para cadastro
btnCadastrar.addEventListener('click', () => {
    window.location.href = 'cadastro.html';
});

// Modo demo (continua com localStorage)
btnDemo.addEventListener('click', () => {
    localStorage.setItem('user', JSON.stringify({
        id: 'demo_' + Date.now(),
        email: 'convidado@demo.com',
        name: 'Convidado',
        isDemo: true
    }));
    window.location.href = 'index.html';
});

// Se já houver usuário logado (via Supabase ou demo), redirecionar para index
if (localStorage.getItem('user')) {
    // Verificar se a sessão do Supabase ainda é válida (opcional)
    // Por simplicidade, redireciona direto
    window.location.href = 'index.html';
}