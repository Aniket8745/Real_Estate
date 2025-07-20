import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

const secret = "Aniket";

export const verifyAuthorizationToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(errorHandler(401, 'Unauthorized'));
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secret, (err, user) => {
    if (err) return next(errorHandler(403, 'Forbidden'));

    req.user = user;
    next();
  });
};
