import { BadRequestError } from '@kunleticket/common';
import express from 'express';
import bcrypt from 'bcrypt'
import { Password } from '../services/password';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// export a function that takes prisma as a parameter and returns the router
export const signupRouter = (prisma: PrismaClient) => {
  router.post('/api/v1/users/signup', async (req, res) => {
    const { email, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) throw new BadRequestError('password is different from password-confirm')

    const hashed = await Password.toHash(password)

    // use the prisma parameter here
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,

      },
      select: {
        email: true, password: true
      }
    }).catch((err) => {
      throw new BadRequestError(`${err}`)
    })

    res.status(201).json({
      status: 'success',
      data: user
    })
  });

  return router; // return the router
}
