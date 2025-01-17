import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User.js';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
export const login = Router();

login.post(
  '/',
  // Validación y sanitización de los datos de entrada
  body('username').not().isEmpty().trim(),
  body('password').isLength({ min: 6 }),

  //
  async (request, response) => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
      }

      const { username, password } = request.body;

      const user = await UserModel.findOne({ username });

      if (!user) {
        return response.status(400).json({
          error: 'username or password is incorrect',
        });
      }

      const isPasswordValid = compare(password, user.password, (err) => {
        if (err) {
          return response.status(400).json({
            error: 'username or password is incorrect',
          });
        }

        // @todo: generate a JWT token
        const token = jwt.sign(
          { username: user.username, id: user.id },
          process.env.JWT_SECRET,
          {
            expiresIn: '1h',
          }
        );
        response.setHeader('x-access-token', token);
        response.status(201).json({ token: token });
      });
    } catch (error) {
      console.error(`[signIn]: ${error}`);

      return response.status(500).json({
        error: 'An unexpected error happened. Please try again later',
      });
    }
  }
);
