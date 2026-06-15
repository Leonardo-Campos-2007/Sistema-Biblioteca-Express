document.addEventListener('DOMContentLoaded', () => {
    const loanForm = document.getElementById('loanForm');
    const loansTable = document.getElementById('loansTable');
    const leitorNome = document.getElementById('leitorNome');
    const livroTitulo = document.getElementById('livroTitulo');
    const editLoanModal = document.getElementById('editLoanModal');
    const editLoanForm = document.getElementById('editLoanForm');
    const API_URL = 'http://localhost:3000';
    let selectLivro;

    async function carregarLeitores(options) {
        if (!options) return;

        try {
            const response = await fetch(`${API_URL}/listarUsuarios`);
            if (!response.ok) throw new Error('Erro ao buscar leitores');

            const leitores = await response.json();

            options.innerHTML = '<option value="">Nenhum Selecionado</option>';

            leitores.forEach(lei => {
                const option = document.createElement('option');
                option.textContent = lei.nome;
                option.value = lei.id_usuario;
                options.appendChild(option);
            });

        } catch (error) {
            console.error('Erro ao carregar leitores:', error);
        }
    }

    async function carregarLivros(options) {
        if (!options) return;

        try {
            const response = await fetch(`${API_URL}/listarLivros`);
            if (!response.ok) throw new Error('Erro ao buscar livros');

            const livros = await response.json();

            options.innerHTML = '<option value="">Nenhum Selecionado</option>';

            livros.forEach(liv => {
                const option = document.createElement('option');
                option.textContent = liv.titulo;
                option.value = liv.id_livro;
                options.appendChild(option);
            });

        } catch (error) {
            console.error('Erro ao carregar livros:', error);
        }
    }

    async function carregarEmprestimos() {
        if (!loansTable) return;

        try {
            const response = await fetch(`${API_URL}/listarEmprestimos`);
            if (!response.ok) throw new Error('Erro ao buscar empréstimos');
            const emprestimos = await response.json();

            loansTable.innerHTML = '';

            emprestimos.forEach(emp => {
                const dataEmp = emp.data_emprestimo ? new Date(emp.data_emprestimo).toLocaleDateString('pt-BR') : '-';
                const dataPrev = emp.data_devolucao_prevista ? new Date(emp.data_devolucao_prevista).toLocaleDateString('pt-BR') : '-';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${emp.nome}</td>
                    <td>${emp.titulo}</td>
                    <td>${dataEmp}</td>
                    <td>${dataPrev}</td>
                    <td><span class="status-badge">${emp.status_emprestimo}</span></td>
                    <td>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button class="btn-primary btn-sm" onclick="editarEmprestimo(${emp.id_emprestimo})">
                                    <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn-danger btn-sm" onclick="deletarEmprestimo(${emp.id_emprestimo})">
                                    <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                loansTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar empréstimos:', error);
        }
    }

    if (loanForm) {
        loanForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dados = {
                livro_id: livroTitulo.value,
                usuario_id: leitorNome.value,
                data_emprestimo: document.getElementById('dataEmprestimo').value,
                data_devolucao_prevista: document.getElementById('dataDevolucaoPrevista').value,
                data_devolucao_real: document.getElementById('dataDevolucaoReal').value,
                status_emprestimo: document.getElementById('status').value
            };


            if (dados.livro_id != 0 || dados.usuario_id != 0) {
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
                        await fetch(`${API_URL}/livro/${dados.livro_id}/diminuir`, {
                            method: 'PUT'
                        });
                        location.reload();

                    } else {
                        const errData = await response.json();
                        alert(errData.error || 'Erro ao realizar empréstimo.');
                    }
                } catch (error) {
                    console.error('Erro ao enviar empréstimo:', error);
                }
            }
        });
    }

    window.editarEmprestimo = async (id_emprestimo) => {
        try {
            // Buscamos a lista para capturar os dados do livro selecionado
            const response = await fetch(`${API_URL}/listarEmprestimos`);
            const emprestimos = await response.json();
            const emprestimo = Array.isArray(emprestimos) ? emprestimos.find(e => e.id_emprestimo === id_emprestimo) : null;

            if (!emprestimo) return alert('Empréstimo não localizado.');

            window.livroAntigoId = emprestimo.id_livro;

            document.getElementById('edit_id_emprestimo').value = emprestimo.id_emprestimo
            leitor = document.getElementById('edit_leitor')
            livro = document.getElementById('edit_livro')

            leitor = carregarLeitores(leitor)
            livro = carregarLivros(livro)

            document.getElementById('edit_data_emprestimo').value =
                emprestimo.data_emprestimo?.split('T')[0];

            document.getElementById('edit_data_prevista').value =
                emprestimo.data_devolucao_prevista?.split('T')[0];

            document.getElementById('edit_data_real').value =
                emprestimo.data_devolucao_real
                    ? emprestimo.data_devolucao_real.split('T')[0]
                    : '';
            document.getElementById('edit_status').value = emprestimo.status_emprestimo;

            // Exibe o modal na tela mudando o estilo CSS
            editLoanModal.style.display = 'flex';
        } catch (error) {
            console.error('Erro ao abrir edição:', error);
        }
    };

    if (editLoanForm) {
        editLoanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id_emprestimo = document.getElementById('edit_id_emprestimo').value;

            const dadosAtualizados = {
                usuario_id: document.getElementById('edit_leitor').value,
                livro_id: document.getElementById('edit_livro').value,
                data_emprestimo: document.getElementById('edit_data_emprestimo').value,
                data_devolucao_prevista: document.getElementById('edit_data_prevista').value,
                data_devolucao_real: document.getElementById('edit_data_real').value,

                status_emprestimo: document.getElementById('edit_status').value
            };

            try {
                const response = await fetch(`${API_URL}/emprestimo/${id_emprestimo}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });

                if (response.ok) {
                    alert('Emprestimo atualizado com sucesso!');
                    fecharLoanModalEdicao();
                    carregarEmprestimos();
                    if (typeof carregarEmprestimos === 'function') carregarEmprestimos();
                    const novoLivroId = dadosAtualizados.livro_id
                    console.log(novoLivroId)
                    if (novoLivroId != window.livroAntigoId) {

                        await fetch(`${API_URL}/livro/${window.livroAntigoId}/aumentar`, {
                            method: 'PUT'
                        });

                        await fetch(`${API_URL}/livro/${novoLivroId}/diminuir`, {
                            method: 'PUT'
                        });
                    }
                    location.reload();
                    
                } else {
                    alert('Erro ao atualizar dados no servidor.');
                }
            } catch (error) {
                console.error('Erro na requisição PUT:', error);
            }
        });
    }

    // Funções para controle de fechamento do Modal
    window.fecharLoanModalEdicao = () => {
        if (editLoanModal) {
            editLoanModal.style.display = 'none';
            editLoanForm.reset();
        }
    };

    // Executa as cargas iniciais a tela
    carregarEmprestimos();
    carregarLeitores(leitorNome);
    carregarLivros(livroTitulo);
});