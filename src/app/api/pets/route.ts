import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pet from "@/models/Pet";
import jwt from "jsonwebtoken";

// Helper function to verify user token
async function verifyUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("No token provided");
    return null;
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.userId;
  } catch (error) {
    console.log("JWT Verification Error:", error, "Token:", token);
    return null;
  }
}

// GET - Get all user pets
export async function GET(req: NextRequest) {
  try {
    const userId = await verifyUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const pets = await Pet.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ pets }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// POST - Add a new pet
export async function POST(req: NextRequest) {
  try {
    const userId = await verifyUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { name, type, breed, age, gender, photo } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const newPet = await Pet.create({
      userId,
      name,
      type,
      breed,
      age: age ? Number(age) : undefined,
      gender,
      photo,
    });

    return NextResponse.json({ message: "Pet added successfully", pet: newPet }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
