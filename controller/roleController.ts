import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { prisma } from '../utils/prisma';

// List all roles
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

// Add a new role
export const addRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, permissions } = req.body;

    const newRole = await prisma.role.create({
        data: {
            name,
            permissions: {
                create: permissions, // Assuming permissions array is provided
            },
        },
    });

    res.status(201).json({
        status: 'success',
        data: {
            role: newRole,
        },
    });
});

// Update an existing role
export const updateRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, permissions } = req.body;
    const updatedData: any = {};
    if (name) {
        updatedData.name = name;
    }
    if (permissions) {
        updatedData.permissions = {
            set : [],
            create : permissions,
        }; // Hash the new password
    }


    const updatedRole = await prisma.role.update({
        where: { id: Number(id) },
        data: updatedData,
        include : {
            permissions : true
        }
    });

    res.status(200).json({
        status: 'success',
        data: updatedRole,
    });
});

// Delete a role
export const deleteRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.role.delete({
        where: { id: Number(id) },
    });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
