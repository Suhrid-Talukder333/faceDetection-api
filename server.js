const express = require("express");
const cors = require("cors");
const knex = require("knex");
const bcrypt = require("bcrypt-nodejs");

const database = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  },
});
const server = express();

server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("Hello World");
});

server.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  // const hash = bcrypt.hashSync(password);

  // database
  //   .transaction((trx) => {
  //     trx
  //       .insert({
  //         hash: hash,
  //         email: email,
  //       })
  //       .into("login")
  //       .returning("email")
  //       .then((loginMail) => {
  //         return trx("users")
  //           .returning("*")
  //           .insert({
  //             email: loginMail[0],
  //             name: name,
  //             joined: new Date(),
  //           })
  //           .then((data) =>
  //             res.json({
  //               status: "success",
  //               name: data[0].name,
  //               points: data[0].entries,
  //             })
  //           );
  //       })
  //       .then(trx.commit)
  //       .catch(trx.rollback);
  //   })
  //   .catch((err) =>
  //     res.json({
  //       status: "error",
  //     })
  //   );
  res.send(email, name, password);
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
    .catch((err) => res.json({ status: "not found" }));
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
        res.status(400).json("not Found");
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
