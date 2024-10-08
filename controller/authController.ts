import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import catchAsync from '../utils/catchAsync'; // Assuming you have this utility
import AppError from '../utils/appError'; // Assuming you have this error handling utility
import {prisma} from "../utils/prisma"; // Assuming you have a prisma client instance

// Define a type for the payload used in JWT
interface JwtPayload {
    id: number;
}

// Generate JWT token
const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Login function using Prisma
const login = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Ensure email and password are provided
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Find user by email using Prisma
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // If user not found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Generate JWT token
    const token = generateToken({
        id: user.id,
    });

    // Send response with token
    return res.json({
        status: 'success',
        token,
        user
    });
});

const loginWithOauth = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Ensure email and password are provided
    if (!email ) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Find user by email using Prisma
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // If user not found or password doesn't match
    if (!user ) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Generate JWT token
    const token = generateToken({
        id: user.id,
    });

    // Send response with token
    return res.json({
        status: 'success',
        token,
        user
    });
});


// Authentication middleware
const authentication = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    // Get token from headers
    let idToken = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        idToken = req.headers.authorization.split(' ')[1];
    }

    if (!idToken) {
        return next(new AppError('Please login to get access', 401));
    }

    try {
        // Verify the token
        const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY!) as JwtPayload;

        // Fetch the user based on token
        const freshUser = await prisma.user.findUnique({
            where: { id: tokenDetail.id },
        });

        if (!freshUser) {
            return next(new AppError('User no longer exists', 400));
        }

        // Attach user to the request object
        req.user = freshUser;
        return next();

    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired. Please log in again.', 401));
        }

        // Handle other JWT verification errors
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
});

// Restrict access based on user's role permissions
const restrictTo = (moduleName: string) => {
    return async (req: any, res: Response, next: NextFunction) => {
        const userId = req.user.id; // Assuming user information is attached to the request

        // Fetch user's role and associated permissions
        const userWithPermissions = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: true, // Include role permissions
                    },
                },
            },
        });
        if (!userWithPermissions || !userWithPermissions.role) {
            return next(new AppError("User's role not found", 403));
        }

        // Check if the user's role has permission for the specified module
        const hasPermission = userWithPermissions.role.permissions.some(
            (permission : any) => permission.module === moduleName
        );

        if (!hasPermission) {
            return next(new AppError("You don't have permission to perform this action", 403));
        }

        return next();
    };
};

export { login, authentication, restrictTo , loginWithOauth };

