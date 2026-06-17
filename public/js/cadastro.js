document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    
    const API_URL = 'http://localhost:3000'; 

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            
            const nome = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('password').value;
            const confirmarSenha = document.getElementById('confirmPassword').value;
            const perfil = document.getElementById('role').value;
            const messageDiv = document.getElementById('registerMessage');

            
            if (senha !== confirmarSenha) {
                messageDiv.style.color = 'red';
                messageDiv.textContent = 'As senhas não coincidem!';
                return; 
            }

            
            messageDiv.style.color = '#555';
            messageDiv.textContent = 'Processando cadastro...';

            try {
                
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

                
                if (response.ok) {
                    messageDiv.style.color = 'green';
                    messageDiv.textContent = 'Usuário cadastrado com sucesso!';
                    
                   
                    registerForm.reset();

                    
                    setTimeout(() => {
                        messageDiv.textContent = '';
                        
                        const loginTabBtn = document.querySelector('[data-tab="login"]');
                        if (loginTabBtn) loginTabBtn.click();
                    }, 2000);

                } else {
                    
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