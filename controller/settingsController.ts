import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { prisma } from '../utils/prisma';

// Update user settings (phone_no, password)
export const updateSettings = catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const { name , phone_no, password } = req.body;

    // Fetch the logged-in user
    const userId = req.user.id;

    // Prepare the data object to be updated
    const updatedData: any = {};
    if (phone_no) {
        updatedData.phone_no = phone_no;
    }
    if (name) {
        updatedData.name = name;
    }
    if (password) {
        updatedData.password = await bcrypt.hash(password, 12); // Hash the new password
    }

    // Update the user's phone_no and/or password
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
        include: {
            role: {
                include : {
                    permissions : true
                }
            }, // Include permissions with roles if needed
        },
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});
