document.addEventListener('DOMContentLoaded', () => {
    const usersTable = document.getElementById('usersTable');
    const API_URL = 'http://localhost:3000';

    async function carregarUsuarios() {
        if (!usersTable) return;
        
        try {
            const response = await fetch(`${API_URL}/usuarios`);
            const usuarios = await response.json();
            
            usersTable.innerHTML = '';

            usuarios.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nome}</td>
                    <td>${user.email}</td>
                    <td><span class="badge">${user.perfil}</span></td>
                    <td>
                        <button class="btn-danger btn-sm" onclick="deletarUsuario(${user.id})">
                            <i class="fa-solid fa-user-minus"></i>
                        </button>
                    </td>
                `;
                usersTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    }

    window.deletarUsuario = async (id) => {
        if (confirm('Remover este usuário do sistema?')) {
            try {
                const response = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    carregarUsuarios();
                    if (typeof atualizarSelectsEmprestimo === 'function') atualizarSelectsEmprestimo();
                }
            } catch (error) {
                console.error('Erro ao deletar usuário:', error);
            }
        }
    };

    carregarUsuarios();
});