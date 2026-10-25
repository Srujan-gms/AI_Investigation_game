import mongoose from 'mongoose';

const MysterySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  createdBy: { type: String, default: null },
  title: { type: String, required: true },
  userPrompt: { type: String, default: '' },
  genre: { type: String, default: 'Noir' },
  difficulty: { type: String, default: 'medium' },
  caseBrief: { type: String, required: true },
  timeline: [
    {
      time: { type: String },
      event: { type: String }
    }
  ],
  suspects: [
    {
      id: { type: String },
      name: { type: String },
      role: { type: String },
      age: { type: Number },
      photoUrl: { type: String },
      alibi: { type: String },
      backstory: { type: String },
      isCulprit: { type: Boolean, default: false }
    }
  ],
  evidence: [
    {
      id: { type: String },
      type: { type: String },
      title: { type: String },
      description: { type: String },
      mediaUrl: { type: String },
      chatData: [{
        sender: String,
        message: String,
        timestamp: String,
        isRead: Boolean,
        isRedacted: Boolean
      }],
      documentText: { type: String },
      cameraLabel: { type: String },
      timestampOverlay: { type: String },
      footageDescription: { type: String },
      exif: {
        camera: String,
        lens: String,
        timestamp: String,
        location: String,
        notes: String
      },
      isRedHerring: { type: Boolean, default: false },
      revealOrder: { type: Number, default: 1 }
    }
  ],
  culpritId: { type: String, required: true },
  motive: { type: String, required: true },
  explanation: { type: String, required: true },
  status: { type: String, default: 'ready' },
  generationLog: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Mystery = mongoose.models.Mystery || mongoose.model('Mystery', MysterySchema);
