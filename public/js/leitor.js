document.addEventListener('DOMContentLoaded', () => {
    const catalogTable = document.getElementById('catalogTable');
    const myLoansTable = document.getElementById('myLoansTable');
    const searchCatalog = document.getElementById('searchCatalog');
    
    // Recupera os dados do usuário logado pelo localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const URL_BASE = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';

    // 1. Carrega e renderiza o catálogo completo de livros
    async function carregarCatalogo(busca = '') {
        if (!catalogTable) return;
        try {
            const response = await fetch(`${URL_BASE}/listarLivros`);
            if (!response.ok) throw new Error('Erro ao buscar livros');
            
            let livros = await response.json();

            // Filtro em tempo real por título ou autor
            if (busca) {
                livros = livros.filter(l => 
                    l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                    l.autor.toLowerCase().includes(busca.toLowerCase())
                );
            }

            catalogTable.innerHTML = '';

            livros.forEach(livro => {
                // Define o badge de disponibilidade baseado na quantidade
                const disponivel = livro.quantidade_disponivel > 0;
                const statusBadge = disponivel 
                    ? `<span class="status-badge ativo">Disponível (${livro.quantidade_disponivel})</span>` 
                    : `<span class="status-badge atrasado">Indisponível</span>`;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.id_livro}</td>
                    <td><strong>${livro.titulo}</strong></td>
                    <td>${livro.autor}</td>
                    <td>${livro.ano_publicacao}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn-primary btn-sm" ${!disponivel ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} onclick="solicitarReserva(${livro.id_livro})">
                            <i class="fa-solid fa-bookmark"></i> Reservar
                        </button>
                    </td>
                `;
                catalogTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar catálogo:', error);
        }
    }

    // 2. Carrega apenas os empréstimos pertencentes ao leitor logado
    async function carregarMeusEmprestimos() {
        if (!myLoansTable || !usuarioLogado) return;
        try {
            const response = await fetch(`${URL_BASE}/listarEmprestimos`);
            if (!response.ok) throw new Error('Erro ao buscar empréstimos');
            
            const todosEmprestimos = await response.json();

            // Filtra os registros trazendo apenas os que possuem o id_usuario correspondente ao logado
            const meusEmprestimos = todosEmprestimos.filter(emp => emp.usuario_id === usuarioLogado.id_usuario);

            myLoansTable.innerHTML = '';

            if (meusEmprestimos.length === 0) {
                myLoansTable.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#777;">Você não possui nenhum empréstimo registrado.</td></tr>`;
                return;
            }

            meusEmprestimos.forEach(emp => {
                const dataEmp = emp.data_emprestimo ? new Date(emp.data_emprestimo).toLocaleDateString('pt-BR') : '-';
                const dataPrev = emp.data_devolucao_prevista ? new Date(emp.data_devolucao_prevista).toLocaleDateString('pt-BR') : '-';
                const statusAtual = emp.status_emprestimo || 'Ativo';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>ID do Livro: ${emp.livro_id}</td>
                    <td>${dataEmp}</td>
                    <td>${dataPrev}</td>
                    <td><span class="status-badge">${statusAtual}</span></td>
                    <td>
                        <button class="btn-secondary btn-sm" disabled style="opacity: 0.6;">
                            <i class="fa-solid fa-clock-rotate-left"></i> Acompanhar
                        </button>
                    </td>
                `;
                myLoansTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar empréstimos do leitor:', error);
        }
    }

    // Função de clique para simular ou criar uma reserva imediata
    window.solicitarReserva = (id_livro) => {
        alert(`Solicitação para o Livro ID ${id_livro} enviada! Procure o bibliotecário para fazer a retirada.`);
    };

    // Escuta o input de pesquisa para atualizar o catálogo instantaneamente
    if (searchCatalog) {
        searchCatalog.addEventListener('input', (e) => {
            carregarCatalogo(e.target.value);
        });
    }

    // Inicializa os dados na tela
    carregarCatalogo();
    carregarMeusEmprestimos();
});