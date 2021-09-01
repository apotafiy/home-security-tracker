const express = require("express");
const path = require("path");
const ring = require("./data-collection/ring.js");
const keepAlive = require("./utils/keep-alive.js");
const PORT = process.env.PORT || 5000;
const pool = require("./db/index.js");
const dbData = require("./utils/db-data");

express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/db", async (req, res) => {
    try {
      let results = await dbData();
      results = results.results.slice(Math.floor(results.results.length / 1.1));
      res.render("pages/db", {
        results: results,
      });
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get("/api/db", async (req, res) => {
    try {
      res.json(await dbData());
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
    ring();
    keepAlive();
  });
