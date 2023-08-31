import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError } from '@kunleticket/common';
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client';

const router = express.Router()

// export a function that takes prisma as a parameter and returns the router
export const forgotPasswordRoute = (prisma: PrismaClient) => {
  router.post('/api/v1/users/forgot-password', [
    body('email')
      .isEmail()
      .withMessage('email must be an email format')
  ], async (req: Request, res: Response) => {
    const { email } = req.body;

    // use the prisma parameter here
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new BadRequestError('no user with this email');
    const token = crypto.randomBytes(32).toString('hex')

    // use the prisma parameter here
    user = await prisma.user.update({
      where: { email }, data: {
        passwordResetToken: crypto.createHash('sha256').update(token).digest('hex'),
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000) //expires in 10 minutes
      }
    });

    res.send({
      status: "success",
      data: {
        message: 'Follow the link to reset password',
        link: `http://localhost:5000/api/v1/users/reset-password/${token}`
      }
    });
  });

  return router; // return the router
}
