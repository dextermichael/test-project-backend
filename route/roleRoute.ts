import express from 'express';
import { roleList, addRole, updateRole, deleteRole } from '../controller/roleController';
import { authentication, restrictTo } from '../controller/authController'; // Ensure you have these middleware

const router = express.Router();

// Protected routes for managing roles
router.use(authentication); // All routes below will require authentication
router.use(restrictTo('Role Management')); // Restrict access to roles with 'Role Management' permissions

// Route to list roles
router.get('/', roleList);

// Route to add a new role
router.post('/create-role', addRole);

// Route to update a role by ID
router.patch('/:id', updateRole);

// Route to delete a role by ID
router.delete('/:id', deleteRole);

export default router;
