import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use((_: Request, res: Response) => {
  res.status(404).json({ status: 'error', statusCode: 404, message: 'Not Found' });
});

app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});