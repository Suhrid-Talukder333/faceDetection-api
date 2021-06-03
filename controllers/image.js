const Clarifai = require("clarifai");
const app = new Clarifai.App({
  apiKey: "f462cceec4324ad69e878059a3d9f8b0",
});

const apiRequest = (req, res) => {
  app.models
    .predict("a403429f2ddf4b49b307e318f00e528b", req.body.imageUrl)
    .then(
      (data) => res.json(data),
      // the introduced link is not a proper one
      (err) => {
        res.json("badLink");
      }
    )
    // image does not contain faces
    .catch((err) => {
      res.json("error");
    });
};

const handleImage = (req, res, knex) => {
  knex("users")
    .where({
      id: Number(req.body.id),
    })
    .increment("entries", 1)
    .then((result) => {
      if (result === 0) {
        res.json("fail");
      } else {
        res.json("success");
      }
    });
};

module.exports = {
  handleImage: handleImage,
  apiRequest: apiRequest,
};
