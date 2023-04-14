const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middlewares/isAuthenticated");
const Offer = require("../models/Offer");
const convertToBase64 = require("../utils/convertToBase64");

// J'utilise les middlewares isAuthenticated et fileUpload()
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log("Je passe dans ma route");
      // console.log(req.user);
      //   console.log(req.body);
      //   console.log(req.files);

      // Destructuring des clefs du body
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      // Je récupère la photo dans la clef suivante
      const picture = req.files.picture;

      // Upload de mon image sur cloudinary, la réponse de ce dernier sera dans result
      const result = await cloudinary.uploader.upload(convertToBase64(picture));

      //   console.log(result);

      // Création de ma nouvelle offre
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: Number(price),
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        product_image: result,
        // Ici, je me mon user entier, du moment que cet objet contient une clef _id, ce sera compris par mongoose comme une référence
        owner: req.user,
      });

      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    console.log(req.query);
    const { title, priceMin, priceMax, sort, page } = req.query;

    //product_name: new RegExp(title, "i"),
    //   product_price: { $gte: priceMin, $lte: priceMax },
    const filter = {};

    if (title) {
      filter.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filter.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (filter.product_price) {
        filter.product_price.$lte = Number(priceMax);
      } else {
        filter.product_price = { $lte: Number(priceMax) };
      }

      const sortFilter = {};
    }
    const offers = await Offer.find(filter).select(
      "product_name product_price"
    );
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
