import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { prisma } from '../utils/prisma'; // Import your Prisma client instance
import bcrypt from 'bcrypt';


// List users function
export const userList = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
        include: {
            role: true, // Include role information with each user
        },
    });

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

export const roleList = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const roles = await prisma.role.findMany({
        include: {
            permissions: true, // Include permissions with roles if needed
        },
    });

    res.status(200).json({
        status: 'success',
        results: roles.length,
        data: {
            roles,
        },
    });
});
// Function to add a new user
const addUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name , email, password, roleId , phone_no } = req.body;

    // Validate input
    if (!name || !email || !password || !roleId || !phone_no) {
        return next(new AppError('Please provide name , email, password, Phone No., and role ID', 400));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        return next(new AppError('User already exists with this email', 400));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in the database
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone_no,
            roleId,
        },
    });

    // Respond with the new user data
    return res.status(201).json({
        status: 'success',
        data: {
            id: newUser.id,
            email: newUser.email,
            roleId: newUser.roleId,
        },
    });
});

// Function to update a user by ID
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name , email, password, roleId , phone_no } = req.body;

    // Validate input
    if (!id) {
        return next(new AppError('Please provide a user ID', 400));
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
    });

    // If user not found
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Update user data
    const updatedData: any = {};
    if (email) {
        updatedData.email = email;
    }
    if (name) {
        updatedData.name = name;
    }
    if (password) {
        updatedData.password = await bcrypt.hash(password, 10); // Hash the new password if provided
    }
    if (roleId) {
        updatedData.roleId = roleId;
    }
    if(phone_no) {
        updatedData.phone_no = phone_no;
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: updatedData,
        include: {
            role: {
                include : {
                    permissions : true
                }
            }, // Include permissions with roles if needed
        },
    });

    // Respond with the updated user data
    return res.status(200).json({
        status: 'success',
        data: user,
    });
});

// Function to delete a user by ID
const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validate input
    if (!id) {
        return next(new AppError('Please provide a user ID', 400));
    }

    // Delete user from the database
    await prisma.user.delete({
        where: { id: Number(id) }, // Ensure id is a number
    });

    // Respond with a success message
    return res.status(204).json({
        status: 'success',
        data: null,
    });
});

// Export the user controller functions
export { addUser, updateUser, deleteUser };
