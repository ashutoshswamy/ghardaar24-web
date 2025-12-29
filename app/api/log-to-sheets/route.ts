import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { appendUserSignup, appendPropertyListing } from "@/lib/google-sheets";

interface SignupData {
  name: string;
  email: string;
  phone: string;
  timestamp: string;
}

interface PropertyData {
  title: string;
  property_type: string;
  listing_type: string;
  price: string;
  location: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientId);

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn),
        }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing type or data in request body" },
        { status: 400 }
      );
    }

    if (type === "signup") {
      const signupData = data as SignupData;
      if (!signupData.name || !signupData.email || !signupData.phone) {
        return NextResponse.json(
          { error: "Missing required signup fields" },
          { status: 400 }
        );
      }
      await appendUserSignup(signupData);
    } else if (type === "property") {
      const propertyData = data as PropertyData;
      if (!propertyData.title || !propertyData.property_type) {
        return NextResponse.json(
          { error: "Missing required property fields" },
          { status: 400 }
        );
      }
      await appendPropertyListing(propertyData);
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'signup' or 'property'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging to Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to log to Google Sheets" },
      { status: 500 }
    );
  }
}
