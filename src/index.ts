import express from 'express';
import route from './routes/index.route'; // Correct
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(route);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});