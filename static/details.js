// Import Firebase initialization
import { db } from './firebase-init.js';
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase Auth
const auth = getAuth();

// Function to fetch book details from Firestore
async function fetchBookDetails(bookId) {
    try {
        console.log("Fetching book details for ID:", bookId);
        document.getElementById("details-progress").style.display = "block"; // Show progress indicator
        const docRef = doc(db, "books", bookId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const book = docSnap.data();
            book.id = docSnap.id; // Ensure the book ID is included
            console.log("Book details fetched:", book);
            displayBookDetails(book);
        } else {
            console.error("No such book!");
        }
    } catch (error) {
        console.error("Error fetching book details:", error);
    } finally {
        document.getElementById("details-progress").style.display = "none"; // Hide progress indicator
    }
}

// Function to like a book
async function likeBook(bookId) {
    try {
        const bookRef = doc(db, "books", bookId);
        await updateDoc(bookRef, {
            likes: increment(1)
        });
        console.log("Book liked successfully!");
        fetchBookDetails(bookId); // Refresh the book details
    } catch (error) {
        console.error("Error liking book:", error);
    }
}

// Function to display book details
function displayBookDetails(book) {
    const detailsDiv = document.getElementById("book-details");
    detailsDiv.innerHTML = `
        <div class="book-detail">
            <img src="${book.cover}" alt="${book.name} cover" class="book-cover">
            <div class="book-info">
                <h2>${book.name}</h2>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Description:</strong> ${book.description}</p>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Uploaded by:</strong> ${book.uploadedBy}</p>
                <p><strong>Uploaded on:</strong> ${new Date(book.timestamp.seconds * 1000).toLocaleDateString()}</p>
                <a href="${book.pdf}" target="_blank" class="read-pdf-link">Read PDF</a>
                <button onclick="likeBook('${book.id}')">Like (${book.likes})</button>
            </div>
        </div>
    `;
}

// Get book ID from data attribute
const detailsDiv = document.getElementById("book-details");
const bookId = detailsDiv.getAttribute("data-book-id");

// Ensure the user is authenticated before fetching book details
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, fetch book details
        if (bookId) {
            fetchBookDetails(bookId);
        } else {
            console.error("No book ID provided in URL");
        }
    } else {
        // No user is signed in, redirect to login page
        window.location.href = "/login";
    }
});

// Make the likeBook function accessible globally
window.likeBook = likeBook;
