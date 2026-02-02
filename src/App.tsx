import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

// Route Protection Components
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AdminRoute } from "@/components/routes/AdminRoute";

import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import ProdutoDetalhes from "@/pages/ProdutoDetalhes";
import MinhasReservas from "@/pages/MinhasReservas";
import PlanosMensais from "@/pages/PlanosMensais";
// import Seminovos from "@/pages/Seminovos"; // REMOVIDO - Venda integrada em produtos
import Configuracoes from "@/pages/Configuracoes";
import ClientDashboard from "@/pages/ClientDashboard";
import Wallet from "@/pages/Wallet";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import CartPage from "@/pages/CartPage";
import Fidelidade from "@/pages/Fidelidade";
import Pacotes from "@/pages/Pacotes";
import Checkout from "@/pages/Checkout";

// Admin pages
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminReservas from "@/pages/admin/AdminReservas";
import AdminProdutos from "@/pages/admin/AdminProdutos";
import AdminCategorias from "@/pages/admin/AdminCategorias";
import AdminPromocoes from "@/pages/admin/AdminPromocoes";
import AdminPacotes from "@/pages/admin/AdminPacotes";
import AdminSiteEditor from "@/pages/admin/AdminSiteEditor";
import AdminUsers from "@/pages/admin/AdminUsers";


const queryClient = new QueryClient();

function App() {


  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/produto/:id" element={<ProdutoDetalhes />} />
                    {/* <Route path="/seminovos" element={<Seminovos />} /> REMOVIDO */}
                    <Route path="/planos" element={<PlanosMensais />} />
                    <Route path="/fidelidade" element={<Fidelidade />} />
                    <Route path="/pacotes" element={<Pacotes />} />

                    {/* Protected User Routes - Require Authentication */}
                    <Route path="/minhas-reservas" element={
                      <ProtectedRoute>
                        <MinhasReservas />
                      </ProtectedRoute>
                    } />
                    <Route path="/minha-conta" element={
                      <ProtectedRoute>
                        <ClientDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/wallet" element={<Navigate to="/minha-conta" replace />} />
                    <Route path="/carrinho" element={<CartPage />} />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/configuracoes" element={
                      <ProtectedRoute>
                        <Configuracoes />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* Auth route */}
                  <Route path="/auth" element={<Auth />} />

                  {/* Admin routes - Protected with AdminRoute */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="reservas" element={<AdminReservas />} />
                    <Route path="produtos" element={<AdminProdutos />} />
                    <Route path="categorias" element={<AdminCategorias />} />
                    <Route path="promocoes" element={<AdminPromocoes />} />
                    <Route path="pacotes" element={<AdminPacotes />} />
                    <Route path="site-editor" element={<AdminSiteEditor />} />
                    <Route path="usuarios" element={<AdminUsers />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
