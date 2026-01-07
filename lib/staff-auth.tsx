"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a separate Supabase client for staff with its own storage key
export const supabaseStaff = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "ghardaar-staff-auth",
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface StaffProfile {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface SheetAccess {
  id: string;
  sheet_id: string;
  sheet_name: string;
}

interface StaffAuthContextType {
  user: User | null;
  session: Session | null;
  staffProfile: StaffProfile | null;
  accessibleSheets: SheetAccess[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(
  undefined
);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [accessibleSheets, setAccessibleSheets] = useState<SheetAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch staff profile from crm_staff table
  const fetchStaffProfile = async (userId: string) => {
    if (isFetching) {
      return null;
    }

    setIsFetching(true);
    try {
      const { data, error } = await supabaseStaff
        .from("crm_staff")
        .select("*")
        .eq("id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.log("User is not a staff member or session invalid");
        }
        setStaffProfile(null);
        setAccessibleSheets([]);
        return false;
      }

      if (data) {
        setStaffProfile(data);
        // Fetch accessible sheets
        await fetchAccessibleSheets(userId);
        return true;
      } else {
        setStaffProfile(null);
        setAccessibleSheets([]);
        return false;
      }
    } catch (err) {
      console.error("Staff profile fetch exception:", err);
      setStaffProfile(null);
      setAccessibleSheets([]);
      return false;
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch sheets the staff member has access to
  const fetchAccessibleSheets = async (staffId: string) => {
    try {
      const { data, error } = await supabaseStaff
        .from("crm_sheet_access")
        .select(`
          id,
          sheet_id,
          crm_sheets (
            name
          )
        `)
        .eq("staff_id", staffId);

      if (error) {
        console.error("Error fetching accessible sheets:", error);
        setAccessibleSheets([]);
        return;
      }

      const sheets = (data || []).map((access: any) => ({
        id: access.id,
        sheet_id: access.sheet_id,
        sheet_name: access.crm_sheets?.name || "Unknown",
      }));

      setAccessibleSheets(sheets);
    } catch (err) {
      console.error("Error fetching accessible sheets:", err);
      setAccessibleSheets([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseStaff.auth.getSession();

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && session.access_token) {
          fetchStaffProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error getting staff session:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabaseStaff.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "INITIAL_SESSION") {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && session.access_token) {
        fetchStaffProfile(session.user.id);
      } else {
        setStaffProfile(null);
        setAccessibleSheets([]);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseStaff.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error as Error };
      }

      // Verify user is a staff member
      if (data.user) {
        const isStaff = await fetchStaffProfile(data.user.id);
        if (!isStaff) {
          // Sign out if not a staff member
          await supabaseStaff.auth.signOut();
          return {
            error: new Error("This account is not authorized as staff."),
          };
        }
      }

      return { error: null };
    } catch (error) {
      console.error("Staff sign in error:", error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabaseStaff.auth.signOut();
    setStaffProfile(null);
    setAccessibleSheets([]);
    router.push("/staff/login");
  };

  return (
    <StaffAuthContext.Provider
      value={{
        user,
        session,
        staffProfile,
        accessibleSheets,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  }
  return context;
}
