import { PrismaClient } from '@prisma/client';
import express from 'express';

const router = express.Router();

export const getAllUsers = (prisma: PrismaClient) => {
  return router.get('/api/v1/users', async (req, res) => {
    const users = await prisma.user.findMany();

    res.send(users)

  })
}