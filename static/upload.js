// Import Firebase initialization
import { db, storage } from './firebase-init.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firebase Auth
const auth = getAuth();

// Function to upload book to Firebase Storage
async function uploadBook(file, cover, metadata) {
    try {
        console.log("Starting upload...");
        document.getElementById("upload-progress").style.display = "block"; // Show progress indicator
        const storageRef = ref(storage, `books/${file.name}`);
        const coverRef = ref(storage, `covers/${cover.name}`);
        
        const [fileSnapshot, coverSnapshot] = await Promise.all([
            uploadBytes(storageRef, file),
            uploadBytes(coverRef, cover)
        ]);
        console.log("Files uploaded to storage...");
        const [fileURL, coverURL] = await Promise.all([
            getDownloadURL(fileSnapshot.ref),
            getDownloadURL(coverSnapshot.ref)
        ]);
        console.log("Download URLs obtained...");

        // Save metadata with download URLs to Firestore
        await addDoc(collection(db, "books"), {
            ...metadata,
            pdf: fileURL,
            cover: coverURL,
            likes: 0,
            timestamp: serverTimestamp()
        });

        console.log("Book and cover uploaded and metadata saved successfully!");
        // Redirect to homepage after successful upload
        window.location.href = "/home";
    } catch (error) {
        console.error("Error uploading book and cover:", error);
    } finally {
        document.getElementById("upload-progress").style.display = "none"; // Hide progress indicator
    }
}

// Function to handle book upload form submission
function handleBookUpload(event) {
    event.preventDefault();
    console.log("Form submitted...");
    const fileInput = document.getElementById("book-file");
    const coverInput = document.getElementById("book-cover");
    const nameInput = document.getElementById("book-name");
    const genreInput = document.getElementById("book-genre");
    const descriptionInput = document.getElementById("book-description");
    const authorInput = document.getElementById("book-author");

    const file = fileInput.files[0];
    const cover = coverInput.files[0];
    const metadata = {
        name: nameInput.value,
        genre: genreInput.value,
        description: descriptionInput.value,
        author: authorInput.value
    };

    if (file && cover) {
        console.log("Uploading book...");
        uploadBook(file, cover, metadata);
    } else {
        alert("Please select both a cover and a file to upload.");
    }
}

// Check if user is authenticated before allowing upload
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, add event listener to book upload form
        document.getElementById("book-upload-form").addEventListener("submit", handleBookUpload);
    } else {
        // No user is signed in, redirect to login page
        window.location.href = "/login";
    }
});
