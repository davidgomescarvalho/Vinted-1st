const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    // console.log("Je passe dans le middleware");
    // console.log(req.headers.authorization);

    // Vérification de la réception d'un token
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    // console.log(token);

    // Vérification que le token correspond bien à un user, je vais chercher dans ma collection User un élément dont la clef token contient le token reçu, je veux qu'on ne me renvoit que sa clef account
    const user = await User.findOne({ token: token }).select("account");
    // console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // console.log(req);

    // Je stocke les infos du user dans req pour y avoir accès dans la route utilisant le middleware
    req.user = user;
    // console.log(req);

    // Je passe à la fonction suivant
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = isAuthenticated;
