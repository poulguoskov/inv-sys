import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  type Item,
  type Assembly,
  type BuildCapacity,
  type Configuration,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  ClipboardList,
  Settings,
  ArrowRight,
} from "lucide-react";

export function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [buildCapacity, setBuildCapacity] = useState<BuildCapacity[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, assembliesData, capacityData, configsData] = await Promise.all([
          api.getItems(),
          api.getAssemblies(),
          api.getBuildCapacity(),
          api.getConfigurations(false),
        ]);
        setItems(itemsData);
        setAssemblies(assembliesData);
        setBuildCapacity(capacityData);
        setConfigurations(configsData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lowStockItems = items.filter(
    (item) => item.reorder_threshold && item.quantity_available <= item.reorder_threshold
  );

  const activeAssemblies = assemblies.filter(
    (a) => a.status === "reserved" || a.status === "building"
  );

  const completedAssemblies = assemblies.filter(
    (a) => a.status === "completed"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory system</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/items" className="bg-card rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{items.length}</p>
            </div>
          </div>
        </Link>

        <Link to="/configurations" className="bg-card rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Configurations</p>
              <p className="text-2xl font-bold text-foreground">{configurations.length}</p>
            </div>
          </div>
        </Link>

        <Link to="/assemblies" className="bg-card rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Builds</p>
              <p className="text-2xl font-bold text-foreground">{activeAssemblies.length}</p>
            </div>
          </div>
        </Link>

        <Link to="/assemblies" className="bg-card rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ready to Ship</p>
              <p className="text-2xl font-bold text-foreground">{completedAssemblies.length}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Build Capacity */}
      {buildCapacity.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Build Capacity</h2>
            <Link to="/assemblies">
              <Button variant="ghost" size="sm" className="gap-1">
                View Assemblies <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {buildCapacity.map((cap) => (
              <div
                key={cap.configuration_id}
                className="bg-card rounded-xl border border-border p-4"
              >
                <p className="text-sm text-muted-foreground">{cap.configuration_name}</p>
                <p className="text-2xl font-bold text-foreground">
                  {cap.can_build}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    available
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Warnings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Low Stock Warnings</h2>
          <Link to="/items">
            <Button variant="ghost" size="sm" className="gap-1">
              View All Items <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {lowStockItems.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <p className="text-muted-foreground">All items are well stocked</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Item</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Available</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-medium text-warning">{item.quantity_available}</span>
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      {item.reorder_threshold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Assemblies */}
      {activeAssemblies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Active Assemblies</h2>
            <Link to="/assemblies">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Configuration</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Order Ref</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeAssemblies.slice(0, 5).map((assembly) => {
                  const config = configurations.find(
                    (c) => c.id === assembly.configuration_id
                  );
                  return (
                    <tr
                      key={assembly.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-medium">#{assembly.id}</td>
                      <td className="p-4">{config?.name || "Custom"}</td>
                      <td className="p-4 text-muted-foreground">
                        {assembly.order_reference || "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            assembly.status === "reserved"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {assembly.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
