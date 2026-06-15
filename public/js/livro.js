document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('bookForm');
    const booksTable = document.getElementById('booksTable');
    const searchBook = document.getElementById('searchBook');
    const API_URL = 'http://localhost:3000'; // Ajuste a sua porta caso mude

    // Função para buscar e listar os livros
    async function carregarLivros(busca = '') {
        try {
            // Sincronizado com a sua rota GET /listarLivros
            const response = await fetch(`${API_URL}/listarLivros`);
            
            if (!response.ok) {
                console.error(`Erro ${response.status} ao carregar livros.`);
                return;
            }

            let livros = await response.json();
            
            // Filtro em tempo real no frontend baseado no título ou autor
            if (busca) {
                livros = livros.filter(livro => 
                    livro.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                    livro.autor.toLowerCase().includes(busca.toLowerCase())
                );
            }
            
            booksTable.innerHTML = ''; // Limpa a tabela

            livros.forEach(livro => {
                const tr = document.createElement('tr');
                // Ajustado para mapear as colunas exatas do seu banco de dados: id_livro, ano_publicacao, quantidade_disponivel
                tr.innerHTML = `
                    <td>${livro.id_livro}</td>
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.ano_publicacao}</td>
                    <td>${livro.quantidade_disponivel}</td>
                    <td>
                        <button class="btn-primary btn-sm" onclick="editarLivro(${livro.id_livro})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-danger btn-sm" onclick="deletarLivro(${livro.id_livro})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                booksTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
        }
    }

    // Evento de Cadastrar/Salvar Livro
    if (bookForm) {
        bookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Sincronizado com as propriedades esperadas no seu req.body do backend
            const dados = {
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                ano_publicacao: parseInt(document.getElementById('ano').value),
                quantidade_disponivel: parseInt(document.getElementById('quantidade').value)
            };

            try {
                // Sincronizado com a sua rota POST /cadastroLivro
                const response = await fetch(`${API_URL}/cadastroLivro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    alert('Livro salvo com sucesso!');
                    bookForm.reset();
                    carregarLivros(); // Atualiza a tabela dinamicamente
                    if (typeof atualizarSelectsEmprestimo === 'function') atualizarSelectsEmprestimo();
                } else {
                    const errData = await response.json();
                    alert(errData.error || 'Erro ao salvar o livro.');
                }
            } catch (error) {
                console.error('Erro ao salvar livro:', error);
            }
        });
    }

    // Evento de Busca em tempo real
    if (searchBook) {
        searchBook.addEventListener('input', (e) => {
            carregarLivros(e.target.value);
        });
    }

    // Funções globais para os botões da tabela alcançarem
    window.deletarLivro = async (id_livro) => {
        if (confirm('Deseja realmente excluir este livro?')) {
            try {
                // Sincronizado com a sua rota DELETE /livro/:id_livro
                const response = await fetch(`${API_URL}/livro/${id_livro}`, { method: 'DELETE' });
                
                if (response.status === 204 || response.ok) {
                    carregarLivros();
                    if (typeof atualizarSelectsEmprestimo === 'function') atualizarSelectsEmprestimo();
                } else {
                    alert('Não foi possível deletar o livro.');
                }
            } catch (error) {
                console.error('Erro ao deletar livro:', error);
            }
        }
    };

    window.editarLivro = (id_livro) => {
        // Rota correspondente no seu backend para edição: PUT /livro/:id_livro
        alert('Pronto para carregar dados do ID do livro ' + id_livro + ' no formulário para atualizar via PUT.');
    };

    // Inicializa a listagem ao abrir a página
    carregarLivros();
});