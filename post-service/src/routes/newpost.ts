import { PrismaClient } from '@prisma/client';
import express from 'express';
import { channel } from '../../app';

import amqp, { Connection, Channel, Message } from 'amqplib';
import { requireAuth } from '@kunleticket/common';




const router = express.Router();

export const createPost = (prisma: PrismaClient) => {
  return router.post('/api/v1/post/create', requireAuth, async (req, res) => {
    const { content } = req.body;

    const post = await prisma.post.create({
      data: {
        userId: req.currentUser!.id,
        createdAt: new Date(Date.now()),
        content,

      }
    })


    channel.sendToQueue('post_created', Buffer.from(JSON.stringify(post)))
    res.send({
      status: 'created post',
      data: post
    })
  })
} 