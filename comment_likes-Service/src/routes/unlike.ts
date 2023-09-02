import express from 'express'
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@kunleticket/common';
import { channel } from '../app';

const router = express.Router();


export const unlikePost = (prisma: PrismaClient) => {
  return router.delete('/api/v1/unlike/:id', requireAuth, async (req, res) => {
    const like = await prisma.like.deleteMany({
      where: {
        postId: req.params.id,
        userId: req.currentUser!.id,
      }
    })

    channel.sendToQueue('unliked', Buffer.from(JSON.stringify({
      userId: req.currentUser!.id,
      postId: req.params.id
    })));

    res.status(201).json({
      status: 'success',
      data: 'post unliked'
    })
  })
}