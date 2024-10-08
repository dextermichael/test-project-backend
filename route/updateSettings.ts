import express from 'express';
import { updateSettings } from '../controller/settingsController';
import { authentication } from '../controller/authController'; // Ensure user is authenticated

const router = express.Router();

// Protected route to update the logged-in user's settings
router.use(authentication); // User must be authenticated

// Route to update phone_no and password
router.patch('/update-settings', updateSettings);

export default router;
