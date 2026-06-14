document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    // Ajuste a porta se o seu servidor Node.js estiver rodando em uma porta diferente
    const API_URL = 'http://localhost:3000'; 

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que a página recarregue ao enviar o formulário

            // Captura os valores digitados nos inputs
            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');

            // Feedback visual de carregamento
            messageDiv.style.color = '#555';
            messageDiv.textContent = 'Autenticando...';

            try {
                // Dispara a requisição POST para a sua rota no Node
                const response = await fetch(`${API_URL}/validarLogin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usuario: email, senha: senha }) 
                });

                const data = await response.json();

                // Tratamento da resposta do servidor
                if (response.ok) {
                    messageDiv.style.color = 'green';
                    messageDiv.textContent = 'Login realizado com sucesso! Redirecionando...';
                    
                    // Salva os dados do usuário se necessário e redireciona
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                    setTimeout(() => {
                        window.location.href = 'dashboard.html'; // Troque pela sua página de painel
                    }, 1500);
                } else {
                    // Exibe a mensagem de erro que veio lá do res.status(401).json(...)
                    messageDiv.style.color = 'red';
                    messageDiv.textContent = data.error || 'Erro ao realizar login.';
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'Não foi possível conectar ao servidor. Verifique se a API está rodando.';
            }
        });
    }
});