import { useState, useEffect, useRef } from "react"
import NavbarComponent from "../navbar/navbar"
import Footer from "../footer"
import styles from "./trabalheConosco.module.css"

const servicos = [
  { id: 1, nome: "Barista", descricao: "Responsável por preparar e servir cafés e bebidas." },
  { id: 2, nome: "Atendente de Cafeteria", descricao: "Atendimento ao cliente e organização do ambiente." },
  { id: 3, nome: "Gerente de Loja", descricao: "Gerenciamento da equipe e das operações da loja." },
  { id: 4, nome: "Coordenador de Eventos", descricao: "Planejamento e execução de eventos especiais." },
]

const TrabalheConosco = () => {
  const [nomeVaga, setNomeVaga] = useState("")
  const [modoTrabalho, setModoTrabalho] = useState("Presencial")
  const [tipoVaga, setTipoVaga] = useState("Efetivo")
  const [estadoUnidade, setEstadoUnidade] = useState("")
  const [cidadeUnidade, setCidadeUnidade] = useState("")
  const [bairroUnidade, setBairroUnidade] = useState("")
  const [email, setEmail] = useState("")
  const [curriculo, setCurriculo] = useState(null)
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
    console.log({
      nomeVaga,
      modoTrabalho,
      tipoVaga,
      estadoUnidade,
      cidadeUnidade,
      bairroUnidade,
      email,
      curriculo,
    })
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setNomeVaga("")
      setModoTrabalho("Presencial")
      setTipoVaga("Efetivo")
      setEstadoUnidade("")
      setCidadeUnidade("")
      setBairroUnidade("")
      setEmail("")
      setCurriculo(null)
    }, 3000)
  }

  return (
    <div className={styles.trabalheConoscoPage}>
      <NavbarComponent />
      <div className={styles.container} ref={contentRef}>
        <div className={`${styles.servicosWrapper} ${styles.animateOnScroll}`}>
          <div className={styles.servicosHeader}>
            <div className={styles.servicosIcon}>💼</div>
            <h1>Serviços Disponíveis</h1>
            <div className={styles.divider}></div>
          </div>
          <ul className={styles.servicosList}>
            {servicos.map((servico, index) => (
              <li
                key={servico.id}
                className={`${styles.servicoItem} ${styles.animateOnScroll}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.servicoCard}>
                  <span className={styles.servicoIcon}>⭐</span>
                  <div className={styles.servicoContent}>
                    <strong>{servico.nome}</strong>
                    <p>{servico.descricao}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.benefitsSection}>
            <h3>
              <span className={styles.benefitsIcon}>🎯</span>
              Por que trabalhar conosco?
            </h3>
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <span className={styles.benefitIcon}>☕</span>
                <span>Café gratuito</span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.benefitIcon}>📚</span>
                <span>Treinamentos</span>
              </div>
              <div className={styles.benefitItem}>
                <span className={styles.benefitIcon}>💰</span>
                <span>Salário competitivo</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.formWrapper} ${styles.animateOnScroll}`}>
          <div className={styles.formHeader}>
            <div className={styles.formIcon}>📝</div>
            <h2>Formulário de Candidatura</h2>
            <div className={styles.divider}></div>
          </div>

          {isSubmitted ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✅</div>
              <h3>Candidatura enviada com sucesso!</h3>
              <p>Entraremos em contato em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.formContainer}>
              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="nomeVaga">
                    <span className={styles.labelIcon}>🏷️</span>
                    Nome da Vaga:
                  </label>
                  <input
                    type="text"
                    id="nomeVaga"
                    value={nomeVaga}
                    onChange={(e) => setNomeVaga(e.target.value)}
                    required
                    className={styles.inputField}
                    placeholder="Ex: Barista"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    <span className={styles.labelIcon}>✉️</span>
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.inputField}
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="tipoVaga">
                    <span className={styles.labelIcon}>📋</span>
                    Tipo de Vaga:
                  </label>
                  <select
                    id="tipoVaga"
                    value={tipoVaga}
                    onChange={(e) => setTipoVaga(e.target.value)}
                    className={styles.selectField}
                  >
                    <option value="Efetivo">Efetivo</option>
                    <option value="Estágio">Estágio</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="modoTrabalho">
                    <span className={styles.labelIcon}>🏢</span>
                    Modo de Trabalho:
                  </label>
                  <select
                    id="modoTrabalho"
                    value={modoTrabalho}
                    onChange={(e) => setModoTrabalho(e.target.value)}
                    className={styles.selectField}
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className={styles.column}>
                <div className={styles.formGroup}>
                  <label htmlFor="estadoUnidade">
                    <span className={styles.labelIcon}>🗺️</span>
                    Estado da Unidade:
                  </label>
                  <input
                    type="text"
                    id="estadoUnidade"
                    value={estadoUnidade}
                    onChange={(e) => setEstadoUnidade(e.target.value)}
                    required
                    className={styles.inputField}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="cidadeUnidade">
                    <span className={styles.labelIcon}>🏙️</span>
                    Cidade da Unidade:
                  </label>
                  <input
                    type="text"
                    id="cidadeUnidade"
                    value={cidadeUnidade}
                    onChange={(e) => setCidadeUnidade(e.target.value)}
                    required
                    className={styles.inputField}
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="bairroUnidade">
                    <span className={styles.labelIcon}>📍</span>
                    Bairro da Unidade:
                  </label>
                  <input
                    type="text"
                    id="bairroUnidade"
                    value={bairroUnidade}
                    onChange={(e) => setBairroUnidade(e.target.value)}
                    required
                    className={styles.inputField}
                    placeholder="Ex: Vila Madalena"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="curriculo">
                    <span className={styles.labelIcon}>📄</span>
                    Anexar Currículo:
                  </label>
                  <input
                    type="file"
                    id="curriculo"
                    onChange={(e) => setCurriculo(e.target.files[0])}
                    className={styles.fileField}
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                <span className={styles.buttonIcon}>🚀</span>
                Enviar Candidatura
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default TrabalheConosco
