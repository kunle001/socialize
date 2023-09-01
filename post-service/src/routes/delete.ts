import express from 'express';
import { channel } from '../../app';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, requireAuth } from '@kunleticket/common';

const router = express.Router();

export const deletePostRouter = (prisma: PrismaClient) => {
  return router.delete('/api/v1/posts/delete/:id', requireAuth, async (req, res) => {

    const post = await prisma.post.delete({
      where: {
        userId: req.currentUser!.id,
        id: req.params.id
      },
    });

    if (!post) throw new NotFoundError('you do not have this post, or it doesnt exist')

    channel.sendToQueue('post_deleted', Buffer.from(JSON.stringify(post)))
    res.send({
      status: 'success',
      data: 'post deleted successfully!'
    })
  });
}