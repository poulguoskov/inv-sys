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
import { api, type Item, type ItemCreate } from "@/lib/api";

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
  onSuccess: () => void;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: ItemFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [type, setType] = useState("component");
  const [quantityOnHand, setQuantityOnHand] = useState(0);
  const [reorderThreshold, setReorderThreshold] = useState<number | "">("");
  const [leadTimeDays, setLeadTimeDays] = useState<number | "">("");

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      setName(item.name);
      setSku(item.sku);
      setBarcode(item.barcode || "");
      setType(item.type);
      setQuantityOnHand(item.quantity_on_hand);
      setReorderThreshold(item.reorder_threshold ?? "");
      setLeadTimeDays(item.lead_time_days ?? "");
    } else {
      setName("");
      setSku("");
      setBarcode("");
      setType("component");
      setQuantityOnHand(0);
      setReorderThreshold("");
      setLeadTimeDays("");
    }
    setError(null);
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data: ItemCreate = {
      name,
      sku,
      barcode: barcode || null,
      type,
      quantity_on_hand: quantityOnHand,
      reorder_threshold: reorderThreshold === "" ? null : reorderThreshold,
      lead_time_days: leadTimeDays === "" ? null : leadTimeDays,
    };

    try {
      if (isEditing) {
        await api.updateItem(item.id, data);
      } else {
        await api.createItem(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      setError(isEditing ? "Failed to update item" : "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 250GB SSD"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. 250GB SSD"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="component">Component</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity on Hand</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantityOnHand}
              onChange={(e) => setQuantityOnHand(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reorder">Reorder Threshold</Label>
              <Input
                id="reorder"
                type="number"
                min="0"
                value={reorderThreshold}
                onChange={(e) =>
                  setReorderThreshold(e.target.value === "" ? "" : parseInt(e.target.value))
                }
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadtime">Lead Time (days)</Label>
              <Input
                id="leadtime"
                type="number"
                min="0"
                value={leadTimeDays}
                onChange={(e) =>
                  setLeadTimeDays(e.target.value === "" ? "" : parseInt(e.target.value))
                }
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
