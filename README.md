# ReadWise

ReadWise is a web application that allows users to share their reviews and ratings for the books they've read. Users can add, view, edit, and delete their reviews.

## Technologies Used

- Express: A web framework for Node.js that facilitates the creation of web applications and APIs.
- Body Parser: An Express middleware that helps parse data sent from the client.
- pg (PostgreSQL): A package for communicating with PostgreSQL database.
- pgAdmin 4: A user interface for managing and administering PostgreSQL databases.
- Open Library Public API: Used for fetching book cover images.

## Database Structure

To manage user reviews and ratings, we created a PostgreSQL database using pgAdmin 4. The `book` table has the following columns:

1. `id`: The unique ID of the book (primary key).
2. `title`: The title of the book.
3. `date_read`: The date when the user read the book.
4. `raiting`: The rating given to the book.
5. `review`: The user's review.
6. `book_id`: The book's ID in the Open Library database.
7. `author`: The author of the book.

## Setup and Usage

1. Install dependencies using `npm install`.
2. Ensure you have a configured PostgreSQL database and run the table creation script to create the `book` table.
3. Start the server using `npm start`.
4. Access the application in your browser at `http://localhost:3000`.

## Contribution

Contributions are welcome! If you'd like to contribute to this project, please open a PR (Pull Request).

## Author

The ReadWise project was developed by Romanescu Eugeniu.

