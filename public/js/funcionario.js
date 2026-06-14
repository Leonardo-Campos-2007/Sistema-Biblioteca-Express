document.addEventListener('DOMContentLoaded', () => {
    const loginFuncionarioForm = document.getElementById('loginFuncionarioForm');
    const cadastroFuncionarioForm = document.getElementById('cadastroFuncionarioForm');
    
    const API_URL = 'http://localhost:3000'; // Ajuste a porta se necessário

    // ==========================================
    // 1. REAPROVEITANDO A ROTA DE LOGIN
    // ==========================================
    if (loginFuncionarioForm) {
        loginFuncionarioForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('funcEmail').value;
            const senha = document.getElementById('funcPassword').value;
            const messageDiv = document.getElementById('loginFuncionarioMessage');

            messageDiv.style.color = '#555';
            messageDiv.textContent = 'Autenticando colaborador...';

            try {
                // Enviando para a MESMA rota de validarLogin que você já criou
                const response = await fetch(`${API_URL}/validarLogin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: email, senha: senha })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.style.color = 'green';
                    messageDiv.textContent = 'Acesso autorizado! Redirecionando...';

                    // Salva a sessão do funcionário
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));

                    // Redireciona para a página do bibliotecário que você pediu
                    setTimeout(() => {
                        window.location.href = 'bibliotecario.html';
                    }, 1500);
                } else {
                    messageDiv.style.color = 'red';
                    messageDiv.textContent = data.error || 'Erro ao realizar login.';
                }
            } catch (error) {
                console.error(error);
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'Erro ao conectar com o servidor.';
            }
        });
    }

    // ==========================================
    // 2. REAPROVEITANDO A ROTA DE CADASTRO
    // ==========================================
    if (cadastroFuncionarioForm) {
        cadastroFuncionarioForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('funcName').value;
            const email = document.getElementById('funcRegisterEmail').value;
            const senha = document.getElementById('funcNewPassword').value;
            const confirmarSenha = document.getElementById('funcConfirmPassword').value;
            const cargo = document.getElementById('funcCargo').value; // 'bibliotecario', 'auxiliar' ou 'TI'
            const messageDiv = document.getElementById('cadastroFuncionarioMessage');

            if (senha !== confirmarSenha) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'As senhas não coincidem!';
                return;
            }

            messageDiv.style.color = '#555';
            messageDiv.textContent = 'Registrando colaborador...';

            try {
                // Enviando para a MESMA rota de cadastroUser que você já criou
                const response = await fetch(`${API_URL}/cadastroUser`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome: nome,
                        email: email,
                        senha: senha,
                        perfil: cargo // Passa o cargo selecionado para o campo perfil do banco
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.style.color = 'green';
                    messageDiv.textContent = 'Colaborador cadastrado com sucesso!';
                    cadastroFuncionarioForm.reset();

                    // Volta para a aba de login de funcionário após 2 segundos
                    setTimeout(() => {
                        messageDiv.textContent = '';
                        const loginTab = document.querySelector('[data-tab="loginFuncionario"]');
                        if (loginTab) loginTab.click();
                    }, 2000);
                } else {
                    messageDiv.style.color = 'red';
                    messageDiv.textContent = data.error || 'Erro ao realizar o cadastro.';
                }
            } catch (error) {
                console.error(error);
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'Erro ao conectar com o servidor.';
            }
        });
    }
});