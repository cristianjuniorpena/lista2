import { supabase } from './supabaseClient.js'

const btnCadastrar = document.getElementById('btnCadastrar');
const btnVoltar = document.getElementById('btnVoltar');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const confirmarInput = document.getElementById('confirmarSenha');
const emailError = document.getElementById('emailError');
const senhaError = document.getElementById('senhaError');
const confirmarError = document.getElementById('confirmarError');

// Toggles de senha
const toggleSenha = document.getElementById('toggleSenha');
const toggleConfirmar = document.getElementById('toggleConfirmarSenha');

toggleSenha.addEventListener('click', () => {
    const type = senhaInput.type === 'password' ? 'text' : 'password';
    senhaInput.type = type;
    toggleSenha.querySelector('i').classList.toggle('fa-eye');
    toggleSenha.querySelector('i').classList.toggle('fa-eye-slash');
});

toggleConfirmar.addEventListener('click', () => {
    const type = confirmarInput.type === 'password' ? 'text' : 'password';
    confirmarInput.type = type;
    toggleConfirmar.querySelector('i').classList.toggle('fa-eye');
    toggleConfirmar.querySelector('i').classList.toggle('fa-eye-slash');
});

async function realizarCadastro(email, senha, nome) {
    // Limpar erros
    emailError.innerText = '';
    senhaError.innerText = '';
    confirmarError.innerText = '';
    
    if (!email || !email.includes('@')) {
        emailError.innerText = 'Digite um e-mail válido';
        return false;
    }
    if (!senha || senha.length < 6) {
        senhaError.innerText = 'A senha deve ter pelo menos 6 caracteres';
        return false;
    }
    if (senha !== confirmarInput.value) {
        confirmarError.innerText = 'As senhas não coincidem';
        return false;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    name: nome || email.split('@')[0]
                }
            }
        });
        
        if (error) {
            if (error.message.includes('User already registered')) {
                emailError.innerText = 'Este e-mail já está cadastrado';
            } else {
                emailError.innerText = error.message;
            }
            return false;
        }
        
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            emailError.innerText = 'Este e-mail já está cadastrado, mas não confirmado. Verifique seu email.';
            return false;
        }
        
        // Cadastro bem-sucedido
        alert('Cadastro realizado com sucesso! Agora faça o login.');
        return true;
    } catch (err) {
        emailError.innerText = 'Erro de conexão. Tente novamente.';
        return false;
    }
}

btnCadastrar.addEventListener('click', async () => {
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    
    const spinner = btnCadastrar.querySelector('.fa-spinner');
    const originalText = btnCadastrar.querySelector('span').innerText;
    btnCadastrar.disabled = true;
    spinner.style.display = 'inline-block';
    btnCadastrar.querySelector('span').innerText = 'Cadastrando';
    
    const success = await realizarCadastro(email, senha, nome);
    
    if (success) {
        window.location.href = 'login.html';
    } else {
        btnCadastrar.disabled = false;
        spinner.style.display = 'none';
        btnCadastrar.querySelector('span').innerText = originalText;
    }
});

btnVoltar.addEventListener('click', () => {
    window.location.href = 'login.html';
});

// Se já estiver logado, redirecionar para index
if (localStorage.getItem('user')) {
    window.location.href = 'index.html';
}