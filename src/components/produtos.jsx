import { useContext, useEffect, useState, useRef } from "react"
import axios from "axios"
import styles from "./produtos.module.css"
import NavbarComponent from "./navbar/navbar"
import Footer from "./footer"
import { useNavigate } from "react-router-dom"
import { CartContext } from "../CartContext"
import { Search, SlidersHorizontal, Coffee, DollarSign, Package, ShoppingCart, Eye, Star } from "lucide-react"
import MessageModal from "./shared/messageModal/messageModal"
import { addProductToCart } from "../services/carrinhoService"
import { buscarProdutoPorId } from "../services/produtoService";
import { toast } from "react-toastify";

function CardProduto({
  id,
  imageSrc,
  title,
  price,
  buttonText,
  description,
  stock,
  setIsModalOpen,
  setModalMessage,
  index,
}) {
  const navigate = useNavigate()
  const { addToCart } = useContext(CartContext)
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleBuyClick = async () => {
    if (stock <= 0) {
      setModalMessage("Produto esgotado!")
      setIsModalOpen(true)
      return
    }

    setIsLoading(true)
    try {
      const responseEstoque = await axios.get(`https://cafeconnect-u9rh.onrender.com/product/${id}`)
      if (responseEstoque.data.quantidadeEstoque < 1) {
        setModalMessage("Produto esgotado!")
        setIsModalOpen(true)
        return
      }

      const response = await addProductToCart(id, 1)
      if (response.success) {
        setModalMessage(`Item adicionado ao carrinho!`)
        toast.warn("Produto reservado por 5 minutos. Finalize a compra antes disso!");
      } else {
        setModalMessage("Erro ao adicionar produto ao carrinho.")
      }
    } catch (error) {
      setModalMessage("Erro ao adicionar produto ao carrinho. Tente novamente.")
    } finally {
      setIsLoading(false)
      setIsModalOpen(true)
    }
  }

  const handleVisualizar = async () => {
    try {
      // Chama o serviço para buscar o produto completo
      const produtoCompleto = await buscarProdutoPorId(id);
      if (produtoCompleto) {
        navigate("/detalhesProduto", { state: { produto: produtoCompleto } });
      } else {
        // Trate erro se necessário
        alert("Produto não encontrado.");
      }
    } catch (e) {
      alert("Erro ao buscar detalhes do produto.");
    }
  };

  return (
    <div className={`${styles.productCard} ${styles.fadeInUp}`} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className={styles.productImageContainer}>
        <img
          className={`${styles.productImage} ${imageLoaded ? styles.imageLoaded : ""}`}
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          onLoad={() => setImageLoaded(true)}
        />
        <div className={styles.productOverlay}>
          <button
            className={styles.quickViewButton}
            onClick={handleVisualizar}
          >
            <Eye size={18} />
            Visualizar
          </button>
        </div>
        {stock <= 5 && stock > 0 && <div className={styles.lowStockBadge}>Últimas unidades!</div>}
        {stock === 0 && <div className={styles.outOfStockBadge}>Esgotado</div>}
      </div>

      <div className={styles.productContent}>
        <h3 className={styles.productTitle}>{title}</h3>
        <div className={styles.productRating}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={styles.starIcon} />
          ))}
          <span className={styles.ratingText}>(4.5)</span>
        </div>
        <p className={styles.productPrice}>{price}</p>
        <div className={styles.stockInfo}>
          <Package size={14} />
          <span>Em estoque: {stock}</span>
        </div>
      </div>

      <div className={styles.productActions}>
        <button
          className={`${styles.productButton} ${stock === 0 ? styles.disabledButton : ""} ${isLoading ? styles.loadingButton : ""}`}
          onClick={handleBuyClick}
          disabled={stock === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner}></div>
              Adicionando...
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              {buttonText}
            </>
          )}
        </button>
        <button
          className={styles.detailsButton}
          onClick={handleVisualizar}
        >
          <Eye size={16} />
          Detalhes
        </button>
      </div>
    </div>
  )
}

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [filteredProdutos, setFilteredProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOptions, setFilterOptions] = useState({
    showOnlyInStock: false,
    sortBy: "default",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const contentRef = useRef(null)
  const navigate = useNavigate()

  const verCarrinho = () => {
    navigate("/carrinho");
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 },
    )

    if (contentRef.current) {
      observer.observe(contentRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get("https://cafeconnect-u9rh.onrender.com/product")
        setProdutos(response.data)
        setFilteredProdutos(response.data)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        setError("Erro ao carregar produtos")
      } finally {
        setLoading(false)
      }
    }

    fetchProdutos()
  }, [])

  useEffect(() => {
    let result = [...produtos]

    if (searchTerm) {
      result = result.filter((produto) => produto.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filterOptions.showOnlyInStock) {
      result = result.filter((produto) => produto.quantidadeEstoque > 0)
    }

    if (filterOptions.sortBy === "priceAsc") {
      result.sort((a, b) => a.preco - b.preco)
    } else if (filterOptions.sortBy === "priceDesc") {
      result.sort((a, b) => b.preco - a.preco)
    }

    setFilteredProdutos(result)
  }, [produtos, searchTerm, filterOptions])

  const handleSortChange = (e) => {
    setFilterOptions({
      ...filterOptions,
      sortBy: e.target.value,
    })
  }

  const handleStockFilterChange = (e) => {
    setFilterOptions({
      ...filterOptions,
      showOnlyInStock: e.target.checked,
    })
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterContainer = document.querySelector(`.${styles.filterContainer}`)
      if (showFilters && filterContainer && !filterContainer.contains(event.target)) {
        setShowFilters(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFilters, styles.filterContainer])

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <NavbarComponent />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <h3>Carregando produtos...</h3>
          <p>Aguarde enquanto buscamos os melhores cafés para você</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.mainContainer}>
        <NavbarComponent />
        <div className={styles.errorContainer}>
          <Coffee size={48} className={styles.errorIcon} />
          <h3>Ops! Algo deu errado</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Tentar Novamente
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const getContainerClass = () => {
    if (filteredProdutos.length === 0) return `${styles.mainContainer} ${styles.noProducts}`
    if (filteredProdutos.length <= 3) return `${styles.mainContainer} ${styles.fewProducts}`
    return styles.mainContainer
  }

  const closeModal = () => {
    // navigate('/produtos')
    setIsModalOpen(false)
    window.location.reload();
  }

  return (
    <div className={getContainerClass()}>
      <NavbarComponent />
      <div className={styles.produtosPage} ref={contentRef}>
        <div
          className={`${styles.filterContainer} ${isVisible ? styles.fadeInUp : ""}`}
          style={{ animationDelay: "0.2s" }}
        >
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <Search className={styles.searchIcon} size={20} />
          </div>

          <div className={styles.filterActions}>
            <div className={styles.resultsCount}>
              {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? "s" : ""} encontrado
              {filteredProdutos.length !== 1 ? "s" : ""}
            </div>
            <button
              className={`${styles.filterToggleButton} ${showFilters ? styles.active : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className={styles.filtersDropdown}>
              <div className={styles.filterOption}>
                <h4>
                  <Package size={16} /> Disponibilidade
                </h4>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filterOptions.showOnlyInStock}
                    onChange={handleStockFilterChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkmark}></span>
                  Mostrar apenas produtos em estoque
                </label>
              </div>

              <div className={styles.filterOption}>
                <h4>
                  <DollarSign size={16} /> Ordenar por
                </h4>
                <select value={filterOptions.sortBy} onChange={handleSortChange} className={styles.sortSelect}>
                  <option value="default">Relevância</option>
                  <option value="priceAsc">Preço: Menor para Maior</option>
                  <option value="priceDesc">Preço: Maior para Menor</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className={`${styles.productList} ${isVisible ? styles.fadeInUp : ""}`} style={{ animationDelay: "0.4s" }}>
          {filteredProdutos.length > 0 ? (
            filteredProdutos.map((produto, index) => (
              <CardProduto
                key={produto.id}
                id={produto.id}
                imageSrc={produto.imagem}
                title={produto.titulo}
                price={`R$${produto.preco.toFixed(2)}`}
                buttonText="Adicionar ao Carrinho"
                description={produto.descricao}
                stock={produto.quantidadeEstoque}
                setIsModalOpen={setIsModalOpen}
                setModalMessage={setModalMessage}
                index={index}
              />
            ))
          ) : (
            <div className={styles.noProductsMessage}>
              <Coffee size={64} className={styles.noProductsIcon} />
              <h3>Nenhum produto encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outros termos.</p>
              <button
                className={styles.clearFiltersButton}
                onClick={() => {
                  setSearchTerm("")
                  setFilterOptions({ showOnlyInStock: false, sortBy: "default" })
                }}
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        {isModalOpen && 
          <MessageModal 
            icon="🛒" 
            message={modalMessage} 
            onClose={closeModal} 
            customButton={
              <button onClick={verCarrinho}>Ver carrinho</button>
            }
          />
        }
      </div>
      <Footer />
    </div>
  )
}

export default Produtos
