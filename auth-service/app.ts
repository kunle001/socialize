import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cookieparser from 'cookie-parser'
import { signupRouter } from './src/routes/signup';
import { NotFoundError, errorHandler } from '@kunleticket/common';
import { loginRouter } from './src/routes/login';
import { signoutRouter } from './src/routes/signout';
import { forgotPasswordRoute } from './src/routes/forgot-password';
import { resetPasswordRoute } from './src/routes/reset-password';
import { PrismaClient } from '@prisma/client';
import { getAllUsers } from './src/routes/get_all';
const prisma = new PrismaClient()

const app = express();
app.use(bodyParser.json())
app.use(cookieparser())


app.use(signupRouter(prisma))
app.use(loginRouter(prisma))
app.use(signoutRouter)
app.use(forgotPasswordRoute(prisma))
app.use(resetPasswordRoute(prisma))
app.use(getAllUsers(prisma))

app.use('*', (req, res) => {
  throw new NotFoundError('page not found')
});


app.use(errorHandler)

export { app }

