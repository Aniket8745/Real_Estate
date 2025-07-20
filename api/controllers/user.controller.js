import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/order.model.js';

const keyId = 'rzp_test_wDliOlkvtU4cdh';
const keySecret = 'E2yPBVKFOjoIbiLUmG0O5zoF';
const razorpayInstance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
})

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      console.log(listings)
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

export const getUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const buyListing = async (req, res, next) => {
  try {
    const { amount } = req.body;
    console.log(amount)
    const options = {
      amount: amount * 100, 
      currency: 'INR',
    };
    const order = await razorpayInstance.orders.create(options);
    console.log(order)
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

export const paymentVerification = async (req, res, next) => {
  try {
      const userId = req.user.id
      const user = await User.findById(userId)
      const body = req.body

      if (!body)
          return res
              .status(200)
              .send({ status: 400, error: 'Invalid payload', error_description: 'paymentId, orderId is required.' })

      const { paymentId, orderId, listingId } = body
      if (!paymentId || !orderId || !listingId) {
          return res.status(200).send({
              status: 400,
              error: 'Invalid payload',
              error_description: 'paymentId, orderId , listingId is required.',
          })
      }
      const razorpay_signature = req.headers['x-razorpay-signature']
      if (!razorpay_signature) return res.status(200).send({ status: 400, message: 'x-razorpay-signature' })
      let sha256 = crypto.createHmac('sha256', keySecret)
      sha256.update(orderId + '|' + paymentId)

      const generated_signature = sha256.digest('hex')
      if (generated_signature !== razorpay_signature) {
          return res.status(400).json({ message: 'Payment verification failed.' })
      }
      const payment = await razorpayInstance.payments.fetch(paymentId)

      if (payment.status === 'captured') {
         const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            { paymentStatus: 'Completed' },
            { new: true }
         )
          return res.status(200).json({ message: 'Payment confirmed.', order: updatedOrder })
      } else {
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId },
          { paymentStatus: 'Failed' },
          { new: true }
       )
        return res.status(200).json({ message: 'Payment failed.', order: updatedOrder })
      }
  } catch (err) {
      return next(err)
  }
}
