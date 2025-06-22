import { Package, Calendar, MapPin, Truck } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import NavbarComponent from "../navbar/navbar"
import Footer from "../footer"
import styles from "./pedidos.module.css"
import { listarPedidosPorUsuario } from "../../services/pedidoService"
  import { getInfoFromToken } from "../../utils/decodedToken";

function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const navigate = useNavigate()  
  const info = getInfoFromToken();
  const usuarioId = info?.id || info?._id; // depende de como está salvo no token

  // Dados mockados para demonstração
  const pedidosMock = [
    {
      _id: "PED001",
      usuario_id: "USER123",
      produtos: [
        { id: "PROD1", nome: "Café Especial Premium", quantidade: 2, preco: 25.9 },
        { id: "PROD2", nome: "Açúcar Cristal", quantidade: 1, preco: 8.5 },
      ],
      total: 60.3,
      status: "entregue",
      data_pedido: "2024-01-15T10:30:00Z",
      endereco_entrega: {
        rua: "Rua das Flores, 123",
        bairro: "Centro",
        cidade: "São Paulo",
        cep: "01234-567",
      },
      rastreamento: {
        codigo: "BR123456789",
        status: "Entregue",
        ultima_atualizacao: "2024-01-18T14:20:00Z",
      },
    },
    {
      _id: "PED002",
      usuario_id: "USER123",
      produtos: [
        { id: "PROD3", nome: "Café Gourmet Torrado", quantidade: 1, preco: 32.9 },
        { id: "PROD4", nome: "Leite Condensado", quantidade: 2, preco: 6.75 },
      ],
      total: 46.4,
      status: "enviado",
      data_pedido: "2024-01-20T15:45:00Z",
      endereco_entrega: {
        rua: "Rua das Flores, 123",
        bairro: "Centro",
        cidade: "São Paulo",
        cep: "01234-567",
      },
      rastreamento: {
        codigo: "BR987654321",
        status: "Em trânsito",
        ultima_atualizacao: "2024-01-22T09:15:00Z",
      },
    },
    {
      _id: "PED003",
      usuario_id: "USER123",
      produtos: [{ id: "PROD5", nome: "Kit Café da Manhã", quantidade: 1, preco: 89.9 }],
      total: 104.9,
      status: "em aberto",
      data_pedido: "2024-01-25T11:20:00Z",
      endereco_entrega: {
        rua: "Rua das Flores, 123",
        bairro: "Centro",
        cidade: "São Paulo",
        cep: "01234-567",
      },
      rastreamento: {
        codigo: "BR456789123",
        status: "Preparando",
        ultima_atualizacao: "2024-01-25T11:25:00Z",
      },
    },
  ]

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const data = await listarPedidosPorUsuario(usuarioId);
        setPedidos(data); // data deve ser um array de pedidos
      } catch (error) {
        // Trate o erro conforme necessário
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [usuarioId]);

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "entregue":
        return "#27a417"
      case "enviado":
        return "#2196F3"
      case "em aberto":
        return "#FF9800"
      default:
        return "#666"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "entregue":
        return "Entregue"
      case "enviado":
        return "Enviado"
      case "em aberto":
        return "Em Aberto"
      default:
        return status
    }
  }

  const pedidosFiltrados = pedidos.filter((pedido) => filtroStatus === "todos" || pedido.status === filtroStatus)

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <NavbarComponent />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando seus pedidos...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.mainContainer}>
      <NavbarComponent />

      <div className={styles.pedidosPage}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>
            <Package className={styles.titleIcon} size={28} />
            Meus Pedidos
          </h1>
          <p className={styles.subtitle}>Acompanhe todos os seus pedidos realizados</p>
        </div>

        <div className={styles.filtrosContainer}>
          <div className={styles.filtros}>
            <button
              className={`${styles.filtroBtn} ${filtroStatus === "todos" ? styles.active : ""}`}
              onClick={() => setFiltroStatus("todos")}
            >
              Todos ({pedidos.length})
            </button>
            <button
              className={`${styles.filtroBtn} ${filtroStatus === "em aberto" ? styles.active : ""}`}
              onClick={() => setFiltroStatus("em aberto")}
            >
              Em Aberto ({pedidos.filter((p) => p.status === "em aberto").length})
            </button>
            <button
              className={`${styles.filtroBtn} ${filtroStatus === "enviado" ? styles.active : ""}`}
              onClick={() => setFiltroStatus("enviado")}
            >
              Enviados ({pedidos.filter((p) => p.status === "enviado").length})
            </button>
            <button
              className={`${styles.filtroBtn} ${filtroStatus === "entregue" ? styles.active : ""}`}
              onClick={() => setFiltroStatus("entregue")}
            >
              Entregues ({pedidos.filter((p) => p.status === "entregue").length})
            </button>
          </div>
        </div>

        <div className={styles.pedidosContainer}>
          {pedidosFiltrados.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={64} className={styles.emptyIcon} />
              <h3>Nenhum pedido encontrado</h3>
              <p>Você ainda não fez nenhum pedido ou não há pedidos com o filtro selecionado.</p>
              <button className={styles.shopButton} onClick={() => navigate("/produtos")}>
                Começar a Comprar
              </button>
            </div>
          ) : (
            <div className={styles.pedidosList}>
              {pedidosFiltrados.map((pedido) => (
                <div key={pedido.pedidoId} className={styles.pedidoCard}>
                  <div className={styles.pedidoHeader}>
                    <div className={styles.pedidoInfo}>
                      <h3 className={styles.pedidoId}>Pedido #{pedido.pedidoId}</h3>
                      <div className={styles.pedidoMeta}>
                        <span className={styles.pedidoData}>
                          <Calendar size={16} />
                          {formatarData(pedido.dataPedido)}
                        </span>
                        <span
                          className={styles.pedidoStatus}
                          style={{ backgroundColor: getStatusColor(pedido.status) }}
                        >
                          {getStatusText(pedido.status)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.pedidoTotal}>
                      <span className={styles.totalLabel}>Total</span>
                      <span className={styles.totalValue}>R$ {pedido.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className={styles.pedidoContent}>
                    <div className={styles.produtosSection}>
                      <h4>Produtos ({pedido.produtos.length})</h4>
                      <div className={styles.produtosList}>
                        {pedido.produtos.map((produto, index) => (
                          <div key={index} className={styles.produtoItem}>
                            <span className={styles.produtoNome}>
                              {produto.nome} x{produto.quantidade}
                            </span>
                            <span className={styles.produtoPreco}>
                              R$ {(produto.preco * produto.quantidade).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.entregaSection}>
                      <h4>
                        <MapPin size={16} />
                        Endereço de Entrega
                      </h4>
                      <p className={styles.endereco}>
                        {pedido.enderecoEntrega.rua}
                        <br />
                        {pedido.enderecoEntrega.bairro}, {pedido.enderecoEntrega.cidade}
                        <br />
                        CEP: {pedido.enderecoEntrega.cep}
                      </p>
                    </div>

                    {pedido.rastreamento && (
                      <div className={styles.rastreamentoSection}>
                        <h4>
                          <Truck size={16} />
                          Rastreamento
                        </h4>
                        <div className={styles.rastreamentoInfo}>
                          <span className={styles.codigoRastreamento}>Código: {pedido.rastreamento.codigo}</span>
                          <span className={styles.statusRastreamento}>{pedido.rastreamento.status}</span>
                          <span className={styles.ultimaAtualizacao}>
                            Atualizado em: {formatarData(pedido.rastreamento.ultimaAtualizacao)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Pedidos
