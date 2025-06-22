import { useEffect, useRef } from "react"
import NavbarComponent from "../navbar/navbar"
import Footer from "../footer"
import MapComponent from "./map-component"
import styles from "./nossasLojas.module.css"

const lojas = [
  { id: 1, localizacao: "Rua das Flores, 123 - São Paulo, SP" },
  { id: 2, localizacao: "Avenida Paulista, 456 - São Paulo, SP" },
  { id: 3, localizacao: "Praça da Sé, 789 - São Paulo, SP" },
  { id: 4, localizacao: "Rua da Consolação, 321 - São Paulo, SP" },
]

const NossasLojas = () => {
  const contentRef = useRef(null)

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

  return (
    <div className={styles.nossasLojasPage}>
      <NavbarComponent />
      <div className={styles.cardsWrapper} ref={contentRef}>
        <div className={styles.headerSection}>
          <div className={styles.storeIcon}>🏪</div>
          <h1 className={styles.animateOnScroll}>CONHEÇA A LOJA MAIS PERTO DA SUA CASA!</h1>
          <div className={styles.divider}></div>
          <p className={`${styles.subtitle} ${styles.animateOnScroll}`}>
            Encontre a unidade Café Connect mais próxima de você e venha viver uma experiência única!
          </p>
        </div>

        <div className={styles.cardsContainer}>
          {lojas.map((loja, index) => (
            <div
              key={loja.id}
              className={`${styles.card} ${styles.animateOnScroll}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>📍</span>
                <h2>Localização</h2>
              </div>
              <div className={styles.cardContent}>
                <p>{loja.localizacao}</p>
                <div className={styles.storeDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🕒</span>
                    <span>Seg-Sex: 7h às 20h</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📞</span>
                    <span>(11) 1234-567{loja.id}</span>
                  </div>
                </div>
              </div>
              <div className={styles.mapWrapper}>
                <MapComponent address={loja.localizacao} />
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.visitButton}>
                  <span className={styles.buttonIcon}>🚗</span>
                  Como Chegar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.infoSection} ${styles.animateOnScroll}`}>
          <div className={styles.infoHeader}>
            <span className={styles.infoIcon}>ℹ️</span>
            <h2>Informações Importantes</h2>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoCardIcon}>☕</span>
              <h3>Cardápio Completo</h3>
              <p>
                Todas as unidades oferecem nosso cardápio completo com cafés especiais e deliciosos acompanhamentos.
              </p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoCardIcon}>🅿️</span>
              <h3>Estacionamento</h3>
              <p>A maioria das nossas lojas possui estacionamento próprio ou conveniado para sua comodidade.</p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoCardIcon}>📶</span>
              <h3>Wi-Fi Gratuito</h3>
              <p>Internet de alta velocidade disponível em todas as unidades para você trabalhar ou relaxar.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default NossasLojas
