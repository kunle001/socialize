import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cookieparser from 'cookie-parser'
import { NotFoundError, errorHandler } from '@kunleticket/common';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

const app = express();
app.use(bodyParser.json())
app.use(cookieparser())


app.use('*', (req, res) => {
  throw new NotFoundError('page not found')
});


app.use(errorHandler)

export { app }

