document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    
    const API_URL = 'http://localhost:3000'; 

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

          
            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');

            messageDiv.style.color = '#555';
            messageDiv.textContent = 'Autenticando...';

            try {
        
                const response = await fetch(`${API_URL}/validarLogin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email, senha: senha }) 
                });

                const data = await response.json();

                
if (response.ok) {
    if (messageDiv) {
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Login realizado com sucesso! Redirecionando...';
    }
    
   
    localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
    
    setTimeout(() => {
     
        const urlAtual = window.location.origin + window.location.pathname;
        const pastaAtual = urlAtual.substring(0, urlAtual.lastIndexOf('/'));

        if (data.usuario && data.usuario.perfil === 'bibliotecario') {
            window.location.href = `${pastaAtual}/bibliotecario.html`;
        } else {
       
            window.location.href = `${pastaAtual}/leitor.html`; 
        }
    }, 1500);
}else {
                    
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