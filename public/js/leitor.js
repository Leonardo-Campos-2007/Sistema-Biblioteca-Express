document.addEventListener('DOMContentLoaded', () => {
    const catalogTable = document.getElementById('catalogTable');
    const myLoansTable = document.getElementById('myLoansTable');
    const searchCatalog = document.getElementById('searchCatalog');
    const loanModal = document.getElementById('loanModal');
    const loanForm = document.getElementById('loanForm');

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const URL_BASE = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';


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


    async function carregarMeusEmprestimos() {
        if (!myLoansTable) return;
        if (!usuarioLogado) {
            myLoansTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:orange;">Usuário não identificado. Faça login novamente.</td></tr>`;
            return;
        }

        try {

            console.log("=== DIAGNÓSTICO DE SESSÃO ===");
            console.log("Objeto do Usuário Logado no LocalStorage:", usuarioLogado);


            const idUsuarioLogado = usuarioLogado.usuario_id || usuarioLogado.id_usuario || usuarioLogado.id || usuarioLogado.id_usuarios;
            console.log("ID do Usuário Logado extraído para filtro:", idUsuarioLogado);


            const resLivros = await fetch(`${URL_BASE}/listarLivros`);
            const todosOsLivros = resLivros.ok ? await resLivros.json() : [];


            const response = await fetch(`${URL_BASE}/listarEmprestimos`);
            if (!response.ok) throw new Error('Erro ao buscar lista de empréstimos do servidor');

            const todosEmprestimos = await response.json();
            console.log("Todos os empréstimos brutos vindos da API:", todosEmprestimos);


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

                const dataEmp = emp.data_emprestimo ? new Date(emp.data_emprestimo).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
                const dataPrev = (emp.data_devolucao_prevista || emp.data_devolucao) ? new Date(emp.data_devolucao_prevista || emp.data_devolucao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
                const statusAtual = emp.status_emprestimo || emp.status || 'Ativo';

                let classeStatus = 'status-badge';

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
            console.error('Erro crítico ao renderizar empréstimos:', error);
            myLoansTable.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Erro ao obter histórico de empréstimos.</td></tr>`;
        }
    }


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


    if (searchCatalog) {
        searchCatalog.addEventListener('input', (e) => {
            carregarCatalogo(e.target.value);
        });
    }


    carregarCatalogo();
    carregarMeusEmprestimos();
});