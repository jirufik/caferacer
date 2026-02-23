import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../client')));

const routes = ['/', '/caferacer', '/caferacer.html', '/CafeRacer', '/CafeRacer.html'];
for (const route of routes) {
  app.use(route, indexRouter);
}

app.use((_req, res) => {
  res.status(404).render('error', {
    message: 'Not Found',
    error: { status: 404 },
  });
});

export default app;
