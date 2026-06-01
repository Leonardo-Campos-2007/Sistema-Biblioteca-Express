/* ==========================
   ELEMENTOS
========================== */

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const bookForm =
    document.getElementById("bookForm");

const booksTable =
    document.getElementById("booksTable");

const searchBook =
    document.getElementById("searchBook");

const loansTable =
    document.getElementById("loansTable");

const catalogTable =
    document.getElementById("catalogTable");

const myLoansTable =
    document.getElementById("myLoansTable");

let editingBookId = null;

const loadingOverlay = document.getElementById("loadingOverlay");
const toastContainer = document.getElementById("toastContainer");

const goRegister = document.getElementById("goRegister");

/* ==========================
   ABAS
========================== */

tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        const tab = button.dataset.tab;

        tabButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        tabContents.forEach(content =>
            content.classList.remove("active")
        );

        button.classList.add("active");

        document
            .getElementById(tab)
            .classList.add("active");
    });

});

/* Link Criar Conta */

if (goRegister) {

    goRegister.addEventListener("click", e => {

        e.preventDefault();

        document
            .querySelector('[data-tab="register"]')
            .click();
    });

}

/* ==========================
   TOAST
========================== */

function showToast(message, type = "success") {

    if (!toastContainer) {

        console.log(type + ": " + message);

        return;
    }

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.innerHTML = `
        <strong>${message}</strong>
    `;

    toastContainer.appendChild(
        toast
    );

    setTimeout(() => {

        toast.remove();

    }, 4000);

}

/* ==========================
   LOADING
========================== */

function showLoading() {
    loadingOverlay.classList.add("active");
}

function hideLoading() {
    loadingOverlay.classList.remove("active");
}

/* ==========================
   VALIDAÇÕES
========================== */

function validateEmail(email) {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

}

function validatePassword(password) {

    return password.length >= 8;

}

/* ==========================
   LOCAL STORAGE
========================== */

function getUsers() {

    return JSON.parse(
        localStorage.getItem("users")
    ) || [];

}

function saveUsers(users) {

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

}

/* ==========================
   CADASTRO
========================== */

if (registerForm) {

    registerForm.addEventListener("submit", e => {

        e.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const role =
            document.getElementById("role").value;

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword ||
            !role
        ) {

            showToast(
                "Preencha todos os campos.",
                "error"
            );

            return;
        }

        if (!validateEmail(email)) {

            showToast(
                "Email inválido.",
                "error"
            );

            return;
        }

        if (!validatePassword(password)) {

            showToast(
                "A senha deve possuir pelo menos 8 caracteres.",
                "error"
            );

            return;
        }

        if (password !== confirmPassword) {

            showToast(
                "As senhas não coincidem.",
                "error"
            );

            return;
        }

        const users = getUsers();

        const existingUser =
            users.find(
                user =>
                user.email === email
            );

        if (existingUser) {

            showToast(
                "Este email já está cadastrado.",
                "warning"
            );

            return;
        }

        showLoading();

        setTimeout(() => {

            users.push({
                id: Date.now(),
                name,
                email,
                password,
                role
            });

            saveUsers(users);

            hideLoading();

            showToast(
                "Conta criada com sucesso!",
                "success"
            );

            registerForm.reset();

            document
                .querySelector('[data-tab="login"]')
                .click();

        }, 1200);

    });

}

/* ==========================
   LOGIN
========================== */

if (loginForm) {

    loginForm.addEventListener("submit", e => {

        e.preventDefault();

        const email =
            document
            .getElementById("loginEmail")
            .value
            .trim();

        const password =
            document
            .getElementById("loginPassword")
            .value;

        if (!email || !password) {

            showToast(
                "Preencha email e senha.",
                "error"
            );

            return;
        }

        showLoading();

        setTimeout(() => {

            const users = getUsers();

            const user = users.find(
                u =>
                u.email === email &&
                u.password === password
            );

            hideLoading();

            if (!user) {

                showToast(
                    "Email ou senha inválidos.",
                    "error"
                );

                return;
            }

            localStorage.setItem(
                "loggedUser",
                JSON.stringify(user)
            );

            showToast(
                "Login realizado com sucesso!",
                "success"
            );

            setTimeout(() => {

                if (
                    user.role ===
                    "bibliotecario"
                ) {

                    window.location.href =
                        "bibliotecario.html";

                } else {

                    window.location.href =
                        "leitor.html";

                }

            }, 1200);

        }, 1000);

    });

}

/* ==========================
   DADOS DE TESTE
========================== */

function createDefaultAdmin() {

    const users = getUsers();

    const adminExists =
        users.some(
            user =>
            user.email ===
            "admin@biblioteca.com"
        );

    if (!adminExists) {

        users.push({
            id: 1,
            name: "Administrador",
            email:
                "admin@biblioteca.com",
            password: "12345678",
            role: "bibliotecario"
        });

        saveUsers(users);

    }

}

