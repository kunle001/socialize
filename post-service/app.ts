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
};

// conuming messages from necessary channels
connect().then(() => {
  channel.consume('user_created', async (data: Message | null) => {
    if (data) {
      const { id, email } = JSON.parse(data.content.toString());
      await prisma.user.create({
        data: {
          id,
          email,
        }
      });
      channel.ack(data)
      console.log('from poem service: user created!')
    }
  });

  // channel.consume('comment_created', (data: Message | null) => {
  //   if (data) {
  //     const { id, userId, postId, content } = JSON.parse(data.content.toString());

  //     prisma.comment.create({
  //       data: {
  //         id,
  //         userId,
  //         content,
  //         postId
  //       }
  //     })
  //     channel.ack(data)
  //     console.log('from poem service: comment created!')
  //   }
  // });

  // channel.consume('like_created', (data: Message | null) => {
  //   if (data) {
  //     const { id, userId, postId } = JSON.parse(data.content.toString());

  //     prisma.like.create({
  //       data: {
  //         id,
  //         userId,
  //         postId
  //       }
  //     })
  //     channel.ack(data)
  //     console.log('from poem service: like created!')
  //   }
  // });


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

