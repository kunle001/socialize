import { NotFoundError } from '@kunleticket/common';
import { PrismaClient } from '@prisma/client';
import express from 'express';

const router = express.Router();

export const getOnePosts = (prisma: PrismaClient) => {
  return router.get('/api/v1/posts/:id', async (req, res) => {
    const post = await prisma.post.findFirst(
      {
        where: {
          id: req.params.id
        }
      }
    );

    if (!post) throw new NotFoundError('no poem with that id')

    res.send({
      status: "success",
      data: post
    })

  })
}