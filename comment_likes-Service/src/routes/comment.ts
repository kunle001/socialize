import express from 'express'
import { PrismaClient } from '@prisma/client';
import { BadRequestError, requireAuth } from '@kunleticket/common';
import { channel } from '../app';

const router = express.Router();


export const createComment = (prisma: PrismaClient) => {
  return router.post('/api/v1/comment/post/:id', requireAuth, async (req, res) => {
    const { content } = req.body
    const comment = await prisma.comment.create({
      data: {
        userId: req.currentUser!.id,
        content,
        postId: req.params.id,
        createdAt: new Date(Date.now())
      }
    }).catch((err) => {
      throw new BadRequestError(`${err}`)
    });

    channel.sendToQueue('comment_created', Buffer.from(JSON.stringify(comment)));

    res.status(201).json({
      status: 'success',
      data: comment
    })
  })
}