import dotenv from 'dotenv';
import express from 'express';
import authRouter from './route/authRoute';
import userRouter from './route/userRoute';
import rolteRouter from './route/roleRoute';
import updateSettings from './route/updateSettings';
import catchAsync from './utils/catchAsync';
import AppError from './utils/appError';
import globalErrorHandler from './controller/errorController';

dotenv.config({ path: `${process.cwd()}/.env` });

const app = express();

app.use(express.json());

// All routes will be here
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/roles', rolteRouter);
app.use('/api/v1/settings', updateSettings);

app.use(
    '*',
    catchAsync(async(req, res, next) => {
        throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
    })
);

app.use(globalErrorHandler);

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
});