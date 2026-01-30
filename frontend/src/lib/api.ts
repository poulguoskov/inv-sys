const API_BASE = "http://localhost:8000/api";

export interface Item {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  type: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_on_order: number;
  quantity_available: number;
  reorder_threshold: number | null;
  lead_time_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface ItemCreate {
  name: string;
  sku: string;
  barcode?: string | null;
  type: string;
  quantity_on_hand?: number;
  quantity_on_order?: number;
  reorder_threshold?: number | null;
  lead_time_days?: number | null;
}

export interface ItemUpdate {
  name?: string;
  sku?: string;
  barcode?: string | null;
  type?: string;
  quantity_on_hand?: number;
  quantity_on_order?: number;
  reorder_threshold?: number | null;
  lead_time_days?: number | null;
}

export const api = {
  // Items
  async getItems(): Promise<Item[]> {
    const res = await fetch(`${API_BASE}/items/`)
    if (!res.ok) throw new Error("Failed to fetch items");
    return res.json();
  },

  async getItem(id: number): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}`);
    if (!res.ok) throw new Error("Failed to fetch item");
    return res.json();
  },

  async createItem(item: ItemCreate): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Failed to create item");
    return res.json();
  },

  async updateItem(id: number, item: ItemUpdate): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Failed to update item");
    return res.json();
  },

  async deleteItem(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete item");
  },
};
