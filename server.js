const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const knex = require("knex");
const bcrypt = require("bcrypt-nodejs");

const database = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "postgres",
    database: "postgres",
  },
});
const server = express();

server.use(bodyParser.json());
server.use(cors());
// const database = [
//     {
//         id: 1,
//         name: "suhrid",
//         email: "suhrid@gmail.com",
//         password: "1234",
//         points: 0,
//         joined: new Date()
//     }
// ]

// server.get('/', (req, res) => {
//     res.send(database);
// })

server.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);

  database
    .transaction((trx) => {
      trx
        .insert({
          hash: hash,
          email: email,
        })
        .into("login")
        .returning("email")
        .then((loginMail) => {
          return trx("users")
            .returning("*")
            .insert({
              email: loginMail[0],
              name: name,
              joined: new Date(),
            })
            .then((data) =>
              res.json({
                status: "success",
                name: data[0].name,
                points: data[0].entries,
              })
            );
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch((err) =>
      res.json({
        status: "error",
      })
    );
});

server.post("/signin", (req, res) => {
  var { email, password } = req.body;
  database
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return database
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((data) =>
            res.json({
              status: "success",
              name: data[0].name,
              points: data[0].entries,
            })
          );
      } else {
        res.json({ status: "not found" });
      }
    })
    .catch((err) => res.json({ status: err }));
});

server.get("/profile/:id", (req, res) => {
  var { id } = req.params;
  database
    .select("*")
    .from("users")
    .where({
      id: id,
    })
    .then((data) => {
      if (data.length) {
        res.json(data[0]);
      } else {
        res.status(400).json("notFound");
        throw Error;
      }
    });
});

server.put("/image", (req, res) => {
  var { name } = req.body;
  database("users")
    .where("name", "=", name)
    .increment("entries", 1)
    .returning("entries")
    .then((data) => res.json(data[0]));
});

server.listen(process.env.PORT || 3001, () => {
  console.log(`The server is running at port ${process.env.PORT}`);
});
