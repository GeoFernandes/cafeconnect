import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useEffect, useRef, useState } from "react"
import InputMask from "react-input-mask"
import { useNavigate } from "react-router-dom"
import invisivel from "../../../assets/images/invisivel.png"
import visivel from "../../../assets/images/visivel.png"
import { getinfoUsuario } from "../../../services/loginService"
import RequisitoSenhaModal from "../../cadastro/requisitoSenha/requisitoSenha"
import Footer from "../../footer"
import NavbarComponent from "../../navbar/navbar"
import LoadingModal from "../../shared/loadingModal/loadingModal"
import MessageModal from "../../shared/messageModal/messageModal"
import styles from "./alterarUsuario.module.css"
import { alterarInformacoes } from "../../../services/loginService"

const AlterarUsuario = () => {
    const [errorMessage, setErrorMessage] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [phone, setPhone] = useState("")
    const [cep, setCep] = useState("")
    const [rua, setRua] = useState("")
    const [estado, setEstado] = useState("")
    const [cidade, setCidade] = useState("")
    const [bairro, setBairro] = useState("")
    const [numero, setNumero] = useState("")
    const [complemento, setComplemento] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState("")
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [activeSection, setActiveSection] = useState("pessoal")
    const navigate = useNavigate()
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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Recupere o token do localStorage
                const token = localStorage.getItem("token")
                if (!token) {
                    console.error("Token não encontrado. Redirecionando para login.")
                    navigate("/login") // Redirecione para login se o token não existir
                    return
                }

                // Decodifique o token para obter o ID do usuário
                const decodedToken = jwtDecode(token)
                const userId = decodedToken.id // Certifique-se de que o token contém o campo `id`

                // Busque as informações do usuário
                const usuario = await getinfoUsuario(userId)

                // Atualize os estados com os dados do usuário
                setEmail(usuario.email || "")
                setPhone(usuario.telefone || "")
                setCep(usuario.endereco.cep || "")
                setRua(usuario.endereco.rua || "")
                setBairro(usuario.endereco.bairro || "")
                setCidade(usuario.endereco.cidade || "")
                setEstado(usuario.endereco.estado || "")
                setNumero(usuario.endereco.numero || "")
                setComplemento(usuario.complemento || "")
                setPassword(usuario.senha || "")
            } catch (error) {
                console.error("Erro ao buscar informações do usuário:", error)
            }
        }

        fetchUserData()

        let timeoutId
        if (cep.length === 9) {
            timeoutId = setTimeout(async () => {
                try {
                    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
                    const data = response.data
                    setRua(data.logradouro)
                    setBairro(data.bairro)
                    setCidade(data.localidade)
                    setEstado(data.uf)
                    setFieldErrors((prevErrors) => {
                        const newErrors = { ...prevErrors }
                        delete newErrors.rua
                        delete newErrors.bairro
                        delete newErrors.cidade
                        delete newErrors.estado
                        return newErrors
                    })
                } catch (error) {
                    console.error("Erro ao buscar endereço:", error)
                }
            }, 500)
        }
        return () => clearTimeout(timeoutId)
    }, [cep, navigate])

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[$*&@#])(?!.*(.)\1).{5,}$/
        return regex.test(password)
    }

    const validateFields = () => {
        const errors = {}

        // Validação específica para cada aba
        if (activeSection === "pessoal") {
            if (!email) errors.email = true
            if (!phone) errors.phone = true
        } else if (activeSection === "endereco") {
            if (!cep) errors.cep = true
            if (!rua) errors.rua = true
            if (!numero) errors.numero = true
            if (!bairro) errors.bairro = true
            if (!estado) errors.estado = true
            if (!cidade) errors.cidade = true
        } else if (activeSection === "senha") {
            if (!password || !validatePassword(password)) errors.password = true
            if (!confirmPassword || confirmPassword !== password) errors.confirmPassword = true
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateFields()) return
        setIsLoading(true)
        setErrorMessage("")
        try {
            if (activeSection === "pessoal") {
                await alterarInformacoes({
                    email,
                    telefone: phone,
                })
            } else if (activeSection === "endereco") {
                await alterarInformacoes({
                    endereco: {
                        cep,
                        rua,
                        estado,
                        cidade,
                        bairro,
                        numero,
                        complemento,
                    },
                })
            }   else if (activeSection === "senha") {
                    await alterarInformacoes({
                        senha: password,
                        confirmarSenha: confirmPassword,
                    })
                }
            setIsModalOpen(true)
        } catch (error) {
            setErrorMessage("Erro ao atualizar informações. Por favor, tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        // Não redireciona para o perfil, mantém o usuário na mesma página
        // navigate("/perfil");
    }

    const handleCepChange = (e) => {
        setCep(e.target.value)
        setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors }
            delete newErrors.cep
            return newErrors
        })
    }

    const handleInputChange = (setter, field) => (e) => {
        setter(e.target.value)
        setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors }
            delete newErrors[field]
            return newErrors
        })
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
        if (validatePassword(value)) {
            setPasswordStrength("Senha forte")
            setFieldErrors((prevErrors) => {
                const newErrors = { ...prevErrors }
                delete newErrors.password
                return newErrors
            })
        } else {
            setPasswordStrength("A senha deve ter pelo menos 6 caracteres, incluindo letras e números")
        }
    }

    const passwordRequirements = [
        { text: "Pelo menos 6 caracteres", isValid: password.length >= 6 },
        { text: "Pelo menos 1 número", isValid: /\d/.test(password) },
        { text: "Pelo menos 1 letra", isValid: /[a-zA-Z]/.test(password) },
    ]

    return (
        <div className={styles.pageContainer}>
            <NavbarComponent />
            <div className={`${styles.registerPage} ${activeSection === 'endereco' ? styles.addressSection : styles.defaultSection}`}>
                <div className={styles.formContainer} ref={contentRef}>
                    <div className={`${styles.formHeader} ${styles.animateOnScroll}`}>
                        <div className={styles.headerIcon}>👤</div>
                        <h2 className={styles.welcomeMessage}>Alterar Informações</h2>
                        <div className={styles.divider}></div>
                    </div>

                    <div className={`${styles.tabsContainer} ${styles.animateOnScroll}`}>
                        <button
                            className={`${styles.tabButton} ${activeSection === "pessoal" ? styles.activeTab : ""}`}
                            onClick={() => setActiveSection("pessoal")}
                        >
                            <span className={styles.tabIcon}>👤</span>
                            Informações Pessoais
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeSection === "endereco" ? styles.activeTab : ""}`}
                            onClick={() => setActiveSection("endereco")}
                        >
                            <span className={styles.tabIcon}>📍</span>
                            Endereço
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeSection === "senha" ? styles.activeTab : ""}`}
                            onClick={() => setActiveSection("senha")}
                        >
                            <span className={styles.tabIcon}>🔒</span>
                            Senha
                        </button>
                    </div>

                    <form className={`${styles.registerForm} ${styles.animateOnScroll}`} onSubmit={handleSubmit}>
                        {activeSection === "pessoal" && (
                            <div className={`${styles.formSection} ${styles.fadeIn}`}>
                                <h3 className={styles.sectionTitle}>
                                    <span className={styles.sectionIcon}>👤</span>
                                    Informações Pessoais
                                </h3>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email">
                                        <span className={styles.labelIcon}>✉️</span>
                                        E-mail:
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="E-mail"
                                        className={`${styles.input} ${fieldErrors.email ? styles.errorInput : ""}`}
                                        value={email}
                                        onChange={handleInputChange(setEmail, "email")}
                                        required
                                        aria-invalid={fieldErrors.email ? "true" : "false"}
                                    />
                                    {fieldErrors.email && <div className={styles.error}>E-mail é obrigatório</div>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">
                                        <span className={styles.labelIcon}>📱</span>
                                        Telefone:
                                    </label>
                                    <InputMask mask="(99) 99999-9999" value={phone} onChange={handleInputChange(setPhone, "phone")}>
                                        {(inputProps) => (
                                            <input
                                                {...inputProps}
                                                type="text"
                                                id="phone"
                                                placeholder="Telefone"
                                                className={`${styles.input} ${fieldErrors.phone ? styles.errorInput : ""}`}
                                                aria-invalid={fieldErrors.phone ? "true" : "false"}
                                            />
                                        )}
                                    </InputMask>
                                    {fieldErrors.phone && <div className={styles.error}>Telefone é obrigatório</div>}
                                </div>

                                <div className={styles.navigationButtons}>
                                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <span className={styles.loadingSpinner}></span>
                                                Atualizando...
                                            </>
                                        ) : (
                                            <>
                                                <span className={styles.buttonIcon}>✓</span>
                                                Atualizar Informações Pessoais
                                            </>
                                        )}
                                    </button>
                                    <button type="button" className={styles.nextButton} onClick={() => setActiveSection("endereco")}>
                                        Próximo <span className={styles.buttonArrow}>→</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === "endereco" && (
                            <div className={`${styles.formSection} ${styles.fadeIn}`}>
                                <h3 className={styles.sectionTitle}>
                                    <span className={styles.sectionIcon}>📍</span>
                                    Endereço
                                </h3>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="cep">
                                            <span className={styles.labelIcon}>📮</span>
                                            CEP:
                                        </label>
                                        <InputMask mask="99999-999" value={cep} onChange={handleCepChange}>
                                            {(inputProps) => (
                                                <input
                                                    {...inputProps}
                                                    type="text"
                                                    id="cep"
                                                    placeholder="CEP"
                                                    className={`${styles.input} ${fieldErrors.cep ? styles.errorInput : ""}`}
                                                    aria-invalid={fieldErrors.cep ? "true" : "false"}
                                                />
                                            )}
                                        </InputMask>
                                        {fieldErrors.cep && <div className={styles.error}>CEP é obrigatório</div>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="rua">
                                            <span className={styles.labelIcon}>🛣️</span>
                                            Rua:
                                        </label>
                                        <input
                                            type="text"
                                            id="rua"
                                            placeholder="Rua"
                                            className={`${styles.input} ${fieldErrors.rua ? styles.errorInput : ""}`}
                                            value={rua}
                                            onChange={handleInputChange(setRua, "rua")}
                                            aria-invalid={fieldErrors.rua ? "true" : "false"}
                                        />
                                        {fieldErrors.rua && <div className={styles.error}>Rua é obrigatória</div>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="numero">
                                            <span className={styles.labelIcon}>🔢</span>
                                            Número:
                                        </label>
                                        <input
                                            type="text"
                                            id="numero"
                                            placeholder="Número"
                                            className={`${styles.input} ${fieldErrors.numero ? styles.errorInput : ""}`}
                                            value={numero}
                                            onChange={handleInputChange(setNumero, "numero")}
                                            aria-invalid={fieldErrors.numero ? "true" : "false"}
                                        />
                                        {fieldErrors.numero && <div className={styles.error}>Número é obrigatório</div>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="complemento">
                                            <span className={styles.labelIcon}>🏠</span>
                                            Complemento:
                                        </label>
                                        <input
                                            type="text"
                                            id="complemento"
                                            placeholder="Complemento"
                                            className={styles.input}
                                            value={complemento}
                                            onChange={handleInputChange(setComplemento, "complemento")}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="bairro">
                                            <span className={styles.labelIcon}>🏘️</span>
                                            Bairro:
                                        </label>
                                        <input
                                            type="text"
                                            id="bairro"
                                            placeholder="Bairro"
                                            className={`${styles.input} ${fieldErrors.bairro ? styles.errorInput : ""}`}
                                            value={bairro}
                                            onChange={handleInputChange(setBairro, "bairro")}
                                            aria-invalid={fieldErrors.bairro ? "true" : "false"}
                                        />
                                        {fieldErrors.bairro && <div className={styles.error}>Bairro é obrigatório</div>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="cidade">
                                            <span className={styles.labelIcon}>🏙️</span>
                                            Cidade:
                                        </label>
                                        <input
                                            type="text"
                                            id="cidade"
                                            placeholder="Cidade"
                                            className={`${styles.input} ${fieldErrors.cidade ? styles.errorInput : ""}`}
                                            value={cidade}
                                            onChange={handleInputChange(setCidade, "cidade")}
                                            aria-invalid={fieldErrors.cidade ? "true" : "false"}
                                        />
                                        {fieldErrors.cidade && <div className={styles.error}>Cidade é obrigatória</div>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="estado">
                                            <span className={styles.labelIcon}>🗺️</span>
                                            Estado:
                                        </label>
                                        <input
                                            type="text"
                                            id="estado"
                                            placeholder="Estado"
                                            className={`${styles.input} ${fieldErrors.estado ? styles.errorInput : ""}`}
                                            value={estado}
                                            onChange={handleInputChange(setEstado, "estado")}
                                            aria-invalid={fieldErrors.estado ? "true" : "false"}
                                        />
                                        {fieldErrors.estado && <div className={styles.error}>Estado é obrigatório</div>}
                                    </div>
                                </div>

                                <div className={styles.navigationButtons}>
                                    <button type="button" className={styles.prevButton} onClick={() => setActiveSection("pessoal")}>
                                        <span className={styles.buttonArrow}>←</span> Anterior
                                    </button>
                                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <span className={styles.loadingSpinner}></span>
                                                Atualizando...
                                            </>
                                        ) : (
                                            <>
                                                <span className={styles.buttonIcon}>✓</span>
                                                Atualizar Endereço
                                            </>
                                        )}
                                    </button>
                                    <button type="button" className={styles.nextButton} onClick={() => setActiveSection("senha")}>
                                        Próximo <span className={styles.buttonArrow}>→</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === "senha" && (
                            <div className={`${styles.formSection} ${styles.fadeIn}`}>
                                <h3 className={styles.sectionTitle}>
                                    <span className={styles.sectionIcon}>🔒</span>
                                    Alterar Senha
                                </h3>

                                <div className={styles.formGroup}>
                                    <label htmlFor="password">
                                        <span className={styles.labelIcon}>🔑</span>
                                        Senha:
                                    </label>
                                    <div className={styles.passwordWrapper}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            placeholder="Senha"
                                            className={`${styles.input} ${fieldErrors.password ? styles.errorInput : ""}`}
                                            value={password}
                                            onFocus={() => setShowPasswordRequirements(true)}
                                            onBlur={() => setShowPasswordRequirements(false)}
                                            onChange={handlePasswordChange}
                                            aria-invalid={fieldErrors.password ? "true" : "false"}
                                        />
                                        <button
                                            type="button"
                                            className={styles.togglePassword}
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            <img src={showPassword ? invisivel : visivel} alt="Toggle Password Visibility" />
                                        </button>
                                    </div>
                                    <RequisitoSenhaModal isVisible={showPasswordRequirements} requirements={passwordRequirements} />
                                    {fieldErrors.password && <div className={styles.error}>Senha inválida</div>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">
                                        <span className={styles.labelIcon}>🔐</span>
                                        Confirmar Senha:
                                    </label>
                                    <div className={styles.passwordWrapper}>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            placeholder="Confirmar Senha"
                                            className={`${styles.input} ${fieldErrors.confirmPassword ? styles.errorInput : ""}`}
                                            value={confirmPassword}
                                            onChange={handleInputChange(setConfirmPassword, "confirmPassword")}
                                            aria-invalid={fieldErrors.confirmPassword ? "true" : "false"}
                                        />
                                        <button
                                            type="button"
                                            className={styles.togglePassword}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            <img src={showConfirmPassword ? invisivel : visivel} alt="Toggle Password Visibility" />
                                        </button>
                                    </div>
                                    {fieldErrors.confirmPassword && <div className={styles.error}>As senhas não coincidem</div>}
                                </div>

                                <div className={styles.navigationButtons}>
                                    <button type="button" className={styles.prevButton} onClick={() => setActiveSection("endereco")}>
                                        <span className={styles.buttonArrow}>←</span> Anterior
                                    </button>
                                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <span className={styles.loadingSpinner}></span>
                                                Atualizando...
                                            </>
                                        ) : (
                                            <>
                                                <span className={styles.buttonIcon}>✓</span>
                                                Atualizar Senha
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <p className={`${styles.message} ${styles.animateOnScroll}`}>
                        Deseja voltar?{" "}
                        <a href="/" className={styles.link}>
                            Voltar para página principal
                        </a>
                    </p>
                </div>

                {isLoading && <LoadingModal />}

                {isModalOpen && !errorMessage && (
                    <MessageModal
                        message={`${activeSection === "pessoal" ? "Informações pessoais" : activeSection === "endereco" ? "Endereço" : "Senha"
                            } atualizado(a) com sucesso!`}
                        onClose={closeModal}
                    />
                )}

                {errorMessage && <MessageModal message={errorMessage} onClose={() => setErrorMessage("")} />}
            </div>
            <Footer />
        </div>
    )
}

export default AlterarUsuario
