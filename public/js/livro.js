document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('bookForm');
    const booksTable = document.getElementById('booksTable');
    const searchBook = document.getElementById('searchBook');
    const API_URL = 'http://localhost:3000'; // Ajuste a sua porta

    // Função para buscar e listar os livros
    async function carregarLivros(busca = '') {
        try {
            const response = await fetch(`${API_URL}/livros?search=${busca}`);
            const livros = await response.json();
            
            booksTable.innerHTML = ''; // Limpa a tabela

            livros.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.id}</td>
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.ano}</td>
                    <td>${livro.quantidade}</td>
                    <td>
                        <button class="btn-primary btn-sm" onclick="editarLivro(${livro.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-danger btn-sm" onclick="deletarLivro(${livro.id})">
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
            
            const dados = {
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                ano: document.getElementById('ano').value,
                quantidade: document.getElementById('quantidade').value
            };

            try {
                const response = await fetch(`${API_URL}/livros`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    alert('Livro salvo com sucesso!');
                    bookForm.reset();
                    carregarLivros(); // Atualiza a tabela
                    if (typeof atualizarSelectsEmprestimo === 'function') atualizarSelectsEmprestimo();
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
    window.deletarLivro = async (id) => {
        if (confirm('Deseja realmente excluir este livro?')) {
            try {
                const response = await fetch(`${API_URL}/livros/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    carregarLivros();
                    if (typeof atualizarSelectsEmprestimo === 'function') atualizarSelectsEmprestimo();
                }
            } catch (error) {
                console.error('Erro ao deletar livro:', error);
            }
        }
    };

    window.editarLivro = (id) => {
        // Implementação do preenchimento para edição (opcional/PUT)
        alert('Função para carregar dados do ID ' + id + ' no formulário para atualizar.');
    };

    // Inicializa a listagem ao abrir a página
    carregarLivros();
});