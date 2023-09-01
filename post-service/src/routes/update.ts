import express from 'express';
import { channel } from '../../app';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, requireAuth } from '@kunleticket/common';

const router = express.Router();

export const updatePostRouter = (prisma: PrismaClient) => {
  return router.patch('/api/v1/posts/update/:id', requireAuth, async (req, res) => {
    const { content } = req.body

    const post = await prisma.post.update({
      where: {
        userId: req.currentUser!.id,
        id: req.params.id
      },
      data: {
        content,
      }
    });

    if (!post) throw new NotFoundError('you do not have this post, or it doesnt exist')

    channel.sendToQueue('post_updated', Buffer.from(JSON.stringify(post)))
    res.send({
      status: 'success',
      data: post
    })
  });
}