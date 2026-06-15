document.addEventListener('DOMContentLoaded', () => {
    // URL base do seu servidor Node.js (Ajuste o final caso use prefixos como /api ou /routes)
    const API_URL = 'http://localhost:3000'; 

    const loginFuncionarioForm = document.getElementById('loginFuncionarioForm');
    const cadastroFuncionarioForm = document.getElementById('cadastroFuncionarioForm');
    
    // ==========================================
    // 1. PROCESSAMENTO DE LOGIN DO FUNCIONÁRIO
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
                const response = await fetch(`${API_URL}/validarLogin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, senha: senha })
                });

                // Evita quebra de leitura caso o retorno não seja JSON
                if (!response.ok) {
                    messageDiv.style.color = 'red';
                    if (response.status === 404) {
                        messageDiv.textContent = 'Erro 404: Rota de login não encontrada no servidor.';
                    } else {
                        const errorText = await response.text();
                        try {
                            const errorJson = JSON.parse(errorText);
                            messageDiv.textContent = errorJson.error || 'Credenciais inválidas.';
                        } catch (e) {
                            messageDiv.textContent = 'Erro ao tentar acessar (' + response.status + ').';
                        }
                    }
                    return;
                }

                const data = await response.json();

                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Acesso autorizado! Redirecionando...';

                // Armazena temporariamente os dados da sessão
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));

                setTimeout(() => {
                    window.location.href = 'bibliotecario.html';
                }, 1500);

            } catch (error) {
                console.error(error);
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'Erro de conexão: Não foi possível alcançar o servidor.';
            }
        });
    }

    // ==========================================
    // 2. PROCESSAMENTO DE CADASTRO DO FUNCIONÁRIO
    // ==========================================
    if (cadastroFuncionarioForm) {
        cadastroFuncionarioForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('funcName').value;
            const email = document.getElementById('funcRegisterEmail').value;
            const senha = document.getElementById('funcNewPassword').value;
            const confirmarSenha = document.getElementById('funcConfirmPassword').value;
            const cargo = document.getElementById('funcCargo').value;
            const messageDiv = document.getElementById('cadastroFuncionarioMessage');

            if (senha !== confirmarSenha) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'As senhas não coincidem!';
                return;
            }

            messageDiv.style.color = '#555';
            messageDiv.textContent = 'Registrando colaborador...';

            try {
                const response = await fetch(`${API_URL}/cadastroUser`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome: nome,
                        email: email,
                        senha: senha,
                        perfil: cargo
                    })
                });

                // Tratamento de erro robusto para evitar o erro do "<!DOCTYPE"
                if (!response.ok) {
                    messageDiv.style.color = 'red';
                    if (response.status === 404) {
                        messageDiv.textContent = 'Erro 404: A rota não foi encontrada no servidor. Verifique o caminho ou prefixos no backend.';
                    } else {
                        const errorText = await response.text();
                        try {
                            const errorJson = JSON.parse(errorText);
                            messageDiv.textContent = errorJson.error || 'Erro ao realizar o cadastro.';
                        } catch (e) {
                            messageDiv.textContent = 'Erro interno do servidor (' + response.status + ').';
                        }
                    }
                    return;
                }

                // Se chegou aqui, a resposta é um JSON válido e deu status 201!
                const data = await response.json();
                
                messageDiv.style.color = 'green';
                messageDiv.textContent = 'Colaborador cadastrado com sucesso!';
                cadastroFuncionarioForm.reset();

                setTimeout(() => {
                    messageDiv.textContent = '';
                    const loginTab = document.querySelector('[data-tab="loginFuncionario"]');
                    if (loginTab) loginTab.click();
                }, 2000);

            } catch (error) {
                console.error(error);
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'Erro de conexão: Não foi possível alcançar o servidor.';
            }
        });
    }
});