import express, { Request, Response } from 'express';
import { body } from 'express-validator'
import { BadRequestError, NotFoundError } from '@kunleticket/common';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// export a function that takes prisma as a parameter and returns the router
export const loginRouter = (prisma: PrismaClient) => {
  router.post('/api/v1/users/login', [
    body('email')
      .isEmail()
      .withMessage('body must contain an email'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('you must provide a password')

  ], async (req: Request, res: Response) => {
    let { email, password } = req.body

    // use the prisma parameter here
    const user = await prisma.user.findFirst({
      where: {
        email
      }
    });


    if (!user) throw new NotFoundError('no user with this email');
    const passwordMatch = await Password.compare(user.password, password);

    if (!passwordMatch) throw new BadRequestError('wrong password');

    const userjwt = jwt.sign({
      id: user.id,
      email: user.email
    }, 'kunle');

    // Store it on session
    res.cookie('secretoken', userjwt, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    });

    res.send({
      status: 'success',
      data: {
        email,
        id: user.id
      }
    })

  })

  return router; // return the router
}
