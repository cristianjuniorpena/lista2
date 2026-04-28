import { supabase } from './supabaseClient.js'

const btnRedefinir = document.getElementById('btnRedefinir');
const btnVoltar = document.getElementById('btnVoltar');
const novaSenhaInput = document.getElementById('novaSenha');
const confirmarInput = document.getElementById('confirmarSenha');
const senhaError = document.getElementById('senhaError');
const confirmarError = document.getElementById('confirmarError');

// Toggles de senha
const toggleSenha = document.getElementById('toggleSenha');
const toggleConfirmar = document.getElementById('toggleConfirmar');

toggleSenha.addEventListener('click', () => {
    const type = novaSenhaInput.type === 'password' ? 'text' : 'password';
    novaSenhaInput.type = type;
    toggleSenha.querySelector('i').classList.toggle('fa-eye');
    toggleSenha.querySelector('i').classList.toggle('fa-eye-slash');
});

toggleConfirmar.addEventListener('click', () => {
    const type = confirmarInput.type === 'password' ? 'text' : 'password';
    confirmarInput.type = type;
    toggleConfirmar.querySelector('i').classList.toggle('fa-eye');
    toggleConfirmar.querySelector('i').classList.toggle('fa-eye-slash');
});

async function atualizarSenha(novaSenha) {
    senhaError.innerText = '';
    confirmarError.innerText = '';
    
    if (!novaSenha || novaSenha.length < 6) {
        senhaError.innerText = 'A senha deve ter pelo menos 6 caracteres';
        return false;
    }
    if (novaSenha !== confirmarInput.value) {
        confirmarError.innerText = 'As senhas não coincidem';
        return false;
    }
    
    try {
        const { error } = await supabase.auth.updateUser({
            password: novaSenha
        });
        
        if (error) {
            senhaError.innerText = error.message;
            return false;
        }
        
        // Senha atualizada com sucesso
        alert('Senha redefinida com sucesso! Faça login com a nova senha.');
        return true;
    } catch (err) {
        senhaError.innerText = 'Erro de conexão. Tente novamente.';
        return false;
    }
}

btnRedefinir.addEventListener('click', async () => {
    const novaSenha = novaSenhaInput.value;
    
    const spinner = btnRedefinir.querySelector('.fa-spinner');
    const originalText = btnRedefinir.querySelector('span').innerText;
    btnRedefinir.disabled = true;
    spinner.style.display = 'inline-block';
    btnRedefinir.querySelector('span').innerText = 'Redefinindo...';
    
    const success = await atualizarSenha(novaSenha);
    
    if (success) {
        window.location.href = 'login.html';
    } else {
        btnRedefinir.disabled = false;
        spinner.style.display = 'none';
        btnRedefinir.querySelector('span').innerText = originalText;
    }
});

btnVoltar.addEventListener('click', () => {
    window.location.href = 'login.html';
});