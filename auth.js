// auth.js - Gerencia autenticação simulada
const btnEntrar = document.getElementById('btnEntrar');
const btnCadastrar = document.getElementById('btnCadastrar');
const btnDemo = document.getElementById('btnDemo');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const emailError = document.getElementById('emailError');
const senhaError = document.getElementById('senhaError');

// Toggle mostrar senha (já tem no HTML inline, mas vamos garantir)
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

// Função de login simulada
async function realizarLogin(email, senha) {
    // Limpar erros
    emailError.innerText = '';
    senhaError.innerText = '';
    let isValid = true;
    
    if (!email || !email.includes('@')) {
        emailError.innerText = 'Digite um e-mail válido';
        isValid = false;
    }
    if (!senha || senha.length < 3) {
        senhaError.innerText = 'Senha deve ter pelo menos 3 caracteres';
        isValid = false;
    }
    if (!isValid) return false;
    
    // Simular sucesso (qualquer email/senha válida)
    // Em um app real, você faria fetch para um backend
    return true;
}

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
        // Salvar dados do usuário (simulado)
        localStorage.setItem('user', JSON.stringify({ email: email, name: email.split('@')[0] }));
        // Redirecionar para a página principal
        window.location.href = 'index.html';
    } else {
        // Reverter loading
        btnEntrar.disabled = false;
        spinner.style.display = 'none';
        btnEntrar.querySelector('span').innerText = originalText;
    }
});

btnCadastrar.addEventListener('click', () => {
    // Redirecionar para página de cadastro (se existir) ou apenas alert
    alert('Funcionalidade de cadastro em breve. Use o demo ou qualquer email/senha para entrar.');
    // window.location.href = 'cadastro.html';
});

btnDemo.addEventListener('click', () => {
    localStorage.setItem('user', JSON.stringify({ email: 'convidado@demo.com', name: 'Convidado' }));
    window.location.href = 'index.html';
});

// Se o usuário já estiver logado, redirecionar para index (evitar voltar ao login)
if (localStorage.getItem('user')) {
    window.location.href = 'index.html';
}