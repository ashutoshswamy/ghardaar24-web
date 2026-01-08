import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// This API route creates staff users with automatic email verification
// It uses the service role key which has admin privileges
// If the user already has an account, it will use their existing account

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, adminId } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    // Check for authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the user
    const { data: { user }, error: authErrorResult } = await supabaseAdmin.auth.getUser(token);

    if (authErrorResult || !user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Verify user is an admin
    const { data: adminRecord, error: adminCheckError } = await supabaseAdmin
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .single();

    if (adminCheckError || !adminRecord) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    let userId: string;
    let isExistingUser = false;

    // Check if user already exists by listing users with this email
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      // User already has an account, use their existing ID
      userId = existingUser.id;
      isExistingUser = true;

      // Check if they're already a staff member
      const { data: existingStaff } = await supabaseAdmin
        .from("crm_staff")
        .select("id")
        .eq("id", userId)
        .single();

      if (existingStaff) {
        return NextResponse.json(
          { error: "This user is already a staff member." },
          { status: 400 }
        );
      }

      // Check if they're an admin (admins shouldn't be added as staff)
      const { data: existingAdmin } = await supabaseAdmin
        .from("admins")
        .select("id")
        .eq("id", userId)
        .single();

      if (existingAdmin) {
        return NextResponse.json(
          { error: "This user is an admin and cannot be added as staff." },
          { status: 400 }
        );
      }
    } else {
      // Create new user with email pre-confirmed
      if (!password) {
        return NextResponse.json(
          { error: "Password is required for new users" },
          { status: 400 }
        );
      }

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

      userId = authData.user.id;
    }

    // Create staff record in crm_staff table
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("crm_staff")
      .insert([
        {
          id: userId,
          email: email,
          name: name,
          created_by: adminId || null,
        },
      ])
      .select()
      .single();

    if (staffError) {
      console.error("Error creating staff record:", staffError);
      // Only delete the auth user if we just created them
      if (!isExistingUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      return NextResponse.json(
        { error: staffError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: staffData,
      isExistingUser: isExistingUser,
    });
  } catch (error: any) {
    console.error("Error in create-staff API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
