import express from 'express';
import { deleteUser, test, updateUser,  getUserListings, getUser, buyListing, paymentVerification} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { createFeedback } from '../controllers/feedback.controller.js';
import  { verifyAuthorizationToken } from '../utils/verifyAuthorizationToken.js';


const router = express.Router();

router.get('/test', test);
router.post('/update/:id', verifyToken, updateUser)
router.delete('/delete/:id', verifyToken, deleteUser)
router.get('/listings/:id', verifyToken, getUserListings)
router.get('/:id', verifyToken, getUser)
router.post('/feedback/listing/:listingId', verifyAuthorizationToken, createFeedback);
router.post('/order', verifyAuthorizationToken, buyListing)
router.post('/verifyOrder', verifyAuthorizationToken, paymentVerification)

export default router;