import axios from "axios";

const API_URL = "https://cafeconnect-u9rh.onrender.com/pedido";

// Cria um novo pedido
export const criarPedido = async (pedidoData: {
  produtos: Array<{ produtoId: string; nome: string; quantidade: number; preco: number }>;
  total: number;
  enderecoEntrega: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/criar`, pedidoData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Lista pedidos de um usuário
export const listarPedidosPorUsuario = async (usuarioId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/usuario/${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Busca um pedido pelo ID
export const buscarPedidoPorId = async (pedidoId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/${pedidoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Atualiza o status do pedido
export const atualizarStatusPedido = async (
  pedidoId: string,
  status: string,
  codigoRastreamento?: string
) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_URL}/${pedidoId}/status`,
    { status, codigoRastreamento },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};