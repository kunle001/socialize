import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cookieparser from 'cookie-parser'
import { NotFoundError, currentUser, errorHandler } from '@kunleticket/common';
import amqp, { Connection, Channel, Message } from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { createComment } from './routes/comment';
import { updateComment } from './routes/update_comment';
import { likePost } from './routes/like';
import { unlikePost } from './routes/unlike';

const prisma = new PrismaClient()
const app = express();

let channel: Channel, connection: Connection;
process.env.JWT_KEY = 'kunle'

async function connect() {
  const amqpServer = "amqp://localhost:5672"; // Corrected typo in protocol
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue('comment_created');
  await channel.assertQueue('like_created');
  await channel.assertQueue('unliked');
  await channel.assertQueue('comment_updated');
  await channel.assertQueue('post_deleted');
};

// conuming messages from necessary channels
connect().then(() => {
  channel.consume('userCreated', async (data: Message | null) => {
    if (data) {
      const { id, email } = JSON.parse(data.content.toString());
      await prisma.user.create({
        data: {
          id,
          email,
        }
      });
      channel.ack(data)
      console.log('from comment service: user created!')
    }
  });

  channel.consume('post_created', async (data: Message | null) => {
    if (data) {
      const { id, userId, content, createdAt } = JSON.parse(data.content.toString());

      await prisma.post.create({
        data: {
          id,
          userId,

          createdAt
        }
      })
      channel.ack(data)
      console.log('from comment service: post created!')
    }
  });

  channel.consume('post_updated', async (data: Message | null) => {
    if (data) {
      const res_data = JSON.parse(data.content.toString());

      await prisma.post.update({
        where: {
          id: res_data.id
        },
        data: {
          ...res_data
        }
      })
      channel.ack(data)
      console.log('from comment service: post updated!')
    }
  });


})


app.use(bodyParser.json())
app.use(cookieparser())
app.use(currentUser);

app.use(createComment(prisma));
app.use(updateComment(prisma));
app.use(likePost(prisma));
app.use(unlikePost(prisma))


app.use('*', (req, res) => {
  throw new NotFoundError('page not found')
});


app.use(errorHandler)

export { app, channel }

