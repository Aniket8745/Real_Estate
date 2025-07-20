import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    listingId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);