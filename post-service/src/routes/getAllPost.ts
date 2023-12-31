import { PrismaClient } from '@prisma/client';
import express from 'express';

const router = express.Router();

export const getAllPosts = (prisma: PrismaClient) => {
  return router.get('/api/v1/posts', async (req, res) => {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        Comment: true,
        Like: true
      }
    });

    res.send({
      status: "success",
      data: posts
    })

  })
}