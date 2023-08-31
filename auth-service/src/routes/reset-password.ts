import { BadRequestError, NotFoundError } from '@kunleticket/common';
import express from 'express';
import { Password } from '../services/password';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto'

const router = express.Router();

// export a function that takes prisma as a parameter and returns the router
export const resetPasswordRoute = (prisma: PrismaClient) => {
  router.post('/api/v1/users/reset-password/:token', async (req, res) => {
    let { password, passwordConfirm, email } = req.body;
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    // use the prisma parameter here
    let user = await prisma.user.findFirst({
      where: {
        email,
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date(Date.now()) }
      }
    }).catch((err) => {
      throw new BadRequestError(`${err}`)
    })



    if (!user) throw new NotFoundError('your token is invalid or expired');


    if (password !== passwordConfirm) throw new BadRequestError('password doesn\'t match');

    password = await Password.toHash(password);

    // use the prisma parameter here
    user = await prisma.user.update({
      where: { email }, data: {
        password,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(Date.now())
      }
    });


    res.send({
      status: 'success',
      data: {
        email: user.email,
        id: user.id
      }
    })
  });

  return router; // return the router
}
