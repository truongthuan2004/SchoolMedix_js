import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';

import userRoutes from './routes/users.routes.js';


const app = express();

app.use(cors());               // Cho phép mọi origin (hoặc cấu hình cụ thể)
app.use(helmet());             // Bảo mật
app.use(morgan('dev'));        // Log ra console theo format "dev"
app.use(express.json());       // Đọc body JSON

app.use('/api', routes);       // Mount tất cả routes con vào đường dẫn /api
app.use('/api', userRoutes);
