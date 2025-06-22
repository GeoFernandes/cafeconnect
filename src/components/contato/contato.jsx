import { useState, useEffect, useRef } from "react"
import NavbarComponent from "../navbar/navbar"
import Footer from "../footer"
import styles from "./contato.module.css"

const Contato = () => {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [titulo, setTitulo] = useState("")
  const [categoria, setCategoria] = useState("pedido não entregue")
  const [solicitacao, setSolicitacao] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ nome, email, titulo, categoria, solicitacao })
    setIsSubmitted(true)

    setTimeout(() => {
      setIsSubmitted(false)
      setNome("")
      setEmail("")
      setTitulo("")
      setCategoria("pedido não entregue")
      setSolicitacao("")
    }, 3000)
  }

  return (
    <div className={styles.contatoPage}>
      <NavbarComponent />
      <div className={styles.container} ref={contentRef}>
        <div className={`${styles.formContainer} ${styles.animateOnScroll}`}>
          <div className={styles.headerSection}>
            <div className={styles.contactIcon}>📧</div>
            <h1>Contato</h1>
            <div className={styles.divider}></div>
          </div>

          {isSubmitted ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✅</div>
              <h3>Mensagem enviada com sucesso!</h3>
              <p>Entraremos em contato em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="nome">
                    <span className={styles.labelIcon}>👤</span>
                    Nome do Solicitante:
                  </label>
                  <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    <span className={styles.labelIcon}>✉️</span>
                    Email do Solicitante:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="titulo">
                  <span className={styles.labelIcon}>📝</span>
                  Título da Solicitação:
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="categoria">
                  <span className={styles.labelIcon}>📂</span>
                  Categoria:
                </label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={styles.selectField}
                >
                  <option value="pedido não entregue">Pedido não entregue</option>
                  <option value="cancelamento">Cancelamento</option>
                  <option value="problema na compra">Problema na compra</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="solicitacao">
                  <span className={styles.labelIcon}>💬</span>
                  Escreva sua solicitação:
                </label>
                <textarea
                  id="solicitacao"
                  value={solicitacao}
                  onChange={(e) => setSolicitacao(e.target.value)}
                  rows="5"
                  required
                  className={styles.textareaField}
                  placeholder="Descreva detalhadamente sua solicitação..."
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Enviar Solicitação
              </button>
            </form>
          )}
        </div>

        <div className={`${styles.infoContainer} ${styles.animateOnScroll}`}>
          <div className={styles.infoHeader}>
            <span className={styles.infoIcon}>📞</span>
            <h2>Informações de Contato</h2>
          </div>

          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <span className={styles.contactItemIcon}>✉️</span>
              <div>
                <strong>Email:</strong>
                <p>contato@cafeconnect.com</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactItemIcon}>📱</span>
              <div>
                <strong>Telefone:</strong>
                <p>(11) 1234-5678</p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactItemIcon}>📍</span>
              <div>
                <strong>Endereço:</strong>
                <p>
                  Rua Exemplo, 123
                  <br />
                  São Paulo, SP
                </p>
              </div>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.contactItemIcon}>📮</span>
              <div>
                <strong>CEP:</strong>
                <p>00000-0900</p>
              </div>
            </div>
          </div>

          <div className={styles.hoursSection}>
            <h3>
              <span className={styles.hoursIcon}>🕒</span>
              Horário de Atendimento
            </h3>
            <div className={styles.hoursInfo}>
              <p>
                <strong>Segunda a Sexta:</strong> 8h às 18h
              </p>
              <p>
                <strong>Sábado:</strong> 9h às 16h
              </p>
              <p>
                <strong>Domingo:</strong> Fechado
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Contato
