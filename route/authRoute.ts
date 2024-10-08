import { login , loginWithOauth } from "../controller/authController";

const router = require('express').Router();



router.route('/login').post(login);
router.route('/login-oauth').post(loginWithOauth);

export default router;