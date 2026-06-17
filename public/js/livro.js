document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('bookForm');
    const booksTable = document.getElementById('booksTable');
    const searchBook = document.getElementById('searchBook');
    const editBookModal = document.getElementById('editBookModal');
    const editBookForm = document.getElementById('editBookForm');

   
    const URL_BASE = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000';

    
    async function carregarLivros(busca = '') {
        try {
            const response = await fetch(`${URL_BASE}/listarLivros`);
            if (!response.ok) return console.error('Erro ao buscar catálogo.');

            let livros = await response.json();
            
            if (busca) {
                livros = livros.filter(l => 
                    l.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                    l.autor.toLowerCase().includes(busca.toLowerCase())
                );
            }

            booksTable.innerHTML = ''; 

            livros.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.id_livro}</td>
                    <td><strong>${livro.titulo}</strong></td>
                    <td>${livro.autor}</td>
                    <td>${livro.ano_publicacao}</td>
                    <td>${livro.quantidade_disponivel}</td>
                    <td>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button class="btn-primary btn-sm" onclick="editarLivro(${livro.id_livro})">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn-danger btn-sm" onclick="deletarLivro(${livro.id_livro})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                booksTable.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao renderizar livros:', error);
        }
    }

    
    if (bookForm) {
        bookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dados = {
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                ano_publicacao: parseInt(document.getElementById('ano').value),
                quantidade_disponivel: parseInt(document.getElementById('quantidade').value)
            };

            try {
                const response = await fetch(`${URL_BASE}/cadastroLivro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    alert('Livro cadastrado com sucesso!');
                    bookForm.reset();
                    carregarLivros();
                    if (typeof atualizarSelectsEmprestimo === 'function') atualizarSelectsEmprestimo();
                }
            } catch (error) {
                console.error('Erro ao cadastrar:', error);
            }
        });
    }

   
    window.editarLivro = async (id_livro) => {
        try {
           
            const response = await fetch(`${URL_BASE}/listarLivros`);
            const livros = await response.json();
            const livro = Array.isArray(livros) ? livros.find(l => l.id_livro === id_livro) : null;

            if (!livro) return alert('Livro não localizado.');

            
            document.getElementById('edit_id_livro').value = livro.id_livro;
            document.getElementById('edit_titulo').value = livro.titulo;
            document.getElementById('edit_autor').value = livro.autor;
            document.getElementById('edit_ano').value = livro.ano_publicacao;
            document.getElementById('edit_quantidade').value = livro.quantidade_disponivel;

            
            editBookModal.style.display = 'flex';
        } catch (error) {
            console.error('Erro ao abrir edição:', error);
        }
    };

 
    if (editBookForm) {
        editBookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id_livro = document.getElementById('edit_id_livro').value;
            
            const dadosAtualizados = {
                titulo: document.getElementById('edit_titulo').value,
                autor: document.getElementById('edit_autor').value,
                ano_publicacao: parseInt(document.getElementById('edit_ano').value),
                quantidade_disponivel: parseInt(document.getElementById('edit_quantidade').value)
            };

            try {
                const response = await fetch(`${URL_BASE}/livro/${id_livro}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });

                if (response.ok) {
                    alert('Livro atualizado com sucesso!');
                    fecharModalEdicao();
                    carregarLivros();
                    if (typeof atualizarSelectsEmprestimo === 'function') atualizarSelectsEmprestimo();
                } else {
                    alert('Erro ao atualizar dados no servidor.');
                }
            } catch (error) {
                console.error('Erro na requisição PUT:', error);
            }
        });
    }

    
    window.fecharBookModalEdicao = () => {
        if (editBookModal) {
            editBookModal.style.display = 'none';
            editBookForm.reset();
        }
    };

    
    window.addEventListener('click', (e) => {
        if (e.target === editBookModal) fecharModalEdicao();
    });

  
    window.deletarLivro = async (id_livro) => {
        if (confirm('Deseja realmente excluir este livro permanentemente?')) {
            try {
                const response = await fetch(`${URL_BASE}/emprestimo/${id_livro}`, { method: 'DELETE' });
                if (response.status === 204 || response.ok) {
                    carregarLivros();
                    if (typeof atualizarSelectsEmprestimo === 'function') atualizarSelectsEmprestimo();
                }
            } catch (error) {
                console.error('Erro ao deletar:', error);
            }
        }
    };

    if (searchBook) {
        searchBook.addEventListener('input', (e) => carregarLivros(e.target.value));
    }

    
    carregarLivros();
});