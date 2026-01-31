import { useEffect, useState } from "react";
import {
  api,
  type Configuration,
  type Item,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Settings,
  AlertTriangle,
  Pencil,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import { ConfigurationFormDialog } from "@/components/ConfigurationFormDialog";

const STATUS_TABS = ["active", "archived"] as const;

export function ConfigurationsPage() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configsData, itemsData] = await Promise.all([
        api.getConfigurations(activeTab === "archived"),
        api.getItems(),
      ]);
      setConfigurations(configsData);
      setItems(itemsData);
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

  const handleCreate = () => {
    setEditingConfig(null);
    setDialogOpen(true);
  };

  const handleEdit = (config: Configuration) => {
    setEditingConfig(config);
    setDialogOpen(true);
  };

  const handleDuplicate = async (id: number) => {
    try {
      await api.duplicateConfiguration(id);
      fetchData();
    } catch {
      setError("Failed to duplicate configuration");
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.archiveConfiguration(id);
      fetchData();
    } catch {
      setError("Failed to archive configuration");
    }
  };

  const handleUnarchive = async (id: number) => {
    try {
      await api.unarchiveConfiguration(id);
      fetchData();
    } catch {
      setError("Failed to unarchive configuration");
    }
  };

  if (loading && configurations.length === 0) {
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
          <h1 className="text-2xl font-bold text-foreground">Configurations</h1>
          <p className="text-muted-foreground">Manage BlackBox system templates</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          New Configuration
        </Button>
      </div>

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

      {/* Configurations Table */}
      {configurations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl border border-border">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {activeTab === "archived" ? "No archived configurations" : "No configurations yet"}
          </p>
          {activeTab === "active" && (
            <Button className="mt-4 gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Create your first configuration
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Components</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((config) => (
                <tr
                  key={config.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{config.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {config.description || "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {config.components.length} items
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(config)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDuplicate(config.id)}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {config.archived ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-400 hover:text-green-400"
                          onClick={() => handleUnarchive(config.id)}
                          title="Unarchive"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-warning hover:text-warning"
                          onClick={() => handleArchive(config.id)}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
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

      {/* Configuration Form Dialog */}
      <ConfigurationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        configuration={editingConfig}
        items={items}
        onSuccess={fetchData}
      />
    </div>
  );
}
