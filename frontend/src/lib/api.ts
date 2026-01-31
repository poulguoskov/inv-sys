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

export interface Configuration {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface AssemblyComponent {
  id: number;
  item_id: number;
  quantity: number;
  item_name: string | null;
  item_sku: string | null;
}

export interface Assembly {
  id: number;
  configuration_id: number | null;
  status: string;
  order_reference: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  shipped_at: string | null;
  components: AssemblyComponent[];
}

export interface AssemblyCreate {
  configuration_id?: number | null;
  order_reference?: string | null;
  notes?: string | null;
  components?: { item_id: number; quantity: number }[];
}

export interface AssemblyUpdate {
  order_reference?: string | null;
  notes?: string | null;
}

export interface BuildCapacity {
  configuration_id: number;
  configuration_name: string;
  can_build: number;
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

  async getConfigurations(): Promise<Configuration[]> {
    const res = await fetch(`${API_BASE}/configurations/`);
    if (!res.ok) throw new Error("Failed to fetch configurations");
    return res.json();
  },

  // Assemblies
  async getAssemblies(status?: string): Promise<Assembly[]> {
    const url = status
      ? `${API_BASE}/assemblies/?status=${status}`
      : `${API_BASE}/assemblies/`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch assemblies");
    return res.json();
  },

  async getAssembly(id: number): Promise<Assembly> {
    const res = await fetch(`${API_BASE}/assemblies/${id}`);
    if (!res.ok) throw new Error("Failed to fetch assembly");
    return res.json();
  },

  async createAssembly(assembly: AssemblyCreate): Promise<Assembly> {
    const res = await fetch(`${API_BASE}/assemblies/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assembly),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to create assembly");
    }
    return res.json();
  },

  async updateAssembly(id: number, assembly: AssemblyUpdate): Promise<Assembly> {
    const res = await fetch(`${API_BASE}/assemblies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assembly),
    });
    if (!res.ok) throw new Error("Failed to update assembly");
    return res.json();
  },

  async startAssembly(id: number): Promise<Assembly> {
    const res = await fetch(`${API_BASE}/assemblies/${id}/start`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to start assembly");
    return res.json();
  },

  async completeAssembly(id: number): Promise<Assembly> {
    const res = await fetch(`${API_BASE}/assemblies/${id}/complete`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to complete assembly");
    return res.json();
  },

  async shipAssembly(id: number): Promise<Assembly> {
    const res = await fetch(`${API_BASE}/assemblies/${id}/ship`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to ship assembly");
    return res.json();
  },

  async cancelAssembly(id: number): Promise<Assembly> {
    const res = await fetch(`${API_BASE}/assemblies/${id}/cancel`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to cancel assembly");
    return res.json();
  },

  async deleteAssembly(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/assemblies/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete assembly");
  },

  async getBuildCapacity(): Promise<BuildCapacity[]> {
    const res = await fetch(`${API_BASE}/assemblies/stats/build-capacity`);
    if (!res.ok) throw new Error("Failed to fetch build capacity");
    return res.json();
  },
};
