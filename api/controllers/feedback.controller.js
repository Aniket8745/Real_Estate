import Feedback from '../models/feedback.model.js';

export const createFeedback = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { rating, content } = req.body;
    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }
    if (!rating || !content) {
      return res.status(400).json({ message: 'Rating and content are required' });
    }
    if( rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const feedback = await Feedback.create({
      rating,
      content,
      listingId,
      userId: req.user.id
    });
    return res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

export const getListingFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ listingId: req.params.listingId })
      .populate('userId', 'username avatar');
    res.status(200).json(feedbacks);
  } catch (error) {
    next(error);
  }
};