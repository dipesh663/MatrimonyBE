const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };