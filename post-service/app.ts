import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cookieparser from 'cookie-parser'
import { NotFoundError, currentUser, errorHandler } from '@kunleticket/common';
import amqp, { Connection, Channel, Message } from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { createPost } from './src/routes/newpost';
import { getAllUsers } from './src/routes/getUsers';
import { updatePostRouter } from './src/routes/update';
import { deletePostRouter } from './src/routes/delete';
import { getAllPosts } from './src/routes/getAllPost';
import { getOnePosts } from './src/routes/getOnePost';

const prisma = new PrismaClient()
const app = express();

let channel: Channel, connection: Connection;
process.env.JWT_KEY = 'kunle'

async function connect() {
  const amqpServer = "amqp://localhost:5672"; // Corrected typo in protocol
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue('post_created');
  await channel.assertQueue('post_updated');
  await channel.assertQueue('post_deleted');
  await channel.assertQueue('userCreated');
};

// conuming messages from necessary channels
connect().then(() => {
  channel.consume('user_created', async (data: Message | null) => {
    if (data) {
      const { id, email } = JSON.parse(data.content.toString());

      const user = await prisma.user.create({
        data: {
          id,
          email,
        }
      });
      channel.sendToQueue('userCreated', Buffer.from(JSON.stringify(user)))
      channel.ack(data)
      console.log('from post service: user created!')
    }
  });

  channel.consume('comment_created', async (data: Message | null) => {
    if (data) {
      const { id, userId, postId, content } = JSON.parse(data.content.toString());

      await prisma.comment.create({
        data: {
          id,
          userId,
          content,
          postId
        }
      })
      channel.ack(data)
      console.log('from poem service: comment created!')
    }
  });

  channel.consume('comment_updated', async (data: Message | null) => {
    if (data) {
      const res_data = JSON.parse(data.content.toString());

      await prisma.comment.update({
        where: {
          id: res_data.id
        },
        data: {
          content: res_data.content,
          // editedAt: res_data.editedAt
        }
      })
      channel.ack(data)
      console.log('from poem service: comment updated!')
    }
  });

  channel.consume('like_created', async (data: Message | null) => {
    if (data) {
      const { id, userId, postId } = JSON.parse(data.content.toString());

      await prisma.like.create({
        data: {
          id,
          userId,
          postId
        }
      })
      channel.ack(data)
      console.log('from poem service: like created!')
    }
  });

  channel.consume('unliked', async (data: Message | null) => {
    if (data) {
      let res_data = JSON.parse(data.content.toString());
      // res_data = res_data[0]
      await prisma.like.deleteMany({
        where: {
          userId: res_data.userId,
          postId: res_data.postId
        }
      })
      channel.ack(data)
      console.log('from poem service: unliked!')
    }
  });


})


app.use(bodyParser.json())
app.use(cookieparser())
app.use(currentUser);


app.use(createPost(prisma));
app.use(getAllUsers(prisma));
app.use(updatePostRouter(prisma))
app.use(deletePostRouter(prisma))
app.use(getAllPosts(prisma))
app.use(getOnePosts(prisma))

app.use('*', (req, res) => {
  throw new NotFoundError('page not found')
});


app.use(errorHandler)

export { app, channel }

