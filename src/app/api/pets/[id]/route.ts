import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pet from "@/models/Pet";
import jwt from "jsonwebtoken";

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

// DELETE - Remove a pet profile
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await verifyUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const pet = await Pet.findOneAndDelete({ _id: id, userId });
    
    if (!pet) {
      return NextResponse.json({ error: "Pet not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pet deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
