const { body, validationResult } = require("express-validator");

const {MongoError} = require("mongodb");

const router = require("express").Router();

const db = require("../../db");

router.post("/users", [
  body("name").trim().not().isEmpty().withMessage("Please enter a name"),
  body("email").trim().isEmail().normalizeEmail().withMessage("Please enter an email"),
  body("password").trim().isLength({min:6}).withMessage("Please enter a password"),
  body("address").trim().notEmpty().withMessage("Please enter an address"),
  body("city").trim().notEmpty().withMessage("Please enter a city"),
  body("state").notEmpty().withMessage("Please enter a state"),
  body("zip").trim().notEmpty().withMessage("Please enter a zip code"),
  body("phone").trim().isMobilePhone().withMessage("Please enter a phone number"),
], async (req, res) => {
  console.log("users route body is: ", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("validation errors in users are: ", errors);
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password, address, city, state, zip, phone} = req.body;
  try {
  const newUser = await db.User.create({ name, email, password, address, city, state, zip, phone});
  // session mamagement
  res.status(201).json(newUser);
  } catch (err) {
    console.log("err in users is: ", err);
    if (err instanceof MongoError) {
      if (err.code === 11000) {        
        res.status(400).json({errors: [{msg: "Email already in use"}]});
      }
    }
      res.status(500).end();
  }
})

router.post("/users/signin", [
  body("email").trim().isEmail().normalizeEmail().withMessage("Please enter an email"),
  body("password").trim().notEmpty().withMessage("Please enter a password"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } 
  const { email, password } = req.body;
  try {
    const user = await db.User.findOne({ email });
    if (!user || !user.comparePassword(password)) {
      return res.status(401).end();
    }
    // session mamagement
    res.status(200).json(user);
  } catch (err) {
    res.status(500).end();
  }
})

module.exports = router;