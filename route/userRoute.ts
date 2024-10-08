import express from 'express';
import { addUser, deleteUser, updateUser, userList , roleList} from '../controller/userController';
import { authentication, restrictTo } from '../controller/authController'; // Ensure you have these middleware

const router = express.Router();

// Protected routes for managing users
router.use(authentication); // All routes below will require authentication
router.use(restrictTo('User Management')); // Assuming 'admin' is the role allowed to manage users

// Route to list users
router.get('/', userList);
router.get('/role-list', roleList);

// Route to add a new user
router.post('/create-user', addUser);

// Route to update a user by ID
router.patch('/:id', updateUser); // Use PATCH for partial updates

// Route to delete a user by ID
router.delete('/:id', deleteUser);

export default router;