createDefaultAdmin();

/* ==========================================
   LIVROS
========================================== */

function getBooks() {

    return JSON.parse(
        localStorage.getItem("books")
    ) || [];

}

function saveBooks(books) {

    localStorage.setItem(
        "books",
        JSON.stringify(books)
    );

}

function generateId() {

    return Date.now();

}



function logout() {

    localStorage.removeItem(
        "loggedUser"
    );

    window.location.href =
        "index.html";

}

/* ==========================
   FECHAR TOAST AO CLICAR
========================== */

document.addEventListener("click", e => {

    if (
        e.target.classList.contains("toast")
    ) {

        e.target.remove();

    }

});

function getBooks() {

    return JSON.parse(
        localStorage.getItem("books")
    ) || [];

}

function saveBooks(books) {

    localStorage.setItem(
        "books",
        JSON.stringify(books)
    );

}

function generateId() {

    return Date.now();

}
if (bookForm) {

    bookForm.addEventListener(
        "submit",
        e => {

            e.preventDefault();

            const titulo =
                document
                .getElementById("titulo")
                .value;

            const autor =
                document
                .getElementById("autor")
                .value;

            const ano =
                document
                .getElementById("ano")
                .value;

            const quantidade =
                Number(
                    document
                    .getElementById("quantidade")
                    .value
                );

            let books =
                getBooks();

            if (editingBookId) {

                const index =
                    books.findIndex(

                        book =>
                        book.id === editingBookId

                    );

                books[index] = {

                    ...books[index],

                    titulo,
                    autor,
                    ano,
                    quantidade

                };

                editingBookId = null;

            } else {

                books.push({

                    id: generateId(),

                    titulo,
                    autor,
                    ano,
                    quantidade

                });

            }

            saveBooks(books);

            showToast(
                "Livro salvo com sucesso!"
            );

            bookForm.reset();

            loadBooks();

            updateDashboard();

        }
    );

}

/* ==========================================
   PESQUISA
========================================== */

if (searchBook) {

    searchBook.addEventListener(
        "keyup",
        e => {

            const termo =
                e.target.value
                .toLowerCase();

            const books =
                getBooks();

            const filtered =
                books.filter(book =>

                    book.titulo
                    .toLowerCase()
                    .includes(termo)

                    ||

                    book.autor
                    .toLowerCase()
                    .includes(termo)

                );

            booksTable.innerHTML = "";

            filtered.forEach(book => {

                booksTable.innerHTML += `

                    <tr>

                        <td>${book.id}</td>

                        <td>${book.titulo}</td>

                        <td>${book.autor}</td>

                        <td>${book.ano}</td>

                        <td>${book.quantidade}</td>

                        <td>

                            <button
                                class="btn-delete"
                                onclick="deleteBook(${book.id})">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>

                    </tr>

                `;

            });

        }
    );

}

function loadBooks() {

    if (!booksTable) return;

    const books =
        getBooks();

    booksTable.innerHTML = "";

    books.forEach(book => {

       booksTable.innerHTML += `

<tr>

    <td>${book.id}</td>

    <td>${book.titulo}</td>

    <td>${book.autor}</td>

    <td>${book.ano}</td>

    <td>${book.quantidade}</td>

    <td>

        <div class="action-buttons">

            <button
                class="btn-edit"
                onclick="editBook(${book.id})">

                Editar

            </button>

            <button
                class="btn-delete"
                onclick="deleteBook(${book.id})">

                Excluir

            </button>

        </div>

    </td>

</tr>

`;

    });

}

function updateDashboard() {

    const books =
        getBooks();

    const loans =
        getLoans();

    const totalBooks =
        document.getElementById(
            "totalBooks"
        );

    const availableBooks =
        document.getElementById(
            "availableBooks"
        );

    const activeLoans =
        document.getElementById(
            "activeLoans"
        );

    const lateLoans =
        document.getElementById(
            "lateLoans"
        );

    if (totalBooks)
        totalBooks.textContent =
            books.length;

    if (availableBooks)
        availableBooks.textContent =
            books.filter(

                book =>
                    book.quantidade > 0

            ).length;

    if (activeLoans)
        activeLoans.textContent =
            loans.filter(

                loan =>
                    loan.status === "Ativo"

            ).length;

    if (lateLoans)
        lateLoans.textContent =
            loans.filter(

                loan =>
                    loan.status === "Atrasado"

            ).length;

}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        function editBook(id) {

    const books =
        getBooks();

    const book =
        books.find(

            b => b.id === id

        );

    if (!book) return;

    document
        .getElementById("titulo")
        .value =
        book.titulo;

    document
        .getElementById("autor")
        .value =
        book.autor;

    document
        .getElementById("ano")
        .value =
        book.ano;

    document
        .getElementById("quantidade")
        .value =
        book.quantidade;

    editingBookId = id;

}
        loadBooks();
        function deleteBook(id) {

    let books =
        getBooks();

    books = books.filter(

        book =>
            book.id !== id

    );

    saveBooks(books);

    loadBooks();

    updateDashboard();

}

        loadCatalog();

        loadMyLoans();

        updateDashboard();

    }
);

    function getLoans() {

    return JSON.parse(
        localStorage.getItem("loans")
    ) || [];

}

