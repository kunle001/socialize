import express from 'express'
import { PrismaClient } from '@prisma/client';
import { BadRequestError, requireAuth } from '@kunleticket/common';
import { channel } from '../app';

const router = express.Router();


export const updateComment = (prisma: PrismaClient) => {
  return router.patch('/api/v1/comment/:id', requireAuth, async (req, res) => {
    const { content } = req.body
    const comment = await prisma.comment.update({
      where: {
        id: req.params.id
      },
      data: {
        ...req.body,
        editedAt: new Date(Date.now())
      }
    }).catch((err) => {
      throw new BadRequestError(`${err}`)
    });

    if (!comment) {
      throw new BadRequestError('no comment with this id')
    }

    channel.sendToQueue('comment_updated', Buffer.from(JSON.stringify(comment)));

    res.status(200).json({
      status: 'success',
      data: comment
    })
  })
}