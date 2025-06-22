import { useEffect, useRef } from "react"
import NavbarComponent from "../navbar/navbar"
import Footer from "../footer"
import styles from "./sobreCafeConnect.module.css"

const SobreCafeConnect = () => {
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
    <div className={styles.sobreCafeConnectPage}>
      <NavbarComponent />
      <div className={styles.contentWrapper} ref={contentRef}>
        <div className={styles.headerSection}>
          <div className={styles.coffeeIcon}>☕</div>
          <h1 className={styles.animateOnScroll}>Sobre Café Connect</h1>
          <div className={styles.divider}></div>
        </div>

        <div className={`${styles.introSection} ${styles.animateOnScroll}`}>
          <p>
            Aqui, no <span className={styles.highlight}>Café Connect</span>, não apenas servimos café excepcional, mas
            também criamos um espaço onde as histórias se entrelaçam e as ideias ganham vida. Nossa equipe é uma
            verdadeira família que compartilha valores de amizade, comunicação e sustentabilidade.
          </p>
          <p>
            O Café Connect não começou como um empreendimento comercial, mas como uma experiência compartilhada. Um
            antigo espaço abandonado foi transformado em um ambiente acolhedor, onde cada detalhe foi cuidadosamente
            concebido para proporcionar uma experiência única aos nossos clientes. Este local não é apenas uma
            cafeteria; é um ponto de encontro onde a comunidade se reúne para compartilhar momentos e criar memórias.
          </p>
        </div>

        <div className={`${styles.sectionBlock} ${styles.animateOnScroll}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>❤️</span>
            <h2>A Experiência no Café Connect</h2>
          </div>
          <p>
            No Café Connect, cada visita é uma oportunidade de vivenciar algo especial. Aqui estão alguns aspectos que
            tornam nossa cafeteria única:
          </p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>🏠</span>
              <div>
                <strong>Ambiente Aconchegante:</strong> O design do espaço foi pensado para promover o conforto e a
                interação social, com áreas de estar que convidam à conversa.
              </div>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>🎨</span>
              <div>
                <strong>Eventos Culturais:</strong> Regularmente, organizamos exposições de arte local e eventos que
                destacam talentos da comunidade. Isso não apenas enriquece a experiência dos nossos clientes, mas também
                apoia artistas locais.
              </div>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>🌱</span>
              <div>
                <strong>Iniciativas Sustentáveis:</strong> Estamos comprometidos com práticas sustentáveis, desde o uso
                de ingredientes orgânicos até a redução de desperdícios. Promovemos a conscientização ambiental entre
                nossos clientes.
              </div>
            </li>
          </ul>
        </div>

        <div className={`${styles.sectionBlock} ${styles.animateOnScroll}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>👥</span>
            <h2>Conectando Pessoas</h2>
          </div>
          <p>
            No Café Connect, não servimos apenas café excepcional; criamos um ambiente onde as histórias fluem, as
            ideias ganham vida e os relacionamentos se fortalecem. Nossa equipe é como uma família, unida pelos valores
            da amizade, da comunicação e da responsabilidade social.
          </p>
          <p>Além disso, incentivamos a participação de nossos clientes através de iniciativas interativas:</p>
          <div className={styles.interactiveGrid}>
            <div className={styles.interactiveCard}>
              <span className={styles.cardIcon}>💬</span>
              <h3>Sessões de Perguntas e Respostas</h3>
              <p>
                Convidamos nossos clientes a interagir conosco sobre suas preferências de café e sugestões para o menu.
              </p>
            </div>
            <div className={styles.interactiveCard}>
              <span className={styles.cardIcon}>📚</span>
              <h3>Combinações de Livro e Café</h3>
              <p>
                Sugerimos livros que combinam perfeitamente com nossas bebidas, criando um espaço convidativo para os
                amantes da leitura.
              </p>
            </div>
          </div>
        </div>

        <div className={`${styles.futureSection} ${styles.animateOnScroll}`}>
          <div className={styles.futureHeader}>
            <span className={styles.futureIcon}>🚀</span>
            <h2>O Futuro do Café Connect</h2>
          </div>
          <p>
            Estamos sempre buscando maneiras de inovar e melhorar a experiência no Café Connect. Com planos para
            integrar mais tecnologia em nosso serviço — como cardápios digitais interativos e opções de pedidos online —
            estamos prontos para atender às necessidades dos nossos clientes modernos.
          </p>
          <p className={styles.callToAction}>
            Em resumo, o Café Connect é mais do que uma simples cafeteria; é um lugar onde cada xícara de café conta uma
            história e cada cliente é parte da nossa jornada. <br /> <br /> Venha nos visitar e faça parte dessa experiência única!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SobreCafeConnect