function saveLoans(loans) {

    localStorage.setItem(
        "loans",
        JSON.stringify(loans)
    );

}

function loadCatalog() {

    if (!catalogTable) return;

    const books = getBooks();

    catalogTable.innerHTML = "";

    books.forEach(book => {

        const disponivel =
            book.quantidade > 0;

        catalogTable.innerHTML += `

        <tr>

            <td>${book.id}</td>

            <td>${book.titulo}</td>

            <td>${book.autor}</td>

            <td>${book.ano}</td>

            <td>

                ${
                    disponivel

                    ?

                    '<span class="status status-devolvido">Disponível</span>'

                    :

                    '<span class="status status-atrasado">Indisponível</span>'
                }

            </td>

            <td>

                ${
                    disponivel

                    ?

                    `<button
                        class="btn-primary"
                        onclick="requestLoan(${book.id})">

                        Solicitar

                    </button>`

                    :

                    "-"
                }

            </td>

        </tr>

        `;

    });

}

function getLoggedUser() {

    return JSON.parse(
        localStorage.getItem(
            "loggedUser"
        )
    );

}

function requestLoan(bookId) {

    const books = getBooks();

    const loans = getLoans();

    const user =
        getLoggedUser();

    const book =
        books.find(
            b => b.id === bookId
        );

    if (!book) return;

    if (book.quantidade <= 0) {

        showToast(
            "Livro indisponível.",
            "error"
        );

        return;

    }

    book.quantidade--;

    saveBooks(books);

    const today =
        new Date();

    const returnDate =
        new Date();

    returnDate.setDate(
        returnDate.getDate() + 7
    );

    loans.push({

        id: generateId(),

        userId: user.id,

        userName: user.name,

        livro: book.titulo,

        bookId: book.id,

        dataEmprestimo:
            today.toISOString(),

        dataPrevista:
            returnDate.toISOString(),

        status: "Ativo"

    });

    saveLoans(loans);

    showToast(
        "Empréstimo realizado!"
    );

    loadCatalog();

    loadMyLoans();

}

function formatDate(date) {

    return new Date(
        date
    ).toLocaleDateString(
        "pt-BR"
    );

}

function loadMyLoans() {

    if (!myLoansTable) return;

    const user =
        getLoggedUser();

    const loans =
        getLoans().filter(

            loan =>
                loan.userId === user.id

        );

    myLoansTable.innerHTML = "";

    loans.forEach(loan => {

        myLoansTable.innerHTML += `

        <tr>

            <td>${loan.livro}</td>

            <td>${formatDate(
                loan.dataEmprestimo
            )}</td>

            <td>${formatDate(
                loan.dataPrevista
            )}</td>

            <td>

                <span class="status status-ativo">

                    ${loan.status}

                </span>

            </td>

            <td>

                ${
                    loan.status === "Ativo"

                    ?

                    `<button
                        class="btn-primary"
                        onclick="requestReturn(${loan.id})">

                        Solicitar Devolução

                    </button>`

                    :

                    "-"
                }

            </td>

        </tr>

        `;

    });

}
function requestReturn(id) {

    const loans =
        getLoans();

    const loan =
        loans.find(
            l => l.id === id
        );

    if (!loan) return;

    loan.status =
        "Devolvido";

    saveLoans(loans);

    const books =
        getBooks();

    const book =
        books.find(
            b => b.id === loan.bookId
        );

    if (book) {

        book.quantidade++;

        saveBooks(books);

    }

    showToast(
        "Livro devolvido."
    );

    loadCatalog();

    loadMyLoans();

}


function editBook(id){

    const books = getBooks();

    const book = books.find(
        b => b.id === id
    );

    if(!book) return;

    document.getElementById("titulo").value =
        book.titulo;

    document.getElementById("autor").value =
        book.autor;

    document.getElementById("ano").value =
        book.ano;

    document.getElementById("quantidade").value =
        book.quantidade;

    editingBookId = id;

    document.querySelector(
        "#bookForm button"
    ).innerHTML =
    `
        <i class="fa-solid fa-floppy-disk"></i>
        Atualizar Livro
    `;
}

function deleteBook(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este livro?"
    );

    if (!confirmar) return;

    let books = getBooks();

    books = books.filter(
        book => book.id !== id
    );

    saveBooks(books);

    loadBooks();

    updateDashboard();

    showToast(
        "Livro excluído com sucesso!",
        "success"
    );

}