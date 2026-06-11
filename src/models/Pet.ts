import mongoose, { Schema, Document } from "mongoose";

export interface IPet extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: string; // "dog", "cat", "cow", "bird", "horse", "parrot"
  breed?: string;
  age?: number;
  gender?: string;
  photo?: string; // base64 string or URL
  createdAt: Date;
}

const PetSchema = new Schema<IPet>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Pet name is required"],
    trim: true,
  },
  type: {
    type: String,
    required: [true, "Pet type is required"],
    enum: ["dog", "cat", "cow", "bird", "horse", "parrot"],
    lowercase: true,
  },
  breed: {
    type: String,
    trim: true,
    default: "",
  },
  age: {
    type: Number,
    min: 0,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Unknown"],
    default: "Unknown",
  },
  photo: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Pet || mongoose.model<IPet>("Pet", PetSchema);
