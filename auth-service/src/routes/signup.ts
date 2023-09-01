import { BadRequestError } from '@kunleticket/common';
import express from 'express';
import bcrypt from 'bcrypt'
import { Password } from '../services/password';
import { PrismaClient } from '@prisma/client';
import { Channel } from 'amqplib';
import { channel } from '../../app';

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
        email: true, password: true, id: true
      }
    }).catch((err) => {
      throw new BadRequestError(`${err}`)
    })


    channel.sendToQueue('user_created', Buffer.from(JSON.stringify(user)))

    res.status(201).json({
      status: 'success',
      data: user
    })
  });

  return router; // return the router
}
