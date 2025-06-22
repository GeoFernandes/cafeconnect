import { ArrowLeft, Heart, Package, Share2, ShoppingCart, Star } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { CartContext } from "../CartContext"
import MessageModal from "../components/shared/messageModal/messageModal"
import styles from "./detalhesProduto.module.css"
import Footer from "./footer"
import NavbarComponent from "./navbar/navbar"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { addProductToCart } from "../services/carrinhoService"
import { toast } from "react-toastify";

function DetalhesProduto() {
  const location = useLocation();
  const produto = location.state?.produto;
  const { addToCart, stock } = useContext(CartContext)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const contentRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.fadeInUp)
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = contentRef.current?.querySelectorAll(`.${styles.animateOnScroll}`)
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const {
    titulo,
    imagem,
    descricao,
    quantidadeEstoque,
    preco
  } = produto;

  const verCarrinho = () => {
    navigate("/carrinho");
  };

  const closeModal = () => {
    setIsModalOpen(false)
    navigate("/produtos");
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: titulo,
        text: `Confira este produto: ${titulo}`,
        url: window.location.href,
      })
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  const isOutOfStock = quantidadeEstoque <= 0;
  const stockLevel = quantidadeEstoque || 0;

  
  const handleBuyClick = async () => {
    try {
      const response = await addProductToCart(produto.id, 1)
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

  return (
    <div className={styles.detalhesPage}>
      <NavbarComponent />
      <div className={styles.container} ref={contentRef}>
        {/* Breadcrumb e ações */}
        <div className={`${styles.headerActions} ${styles.animateOnScroll}`}>
          <button className={styles.backButton} onClick={handleGoBack}>
            <ArrowLeft size={20} />
            Voltar aos Produtos
          </button>
          <div className={styles.actionButtons}>
            <button
              className={`${styles.favoriteButton} ${isFavorite ? styles.favorited : ""}`}
              onClick={handleToggleFavorite}
            >
              <Heart size={20} />
            </button>
            <button className={styles.shareButton} onClick={handleShare}>
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Container da imagem */}
          <div className={`${styles.imageContainer} ${styles.animateOnScroll}`}>
            <div className={styles.imageWrapper}>
              <img
                src={imagem || "/placeholder.svg"}
                alt={titulo}
                className={`${styles.detalhesImage} ${imageLoaded ? styles.imageLoaded : ""}`}
                onLoad={() => setImageLoaded(true)}
              />
              {stockLevel <= 5 && stockLevel > 0 && <div className={styles.lowStockBadge}>Últimas unidades!</div>}
              {isOutOfStock && <div className={styles.outOfStockBadge}>Esgotado</div>}
            </div>
          </div>

          {/* Container dos detalhes */}
          <div className={`${styles.detailsContainer} ${styles.animateOnScroll}`}>
            <div className={styles.productHeader}>
              <h1 className={styles.productTitle}>{titulo}</h1>
              <div className={styles.productRating}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={styles.starIcon} />
                ))}
                <span className={styles.ratingText}>(4.5) • 127 avaliações</span>
              </div>
            </div>

            <div className={styles.priceSection}>
              <span className={styles.currentPrice}>
                R$ {Number(preco).toFixed(2)}
              </span>
              <span className={styles.originalPrice}>
                R$ {(Number(preco) * 1.2).toFixed(2)}
              </span>
              <span className={styles.discount}>17% OFF</span>
            </div>

            <div className={styles.descriptionSection}>
              <h3>
                <Package size={20} />
                Descrição do Produto
              </h3>
              <p className={styles.productDescription}>{descricao}</p>
            </div>

            <div className={styles.stockSection}>
              <div className={styles.stockInfo}>
                <Package size={16} />
                <span>Em estoque: {stockLevel} unidades</span>
              </div>
              <div className={styles.stockBar}>
                <div className={styles.stockFill} style={{ width: `${Math.min((stockLevel / 20) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className={styles.featuresSection}>
              <h4>Características:</h4>
              <ul className={styles.featuresList}>
                <li>✓ Produto 100% natural</li>
                <li>✓ Origem sustentável</li>
                <li>✓ Qualidade premium</li>
                <li>✓ Entrega rápida</li>
              </ul>
            </div>

            <div className={styles.actionsSection}>
              <button
                className={`${styles.buyButton} ${isOutOfStock ? styles.outOfStock : ""} ${isLoading ? styles.loading : ""}`}
                onClick={handleBuyClick}
                disabled={isOutOfStock || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {isOutOfStock ? "Produto Esgotado" : "Adicionar ao Carrinho"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {isModalOpen && (
        <MessageModal
          icon="🛒"
          message={`Item adicionado ao carrinho!`}
          onClose={closeModal}
          customButton={
            <button onClick={verCarrinho}>Ver carrinho</button>
          }
        />
      )}
    </div>
  )
}

export default DetalhesProduto
