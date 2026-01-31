import { useEffect, useState } from "react";
import {
  api,
  type Assembly,
  type BuildCapacity,
  type Configuration,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ClipboardList,
  AlertTriangle,
  Play,
  CheckCircle,
  Truck,
  XCircle,
  Trash2,
  Package,
} from "lucide-react";
import { AssemblyFormDialog } from "@/components/AssemblyFormDialog";

const STATUS_TABS = ["all", "reserved", "building", "completed", "shipped"] as const;

const STATUS_COLORS: Record<string, string> = {
  reserved: "bg-yellow-500/20 text-yellow-400",
  building: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  shipped: "bg-purple-500/20 text-purple-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export function AssembliesPage() {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [buildCapacity, setBuildCapacity] = useState<BuildCapacity[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assembliesData, capacityData, configsData] = await Promise.all([
        api.getAssemblies(activeTab === "all" ? undefined : activeTab),
        api.getBuildCapacity(),
        api.getConfigurations(),
      ]);
      setAssemblies(assembliesData);
      setBuildCapacity(capacityData);
      setConfigurations(configsData);
      setError(null);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleStatusChange = async (
    id: number,
    action: "start" | "complete" | "ship" | "cancel"
  ) => {
    try {
      if (action === "start") await api.startAssembly(id);
      else if (action === "complete") await api.completeAssembly(id);
      else if (action === "ship") await api.shipAssembly(id);
      else if (action === "cancel") {
        if (!confirm("Are you sure you want to cancel this assembly?")) return;
        await api.cancelAssembly(id);
      }
      fetchData();
    } catch {
      setError(`Failed to ${action} assembly`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this assembly?")) return;
    try {
      await api.deleteAssembly(id);
      fetchData();
    } catch {
      setError("Failed to delete assembly");
    }
  };

  const getConfigName = (configId: number | null) => {
    if (!configId) return "Custom";
    const config = configurations.find((c) => c.id === configId);
    return config?.name || "Unknown";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading && assemblies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assemblies</h1>
          <p className="text-muted-foreground">Track BlackBox system builds</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Assembly
        </Button>
      </div>

      {/* Build Capacity Cards */}
      {buildCapacity.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {buildCapacity.map((cap) => (
            <div
              key={cap.configuration_id}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{cap.configuration_name}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {cap.can_build}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      available
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Assemblies Table */}
      {assemblies.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No assemblies found</p>
          <Button className="mt-4 gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create your first assembly
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Configuration</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Order Ref</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Components</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assemblies.map((assembly) => (
                <tr
                  key={assembly.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 font-medium">#{assembly.id}</td>
                  <td className="p-4">{getConfigName(assembly.configuration_id)}</td>
                  <td className="p-4 text-muted-foreground">
                    {assembly.order_reference || "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        STATUS_COLORS[assembly.status] || "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {assembly.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(assembly.created_at)}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {assembly.components.length} items
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      {assembly.status === "reserved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-400 hover:text-blue-400"
                          onClick={() => handleStatusChange(assembly.id, "start")}
                          title="Start building"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {(assembly.status === "reserved" || assembly.status === "building") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-400 hover:text-green-400"
                          onClick={() => handleStatusChange(assembly.id, "complete")}
                          title="Mark complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {assembly.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-purple-400 hover:text-purple-400"
                          onClick={() => handleStatusChange(assembly.id, "ship")}
                          title="Mark shipped"
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                      {(assembly.status === "reserved" || assembly.status === "building") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleStatusChange(assembly.id, "cancel")}
                          title="Cancel"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {(assembly.status === "shipped" || assembly.status === "cancelled") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(assembly.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AssemblyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
