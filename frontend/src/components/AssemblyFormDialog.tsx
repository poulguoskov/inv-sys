import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type Configuration } from "@/lib/api";

interface AssemblyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssemblyFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: AssemblyFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);

  const [configurationId, setConfigurationId] = useState<string>("");
  const [orderReference, setOrderReference] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      api.getConfigurations().then(setConfigurations).catch(() => {});
      // Reset form
      setConfigurationId("");
      setOrderReference("");
      setNotes("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!configurationId) {
      setError("Please select a configuration");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createAssembly({
        configuration_id: parseInt(configurationId),
        order_reference: orderReference || null,
        notes: notes || null,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create assembly");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Assembly</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="configuration">Configuration *</Label>
            <Select value={configurationId} onValueChange={setConfigurationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a configuration" />
              </SelectTrigger>
              <SelectContent>
                {configurations.map((config) => (
                  <SelectItem key={config.id} value={config.id.toString()}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {configurations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No configurations found. Create one first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderReference">Order Reference</Label>
            <Input
              id="orderReference"
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              placeholder="e.g. ORD-12345 or Customer Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || configurations.length === 0}>
              {loading ? "Creating..." : "Create & Reserve Parts"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
