document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os botões das abas e os conteúdos de cada uma
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const goRegister = document.getElementById('goRegister');

    // Função responsável por alternar a exibição das telas
    function switchTab(tabId) {
        // Remove o estado ativo de todas as abas e conteúdos
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Ativa apenas a aba e o conteúdo que foram clicados
        const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
        const targetContent = document.getElementById(tabId);

        if (targetBtn && targetContent) {
            targetBtn.classList.add('active');
            targetContent.classList.add('active');
        }
    }

    // Configura o clique para os botões do topo (Login e Cadastro)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Configura o clique para o link "Criar conta" lá embaixo
    if (goRegister) {
        goRegister.addEventListener('click', (e) => {
            e.preventDefault(); // Impede o link de recarregar a página
            switchTab('register'); // Força a mudança para a aba de cadastro
        });
    }
});

const goLibrarian = document.getElementById('goLibrarian');
const backToLogin = document.getElementById('backToLogin');

// Abre a tela de login do bibliotecário
if (goLibrarian) {
    goLibrarian.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('librarian'); // Esconde os outros e mostra a div #librarian
    });
}

// Retorna para a tela de login comum
if (backToLogin) {
    backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('login'); // Volta para o formulário comum
    });
}

function logout() {
    // Caso use autenticação futuramente, limpe os dados aqui:
    // localStorage.removeItem('usuarioLogado');
    
    // Redireciona para a página inicial
    window.location.href = 'index.html';
}