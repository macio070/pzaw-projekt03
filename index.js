import express from "express";
import fs from "node:fs";
import {
  getGameTitles,
  getGameData,
  getAllGameImages,
  games,
  getGameGenres,
  getGamePlatforms,
  getAllGenres,
  getAllPlatforms,
  db,
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
      genres: getAllGenres(),
      platforms: getAllPlatforms()
    });
  } else if (!getGameTitles().includes(title)) {
    res.status(404).end("Game not found");
  } else {
    res.render("game", {
      title: title,
      gameData: getGameData(title),
      genres: getGameGenres(title),
      platforms: getGamePlatforms(title)
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

  console.log(req.body)

  const genres = getAllGenres();
  const platforms = getAllPlatforms();

  const keys = Object.keys(req.body)
  console.log(keys)

  const newGenres = [];
  const newPlatforms = [];

  keys.forEach(key => {
    genres.forEach(genre => {
      if(key === genre){
        console.log(`key: ${key}, genre: ${genre}`)
        newGenres.push(key)
      }
    });
    platforms.forEach(platform => {
      if(key === platform){
        console.log(`key: ${key}, platform: ${platform}`)
        newPlatforms.push(key)
      }
    })

    db.prepare("INSERT INTO game_data (game_title, release_date, developer, description, link, image) VALUES (?, ?, ?, ?, ?, ?)")
    .run(req.body.title, req.body.release_date, req.body.developer, req.body.description, req.body.link, req.body.logo);

    const newGameId = db.prepare("SELECT game_id FROM game_data ORDER BY game_id DESC LIMIT 1").all();
    newGameId.forEach(d => {
      console.log(d)
    });

    const id = newGameId.game_id;
    console.log(`id: ${id}`)
    // const newGenresID = [];
    // const newPlatformsID = [];`

    newGenres.forEach(newGenre => {
      const genre_id = db.prepare("SELECT genre_id FROM genres WHERE genre_name = ?").get(newGenre);
      db.prepare("INSERT INTO games_genres (game_id, genre_id) VALUES (?, ?)").run(newGameId.game_id, genre_id.genre_id);
      // newGenresID.push(id.genre_id);
    });
    
    newPlatforms.forEach(newPlatform => {
      const id = db.prepare("SELECT platform_id FROM platforms WHERE platform_name = ?").get(newPlatform);
      db.prepare("INSERT INTO games_platforms (game_id, platform_id) VALUES (?, ?)").run(newGameId.game_id, id.platform_id);
      // newPlatformsID.push(id.platform_id);
    });



  });


  // games[title] = {
  //   genre: genre.split(",").map((g) => capitalizeFirstLetter(g)),
  //   platform: platform.split(",").map((p) => capitalizeFirstLetter(p)),
  //   release_date: new Date(release_date),
  //   developer: developer,
  //   description: description,
  //   link: link,
  //   image: logo,
  // };



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
