document.addEventListener('DOMContentLoaded', () => {
    const loanForm = document.getElementById('loanForm');
    const loansTable = document.getElementById('loansTable');
    const loanUserSelect = document.getElementById('loanUserSelect');
    const loanBookSelect = document.getElementById('loanBookSelect');
    const API_URL = 'http://localhost:3000';

    // Alimenta os selects de Usuários e Livros dinamicamente
    async function atualizarSelectsEmprestimo() {
        if (!loanUserSelect || !loanBookSelect) return;

        try {
            // Busca usuários leitores
            const resUsers = await fetch(`${API_URL}/usuarios`);
            const usuarios = await resUsers.json();
            loanUserSelect.innerHTML = '<option value="">Selecione o Leitor</option>';
            usuarios.forEach(u => {
                loanUserSelect.innerHTML += `<option value="${u.id}">${u.nome} (${u.perfil})</option>`;
            });

            // Busca livros disponíveis
            const resBooks = await fetch(`${API_URL}/livros`);
            const livros = await resBooks.json();
            loanBookSelect.innerHTML = '<option value="">Selecione o Livro</option>';
            livros.forEach(l => {
                if (l.quantidade > 0) {
                    loanBookSelect.innerHTML += `<option value="${l.id}">${l.titulo}</option>`;
                }
            });
        } catch (error) {
            console.error('Erro ao carregar selects de empréstimo:', error);
        }
    }

    // Carrega a listagem de empréstimos ativos
    async function carregarEmprestimos() {
        if (!loansTable) return;

        try {
            const response = await fetch(`${API_URL}/emprestimos`);
            const emprestimos = await response.json();
            
            loansTable.innerHTML = '';

            emprestimos.forEach(emp => {
                // Formatação simples de data básica
                const dataEmp = new Date(emp.data_emprestimo).toLocaleDateString('pt-BR');
                const dataPrev = new Date(emp.data_devolucao_prevista).toLocaleDateString('pt-BR');
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${emp.nome_leitor}</td>
                    <td>${emp.titulo_livro}</td>
                    <td>${dataEmp}</td>
                    <td>${dataPrev}</td>
                    <td><span class="status-badge ${emp.status}">${emp.status}</span></td>
                    <td>
                        <button class="btn-primary btn-sm" onclick="devolverLivro(${emp.id})">
                            <i class="fa-solid fa-arrow-rotate-left"></i> Receber Devolução
                        </button>
                    </td>
                `;
                loansTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar empréstimos:', error);
        }
    }

    // Enviar formulário de novo empréstimo
    if (loanForm) {
        loanForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dados = {
                usuario_id: loanUserSelect.value,
                livro_id: loanBookSelect.value,
                data_devolucao_prevista: document.getElementById('returnDate').value
            };

            try {
                const response = await fetch(`${API_URL}/emprestimos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    alert('Empréstimo registrado!');
                    loanForm.reset();
                    carregarEmprestimos();
                    atualizarSelectsEmprestimo();
                } else {
                    const errData = await response.json();
                    alert(errData.error || 'Erro ao realizar empréstimo.');
                }
            } catch (error) {
                console.error(error);
            }
        });
    }

    // Função global para dar baixa no empréstimo (Devolução)
    window.devolverLivro = async (id) => {
        if (confirm('Confirmar devolução deste exemplar?')) {
            try {
                const response = await fetch(`${API_URL}/emprestimos/${id}/devolucao`, { method: 'PUT' });
                if (response.ok) {
                    carregarEmprestimos();
                    atualizarSelectsEmprestimo();
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Torna a função visível para os outros arquivos JS atualizarem os dados em cascata
    window.atualizarSelectsEmprestimo = atualizarSelectsEmprestimo;

    // Executa as cargas iniciais
    atualizarSelectsEmprestimo();
    carregarEmprestimos();
});