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
                    body: JSON.stringify({ email: email, senha: senha }) 
                });

                const data = await response.json();

                // Tratamento da resposta do servidor
              // Tratamento da resposta do servidor dentro do evento de submit
if (response.ok) {
    if (messageDiv) {
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Login realizado com sucesso! Redirecionando...';
    }
    
    // Guarda os dados do usuário para usarmos no painel
    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
    
    setTimeout(() => {
        // Captura o endereço da pasta atual do seu projeto frontend
        const urlAtual = window.location.origin + window.location.pathname;
        const pastaAtual = urlAtual.substring(0, urlAtual.lastIndexOf('/'));

        // 🔥 Força o redirecionamento correto para as páginas existentes:
        if (data.usuario && data.usuario.perfil === 'bibliotecario') {
            window.location.href = `${pastaAtual}/bibliotecario.html`;
        } else {
            // Garante que o leitor vá direto para o arquivo certo
            window.location.href = `${pastaAtual}/leitor.html`; 
        }
    }, 1500);
}else {
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