import express from "express"; // Importing Express
import bodyParser from "body-parser"; // Importing bodyParser for parsing incoming request bodies
import pg from "pg"; // Importing pg for PostgreSQL database interactions

const app = express(); // Creating an Express application
const port = 3000; // Setting the port number

const db = new pg.Client({ // Creating a new PostgreSQL client
  user: "postgres", // Database user
  host:"localhost", // Database host
  database: "book-notes", // Database name
  password: "admin", // Database password
  port: 5432, // Database port
});

db.connect(); // Connecting to the database

app.use(bodyParser.urlencoded({ extended: true })); // Using bodyParser to parse URL-encoded request bodies
app.use(express.static("public")); // Serving static files from the "public" directory

let items = []; // Initializing an array to store items

// Route for the home page
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book"); // Querying all items from the database
        items = result.rows; // Storing the result in the items array
        res.render("index.ejs", { // Rendering the index page with the list of items
            listItems: items,
        });
    } catch (err) {
        console.log(err); // Logging any errors
    }
});

// Route for adding a new item
app.get("/add", async (req, res) => {
    // Initializing variables for form fields and error messages
    let authorName = "";
    let bookTitle = "";
    let reviewBook = "";
    let bookId = "";
    let errorMessageAuthor = "";
    let errorMessageTitle = "";
    let errorMessageReview = "";
    let errorMessageBookId = "";

    res.render("add_item.ejs", { // Rendering the add item page with form fields and error messages
        authorName: authorName,
        bookTitle: bookTitle,
        reviewBook: reviewBook,
        bookId: bookId,
        errorMessageAuthor: errorMessageAuthor,
        errorMessageTitle: errorMessageTitle,
        errorMessageReview: errorMessageReview,
        errorMessageBookId: errorMessageBookId
    });
});

// Route for submitting a new item
app.post("/add", async (req, res) => {
    // Extracting data from the form submission
    const author = req.body.authorName.trim();
    const title = req.body.bookTitle.trim();
    const rating = req.body.rating;
    const date_read = req.body.dateRead;
    let review = req.body.reviewBook;
    const book_id = req.body.bookId;

    // Setting maximum and minimum lengths for input fields
    const MAX_LENGTH = 10000;
    const MAX_LENGTH2 = 100;
    const MIN_LENGTH = 2;

    // Initializing error messages for form validation
    let errorMessageTitle = "";
    let errorMessageAuthor = "";
    let errorMessageReview = "";
    let errorMessageBookId = "";

    // Validating input fields
    if (!title || title.length < MIN_LENGTH || title.length > MAX_LENGTH2) {
        errorMessageTitle = "* Title must have between 2 and 100 characters.";
    }
    if (!author || author.length < MIN_LENGTH || author.length > MAX_LENGTH2) {
        errorMessageAuthor = "* Author must have between 2 and 100 characters.";
    }
    if (book_id.length > MAX_LENGTH2) {
        errorMessageBookId = "* Book ID must have no more than 100 characters.";
    }
    if (!review || review.length < MIN_LENGTH || review.length > MAX_LENGTH) {
        errorMessageReview = "* Review must have between 2 and 10000 characters.";
    }

    // If there are errors, render the add item page with error messages
    if (errorMessageTitle || errorMessageAuthor || errorMessageReview || errorMessageBookId) {
        return res.render("add_item.ejs", {
            authorName: author,
            errorMessageTitle: errorMessageTitle,
            errorMessageAuthor: errorMessageAuthor,
            errorMessageReview: errorMessageReview,
            errorMessageBookId: errorMessageBookId
        });
    }

    // If no errors, insert the new item into the database
    try {
        await db.query(
            "INSERT INTO book (title, date_read, raiting, review, book_id, author) VALUES ($1, $2, $3, $4, $5, $6)",
            [title, date_read, rating, review, book_id, author]
        );
        res.redirect("/"); // Redirect to the home page
    } catch (err) {
        console.log(err); // Log any errors
        const errorMessage = "An error occurred while adding the review to the database.";
        return res.render("add_item.ejs", { // Render the add item page with error message
            authorName: author,
            errorMessage: errorMessage
        });
    }
});

