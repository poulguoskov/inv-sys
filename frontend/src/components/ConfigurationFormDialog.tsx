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
import { api, type Configuration, type Item } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

interface ConfigurationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configuration: Configuration | null;
  items: Item[];
  onSuccess: () => void;
}

export function ConfigurationFormDialog({
  open,
  onOpenChange,
  configuration,
  items,
  onSuccess,
}: ConfigurationFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [components, setComponents] = useState<
    { id?: number; item_id: number; quantity: number; item_name?: string }[]
  >([]);

  // For adding new component
  const [newItemId, setNewItemId] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<number>(1);

  const isEditing = !!configuration;

  useEffect(() => {
    if (configuration) {
      setName(configuration.name);
      setDescription(configuration.description || "");
      setComponents(
        configuration.components.map((c) => ({
          id: c.id,
          item_id: c.item_id,
          quantity: c.quantity,
          item_name: c.item_name || undefined,
        }))
      );
    } else {
      setName("");
      setDescription("");
      setComponents([]);
    }
    setNewItemId("");
    setNewQuantity(1);
    setError(null);
  }, [configuration, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // Update name/description
        await api.updateConfiguration(configuration.id, {
          name,
          description: description || null,
        });
      } else {
        // Create new with components
        await api.createConfiguration({
          name,
          description: description || null,
          components: components.map((c) => ({
            item_id: c.item_id,
            quantity: c.quantity,
          })),
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      setError(isEditing ? "Failed to update configuration" : "Failed to create configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = async () => {
    if (!newItemId) return;

    const itemId = parseInt(newItemId);
    const item = items.find((i) => i.id === itemId);

    // Check if already in list
    if (components.some((c) => c.item_id === itemId)) {
      setError("Item already added");
      return;
    }

    if (isEditing && configuration) {
      // Add via API
      try {
        await api.addConfigurationComponent(configuration.id, {
          item_id: itemId,
          quantity: newQuantity,
        });
        onSuccess();
        // Refresh components
        const updated = await api.getConfiguration(configuration.id);
        setComponents(
          updated.components.map((c) => ({
            id: c.id,
            item_id: c.item_id,
            quantity: c.quantity,
            item_name: c.item_name || undefined,
          }))
        );
      } catch {
        setError("Failed to add component");
      }
    } else {
      // Add to local state
      setComponents([
        ...components,
        {
          item_id: itemId,
          quantity: newQuantity,
          item_name: item?.name,
        },
      ]);
    }

    setNewItemId("");
    setNewQuantity(1);
    setError(null);
  };

  const handleRemoveComponent = async (index: number) => {
    const comp = components[index];

    if (isEditing && configuration && comp.id) {
      // Remove via API
      try {
        await api.removeConfigurationComponent(configuration.id, comp.id);
        onSuccess();
        setComponents(components.filter((_, i) => i !== index));
      } catch {
        setError("Failed to remove component");
      }
    } else {
      // Remove from local state
      setComponents(components.filter((_, i) => i !== index));
    }
  };

  const getItemName = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    return item?.name || `Item #${itemId}`;
  };

  // Filter out items already in components
  const availableItems = items.filter(
    (item) => !components.some((c) => c.item_id === item.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Configuration" : "New Configuration"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BlackBox i7"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>

          {/* Components Section */}
          <div className="space-y-3">
            <Label>Components</Label>

            {/* Add Component Form */}
            <div className="flex gap-2">
              <Select value={newItemId} onValueChange={setNewItemId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleAddComponent}
                disabled={!newItemId}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Component List */}
            {components.length > 0 ? (
              <div className="border border-border rounded-lg divide-y divide-border">
                {components.map((comp, index) => (
                  <div
                    key={comp.id || `new-${index}`}
                    className="flex items-center justify-between p-3"
                  >
                    <div>
                      <span className="font-medium">
                        {comp.item_name || getItemName(comp.item_id)}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        × {comp.quantity}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveComponent(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
                No components added yet
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
