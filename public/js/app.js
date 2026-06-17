document.addEventListener('DOMContentLoaded', () => {
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const goRegister = document.getElementById('goRegister');

   
    function switchTab(tabId) {
        
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

       
        const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
        const targetContent = document.getElementById(tabId);

        if (targetBtn && targetContent) {
            targetBtn.classList.add('active');
            targetContent.classList.add('active');
        }
    }

    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    
    if (goRegister) {
        goRegister.addEventListener('click', (e) => {
            e.preventDefault(); 
            switchTab('register'); 
        });
    }
});

const goLibrarian = document.getElementById('goLibrarian');
const backToLogin = document.getElementById('backToLogin');


if (goLibrarian) {
    goLibrarian.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('librarian'); 
    });
}


if (backToLogin) {
    backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('login'); 
    });
}

function logout() {
  
    
 
    window.location.href = 'index.html';
}