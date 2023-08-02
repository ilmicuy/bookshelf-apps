const books = [];
const RENDER_VIEW = "render-book";
const SAVED_VIEW = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser ente tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_VIEW));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_VIEW));
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  const textYear = document.createElement("p");
  textYear.innerText = year;

  const textContainer = document.createElement("article");
  textContainer.classList.add("book_item");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${id}`);

  if (isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", function () {
      editBookFromCompleted(id);
    });

    container.append(undoButton, trashButton, editButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addBookToCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", function () {
      editBookFromCompleted(id);
    });

    container.append(checkButton, trashButton, editButton);
  }

  return container;
}

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    author,
    year,
    isComplete,
    false
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_VIEW));
  saveData();
  window.alert('Buku Berhasil Ditambahkan.');
}

function searchedBook() {
  const searchBook = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookList = document.querySelectorAll('.book_item > h3');
  let bookFound = false;

  for (const book of bookList) {
    const bookItem = book.parentElement.parentElement;

    if (book.innerText.toLowerCase().includes(searchBook)) {
      bookItem.style.display = '';
      bookFound = true;
    } else {
      bookItem.style.display = 'none';
    }
  }

  if (!bookFound) {
    alert('Buku tidak ditemukan');
  }
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_VIEW));
  saveData();
  window.alert('Selamat! Anda telah selesai membaca buku ini.');
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  const confirmation =  window.confirm('Apakah Kamu yakin untuk menghapus buku ini?');
  if(confirmation) {
    if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_VIEW));
  saveData();
  alert('Menghapus Buku Sukses');
  }
  else {
    alert('Menghapus Buku Gagal');
  }
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_VIEW));
  saveData();
}

function editBookFromCompleted(bookId) {
  const bookIndex = findBookIndex(bookId);
  const bookTarget = findBook(bookId);
  const editedTitle = prompt("Masukkan judul buku", bookTarget.title);
  const editedAuthor = prompt("Masukkan nama pengarang buku", bookTarget.author);
  const editedYear = prompt("Masukkan tahun terbit buku", bookTarget.year);

  if (bookIndex == null || bookIndex < 0 || bookTarget == null) {
    return;
  }

  bookTarget.title = editedTitle;
  bookTarget.author = editedAuthor;
  bookTarget.year = editedYear;

  const bookElement = document.getElementById(`book-${bookId}`);
  bookElement.querySelector("h3").innerText = editedTitle;
  bookElement.querySelector("p:first-of-type").innerText = editedAuthor;
  bookElement.querySelector("p:last-of-type").innerText = editedYear;

  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const search = document.getElementById('searchBook');
search.addEventListener('submit', function(event) {
  event.preventDefault();
  searchedBook();
});

document.addEventListener(SAVED_VIEW, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_VIEW, function () {
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedBookList = document.getElementById("completeBookshelfList");

  uncompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isCompleted) {
      completedBookList.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
});
