import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/pages/Dashboard";
import { ItemsPage } from "@/pages/Items";
import { AssembliesPage } from "@/pages/Assemblies";
import { ConfigurationsPage } from "@/pages/Configurations";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/assemblies" element={<AssembliesPage />} />
          <Route path="/configurations" element={<ConfigurationsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
