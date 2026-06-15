document.addEventListener('DOMContentLoaded', () => {
    const loanForm = document.getElementById('loanForm');
    const loansTable = document.getElementById('loansTable');
    const loanUserSelect = document.getElementById('loanUserSelect');
    const loanBookSelect = document.getElementById('loanBookSelect');
    const API_URL = 'http://localhost:3000';

    // Alimenta os selects de Usuários e Livros dinamicamente com as suas rotas reais
    async function atualizarSelectsEmprestimo() {
        if (!loanUserSelect || !loanBookSelect) return;

        try {
            // 1. Busca usuários usando sua rota real: GET /listarUsuarios
            const resUsers = await fetch(`${API_URL}/listarUsuarios`);
            if (!resUsers.ok) throw new Error('Erro ao listar usuários');
            const usuarios = await resUsers.json();
            
            loanUserSelect.innerHTML = '<option value="">Selecione o Leitor</option>';
            usuarios.forEach(u => {
                // Ajustado para usar o seu 'id_usuario' do banco de dados
                loanUserSelect.innerHTML += `<option value="${u.id_usuario}">${u.nome} (${u.perfil})</option>`;
            });

            // 2. Busca livros disponíveis usando sua rota real: GET /listarLivros
            const resBooks = await fetch(`${API_URL}/listarLivros`);
            if (!resBooks.ok) throw new Error('Erro ao listar livros');
            const livros = await resBooks.json();
            
            loanBookSelect.innerHTML = '<option value="">Selecione o Livro</option>';
            livros.forEach(l => {
                // Ajustado para usar o seu 'quantidade_disponivel' e 'id_livro' do banco
                if (l.quantidade_disponivel > 0) {
                    loanBookSelect.innerHTML += `<option value="${l.id_livro}">${l.titulo} (${l.quantidade_disponivel} disp.)</option>`;
                }
            });
        } catch (error) {
            console.error('Erro ao carregar selects de empréstimo:', error);
        }
    }

    // Carrega a listagem de empréstimos
    async function carregarEmprestimos() {
        if (!loansTable) return;

        try {
            // Sincronizado com a sua rota real: GET /listarEmprestimos
            const response = await fetch(`${API_URL}/listarEmprestimos`);
            if (!response.ok) throw new Error('Erro ao buscar empréstimos');
            const emprestimos = await response.json();
            
            loansTable.innerHTML = '';

            emprestimos.forEach(emp => {
                // Formatação segura de data
                const dataEmp = emp.data_emprestimo ? new Date(emp.data_emprestimo).toLocaleDateString('pt-BR') : '-';
                const dataPrev = emp.data_devolucao_prevista ? new Date(emp.data_devolucao_prevista).toLocaleDateString('pt-BR') : '-';
                
                // Mapeia o seu status_emprestimo (caso venha nulo, assume 'Ativo')
                const statusAtual = emp.status_emprestimo || 'Ativo';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>ID Leitor: ${emp.usuario_id}</td>
                    <td>ID Livro: ${emp.livro_id}</td>
                    <td>${dataEmp}</td>
                    <td>${dataPrev}</td>
                    <td><span class="status-badge">${statusAtual}</span></td>
                    <td>
                        <button class="btn-primary btn-sm" onclick="devolverLivro(${emp.id_emprestimo})">
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

            const hoje = new Date().toISOString().slice(0, 10); // Gera a data de hoje no formato YYYY-MM-DD

            // Montado EXATAMENTE com as colunas que o seu INSERT INTO emprestimo espera no req.body
            const dados = {
                livro_id: parseInt(loanBookSelect.value),
                usuario_id: parseInt(loanUserSelect.value),
                data_emprestimo: hoje,
                data_devolucao_prevista: document.getElementById('returnDate').value,
                data_devolucao_real: null,
                status_emprestimo: 'Ativo'
            };

            try {
                // Sincronizado com a sua rota real de inserção: POST /emprestimo
                const response = await fetch(`${API_URL}/emprestimo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    alert('Empréstimo registrado com sucesso!');
                    loanForm.reset();
                    carregarEmprestimos();
                    atualizarSelectsEmprestimo();
                } else {
                    const errData = await response.json();
                    alert(errData.error || 'Erro ao realizar empréstimo.');
                }
            } catch (error) {
                console.error('Erro ao enviar empréstimo:', error);
            }
        });
    }

    // Função global para atualizar o empréstimo (Devolução / PUT)
    window.devolverLivro = async (id_emprestimo) => {
        if (confirm('Confirmar devolução deste exemplar?')) {
            try {
                // O seu arquivo api.js possui a rota PUT /emprestimo/:id_emprestimo para edição.
                // Aqui nós avisamos o backend qual empréstimo deve ser alterado.
                // NOTA: Para uma baixa perfeita, o seu backend deve atualizar a 'data_devolucao_real' e o 'status_emprestimo' nesta rota.
                
                const hoje = new Date().toISOString().slice(0, 10);
                
                // Como a sua rota PUT atual do backend exige reenvio dos dados para o UPDATE completo,
                // enviamos o status atualizado para 'Devolvido' e a data real de hoje.
                const dadosAtualizacao = {
                    status_emprestimo: 'Devolvido',
                    data_devolucao_real: hoje
                };

                const response = await fetch(`${API_URL}/emprestimo/${id_emprestimo}`, { 
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizacao)
                });

                if (response.ok) {
                    alert('Devolução registrada com sucesso!');
                    carregarEmprestimos();
                    atualizarSelectsEmprestimo();
                } else {
                    alert('Erro ao atualizar o status do empréstimo no servidor.');
                }
            } catch (error) {
                console.error('Erro ao devolver livro:', error);
            }
        }
    };

    // Torna a função visível para os outros arquivos JS (como livro.js) atualizarem os dados em cascata
    window.atualizarSelectsEmprestimo = atualizarSelectsEmprestimo;

    // Executa as cargas iniciais na tela
    atualizarSelectsEmprestimo();
    carregarEmprestimos();
});