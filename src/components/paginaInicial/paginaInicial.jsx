import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import NavbarComponent from "../navbar/navbar"
import Footer from "../footer"
import styles from "./paginaInicial.module.css"
import banner1 from "./banner1.png"
import banner2 from "./banner2.png"
import banner3 from "./banner3.jpg"
import cafe1 from "./cafe1.png"
import cafe2 from "./cafe2.png"
import { useAuth } from "../../authenticate/authContext"

const PaginaInicial = () => {
  const { token } = useAuth()
  const isLoggedIn = !!token
  const [activeSlide, setActiveSlide] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const promotionsRef = useRef(null)
  const aboutRef = useRef(null)
  const loginRef = useRef(null)

  // Configuração do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 2 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Animação de entrada para elementos quando visíveis
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.2 },
    )

    if (promotionsRef.current) observer.observe(promotionsRef.current)
    if (aboutRef.current) observer.observe(aboutRef.current)
    if (loginRef.current) observer.observe(loginRef.current)

    return () => {
      if (promotionsRef.current) observer.unobserve(promotionsRef.current)
      if (aboutRef.current) observer.unobserve(aboutRef.current)
      if (loginRef.current) observer.unobserve(loginRef.current)
    }
  }, [])

  // Função para navegar no carrossel
  const goToSlide = (index) => {
    setActiveSlide(index)
  }

  // Array de slides para o carrossel
  const slides = [
    {
      image: banner1 || "/placeholder.svg",
      title: "Bem-vindo ao Café Connect",
      description: "Desfrute de uma experiência única com nossos cafés.",
    },
    {
      image: banner2 || "/placeholder.svg",
      title: "Eventos Especiais",
      description: "Participe de nossos eventos culturais e sociais.",
    },
    {
      image: banner3 || "/placeholder.svg",
      title: "Sustentabilidade",
      description: "Comprometidos com práticas sustentáveis.",
    },
  ]

  // Lista de promoções
  const promotions = [
    "10% de desconto em todos os cafés!",
    "Compre 1, leve 2 em cafés selecionados!",
    "Frete grátis para pedidos acima de R$50!",
  ]

  return (
    <div className={styles.paginaInicial}>
      <NavbarComponent />

      {/* Carrossel melhorado */}
      <div className={styles.carouselContainer}>
        <div className={styles.customCarousel}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`${styles.carouselItem} ${activeSlide === index ? styles.active : ""}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className={styles.carouselOverlay}></div>
              <div className={styles.carouselCaption}>
                <h5 className={styles.slideTitle}>{slide.title}</h5>
                <p className={styles.slideDescription}>{slide.description}</p>
                <Link to="/produtos" className={styles.carouselButton}>
                  Explorar Agora
                </Link>
              </div>
            </div>
          ))}

          {/* Controles do carrossel */}
          <button
            className={`${styles.carouselControl} ${styles.prevControl}`}
            onClick={() => goToSlide(activeSlide === 0 ? slides.length - 1 : activeSlide - 1)}
          >
            <span className={styles.controlIcon}>❮</span>
          </button>
          <button
            className={`${styles.carouselControl} ${styles.nextControl}`}
            onClick={() => goToSlide(activeSlide === slides.length - 1 ? 0 : activeSlide + 1)}
          >
            <span className={styles.controlIcon}>❯</span>
          </button>

          {/* Indicadores do carrossel */}
          <div className={styles.carouselIndicators}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${activeSlide === index ? styles.activeIndicator : ""}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* Seções inferiores */}
      <div className={`${styles.bottomContainer}`}>
        <div
          id="about-section"
          ref={aboutRef}
          className={`${styles.sobreDiv} ${isVisible["about-section"] ? styles.fadeInLeft : ""}`}
        >
          <Link to="/sobre-cafe-connect" className={styles.cardLink}>
            <div className={styles.imageOverlayContainer}>
              <img src={cafe1 || "/placeholder.svg"} alt="Sobre Café Connect" />
              <div className={styles.imageOverlayText}>
                <span className={styles.overlayIcon}>☕</span>
                Sobre o Café Connect
              </div>
              <div className={styles.cardHoverEffect}></div>
            </div>
          </Link>
        </div>

        <div
          id="login-section"
          ref={loginRef}
          className={`${styles.loginDiv} ${isVisible["login-section"] ? styles.fadeInUp : ""}`}
        >
          {isLoggedIn ? (
            <Link to="/nossas-lojas" className={styles.cardLink}>
              <div className={styles.imageOverlayContainer}>
                <img src={cafe2 || "/placeholder.svg"} alt="Veja nossas lojas" />
                <div className={styles.imageOverlayText}>
                  <span className={styles.overlayIcon}>🏪</span>
                  Veja nossas lojas
                </div>
                <div className={styles.cardHoverEffect}></div>
              </div>
            </Link>
          ) : (
            <Link to="/login" className={styles.cardLink}>
              <div className={styles.imageOverlayContainer}>
                <img src={cafe2 || "/placeholder.svg"} alt="Acesse sua Conta" />
                <div className={styles.imageOverlayText}>
                  <span className={styles.overlayIcon}>👤</span>
                  Acesse sua Conta
                </div>
                <div className={styles.cardHoverEffect}></div>
              </div>
            </Link>
          )}
        </div>

        <div
          id="promotions-section"
          ref={promotionsRef}
          className={`${styles.promocoesDiv} ${isVisible["promotions-section"] ? styles.fadeInRight : ""}`}
        >
          <div className={styles.promotionHeader}>
            <span className={styles.promotionIcon}>🔥</span>
            <h3>Promoções do Dia</h3>
          </div>
          <ul className={styles.promotionsList}>
            {promotions.map((promo, index) => (
              <li key={index} className={styles.promotionItem}>
                {promo}
              </li>
            ))}
          </ul>
          <Link to="/produtos" className={styles.verProdutosBtn}>
            <span className={styles.btnText}>VEJA NOSSOS PRODUTOS</span>
            <span className={styles.btnIcon}>→</span>
          </Link>
        </div>
      </div>

      <div className={styles.featuresSection}>
        <div className={`${styles.featureCard} ${styles.fadeInUp}`} style={{ animationDelay: "0.1s" }}>
          <div className={styles.featureIcon}>☕</div>
          <h4>Cafés Especiais</h4>
          <p>Grãos selecionados de diversas regiões do mundo para uma experiência única.</p>
        </div>
        <div className={`${styles.featureCard} ${styles.fadeInUp}`} style={{ animationDelay: "0.3s" }}>
          <div className={styles.featureIcon}>🌱</div>
          <h4>Sustentabilidade</h4>
          <p>Comprometidos com práticas sustentáveis em toda nossa cadeia de produção.</p>
        </div>
        <div className={`${styles.featureCard} ${styles.fadeInUp}`} style={{ animationDelay: "0.5s" }}>
          <div className={styles.featureIcon}>🎭</div>
          <h4>Eventos Culturais</h4>
          <p>Exposições, música ao vivo e encontros literários em nossas lojas.</p>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default PaginaInicial
