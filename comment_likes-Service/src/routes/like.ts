import express from 'express'
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@kunleticket/common';
import { channel } from '../app';

const router = express.Router();


export const likePost = (prisma: PrismaClient) => {
  return router.post('/api/v1/like/post/:id', requireAuth, async (req, res) => {
    const like = await prisma.like.create({
      data: {
        userId: req.currentUser!.id,
        postId: req.params.id,
        createdAt: new Date(Date.now())
      }
    })

    channel.sendToQueue('like_created', Buffer.from(JSON.stringify(like)));

    res.status(201).json({
      status: 'success',
      data: like
    })
  })
}