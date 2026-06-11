import mongoose, { Schema, Document } from "mongoose";

export interface ITranslation extends Document {
  userId: mongoose.Types.ObjectId;
  petId?: mongoose.Types.ObjectId;
  animal: string;
  emotion: string;
  message: string;
  confidence?: number;
  audioData?: string;
  createdAt: Date;
}

const TranslationSchema = new Schema<ITranslation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  petId: {
    type: Schema.Types.ObjectId,
    ref: "Pet",
    required: false,
  },
  animal: {
    type: String,
    required: true,
    lowercase: true,
  },
  emotion: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: false,
    min: 0,
    max: 1,
  },
  audioData: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Translation || mongoose.model<ITranslation>("Translation", TranslationSchema);
