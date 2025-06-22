/* eslint-disable no-unused-vars */
import axios from "axios"
import { useEffect, useState } from "react"
import InputMask from "react-input-mask"
import { useNavigate } from "react-router-dom"
import iconeErro from "../../assets/images/error.svg"
import invisivel from "../../assets/images/invisivel.png"
import iconeSucesso from "../../assets/images/sucesso.svg"
import visivel from "../../assets/images/visivel.png"
import { registro } from "../../services/loginService"
import RequisitoSenhaModal from "../cadastro/requisitoSenha/requisitoSenha"
import Footer from "../footer"
import NavbarComponent from "../navbar/navbar"
import LoadingModal from "../shared/loadingModal/loadingModal"
import MessageModal from "../shared/messageModal/messageModal"
import styles from "./cadastro.module.css"

const Cadastro = () => {
  // Estados existentes
  const [errorMessage, setErrorMessage] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [cpf, setCpf] = useState("")
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

  // Novos estados para controle das etapas
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  const navigate = useNavigate()

  useEffect(() => {
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
  }, [cep])

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[$*&@#])(?!.*(.)\1).{5,}$/
    return regex.test(password)
  }

  const validateStep1 = () => {
    const errors = {}
    if (!name) errors.name = true
    if (!cpf) errors.cpf = true
    if (!email) errors.email = true
    if (!phone) errors.phone = true
    if (!password || !validatePassword(password)) errors.password = true
    if (!confirmPassword || confirmPassword !== password) errors.confirmPassword = true
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    if (!cep) errors.cep = true
    if (!rua) errors.rua = true
    if (!numero) errors.numero = true
    if (!bairro) errors.bairro = true
    if (!estado) errors.estado = true
    if (!cidade) errors.cidade = true
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateFields = () => {
    return validateStep1() && validateStep2()
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (currentStep === 1) {
      handleNextStep()
      return
    }

    if (!validateStep2()) return

    setIsLoading(true)
    setErrorMessage("")
    try {
      await registro(
        email,
        name,
        password,
        cpf,
        phone,
        confirmPassword,
        cep,
        rua,
        estado,
        cidade,
        bairro,
        numero,
        complemento,
      )

      // Salvar dados do usuário no localStorage para uso posterior
      const userData = {
        nome: name,
        email,
        cpf,
        telefone: phone,
        cep,
        rua,
        estado,
        cidade,
        bairro,
        numero,
        complemento,
      }
      localStorage.setItem("userData", JSON.stringify(userData))

      setIsModalOpen(true)
    } catch (error) {
      setErrorMessage("Erro ao fazer registro. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    navigate("/login")
  }

  const toggleForm = () => { }

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
    } else {
      setPasswordStrength("A senha deve ter pelo menos 6 caracteres, incluindo letras e números")
    }
  }

  const passwordRequirements = [
    { text: "Uma letra maiúscula", isValid: /[A-Z]/.test(password) },
    { text: "Um número", isValid: /\d/.test(password) },
    { text: "Um caractere especial ($*&@#)", isValid: /[$*&@#]/.test(password) },
    { text: "Sem caracteres repetidos", isValid: !/(.)\1/.test(password) },
    { text: "Mínimo 5 caracteres", isValid: password.length >= 5 },
  ]

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Informações Pessoais"
      case 2:
        return "Endereço"
      default:
        return "Cadastro"
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Preencha seus dados pessoais para começar"
      case 2:
        return "Agora vamos precisar do seu endereço"
      default:
        return ""
    }
  }

  return (
    <div className={styles.pageContainer}>
      <NavbarComponent />
      <div>
        <div className={`${styles.container} ${currentStep === 1 ? styles.step1 : styles.step2}`}>
          <form className={styles.registerForm} onSubmit={handleSubmit}>
            <h2 className={styles.welcomeMessage}>Cadastre-se</h2>

            {/* Barra de Progresso */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
              </div>
              <div className={styles.stepInfo}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepCounter}>
                    Etapa {currentStep} de {totalSteps}
                  </span>
                </div>
                <h3 className={styles.stepTitle}>{getStepTitle()}</h3>
                <p className={styles.stepDescription}>{getStepDescription()}</p>
              </div>
            </div>

            {/* Etapa 1: Informações Pessoais */}
            {currentStep === 1 && (
              <div className={styles.stepContent}>
                <div className={styles.informacoesPessoais}>
                  <input
                    type="text"
                    placeholder="Nome"
                    className={`${styles.input} ${fieldErrors.name ? styles.errorInput : ""}`}
                    value={name}
                    onChange={handleInputChange(setName, "name")}
                    aria-invalid={fieldErrors.name ? "true" : "false"}
                  />
                  <InputMask mask="999.999.999-99" value={cpf} onChange={handleInputChange(setCpf, "cpf")}>
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        placeholder="CPF"
                        className={`${styles.input} ${fieldErrors.cpf ? styles.errorInput : ""}`}
                        aria-invalid={fieldErrors.cpf ? "true" : "false"}
                      />
                    )}
                  </InputMask>
                  <input
                    type="email"
                    placeholder="E-mail"
                    className={`${styles.input} ${fieldErrors.email ? styles.errorInput : ""}`}
                    value={email}
                    onChange={handleInputChange(setEmail, "email")}
                    required
                    aria-invalid={fieldErrors.email ? "true" : "false"}
                  />
                  <InputMask mask="(99) 99999-9999" value={phone} onChange={handleInputChange(setPhone, "phone")}>
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        placeholder="Telefone"
                        className={`${styles.input} ${fieldErrors.phone ? styles.errorInput : ""}`}
                        aria-invalid={fieldErrors.phone ? "true" : "false"}
                      />
                    )}
                  </InputMask>
                </div>

                <div className={styles.confirmarSenha}>
                  <div className={styles.passwordWrapper}>
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
                        className={`${styles.input} ${fieldErrors.password ? styles.errorInput : ""}`}
                        value={password}
                        onFocus={() => setShowPasswordRequirements(true)}
                        onBlur={() => setShowPasswordRequirements(false)}
                        onChange={handlePasswordChange}
                        aria-invalid={fieldErrors.password ? "true" : "false"}
                      />
                      <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                        <img src={showPassword ? invisivel : visivel} alt="Toggle Password Visibility" />
                      </button>
                      <RequisitoSenhaModal
                        isVisible={showPasswordRequirements}
                        requirements={passwordRequirements}
                      />
                    </div>
                  </div>

                  <div className={styles.passwordWrapper}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
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
                    >
                      <img src={showConfirmPassword ? invisivel : visivel} alt="Toggle Password Visibility" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Endereço */}
            {currentStep === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.endereco}>
                  <InputMask mask="99999-999" value={cep} onChange={handleCepChange}>
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        placeholder="CEP"
                        className={`${styles.input} ${fieldErrors.cep ? styles.errorInput : ""}`}
                        aria-invalid={fieldErrors.cep ? "true" : "false"}
                      />
                    )}
                  </InputMask>
                  <input
                    type="text"
                    placeholder="Rua"
                    className={`${styles.input} ${fieldErrors.rua ? styles.errorInput : ""}`}
                    value={rua}
                    onChange={handleInputChange(setRua, "rua")}
                    aria-invalid={fieldErrors.rua ? "true" : "false"}
                  />
                  <input
                    type="text"
                    placeholder="Número"
                    className={`${styles.input} ${fieldErrors.numero ? styles.errorInput : ""}`}
                    value={numero}
                    onChange={handleInputChange(setNumero, "numero")}
                    aria-invalid={fieldErrors.numero ? "true" : "false"}
                  />
                  <input
                    type="text"
                    placeholder="Complemento"
                    className={styles.input}
                    value={complemento}
                    onChange={handleInputChange(setComplemento, "complemento")}
                  />
                  <input
                    type="text"
                    placeholder="Bairro"
                    className={`${styles.input} ${fieldErrors.bairro ? styles.errorInput : ""}`}
                    value={bairro}
                    onChange={handleInputChange(setBairro, "bairro")}
                    aria-invalid={fieldErrors.bairro ? "true" : "false"}
                  />
                  <input
                    type="text"
                    placeholder="Estado"
                    className={`${styles.input} ${fieldErrors.estado ? styles.errorInput : ""}`}
                    value={estado}
                    onChange={handleInputChange(setEstado, "estado")}
                    aria-invalid={fieldErrors.estado ? "true" : "false"}
                  />
                  <input
                    type="text"
                    placeholder="Cidade"
                    className={`${styles.input} ${fieldErrors.cidade ? styles.errorInput : ""}`}
                    value={cidade}
                    onChange={handleInputChange(setCidade, "cidade")}
                    aria-invalid={fieldErrors.cidade ? "true" : "false"}
                  />
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className={styles.buttonContainer}>
              {currentStep > 1 && (
                <button type="button" className={styles.buttonSecondary} onClick={handlePrevStep}>
                  Voltar
                </button>
              )}

              <button type="submit" className={styles.button} disabled={isLoading}>
                {isLoading ? "Cadastrando..." : currentStep === totalSteps ? "Cadastrar" : "Próximo"}
              </button>
            </div>

            <p className={styles.message}>
              Já tem uma conta?{" "}
              <a href="/login" className={styles.link} onClick={toggleForm}>
                Login
              </a>
            </p>
          </form>

          {isLoading && <LoadingModal />}

          {isModalOpen && !errorMessage && (
            <MessageModal
              message="Cadastro realizado com sucesso"
              onClose={closeModal}
              icon={<img src={iconeSucesso || "/placeholder.svg"} alt="Sucesso" />}
            />
          )}

          {errorMessage && (
            <MessageModal
              message={errorMessage}
              onClose={() => setErrorMessage("")}
              icon={<img src={iconeErro || "/placeholder.svg"} alt="Erro" />}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Cadastro