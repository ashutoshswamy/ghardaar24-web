"use client";

import { useEffect, useState } from "react";
import { useStaffAuth, supabaseStaff } from "@/lib/staff-auth";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Search,
  Filter,
  Phone,
  Calendar,
  MapPin,
  MessageSquare,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  FileSpreadsheet,
  Lock,
} from "lucide-react";

// Types
interface CRMClient {
  id: string;
  client_name: string;
  customer_number: string | null;
  lead_stage: "follow_up_req" | "dnp" | "disqualified" | "callback_later";
  lead_type: "hot" | "warm" | "cold";
  location_category: string | null;
  calling_comment: string | null;
  expected_visit_date: string | null;
  deal_status: "open" | "locked" | "lost";
  admin_notes: string | null;
  sheet_id: string | null;
  created_at: string;
}

interface CRMSheet {
  id: string;
  name: string;
  description: string | null;
}

type FilterState = {
  search: string;
  leadStage: string;
  leadType: string;
  dealStatus: string;
  locationCategory: string;
};

const LEAD_STAGE_OPTIONS = [
  { value: "follow_up_req", label: "Follow Up Required", color: "#f59e0b" },
  { value: "dnp", label: "DNP", color: "#6366f1" },
  { value: "disqualified", label: "Disqualified", color: "#ef4444" },
  { value: "callback_later", label: "CB after 2-3 Months", color: "#8b5cf6" },
];

const LEAD_TYPE_OPTIONS = [
  { value: "hot", label: "Hot", color: "#ef4444" },
  { value: "warm", label: "Warm", color: "#f59e0b" },
  { value: "cold", label: "Cold", color: "#3b82f6" },
];

const DEAL_STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "#f59e0b" },
  { value: "locked", label: "Deal Locked", color: "#22c55e" },
  { value: "lost", label: "Lost", color: "#6b7280" },
];

