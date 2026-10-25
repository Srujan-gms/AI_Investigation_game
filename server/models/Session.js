import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, default: null },
  mysteryId: { type: String, required: true },
  pinnedEvidence: [{ type: String }],
  notes: { type: String, default: '' },
  hintsUsed: { type: Number, default: 0 },
  verdict: { type: String, default: null },
  isCorrect: { type: Boolean, default: null },
  score: { type: Number, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
