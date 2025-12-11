import express from "express";
import fs from "node:fs";
import {
  getGameTitles,
  getGameData,
  getAllGameImages,
  games,
} from "./models/videogames.js";
const port = 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());

const html = fs.readFileSync("public/index.html");
app.get("/", (req, res) => {
  res.end(html);
});

app.get("/games", (req, res) => {
  res.render("games", {
    title: "List of Video Games",
    games: getGameTitles(),
    images: getAllGameImages(),
  });
});

app.get("/games/:title", (req, res) => {
  const title = req.params.title;
  if (title === "new") {
    res.render("newGame", {
      title: "Add New Game",
    });
  } else if (!getGameTitles().includes(title)) {
    res.status(404).end("Game not found");
  } else {
    res.render("game", {
      title: title,
      game: getGameData(title),
    });
  }
});

app.post("/games/new", (req, res) => {
  const {
    title,
    genre,
    platform,
    release_date,
    developer,
    description,
    link,
    logo,
  } = req.body;

  games[title] = {
    genre: genre.split(",").map((g) => capitalizeFirstLetter(g)),
    platform: platform.split(",").map((p) => capitalizeFirstLetter(p)),
    release_date: new Date(release_date),
    developer: developer,
    description: description,
    link: link,
    image: logo,
  };

  res.redirect(`/games/`);
});

app.get("/random", (req, res) => {
  const titles = getGameTitles();
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  res.redirect(`/games/${randomTitle}`);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const capitalizeFirstLetter = (string) => {
  return string.trim().charAt(0).toUpperCase() + string.slice(1);
};
