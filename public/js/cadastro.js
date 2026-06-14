document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    // Ajuste a URL/porta de acordo com a configuração do seu servidor Node.js
    const API_URL = 'http://localhost:3000'; 

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede a página de recarregar

            // Captura os elementos de input do HTML
            const nome = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('password').value;
            const confirmarSenha = document.getElementById('confirmPassword').value;
            const perfil = document.getElementById('role').value;
            const messageDiv = document.getElementById('registerMessage');

            // 1. Validação de segurança no Frontend: As senhas são iguais?
            if (senha !== confirmarSenha) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'As senhas não coincidem!';
                return; // Para a execução aqui e não envia para o servidor
            }

            // Feedback visual inicial
            messageDiv.style.color = '#555';
            messageDiv.textContent = 'Processando cadastro...';

            try {
                // 2. Envio dos dados para a rota do backend (/cadastroUser)
                const response = await fetch(`${API_URL}/cadastroUser`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: nome,
                        email: email,
                        senha: senha,
                        perfil: perfil
                    })
                });

                const data = await response.json();

                // 3. Tratamento da resposta do servidor
                if (response.ok) {
                    messageDiv.style.color = 'green';
                    messageDiv.textContent = 'Usuário cadastrado com sucesso!';
                    
                    // Limpa o formulário após o sucesso
                    registerForm.reset();

                    // Opcional: Redireciona ou limpa a mensagem após 2 segundos
                    setTimeout(() => {
                        messageDiv.textContent = '';
                        // Se quiser que ele volte para a aba de login automaticamente:
                        const loginTabBtn = document.querySelector('[data-tab="login"]');
                        if (loginTabBtn) loginTabBtn.click();
                    }, 2000);

                } else {
                    // Exibe o erro retornado pelo backend (ex: erro 500)
                    messageDiv.style.color = 'red';
                    messageDiv.textContent = data.error || 'Erro ao realizar o cadastro.';
                }

            } catch (error) {
                console.error('Erro na requisição de cadastro:', error);
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'Não foi possível conectar ao servidor.';
            }
        });
    }
});