// Route for viewing a specific item
app.get("/review/:id", async (req, res) => {
    try {
        let id = req.params.id; // Extracting the item ID from the request parameters
        const result = await db.query("SELECT * FROM book WHERE id = $1",[id]); // Querying the database for the item
        let item = result.rows[0]; // Extracting the item from the query result
        res.render("open_item.ejs", { // Render the open item page with the chosen item
            choosenItem: item,
        });
    } catch (err) {
        console.log(err); // Log any errors
    }
});

// Route for editing a specific item
app.get("/edit/:id", async (req, res) => {
    try {
        let id = req.params.id; // Extracting the item ID from the request parameters
        const result = await db.query("SELECT * FROM book WHERE id = $1", [id]); // Querying the database for the item
        let item = result.rows[0]; // Extracting the item from the query result

        // Initializing error messages for form validation
        let errorMessageAuthor = "";
        let errorMessageTitle = "";
        let errorMessageReview = "";
        let errorMessageBookId = "";

        res.render("edit_item.ejs", { // Render the edit item page with form fields and error messages
            choosenItem: item,
            errorMessageAuthor: errorMessageAuthor,
            errorMessageTitle: errorMessageTitle,
            errorMessageReview: errorMessageReview,
            errorMessageBookId: errorMessageBookId
        });
    } catch (err) {
        console.log(err); // Log any errors
    }
});

// Route for submitting edits to a specific item
app.post("/edit/:id", async (req, res) => {
    // Extracting data from the form submission
    const editAuthor = req.body.authorName.trim();
    const editTitle = req.body.bookTitle.trim();
    const editBookID = req.body.bookId;
    const editRating = req.body.rating;
    const editDate = req.body.dateRead;
    const editReview = req.body.reviewBook.trim();
    const id = req.params.id; // Extracting the item ID from the request parameters

    // Setting maximum and minimum lengths for input fields
    const MAX_LENGTH = 10000;
    const MAX_LENGTH2 = 100;
    const MIN_LENGTH = 2;

    // Initializing error messages for form validation
    let errorMessageAuthor = "";
    let errorMessageTitle = "";
    let errorMessageReview = "";
    let errorMessageBookId = "";

    // Validating input fields
    if (!editAuthor || editAuthor.length < MIN_LENGTH || editAuthor.length > MAX_LENGTH2) {
        errorMessageAuthor = "* Author must have between 2 and 100 characters.";
    }
    if (!editTitle || editTitle.length < MIN_LENGTH || editTitle.length > MAX_LENGTH2) {
        errorMessageTitle = "* Title must have between 2 and 100 characters.";
    }
    if (editBookID.length > MAX_LENGTH2) {
        errorMessageBookId = "* Book ID must have no more than 100 characters.";
    }
    if (!editReview || editReview.length < MIN_LENGTH || editReview.length > MAX_LENGTH) {
        errorMessageReview = "* Review must have between 2 and 10000 characters.";
    }

    // If there are errors, render the edit item page with error messages
    if (errorMessageAuthor || errorMessageTitle || errorMessageReview || errorMessageBookId) {
        return res.render("edit_item.ejs", {
            choosenItem: { 
                id: id,
                author: editAuthor,
                title: editTitle,
                book_id: editBookID,
                rating: editRating,
                date_read: editDate,
                review: editReview
            },
            errorMessageAuthor: errorMessageAuthor,
            errorMessageTitle: errorMessageTitle,
            errorMessageReview: errorMessageReview,
            errorMessageBookId: errorMessageBookId
        });
    }

    // If no errors, update the item in the database
    try {
        await db.query(
            "UPDATE book SET author = $1, title = $2, book_id = $3, rating = $4, date_read = $5, review = $6 WHERE id = $7",
            [editAuthor, editTitle, editBookID, editRating, editDate, editReview, id]
        );
        res.redirect("/"); // Redirect to the home page
    } catch (err) {
        console.log(err); // Log any errors
    }
});

// Route for deleting an item
app.post("/delete", async (req, res) => {
    const deleteReview = req.body.deleteReview; // Extracting the ID of the item to be deleted
    try {
        await db.query(
            "DELETE FROM book WHERE id = $1", [deleteReview] // Deleting the item from the database
        );
        res.redirect("/"); // Redirect to the home page
    } catch (err) {
        console.log(err); // Log any errors
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});