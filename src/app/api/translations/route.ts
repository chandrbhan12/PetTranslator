import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Translation from "@/models/Translation";
import Pet from "@/models/Pet"; // Ensure Pet model is registered for populate
import jwt from "jsonwebtoken";

// Helper function to verify user token
async function verifyUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// GET - Get user translation history
export async function GET(req: NextRequest) {
  try {
    const userId = await verifyUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    // Fetch and populate pet info if present
    const translations = await Translation.find({ userId })
      .populate("petId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ translations }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// POST - Save a new translation
export async function POST(req: NextRequest) {
  try {
    const userId = await verifyUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { petId, animal, emotion, message } = await req.json();

    if (!animal || !emotion || !message) {
      return NextResponse.json({ error: "Animal, emotion, and message are required" }, { status: 400 });
    }

    const newTranslation = await Translation.create({
      userId,
      petId: petId || undefined,
      animal,
      emotion,
      message,
    });

    return NextResponse.json({ message: "Translation saved successfully", translation: newTranslation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
