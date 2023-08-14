import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Clientes } from "./pages/Clientes.jsx";
import { Home } from './pages/Home.jsx'
import { Proveedores } from './pages/Proveedores.jsx'
import { Productos } from './pages/Productos.jsx'
import { SideBar } from "./components/SideBar.jsx";
import { NavBar } from './components/NavBar.jsx'
import { Ventas } from "./pages/Ventas.jsx";
import { Compras } from "./pages/Compras.jsx";
import ComprasRealizadas from "./pages/ComprasRealizadas.jsx";
import VentasRealizadas from "./pages/VentasRealizadas.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <SideBar />
        <div className="h-screen flex-1">
          <NavBar />
          <Routes>
              <Route exact path="/" element={<Home />} />
              <Route path="/Clientes" element={<Clientes />} />
              <Route path="/Proveedores" element={<Proveedores />} />
              <Route path="/Productos" element={<Productos />} />
              <Route path="/Ventas" element={<Ventas />} />
              <Route path="/Compras" element={<Compras />} />
              <Route path="/ComprasRealizadas" element={<ComprasRealizadas />} />
              <Route path="/VentasRealizadas" element={<VentasRealizadas />} />
            </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;



