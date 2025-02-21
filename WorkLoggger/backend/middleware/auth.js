const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async(req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    const user = await User.findOne({ _id: decoded.userId }).select('-password');;
    if(!user){
      throw Error("Such user does not exist!!");
    }

    req.user = {...req.user, user};


    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
