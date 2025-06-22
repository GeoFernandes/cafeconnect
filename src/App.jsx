import { Route, Routes } from 'react-router-dom';
import { CartProvider } from './CartContext';
import PrivateRoute from './authenticate/privateRoute';
import Carrinho from './components/carrinho';
import Contato from './components/contato/contato';
import DetalhesProduto from './components/detalhesProduto';
import Login from './components/login/login';
import Cadastro from './components/cadastro/cadastro';
import NossasLojas from './components/nossasLojas/nossasLojas';
import PaginaInicial from './components/paginaInicial/paginaInicial';
import AlterarUsuario from './components/login/alterarUsuario/alterarUsuario';
import Produtos from './components/produtos';
import SobreCafeConnect from './components/sobreCafeConnect/sobreCafeConnect';
import TrabalheConosco from './components/trabalheConosco/trabalheConosco';
import Checkout from './components/checkout/checkout';
import Pedidos from './components/pedidos/pedidos';
import './styles/App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/detalhesProduto" element={<DetalhesProduto />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/nossas-lojas" element={<NossasLojas />} />
        <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
        <Route path="/sobre-cafe-connect" element={<SobreCafeConnect />} />
        

        {/* Rotas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/perfil" element={<AlterarUsuario />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedidos" element={<Pedidos />} />
        </Route>
      </Routes>
      <ToastContainer />
    </CartProvider>
  );
}

export default App;