export default function StaffCRMPage() {
  const { staffProfile, accessibleSheets, loading: authLoading } = useStaffAuth();
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [sheets, setSheets] = useState<CRMSheet[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    leadStage: "",
    leadType: "",
    dealStatus: "",
    locationCategory: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ clientId: string; field: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // Fetch accessible sheets
  useEffect(() => {
    async function fetchSheets() {
      if (accessibleSheets.length === 0) {
        setSheets([]);
        setIsLoading(false);
        return;
      }

      try {
        const sheetIds = accessibleSheets.map((s) => s.sheet_id);
        const { data, error } = await supabaseStaff
          .from("crm_sheets")
          .select("*")
          .in("id", sheetIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSheets(data || []);

        // Select first sheet by default
        if (data && data.length > 0 && !selectedSheetId) {
          setSelectedSheetId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching sheets:", error);
      }
    }

    if (!authLoading && staffProfile) {
      fetchSheets();
    }
  }, [authLoading, staffProfile, accessibleSheets]);

  // Fetch clients for selected sheet
  useEffect(() => {
    async function fetchClients() {
      if (!selectedSheetId) {
        setClients([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseStaff
          .from("crm_clients")
          .select("*")
          .eq("sheet_id", selectedSheetId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedSheetId) {
      setIsLoading(true);
      fetchClients();
    }
  }, [selectedSheetId]);

  // Real-time subscription for live updates
  useEffect(() => {
    if (!selectedSheetId) return;

    const channel = supabaseStaff
      .channel('staff_crm_clients_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crm_clients',
        },
        (payload) => {
          const newClient = payload.new as CRMClient;
          // Only add if it belongs to the current sheet
          if (newClient.sheet_id === selectedSheetId) {
            setClients((prev) => [newClient, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crm_clients',
        },
        (payload) => {
          const updatedClient = payload.new as CRMClient;
          setClients((prev) =>
            prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'crm_clients',
        },
        (payload) => {
          const deletedId = payload.old.id;
          setClients((prev) => prev.filter((c) => c.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabaseStaff.removeChannel(channel);
    };
  }, [selectedSheetId]);

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      !filters.search ||
      client.client_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      client.customer_number?.includes(filters.search) ||
      client.calling_comment?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStage = !filters.leadStage || client.lead_stage === filters.leadStage;
    const matchesType = !filters.leadType || client.lead_type === filters.leadType;
    const matchesStatus = !filters.dealStatus || client.deal_status === filters.dealStatus;
    const matchesLocation =
      !filters.locationCategory ||
      client.location_category?.toLowerCase().includes(filters.locationCategory.toLowerCase());

    return matchesSearch && matchesStage && matchesType && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter
  const uniqueLocations = [...new Set(clients.map((c) => c.location_category).filter(Boolean))];

  // Stats
  const stats = {
    total: clients.length,
    hot: clients.filter((c) => c.lead_type === "hot").length,
    warm: clients.filter((c) => c.lead_type === "warm").length,
    cold: clients.filter((c) => c.lead_type === "cold").length,
    locked: clients.filter((c) => c.deal_status === "locked").length,
  };

  // Get badge styles
  const getLeadTypeBadge = (type: CRMClient["lead_type"]) => {
    const option = LEAD_TYPE_OPTIONS.find((o) => o.value === type);
    return { backgroundColor: `${option?.color}20`, color: option?.color };
  };

  const getLeadStageBadge = (stage: CRMClient["lead_stage"]) => {
    const option = LEAD_STAGE_OPTIONS.find((o) => o.value === stage);
    return { backgroundColor: `${option?.color}20`, color: option?.color };
  };

  const getDealStatusBadge = (status: CRMClient["deal_status"]) => {
    const option = DEAL_STATUS_OPTIONS.find((o) => o.value === status);
    return { backgroundColor: `${option?.color}20`, color: option?.color };
  };

  // Start inline editing
  const startEditing = (clientId: string, field: string, currentValue: string) => {
    setEditingCell({ clientId, field });
    setEditingValue(currentValue || "");
  };

  // Cancel inline editing
  const cancelEditing = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  // Handle inline update
  const handleInlineUpdate = async (clientId: string, field: string, value: string) => {
    try {
      const updateData: Record<string, string | null> = { [field]: value || null };
      
      const { error } = await supabaseStaff
        .from("crm_clients")
        .update(updateData)
        .eq("id", clientId);

      if (error) throw error;

      // Update local state
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId ? { ...c, [field]: value || null } : c
        )
      );
      cancelEditing();
    } catch (error) {
      console.error("Error updating field:", error);
      alert("Failed to update. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (sheets.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Access</h2>
        <p className="text-gray-500">
          You don&apos;t have access to any CRM sheets yet.
          <br />
          Please contact your admin to grant access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Clients</h1>
          <p className="text-gray-500">View and search client data</p>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex flex-wrap gap-1">
        {sheets.map((sheet) => (
          <button
            key={sheet.id}
            onClick={() => setSelectedSheetId(sheet.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSheetId === sheet.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            {sheet.name}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Hot</p>
              <p className="text-xl font-bold text-gray-900">{stats.hot}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Warm</p>
              <p className="text-xl font-bold text-gray-900">{stats.warm}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Cold</p>
              <p className="text-xl font-bold text-gray-900">{stats.cold}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Locked</p>
              <p className="text-xl font-bold text-gray-900">{stats.locked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, phone, or notes..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${
              showFilters
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-gray-100"
            >
              <select
                value={filters.leadStage}
                onChange={(e) => setFilters((prev) => ({ ...prev, leadStage: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Stages</option>
                {LEAD_STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.leadType}
                onChange={(e) => setFilters((prev) => ({ ...prev, leadType: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                {LEAD_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.dealStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, dealStatus: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Status</option>
                {DEAL_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.locationCategory}
                onChange={(e) => setFilters((prev) => ({ ...prev, locationCategory: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc || ""}>
                    {loc}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-3 text-gray-500">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No clients found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lead Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Visit Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDetailsModal(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{client.client_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {client.customer_number && (
                        <a
                          href={`tel:${client.customer_number}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {client.customer_number}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "lead_stage" ? (
                        <select
                          value={editingValue}
                          onChange={(e) => handleInlineUpdate(client.id, "lead_stage", e.target.value)}
                          onBlur={cancelEditing}
                          onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                          autoFocus
                          className="crm-inline-select"
                          style={{ ...getLeadStageBadge(editingValue as CRMClient["lead_stage"]), minWidth: "120px" }}
                        >
                          {LEAD_STAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                          style={getLeadStageBadge(client.lead_stage)}
                          onClick={() => startEditing(client.id, "lead_stage", client.lead_stage)}
                        >
                          {LEAD_STAGE_OPTIONS.find((o) => o.value === client.lead_stage)?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "lead_type" ? (
                        <select
                          value={editingValue}
                          onChange={(e) => handleInlineUpdate(client.id, "lead_type", e.target.value)}
                          onBlur={cancelEditing}
                          onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                          autoFocus
                          className="crm-inline-select"
                          style={{ ...getLeadTypeBadge(editingValue as CRMClient["lead_type"]), minWidth: "80px" }}
                        >
                          {LEAD_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                          style={getLeadTypeBadge(client.lead_type)}
                          onClick={() => startEditing(client.id, "lead_type", client.lead_type)}
                        >
                          {LEAD_TYPE_OPTIONS.find((o) => o.value === client.lead_type)?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "location_category" ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => handleInlineUpdate(client.id, "location_category", editingValue)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleInlineUpdate(client.id, "location_category", editingValue);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          autoFocus
                          className="crm-inline-input"
                          placeholder="Enter location"
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-all"
                          onClick={() => startEditing(client.id, "location_category", client.location_category || "")}
                        >
                          {client.location_category || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "expected_visit_date" ? (
                        <input
                          type="date"
                          value={editingValue}
                          onChange={(e) => handleInlineUpdate(client.id, "expected_visit_date", e.target.value)}
                          onBlur={cancelEditing}
                          onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                          autoFocus
                          className="crm-inline-input"
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-all"
                          onClick={() => startEditing(client.id, "expected_visit_date", client.expected_visit_date || "")}
                        >
                          {client.expected_visit_date
                            ? new Date(client.expected_visit_date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })
                            : "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {editingCell?.clientId === client.id && editingCell?.field === "deal_status" ? (
                        <select
                          value={editingValue}
                          onChange={(e) => handleInlineUpdate(client.id, "deal_status", e.target.value)}
                          onBlur={cancelEditing}
                          onKeyDown={(e) => e.key === "Escape" && cancelEditing()}
                          autoFocus
                          className="crm-inline-select"
                          style={{ ...getDealStatusBadge(editingValue as CRMClient["deal_status"]), minWidth: "100px" }}
                        >
                          {DEAL_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                          style={getDealStatusBadge(client.deal_status)}
                          onClick={() => startEditing(client.id, "deal_status", client.deal_status)}
                        >
                          {DEAL_STATUS_OPTIONS.find((o) => o.value === client.deal_status)?.label}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedClient && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedClient.client_name}</h3>
                    {selectedClient.customer_number && (
                      <a
                        href={`tel:${selectedClient.customer_number}`}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mt-1 font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedClient.customer_number}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                      style={getLeadTypeBadge(selectedClient.lead_type)}
                    >
                      {LEAD_TYPE_OPTIONS.find((o) => o.value === selectedClient.lead_type)?.label}
                    </span>
                    <span
                      className="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                      style={getLeadStageBadge(selectedClient.lead_stage)}
                    >
                      {LEAD_STAGE_OPTIONS.find((o) => o.value === selectedClient.lead_stage)?.label}
                    </span>
                    <span
                      className="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                      style={getDealStatusBadge(selectedClient.deal_status)}
                    >
                      {DEAL_STATUS_OPTIONS.find((o) => o.value === selectedClient.deal_status)?.label}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Location
                    </label>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedClient.location_category || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Visit Date
                    </label>
                    <div className="mt-1 text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {selectedClient.expected_visit_date
                        ? new Date(selectedClient.expected_visit_date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Not Scheduled"}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                      <MessageSquare className="w-3 h-3" /> Calling Notes
                    </label>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedClient.calling_comment || "No calling notes added."}
                    </p>
                  </div>
                  {selectedClient.admin_notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <AlertCircle className="w-3 h-3" /> Admin Notes
                      </label>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedClient.admin_notes}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
