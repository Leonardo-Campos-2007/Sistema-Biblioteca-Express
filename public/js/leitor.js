document.addEventListener('DOMContentLoaded', () => {
    const catalogTable = document.getElementById('catalogTable');
    const myLoansTable = document.getElementById('myLoansTable');
    const searchCatalog = document.getElementById('searchCatalog');
    const loanModal = document.getElementById('loanModal');
    const loanForm = document.getElementById('loanForm');
    
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const URL_BASE = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';

    // 1. Carrega e renderiza o catálogo completo de livros
    async function carregarCatalogo(busca = '') {
        if (!catalogTable) return;
        try {
            const response = await fetch(`${URL_BASE}/listarLivros`);
            if (!response.ok) throw new Error('Erro ao buscar dados do catálogo');
            
            let livros = await response.json();

            if (busca) {
                livros = livros.filter(l => 
                    (l.titulo && l.titulo.toLowerCase().includes(busca.toLowerCase())) ||
                    (l.autor && l.autor.toLowerCase().includes(busca.toLowerCase()))
                );
            }

            catalogTable.innerHTML = '';

            livros.forEach(livro => {
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

    // 2. Carrega estritamente os empréstimos pertencentes ao leitor logado (Exclusivos com Diagnóstico)
    async function carregarMeusEmprestimos() {
        if (!myLoansTable) return;
        if (!usuarioLogado) {
            myLoansTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:orange;">Usuário não identificado. Faça login novamente.</td></tr>`;
            return;
        }

        try {
            // Diagnóstico inicial no console F12
            console.log("=== DIAGNÓSTICO DE SESSÃO ===");
            console.log("Objeto do Usuário Logado no LocalStorage:", usuarioLogado);

            // Tenta achar qualquer variação de ID salva na sessão do usuário
            const idUsuarioLogado = usuarioLogado.usuario_id || usuarioLogado.id_usuario || usuarioLogado.id || usuarioLogado.id_usuarios;
            console.log("ID do Usuário Logado extraído para filtro:", idUsuarioLogado);

            // 1. Busca os livros para traduzir IDs em Títulos (Caso a query falhe em trazer o join)
            const resLivros = await fetch(`${URL_BASE}/listarLivros`);
            const todosOsLivros = resLivros.ok ? await resLivros.json() : [];

            // 2. Busca todos os empréstimos do banco
            const response = await fetch(`${URL_BASE}/listarEmprestimos`);
            if (!response.ok) throw new Error('Erro ao buscar lista de empréstimos do servidor');
            
            const todosEmprestimos = await response.json();
            console.log("Todos os empréstimos brutos vindos da API:", todosEmprestimos);

            // Filtra os registros procurando qualquer variação de nome de coluna de ID que venha do banco
            const meusEmprestimos = todosEmprestimos.filter(emp => {
                const idNoBanco = emp.id_usuario || emp.usuario_id || emp.id_usuarios || emp.usuario || emp.idLeitor;
                console.log(`Comparando livro do banco (User ID: ${idNoBanco}) com o Logado (ID: ${idUsuarioLogado})`);
                return String(idNoBanco) === String(idUsuarioLogado);
            });

            console.log("Empréstimos encontrados após o filtro por ID:", meusEmprestimos);
            console.log("=============================");

            myLoansTable.innerHTML = '';

            if (meusEmprestimos.length === 0) {
                myLoansTable.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#777;">Você não possui nenhum empréstimo ativo ou histórico registrado.</td></tr>`;
                return;
            }

            meusEmprestimos.forEach(emp => {
                const idEmprestimo = emp.id_emprestimo;
                const idDoLivroEmp = emp.livro_id || emp.id_livro;
                const dadosDoLivro = todosOsLivros.find(l => Number(l.id_livro || l.id) === Number(idDoLivroEmp));
                
                const tituloLivro = emp.titulo || (dadosDoLivro ? dadosDoLivro.titulo : `Livro (Código ID: ${idDoLivroEmp})`);
                
                const dataEmp = emp.data_emprestimo ? new Date(emp.data_emprestimo).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-';
                const dataPrev = (emp.data_devolucao_prevista || emp.data_devolucao) ? new Date(emp.data_devolucao_prevista || emp.data_devolucao).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-';
                const statusAtual = emp.status_emprestimo || emp.status || 'Ativo';

                let classeStatus = 'status-badge';
                let botaoDevolver = '';

                // Se o livro estiver Ativo ou Pendente, permite a devolução pelo painel
                if (statusAtual.toLowerCase() === 'ativo' || statusAtual.toLowerCase() === 'pendente') {
                    classeStatus += ' ativo';
                    botaoDevolver = `
                        <button class="btn-danger btn-sm" style="padding: 2px 8px; font-size: 0.8rem; cursor: pointer;" 
                                onclick="devolverLivro(${idEmprestimo}, ${idDoLivroEmp})">
                            <i class="fa-solid fa-arrow-rotate-left"></i> Devolver
                        </button>
                    `;
                } else if (statusAtual.toLowerCase() === 'atrasado') {
                    classeStatus += ' atrasado';
                    botaoDevolver = `
                        <button class="btn-danger btn-sm" style="padding: 2px 8px; font-size: 0.8rem; cursor: pointer;" 
                                onclick="devolverLivro(${idEmprestimo}, ${idDoLivroEmp})">
                            <i class="fa-solid fa-arrow-rotate-left"></i> Devolver
                        </button>
                    `;
                } else {
                    classeStatus += ' encerrado'; // Para o status 'Devolvido'
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${tituloLivro}</strong></td>
                    <td>${dataEmp}</td>
                    <td>${dataPrev}</td>
                    <td><span class="${classeStatus}">${statusAtual}</span></td>
                    <td style="text-align: center;">${botaoDevolver || '-'}</td>
                `;
                myLoansTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro crítico ao renderizar empréstimos:', error);
            myLoansTable.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Erro ao obter histórico de empréstimos.</td></tr>`;
        }
    }

    // 3. Controle do Modal
    window.abrirModalEmprestimo = (id, titulo) => {
        if (!loanModal) return;
        document.getElementById('form_id_livro').value = id;
        document.getElementById('form_titulo_livro').value = titulo;
        
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('form_data_devolucao').min = hoje;
        
        loanModal.style.display = 'flex';
    };

    window.fecharModalEmprestimo = () => {
        if (loanModal) loanModal.style.display = 'none';
        if (loanForm) loanForm.reset();
    };

    // 4. Submissão do formulário (Pegar Livro Emprestado)
    if (loanForm) {
        loanForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idLivroDigitado = document.getElementById('form_id_livro').value;
            const dataDevolucaoDigitada = document.getElementById('form_data_devolucao').value;
            const idUsuarioLogado = usuarioLogado.usuario_id || usuarioLogado.id_usuario || usuarioLogado.id || usuarioLogado.id_usuarios;

            const hoje = new Date().toISOString().split('T')[0];

            const dadosEmprestimo = {
                livro_id: Number(idLivroDigitado),
                usuario_id: Number(idUsuarioLogado),
                data_emprestimo: hoje,
                data_devolucao_prevista: dataDevolucaoDigitada,
                data_devolucao_real: null,
                status_emprestimo: 'Ativo'
            };

            // Validação de segurança baseada na regra do seu código anterior
            if (dadosEmprestimo.livro_id !== 0 && dadosEmprestimo.usuario_id !== 0) {
                try {
                    const response = await fetch(`${URL_BASE}/emprestimo`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dadosEmprestimo)
                    });

                    const respostaServidor = await response.json();

                    if (response.ok || response.status === 201) {
                        alert('Empréstimo registrado com sucesso! O estoque foi atualizado.');
                        fecharModalEmprestimo();
                        
                        // Atualiza as duas tabelas dinamicamente em tempo real
                        carregarCatalogo();
                        carregarMeusEmprestimos();
                    } else {
                        alert(`Falha ao registrar empréstimo: ${respostaServidor.error || 'Erro desconhecido'}`);
                    }
                } catch (error) {
                    console.error('Erro na requisição de empréstimo:', error);
                    alert('Não foi possível conectar ao servidor para concluir o empréstimo.');
                }
            }
        });
    }

    // 5. Função Global para Devolução de Livros
    window.devolverLivro = async (idEmprestimo, idLivro) => {
        if (!confirm('Tem certeza que deseja devolver este livro e atualizar o acervo?')) return;

        const hoje = new Date().toISOString().split('T')[0];
        const idUsuarioLogado = usuarioLogado.usuario_id || usuarioLogado.id_usuario || usuarioLogado.id || usuarioLogado.id_usuarios;

        // Monta o corpo com as informações necessárias para atualizar a rota PUT /emprestimo/:id
        const dadosDevolucao = {
            livro_id: Number(idLivro),
            usuario_id: Number(idUsuarioLogado),
            data_devolucao_real: hoje,
            status_emprestimo: 'Devolvido'
        };

        try {
            const response = await fetch(`${URL_BASE}/emprestimo/${idEmprestimo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosDevolucao)
            });

            if (response.ok) {
                alert('Livro devolvido com sucesso! O estoque foi reabastecido.');
                
                // Recarrega as tabelas da tela sem precisar dar reload total
                carregarCatalogo();
                carregarMeusEmprestimos();
            } else {
                const errData = await response.json();
                alert(errData.error || 'Erro ao processar devolução no servidor.');
            }
        } catch (error) {
            console.error('Erro na requisição de devolução:', error);
            alert('Não foi possível conectar ao servidor para processar a devolução.');
        }
    };

    if (searchCatalog) {
        searchCatalog.addEventListener('input', (e) => {
            carregarCatalogo(e.target.value);
        });
    }

    // Inicialização da página
    carregarCatalogo();
    carregarMeusEmprestimos();
});