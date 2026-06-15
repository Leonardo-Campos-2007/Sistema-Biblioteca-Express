document.addEventListener('DOMContentLoaded', () => {
    const catalogTable = document.getElementById('catalogTable');
    const myLoansTable = document.getElementById('myLoansTable');
    const searchCatalog = document.getElementById('searchCatalog');
    const loanModal = document.getElementById('loanModal');
    const loanForm = document.getElementById('loanForm');
    
    // Recupera os dados do usuário autenticado do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const URL_BASE = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';

    // 1. Carrega e renderiza o catálogo completo de livros mapeando propriedades comuns
    async function carregarCatalogo(busca = '') {
        if (!catalogTable) return;
        try {
            const response = await fetch(`${URL_BASE}/listarLivros`);
            if (!response.ok) throw new Error('Erro ao buscar dados do catálogo');
            
            let livros = await response.json();

            // Filtro dinâmico por input de texto
            if (busca) {
                livros = livros.filter(l => 
                    (l.titulo && l.titulo.toLowerCase().includes(busca.toLowerCase())) ||
                    (l.autor && l.autor.toLowerCase().includes(busca.toLowerCase()))
                );
            }

            catalogTable.innerHTML = '';

            livros.forEach(livro => {
                // Compatibilidade de propriedades com diferentes estruturas SQL padrão
                const idLivro = livro.id_livro || livro.id;
                const tituloLivro = livro.titulo;
                const autorLivro = livro.autor;
                const anoLivro = livro.ano_publicacao || livro.ano;
                const qtdDisponivel = livro.quantidade_disponivel !== undefined ? livro.quantidade_disponivel : livro.quantidade;

                const disponivel = qtdDisponivel > 0;
                const statusBadge = disponivel 
                    ? `<span class="status-badge ativo">Disponível (${qtdDisponivel})</span>` 
                    : `<span class="status-badge atrasado">Indisponível</span>`;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${idLivro}</td>
                    <td><strong>${tituloLivro}</strong></td>
                    <td>${autorLivro}</td>
                    <td>${anoLivro}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn-primary btn-sm" ${!disponivel ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} 
                                onclick="abrirModalEmprestimo(${idLivro}, '${tituloLivro.replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-hand-holding-hand"></i> Pegar Emprestado
                        </button>
                    </td>
                `;
                catalogTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao renderizar o catálogo:', error);
            catalogTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Falha ao carregar catálogo do banco de dados.</td></tr>`;
        }
    }

    // 2. Carrega estritamente os empréstimos pertencentes ao leitor logado (Exclusivos)
    async function carregarMeusEmprestimos() {
        if (!myLoansTable) return;
        if (!usuarioLogado) {
            myLoansTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:orange;">Usuário não identificado. Faça login novamente.</td></tr>`;
            return;
        }

        try {
            const response = await fetch(`${URL_BASE}/listarEmprestimos`);
            if (!response.ok) throw new Error('Erro ao buscar lista de empréstimos');
            
            const todosEmprestimos = await response.json();

            // ID do usuário obtido na sessão do login de forma limpa
            const idUsuarioLogado = usuarioLogado.id_usuario || usuarioLogado.id;

            // Filtra os registros unicamente deste leitor
            const meusEmprestimos = todosEmprestimos.filter(emp => 
                Number(emp.usuario_id) === Number(idUsuarioLogado) || 
                Number(emp.id_usuario) === Number(idUsuarioLogado)
            );

            myLoansTable.innerHTML = '';

            if (meusEmprestimos.length === 0) {
                myLoansTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#777;">Você não possui nenhum empréstimo ativo ou histórico registrado.</td></tr>`;
                return;
            }

            meusEmprestimos.forEach(emp => {
                const tituloLivro = emp.titulo || `Livro (ID: ${emp.livro_id || emp.id_livro})`;
                const dataEmp = emp.data_emprestimo ? new Date(emp.data_emprestimo).toLocaleDateString('pt-BR') : '-';
                const dataPrev = emp.data_devolucao_prevista || emp.data_devolucao ? new Date(emp.data_devolucao_prevista || emp.data_devolucao).toLocaleDateString('pt-BR') : '-';
                const statusAtual = emp.status_emprestimo || emp.status || 'Ativo';

                // Aplica estilos visuais à tag de status baseado no retorno
                let classeStatus = 'status-badge';
                if(statusAtual.toLowerCase() === 'ativo' || statusAtual.toLowerCase() === 'pendente') classeStatus += ' ativo';
                if(statusAtual.toLowerCase() === 'atrasado') classeStatus += ' atrasado';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${tituloLivro}</strong></td>
                    <td>${dataEmp}</td>
                    <td>${dataPrev}</td>
                    <td><span class="${classeStatus}">${statusAtual}</span></td>
                `;
                myLoansTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao puxar empréstimos do usuário:', error);
            myLoansTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro ao obter histórico de empréstimos.</td></tr>`;
        }
    }

    // 3. Controle de abertura do Formulário/Modal de Empréstimo
    window.abrirModalEmprestimo = (id, titulo) => {
        if (!loanModal) return;
        document.getElementById('form_id_livro').value = id;
        document.getElementById('form_titulo_livro').value = titulo;
        
        // Define uma data padrão mínima para o input de data (hoje)
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('form_data_devolucao').min = hoje;
        
        loanModal.style.display = 'flex';
    };

    window.fecharModalEmprestimo = () => {
        if (loanModal) loanModal.style.display = 'none';
        if (loanForm) loanForm.reset();
    };

// 4. Submissão do formulário totalmente adaptada ao seu backend original
    if (loanForm) {
        loanForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idLivroDigitado = document.getElementById('form_id_livro').value;
            const dataDevolucaoDigitada = document.getElementById('form_data_devolucao').value;
            const idUsuarioLogado = usuarioLogado.id_usuario || usuarioLogado.id;

            // Define a data de empréstimo como o dia de hoje (Formato: AAAA-MM-DD)
            const hoje = new Date().toISOString().split('T')[0];

            // 🌟 CORREÇÃO AQUI: Chaves mapeadas idênticas ao destructuring do seu backend:
            // const { livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, ... } = req.body;
            const dadosEmprestimo = {
                livro_id: Number(idLivroDigitado),
                usuario_id: Number(idUsuarioLogado),
                data_emprestimo: hoje,
                data_devolucao_prevista: dataDevolucaoDigitada,
                data_devolucao_real: null,         // Como está iniciando, ainda não foi devolvido
                status_emprestimo: 'Ativo'
            };

            try {
                // 🌟 CORREÇÃO AQUI: Mudado para a rota correta do seu backend '/emprestimo'
                const response = await fetch(`${URL_BASE}/emprestimo`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosEmprestimo)
                });

                const respostaServidor = await response.json();

                if (response.ok || response.status === 201) {
                    alert('Empréstimo registrado com sucesso!');
                    fecharModalEmprestimo();
                    
                    // Atualiza instantaneamente as tabelas do painel
                    carregarCatalogo();
                    carregarMeusEmprestimos();
                } else {
                    alert(`Falha ao registrar empréstimo: ${respostaServidor.error || 'Erro desconhecido'}`);
                }
            } catch (error) {
                console.error('Erro na requisição de empréstimo:', error);
                alert('Não foi possível conectar ao servidor para concluir o empréstimo.');
            }
        });
    }

    // Escuta o input de pesquisa e filtra em tempo real
    if (searchCatalog) {
        searchCatalog.addEventListener('input', (e) => {
            carregarCatalogo(e.target.value);
        });
    }

    // Inicialização da interface
    carregarCatalogo();
    carregarMeusEmprestimos();
});