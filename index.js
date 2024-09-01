import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    database: "books",
    host: "localhost",
    password: "....",
    port: 5432
});
db.connect();

async function getBooks(){
    const result = await db.query("SELECT * FROM books");
    const books = result.rows;
    return books;
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", async (req, res) => {
    const sortBy = req.query.sort;
    let query;

    if (sortBy === "rating") {
        query = "SELECT * FROM books ORDER BY rating DESC";
    } else if (sortBy === "title") {
        query = "SELECT * FROM books ORDER BY title ASC";
    } else {
        query = "SELECT * FROM books";
    }

    try {
        const result = await db.query(query);
        const books = result.rows;
        res.render("index.ejs", { books: books });
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).send("Error fetching books");
    }
});

app.get("/add", (req, res) => {
    res.render("add.ejs");
});

app.post("/add", async (req, res) => {
    const { title, description, cover_id, rating } = req.body;

    try {
        await db.query(
            "INSERT INTO books (title, description, cover_id, rating) VALUES ($1, $2, $3, $4)",
            [title, description, cover_id, rating]
        );
        res.redirect("/");
    } catch (err) {
        console.error("Error adding book:", err);
        res.status(500).send("Error adding book");
    }
});

app.listen(port, () =>{
    console.log(`listening to port ${port}.`);
})