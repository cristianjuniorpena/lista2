import { supabase } from './supabaseClient.js'

const btnEnviar = document.getElementById('btnEnviar');
const btnVoltar = document.getElementById('btnVoltar');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const successMessage = document.getElementById('successMessage');

// URL base para redefinição - ajuste após deploy na Vercel
// Substitua 'seu-projeto.vercel.app' pelo seu domínio real
const PRODUCTION_URL = 'https://listadecristianjunior.app'; // <-- ALTERE AQUI
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const redirectTo = isLocal 
    ? 'http://localhost:5500/atualizar-senha.html' 
    : `${PRODUCTION_URL}/atualizar-senha.html`;

async function enviarLinkRecuperacao(email) {
    emailError.innerText = '';
    successMessage.style.display = 'none';
    
    if (!email || !email.includes('@')) {
        emailError.innerText = 'Digite um e-mail válido';
        return false;
    }
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo,
        });
        
        if (error) {
            if (error.message.includes('User not found')) {
                emailError.innerText = 'Nenhum usuário encontrado com este e-mail';
            } else {
                emailError.innerText = error.message;
            }
            return false;
        }
        
        successMessage.innerText = 'Link de recuperação enviado! Verifique sua caixa de entrada (e spam).';
        successMessage.style.display = 'block';
        return true;
    } catch (err) {
        emailError.innerText = 'Erro de conexão. Tente novamente.';
        return false;
    }
}

btnEnviar.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    
    const spinner = btnEnviar.querySelector('.fa-spinner');
    const originalText = btnEnviar.querySelector('span').innerText;
    btnEnviar.disabled = true;
    spinner.style.display = 'inline-block';
    btnEnviar.querySelector('span').innerText = 'Enviando...';
    
    await enviarLinkRecuperacao(email);
    
    btnEnviar.disabled = false;
    spinner.style.display = 'none';
    btnEnviar.querySelector('span').innerText = originalText;
});

btnVoltar.addEventListener('click', () => {
    window.location.href = 'login.html';
});

// Se já estiver logado, redirecionar para index
if (localStorage.getItem('user')) {
    window.location.href = 'index.html';
}