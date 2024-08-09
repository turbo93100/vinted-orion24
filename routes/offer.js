const express = require("express");

const fileupload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

const User = require("../models/User");

const router = express.Router();

// import de mon middleware
const isAuthenticated = require("../middlewares/isAuthenticated");

// fonction formatage image

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  fileupload(),
  isAuthenticated,
  async (req, res) => {
    try {
      // --------------------- MIDDLEWARE
      // console.log(req.headers.authorization.replace("Bearer ", ""));
      // const token = req.headers.authorization.replace("Bearer ", "");

      // const user = await User.findOne({ token: token });

      // if (!user) {
      //   return res.status(401).json({ message: "Unauthorized" });
      // }

      // --------------------- MIDDLEWARE

      // console.log(req.body);
      // req.body -->
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      //

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        // product_image: Object,
        owner: req.user._id,
      });

      // const result = await cloudinary.uploader.upload(
      //   convertToBase64(req.files.picture)
      // );

      // console.log(result);

      // j'ajoute les infos de mon image dans newOffer
      // newOffer.product_image = result;

      // console.log(newOffer);

      await newOffer.save();

      // répondre :

      const responseObj = {
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        // product_image: result,
        owner: {
          account: req.user.account,
          _id: req.user._id,
        },
      };

      // console.log(responseObj);

      return res.status(201).json(responseObj);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  // console.log("/offers");

  // les filtres du find :
  const filters = {};

  // si j'ai un titre :  .find({ product_name : regex })
  // si j'ai un price min :  .find({ product_price : { $gte : priceMin } })
  // si j'ai price MIN ET price MAX :  .find({ product_price : { $gte : priceMin, $lte : priceMax } })
  // si j'ai un titre et une ou pls limites : .find({ product_name : regex , product_price : { $gte : priceMin } })

  // MAIS COMMENT FAIRE ?

  if (req.query.title) {
    filters.product_name = new RegExp(req.query.title, "i");
  }

  if (req.query.priceMin) {
    filters.product_price = { $gte: Number(req.query.priceMin) }; // { product_price : { $gte : priceMin } }
  }

  if (req.query.priceMax) {
    // est ce que l'objet product price existe ?
    if (filters.product_price) {
      // si oui je lui rajoute une clé $lte
      filters.product_price.$lte = Number(req.query.priceMax);
    } else {
      filters.product_price = { $lte: Number(req.query.priceMax) };
    }
  }

  console.log("filters =>", filters);

  // le tri
  const sort = {};

  if (req.query.sort === "price-asc") {
    sort.product_price = 1; // si req.query.sort === "price-asc" alors j'ajoute une clé product_price qui vaut 1 pour trier en ordre asc
  } else if (req.query.sort === "price-desc") {
    sort.product_price = -1;
  }

  console.log("sort => ", sort);

  // la page
  let page = 1;
  // update si query page reçue
  if (req.query.page) {
    page = req.query.page;
  }

  // la limite
  const limit = 5;

  // page 1 => 0 -> 0 * limit ; page 2 => 5 -> 1 * limit ; page 3 => 10 -> 2 * limit

  const skip = (page - 1) * limit;

  const result = await Offer.find(filters)
    .populate({
      path: "owner",
      select: "account",
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  //.sort({ product_price: 1 })

  res.json({ count: result.length, offers: result });
});

router.get("/offers/:id", async (req, res) => {
  // console.log(req.params.id);

  const result = await Offer.findById(req.params.id).populate({
    path: "owner",
    select: "account",
  });

  res.json(result);
});

module.exports = router;
