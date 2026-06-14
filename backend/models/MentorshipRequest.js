import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true }
);

mentorshipRequestSchema.index({ student: 1, alumni: 1, status: 1 });

export default mongoose.model('MentorshipRequest', mentorshipRequestSchema);
