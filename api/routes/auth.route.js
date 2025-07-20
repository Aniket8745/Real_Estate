import express from 'express';
import { google, signOut, signin, signup } from '../controllers/auth.controller.js';
import { getListingFeedbacks } from '../controllers/feedback.controller.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post('/google', google);
router.get('/signout', signOut)
router.get('/feedback/listing/:listingId', getListingFeedbacks);

export default router;