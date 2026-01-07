import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// This API route creates staff users with automatic email verification
// It uses the service role key which has admin privileges

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, adminId } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user with email pre-confirmed
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-verify email
    });

    if (authError) {
      console.error("Auth error creating staff:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create staff record in crm_staff table
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("crm_staff")
      .insert([
        {
          id: authData.user.id,
          email: email,
          name: name,
          created_by: adminId || null,
        },
      ])
      .select()
      .single();

    if (staffError) {
      console.error("Error creating staff record:", staffError);
      // Try to clean up the auth user if staff record creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: staffError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: staffData,
    });
  } catch (error: any) {
    console.error("Error in create-staff API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
