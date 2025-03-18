// Import Firebase initialization
import { db } from './firebase-init.js';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase Auth
const auth = getAuth();

let firestoreBooks = [];

// Function to fetch books from Firestore
async function fetchBooksFromFirestore() {
    try {
        console.log("Fetching books from Firestore...");
        const querySnapshot = await getDocs(collection(db, "books"));
        firestoreBooks = [];
        querySnapshot.forEach(doc => {
            firestoreBooks.push({ ...doc.data(), id: doc.id });
        });
        console.log("Books fetched from Firestore:", firestoreBooks);

        // Update the display with books from Firestore
        displayBooks(firestoreBooks);
        displayGenres(firestoreBooks);
    } catch (error) {
        console.error("Error fetching books from Firestore:", error);
    }
}

// Function to fetch top 10 most liked books
async function fetchTopLikedBooks() {
    try {
        console.log("Fetching top liked books from Firestore...");
        const q = query(collection(db, "books"), orderBy("likes", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        const topLikedBooks = [];
        querySnapshot.forEach(doc => {
            topLikedBooks.push({ ...doc.data(), id: doc.id });
        });
        console.log("Top liked books fetched from Firestore:", topLikedBooks);

        // Update the display with top liked books
        displayTrendingBooks(topLikedBooks);
    } catch (error) {
        console.error("Error fetching top liked books from Firestore:", error);
    }
}

// Function to like a book
async function likeBook(bookId) {
    try {
        const bookRef = doc(db, "books", bookId);
        await updateDoc(bookRef, {
            likes: firebase.firestore.FieldValue.increment(1)
        });
        console.log("Book liked successfully!");
        fetchBooksFromFirestore(); // Refresh the book list
        fetchTopLikedBooks(); // Refresh the trending books list
    } catch (error) {
        console.error("Error liking book:", error);
    }
}

// Function to search books
function searchBooks() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const genre = document.getElementById("genre-dropdown").value;

    const filteredBooks = firestoreBooks.filter(book => {
        const matchesQuery = book.name.toLowerCase().includes(query);
        const matchesGenre = genre === "" || book.genre === genre;
        return matchesQuery && matchesGenre;
    });

    displayBooks(filteredBooks);
}

// Function to filter books by genre
function filterByGenre() {
    searchBooks();
}

// Function to display books
function displayBooks(books) {
    const resultsDiv = document.getElementById("search-results");
    const booksContainer = document.getElementById("books-container");
    resultsDiv.innerHTML = "";
    booksContainer.innerHTML = "";

    if (books.length === 0) {
        resultsDiv.innerHTML = "<p>No books found</p>";
    } else {
        books.forEach(book => {
            const bookElement = document.createElement("div");
            bookElement.classList.add("book");

            const bookLink = document.createElement("a");
            bookLink.href = `/book-details?id=${book.id}`;
            bookLink.target = "_blank";

            const bookCover = document.createElement("img");
            bookCover.src = book.cover;
            bookCover.alt = book.name;
            bookCover.classList.add("book-cover");

            const bookTitle = document.createElement("h3");
            bookTitle.textContent = book.name;

            const likeButton = document.createElement("button");
            likeButton.textContent = `Like (${book.likes})`;
            likeButton.onclick = () => likeBook(book.id);

            bookLink.appendChild(bookCover);
            bookLink.appendChild(bookTitle);
            bookElement.appendChild(bookLink);
            bookElement.appendChild(likeButton);
            booksContainer.appendChild(bookElement);
        });
    }
}

// Function to display trending books
function displayTrendingBooks(books) {
    const trendingDiv = document.getElementById("trending-books-container");
    trendingDiv.innerHTML = "";

    books.forEach(book => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book");

        const bookLink = document.createElement("a");
        bookLink.href = `/book-details?id=${book.id}`;
        bookLink.target = "_blank";

        const bookCover = document.createElement("img");
        bookCover.src = book.cover;
        bookCover.alt = book.name;
        bookCover.classList.add("book-cover");

        bookLink.appendChild(bookCover);
        bookElement.appendChild(bookLink);
        trendingDiv.appendChild(bookElement);
    });
}

// Function to display genres and their books
function displayGenres(books) {
    const genresContainer = document.getElementById("genres-container");
    genresContainer.innerHTML = "";

    const genres = {};

    books.forEach(book => {
        if (!genres[book.genre]) {
            genres[book.genre] = [];
        }
        genres[book.genre].push(book);
    });

    for (const genre in genres) {
        const genreSection = document.createElement("section");
        genreSection.classList.add("genre-section");

        const genreTitle = document.createElement("h3");
        genreTitle.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
        genreSection.appendChild(genreTitle);

        const genreBooksWrapper = document.createElement("div");
        genreBooksWrapper.classList.add("genre-books-wrapper");

        const scrollLeftButton = document.createElement("button");
        scrollLeftButton.classList.add("scroll-button", "left");
        scrollLeftButton.innerHTML = "&lt;";
        scrollLeftButton.onclick = () => scrollLeft(`genre-books-container-${genre}`);

        const scrollRightButton = document.createElement("button");
        scrollRightButton.classList.add("scroll-button", "right");
        scrollRightButton.innerHTML = "&gt;";
        scrollRightButton.onclick = () => scrollRight(`genre-books-container-${genre}`);

        const genreBooksContainer = document.createElement("div");
        genreBooksContainer.classList.add("genre-books-container");
        genreBooksContainer.id = `genre-books-container-${genre}`;

        genres[genre].forEach(book => {
            const bookElement = document.createElement("div");
            bookElement.classList.add("book");

            const bookLink = document.createElement("a");
            bookLink.href = `/book-details?id=${book.id}`;
            bookLink.target = "_blank";

            const bookCover = document.createElement("img");
            bookCover.src = book.cover;
            bookCover.alt = book.name;
            bookCover.classList.add("book-cover");

            const bookTitle = document.createElement("h3");
            bookTitle.textContent = book.name;

            bookLink.appendChild(bookCover);
            bookLink.appendChild(bookTitle);
            bookElement.appendChild(bookLink);
            genreBooksContainer.appendChild(bookElement);
        });

        genreBooksWrapper.appendChild(scrollLeftButton);
        genreBooksWrapper.appendChild(genreBooksContainer);
        genreBooksWrapper.appendChild(scrollRightButton);
        genreSection.appendChild(genreBooksWrapper);
        genresContainer.appendChild(genreSection);
    }
}

// Function to scroll left
function scrollLeft(containerId) {
    const container = document.getElementById(containerId);
    container.scrollBy({
        left: -container.clientWidth,
        behavior: 'smooth'
    });
}

// Function to scroll right
function scrollRight(containerId) {
    const container = document.getElementById(containerId);
    container.scrollBy({
        left: container.clientWidth,
        behavior: 'smooth'
    });
}

// Initialize the page with books from Firestore and top liked books
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, fetch books from Firestore
            fetchBooksFromFirestore();
            fetchTopLikedBooks();

            const genreDropdown = document.getElementById("genre-dropdown");
            if (genreDropdown) {
                genreDropdown.addEventListener("change", filterByGenre);
            } else {
                console.error("Element with ID 'genre-dropdown' not found.");
            }
        } else {
            // No user is signed in, redirect to login page
            window.location.href = "/login";
        }
    });
});
