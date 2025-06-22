
import { ArrowLeft, CreditCard, MapPin, ShoppingBag, Truck } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CartContext } from "../../CartContext"
import { criarPedido } from "../../services/pedidoService"
import Footer from "../footer"
import NavbarComponent from "../navbar/navbar"
import styles from "./checkout.module.css"

import { loadMercadoPago } from "@mercadopago/sdk-js"
import axios from "axios"
import errorIcon from "../../assets/images/error.svg"
import successIcon from "../../assets/images/sucesso.svg"
import { getinfoUsuario } from "../../services/loginService"
import { getInfoFromToken } from "../../utils/decodedToken"
import MessageModal from "../shared/messageModal/messageModal"
import PixQrCodeModal from "./pix/pixQrCodeModal"
import iconePix from "../../assets/images/iconePix.png";

function Checkout() {
  const [identificationType, setIdentificationType] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("")
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [isAddressComplete, setIsAddressComplete] = useState(true)
  const [showPixModal, setShowPixModal] = useState(false);
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [qrCode, setChavePix] = useState("");
  const [pagamentoCriado, setPagamentoCriado] = useState(false);
  const [loadingPix, setLoadingPix] = useState(false);
  const [cardFieldsLoaded, setCardFieldsLoaded] = useState(false);
  const [identificationTypes, setIdentificationTypes] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [issuerOptions, setIssuerOptions] = useState([]);
  const [token, setToken] = useState("");
  const [processingCard, setProcessingCard] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [user, setUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalType, setModalType] = useState("success"); // ou "error"

  const [mp, setMp] = useState(null);

  useEffect(() => {
    (async () => {
      await loadMercadoPago();
      const instance = new window.MercadoPago("TEST-87a3956a-bd8d-41fb-9054-4ff3582631f8");
      setMp(instance);
    })();
  }, []);



  const [formData, setFormData] = useState({
    cep: "",
    city: "",
    neighborhood: "",
    street: "",
    number: "",
    complement: "",
    cardNumber: "",
    cardName: "",
    expiryMonth: "1",
    expiryYear: new Date().getFullYear().toString(),
    cvv: "",
    installments: "1",
  })

  const handleCriarPedido = async () => {
  try {
    const pedidoData = {
      produtos: cartItems.map(item => ({
        produtoId: item.id,
        nome: item.title,
        quantidade: item.quantity,
        preco: item.price
      })),
      total: totalPrice,
      enderecoEntrega: {
        rua: formData.street,
        numero: formData.number,
        complemento: formData.complement,
        bairro: formData.neighborhood,
        cidade: formData.city,
        estado: formData.state,
        cep: formData.cep
      }
    };

    await criarPedido(pedidoData);

  } catch (error) {
    setModalMessage("Erro ao criar pedido.");
  }
};

  const criarPagamentoPix = async () => {
    try {
      const response = await axios.post("https://cafeconnect-u9rh.onrender.com/pagamento/criar-pagamento-pix", {
        totalAmount: totalPrice,
        payerEmail: user?.email || "cliente@exemplo.com",
        description: "Compra de café especial"
      }, {
        headers: {
          "x-idempotency-key": crypto.randomUUID()
        }
      });
      setQrCodeBase64(response.data.qrCodeBase64);
      setChavePix(response.data.qrCode);
      setPagamentoCriado(true);
      setShowPixModal(true);
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      setModalType("error");
      setModalMessage("Erro ao gerar pagamento Pix");
      setShowPixModal(false);
    }
  };

  // Função para processar o pagamento com o token
  const processPayment = async (tokenId) => {
    try {
      const response = await axios.post("https://cafeconnect-u9rh.onrender.com/pagamento/criar-pagamento-cartao", {
        totalAmount: totalPrice,
        payerEmail: user?.email || "cliente@exemplo.com",
        description: "Compra na Loja",
        token: tokenId,
        paymentMethodId: paymentMethodId,
        installments: parseInt(document.getElementById('form-checkout__installments').value),
        issuer: document.getElementById('form-checkout__issuer').value
      }, {
        headers: {
          "x-idempotency-key": crypto.randomUUID()
        }
      });

      if (response.data.status === "approved") {
        if (clearCart) clearCart();
        await handleCriarPedido();
        setShowSuccessModal(true);
      } else {
        setModalMessage(`Pagamento ${response.data.status}`);
      }
    } catch (error) {
      console.error("Erro no pagamento:", error);
      setModalType("error");
      setModalMessage(error.response?.data?.message || "Erro ao processar pagamento");
    }
  };

  const validateCreditCardForm = () => {
    // Valida campos de texto normais
    const textFields = [
      'form-checkout__cardholderName',
      'card-form-checkout__identificationType',
      'card-form-checkout__identificationNumber',
      'card-form-checkout__email'
    ];

    for (const fieldId of textFields) {
      const element = document.getElementById(fieldId);
      if (!element?.value) {
        const label = document.querySelector(`label[for="${fieldId}"]`)?.textContent || fieldId;
        setModalMessage(`Dados para pagamento não preenchidos`);
        setModalType("error");
        return false;
      }
    }

    // Valida se os campos do MercadoPago foram renderizados
    const mpContainers = ['cardNumber', 'expirationDate', 'securityCode'];
    for (const field of mpContainers) {
      const container = document.getElementById(`form-checkout__${field}`);
      if (!container || container.children.length === 0) {
        setModalMessage(`Dados para pagamento não preenchidos`);
        setModalType("error");
        return false;
      }
    }

    return true;
  };

  const handleCreditCardSubmit = async (event) => {
    event.preventDefault();
    setProcessingCard(true);

    try {
      if (!validateCreditCardForm()) {
        return;
      }

      const tokenData = await mp.fields.createCardToken({
        cardholderName: document.getElementById('form-checkout__cardholderName').value,
        identificationType: document.getElementById('card-form-checkout__identificationType').value,
        identificationNumber: document.getElementById('card-form-checkout__identificationNumber').value.replace(/\D/g, '')
      });

      setToken(tokenData.id);
      await processPayment(tokenData.id);
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setModalMessage(error.response?.message || "Erro ao processar o cartão");
      setModalType("error");
    } finally {
      setProcessingCard(false);
    }
  };

  const navigate = useNavigate()
  const { cartItems = [], clearCart } = useContext(CartContext);

  const handlePaymentChange = (paymentMethod) => {
    setSelectedPayment(paymentMethod)
    setShowCardDetails(paymentMethod === "creditCard")
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    let processedValue = value

    if (id === "cep" || id === "number") {
      processedValue = value.replace(/[^0-9]/g, "")
    }

    setFormData({
      ...formData,
      [id]: processedValue,
    })

    if (["cep", "city", "neighborhood", "street", "number"].includes(id)) {
      validateAddress()
    }
  }

  const validateAddress = () => {
    const { cep, city, neighborhood, street, number } = formData
    setIsAddressComplete(cep && city && neighborhood && street && number)
  }

  useEffect(() => {
    validateAddress();
  }, [formData]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = getInfoFromToken();
      console.log("USERID", userId)
      if (!userId) return;
      try {
        const user = await getinfoUsuario(userId.id);
        setUser(user);
        if (user && user.endereco) {
          setFormData(prev => ({
            ...prev,
            cep: user.endereco.cep || "",
            city: user.endereco.cidade || "",
            neighborhood: user.endereco.bairro || "",
            street: user.endereco.rua || "",
            number: user.endereco.numero || "",
            complement: user.endereco.complemento || "",
            // outros campos se necessário
          }));
          validateAddress();
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
      }
    };

    fetchUserData();
  }, []);

  // Calcular preços
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      console.log("cartItems", cartItems)
      const quantity = item.quantity || 1;
      const price = typeof item.price === "string"
        ? Number.parseFloat(item.price.replace(/[^\d.,]/g, "").replace(",", "."))
        : item.price;
      return total + (price * quantity);
    }, 0);
  };

  // Estado para o frete
  const [shippingCost, setShippingCost] = useState(15.0) // Valor padrão ou calculado

  // Cálculo do total
  const subtotal = calculateSubtotal()
  const totalPrice = subtotal + shippingCost

  const getContainerClass = () => {
    return styles.mainContainer
  }

  function maskCPF(value) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  function maskCNPJ(value) {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  }

  const handleIdentificationNumberChange = (e) => {
    let value = e.target.value;
    if (identificationType === "CPF") {
      value = maskCPF(value);
    } else if (identificationType === "CNPJ") {
      value = maskCNPJ(value);
    }
    setIdentificationNumber(value);
  };

  // Adicionar as funções para obter tipos de documento
  function createSelectOptions(elem, options, labelsAndKeys = { label: "name", value: "id" }) {
    const { label, value } = labelsAndKeys

    elem.options.length = 0

    const tempOptions = document.createDocumentFragment()

    options.forEach((option) => {
      const optValue = option[value]
      const optLabel = option[label]

      const opt = document.createElement("option")
      opt.value = optValue
      opt.textContent = optLabel

      tempOptions.appendChild(opt)
    })

    elem.appendChild(tempOptions)
  }

  async function updateIssuer(paymentMethod, bin, issuerElement, issuerPlaceholder) {
    const { additional_info_needed, issuer } = paymentMethod;
    let issuerOptions = [issuer];

    if (additional_info_needed.includes('issuer_id')) {
      issuerOptions = await getIssuers(paymentMethod, bin);
    }

    clearHTMLSelectChildrenFrom(issuerElement);
    createSelectElementPlaceholder(issuerElement, issuerPlaceholder);

    if (issuerOptions.length > 0) {
      issuerOptions.forEach(issuer => {
        const optionElement = document.createElement('option');
        optionElement.value = issuer.id;
        optionElement.textContent = issuer.name;
        issuerElement.appendChild(optionElement);
      });
    }
  }

  async function getIssuers(paymentMethod, bin) {
    try {
      const { id: paymentMethodId } = paymentMethod;
      return await mp.getIssuers({ paymentMethodId, bin });
    } catch (e) {
      console.error('error getting issuers: ', e);
      return [];
    }
  }

  async function updateInstallments(paymentMethod, bin, installmentsElement, installmentsPlaceholder, amount) {
    try {
      clearHTMLSelectChildrenFrom(installmentsElement);
      createSelectElementPlaceholder(installmentsElement, installmentsPlaceholder);

      const installments = await mp.getInstallments({
        amount: amount.toString(),
        bin,
        paymentTypeId: 'credit_card',
        paymentMethodId: paymentMethod.id
      });

      if (installments.length > 0 && installments[0].payer_costs) {
        installments[0].payer_costs.forEach(cost => {
          const optionElement = document.createElement('option');
          optionElement.value = cost.installments;
          optionElement.textContent = `${cost.installments}x de ${cost.installment_amount} ${cost.installment_rate === 0 ? 'sem juros' : 'com juros'}`;
          installmentsElement.appendChild(optionElement);
        });
      }
    } catch (error) {
      console.error('error getting installments: ', error);
    }
  }

  function clearHTMLSelectChildrenFrom(element) {
    const currOptions = [...element.children];
    currOptions.forEach(child => child.remove());
  }

  function createSelectElementPlaceholder(element, placeholder) {
    const optionElement = document.createElement('option');
    optionElement.textContent = placeholder;
    optionElement.setAttribute('selected', "");
    optionElement.setAttribute('disabled', "");
    element.appendChild(optionElement);
  }


  useEffect(() => {
    if (selectedPayment === "pix" || selectedPayment === "creditCard") {
      (async function getIdentificationTypes() {
        try {
          const types = await mp.getIdentificationTypes()
          setIdentificationTypes(types)

          const pixIdentificationElement = document.getElementById("form-checkout__identificationType")
          const cardIdentificationElement = document.getElementById("card-form-checkout__identificationType")

          if (pixIdentificationElement) {
            createSelectOptions(pixIdentificationElement, types)
          }

          if (cardIdentificationElement) {
            createSelectOptions(cardIdentificationElement, types)
          }
        } catch (e) {
          console.error("Error getting identificationTypes: ", e)
        }
      })()
    }
  }, [selectedPayment])

  useEffect(() => {
    if (showCardDetails) {
      mp.cardForm({
        amount: totalPrice.toFixed(2),
        autoMount: true,
        form: {
          id: "form-checkout",
          cardholderName: {
            id: "form-checkout__cardholderName",
            placeholder: "Nome como aparece no cartão",
          },
          cardNumber: {
            id: "form-checkout__cardNumber",
            placeholder: "Número do cartão",
          },
          expirationDate: {
            id: "form-checkout__expirationDate",
            placeholder: "MM/YY",
          },
          securityCode: {
            id: "form-checkout__securityCode",
            placeholder: "CVV",
          },
          installments: {
            id: "form-checkout__installments",
            placeholder: "Parcelas",
          },
          issuer: {
            id: "form-checkout__issuer",
            placeholder: "Banco emissor",
          },
        },
        callbacks: {
          onFormMounted: error => {
            if (error) console.error("Form Mounted handling error: ", error);
          },
          onSubmit: event => {
            event.preventDefault();
          },
          onBinChange: data => {
            console.log("BIN changed: ", data);
          },
        },
      });
    }
  }, [showCardDetails, totalPrice]);

  useEffect(() => {
    if (showCardDetails && !cardFieldsLoaded) {
      const initializeCardFields = async () => {
        try {
          // Inicializa os campos do cartão
          const cardNumberElement = mp.fields.create('cardNumber', {
            placeholder: "Número do cartão",

          }).mount('form-checkout__cardNumber');

          const expirationDateElement = mp.fields.create('expirationDate', {
            placeholder: "MM/YY",
          }).mount('form-checkout__expirationDate');

          const securityCodeElement = mp.fields.create('securityCode', {
            placeholder: "Código de segurança",
          }).mount('form-checkout__securityCode');

          const paymentMethodElement = document.createElement('input');
          paymentMethodElement.type = 'hidden';
          paymentMethodElement.id = 'paymentMethodId';
          document.getElementById('form-checkout').appendChild(paymentMethodElement);

          // Obtenha referências aos elementos do DOM
          const issuerElement = document.getElementById('form-checkout__issuer');
          const installmentsElement = document.getElementById('form-checkout__installments');

          const issuerPlaceholder = "Banco emissor";
          const installmentsPlaceholder = "Parcelas";

          let currentBin;

          // Configuração do evento binChange
          cardNumberElement.on('binChange', async (data) => {
            const { bin } = data;
            try {
              if (!bin && paymentMethodElement.value) {
                clearSelectsAndSetPlaceholders();
                paymentMethodElement.value = "";
                setPaymentMethodId("");
              }

              if (bin && bin !== currentBin) {
                const { results } = await mp.getPaymentMethods({ bin });
                const paymentMethod = results[0];

                paymentMethodElement.value = paymentMethod.id;
                setPaymentMethodId(paymentMethod.id);
                updatePCIFieldsSettings(paymentMethod, cardNumberElement, securityCodeElement);
                await updateIssuer(paymentMethod, bin, issuerElement, issuerPlaceholder);
                await updateInstallments(paymentMethod, bin, installmentsElement, installmentsPlaceholder, totalPrice);
              }

              currentBin = bin;
            } catch (e) {
              console.error('error getting payment methods: ', e);
            }
          });

          function clearSelectsAndSetPlaceholders() {
            clearHTMLSelectChildrenFrom(issuerElement);
            createSelectElementPlaceholder(issuerElement, issuerPlaceholder);

            clearHTMLSelectChildrenFrom(installmentsElement);
            createSelectElementPlaceholder(installmentsElement, installmentsPlaceholder);
          }

          function clearHTMLSelectChildrenFrom(element) {
            const currOptions = [...element.children];
            currOptions.forEach(child => child.remove());
          }

          function createSelectElementPlaceholder(element, placeholder) {
            const optionElement = document.createElement('option');
            optionElement.textContent = placeholder;
            optionElement.setAttribute('selected', "");
            optionElement.setAttribute('disabled', "");
            element.appendChild(optionElement);
          }

          function updatePCIFieldsSettings(paymentMethod, cardNumberElement, securityCodeElement) {
            const { settings } = paymentMethod;

            const cardNumberSettings = settings[0].card_number;
            cardNumberElement.update({
              settings: cardNumberSettings
            });

            const securityCodeSettings = settings[0].security_code;
            securityCodeElement.update({
              settings: securityCodeSettings
            });
          }

          async function updateIssuer(paymentMethod, bin, issuerElement, issuerPlaceholder) {
            clearHTMLSelectChildrenFrom(issuerElement);
            createSelectElementPlaceholder(issuerElement, issuerPlaceholder);

            const issuers = await mp.getIssuers({ paymentMethodId: paymentMethod.id, bin });

            if (issuers.length > 0) {
              issuers.forEach(issuer => {
                const optionElement = document.createElement('option');
                optionElement.value = issuer.id;
                optionElement.textContent = issuer.name;
                issuerElement.appendChild(optionElement);
              });
            }
          }

          async function updateInstallments(paymentMethod, bin, installmentsElement, installmentsPlaceholder, amount) {
            clearHTMLSelectChildrenFrom(installmentsElement);
            createSelectElementPlaceholder(installmentsElement, installmentsPlaceholder);

            const installments = await mp.getInstallments({
              amount: amount.toString(),
              bin,
              paymentTypeId: 'credit_card',
              paymentMethodId: paymentMethod.id
            });

            if (installments.length > 0 && installments[0].payer_costs) {
              installments[0].payer_costs.forEach(cost => {
                const optionElement = document.createElement('option');
                optionElement.value = cost.installments;
                optionElement.textContent = `${cost.installments}x de ${cost.installment_amount} ${cost.installment_rate === 0 ? 'sem juros' : 'com juros'}`;
                installmentsElement.appendChild(optionElement);
              });
            }
          }

          setCardFieldsLoaded(true);
        } catch (error) {
          console.error("Erro ao inicializar campos do cartão:", error);
        }
      };

      initializeCardFields();

      return () => {
        const paymentMethodElement = document.getElementById('paymentMethodId');
        if (paymentMethodElement) {
          paymentMethodElement.remove();
        }
      };
    }
  }, [showCardDetails, cardFieldsLoaded, totalPrice]);



  return (
    <div className={getContainerClass()} data-payment={selectedPayment}>
      <NavbarComponent />
      <div className={styles.checkoutPage}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>
            <ShoppingBag className={styles.titleIcon} size={28} />
            Finalizar Compra
          </h1>
        </div>

        <div className={styles.checkoutContent}>
          {/* Coluna 1: Endereço */}
          <div className={styles.addressSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <MapPin size={20} />
              </div>
              <h2>Endereço de Entrega</h2>
            </div>
            <form className={styles.addressForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="cep">CEP</label>
                  <input
                    type="text"
                    id="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="city">Cidade</label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Sua cidade"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="neighborhood">Bairro</label>
                  <input
                    type="text"
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    placeholder="Seu bairro"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="street">Rua</label>
                  <input
                    type="text"
                    id="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Nome da rua"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="number">Número</label>
                  <input
                    type="text"
                    id="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="complement">Complemento</label>
                  <input
                    type="text"
                    id="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                    placeholder="Apto, Bloco, etc. (opcional)"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Coluna 2: Pagamento */}
          <div className={`${styles.paymentSection} ${!isAddressComplete ? styles.disabled : ""}`}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <CreditCard size={20} />
              </div>
              <h2>Método de Pagamento</h2>
            </div>
            <div className={styles.paymentOptions}>
              <div
                className={`${styles.paymentOption} ${selectedPayment === "pix" ? styles.selected : ""}`}
                onClick={() => isAddressComplete && handlePaymentChange("pix")}
              >
                <div className={styles.paymentOptionIcon}>
                  <img src={iconePix} alt="Pix" style={{ width: 30, height: 30 }} />
                </div>
                <div className={styles.paymentOptionText}>
                  <h3>PIX</h3>
                  <p>Pagamento instantâneo</p>
                </div>
              </div>
              <div
                className={`${styles.paymentOption} ${selectedPayment === "creditCard" ? styles.selected : ""}`}
                onClick={() => isAddressComplete && handlePaymentChange("creditCard")}
              >
                <div className={styles.paymentOptionIcon}>💳</div>
                <div className={styles.paymentOptionText}>
                  <h3>Cartão de Crédito</h3>
                  <p>Pagamento em até 12x</p>
                </div>
              </div>
            </div>
            {selectedPayment === "pix" && (
              <div className={styles.pixDetailsForm}>
                <h3>Detalhes do Pagamento PIX</h3>
                <form id="form-checkout">
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="payerFirstName">Nome</label>
                      <input id="form-checkout__payerFirstName" name="payerFirstName" type="text" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="payerLastName">Sobrenome</label>
                      <input id="form-checkout__payerLastName" name="payerLastName" type="text" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="email">E-mail</label>
                      <input id="form-checkout__email" name="email" type="text" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="identificationType">Tipo de documento</label>
                      <select
                        id="form-checkout__identificationType"
                        name="identificationType"
                        type="text"
                        onChange={e => setIdentificationType(e.target.value)}
                      >
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="identificationNumber">Número do documento</label>
                      <input
                        id="form-checkout__identificationNumber"
                        name="identificationNumber"
                        type="text"
                        value={identificationNumber}
                        onChange={handleIdentificationNumberChange}
                        placeholder={identificationType === "CNPJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                        maxLength={identificationType === "CNPJ" ? 18 : 14} />
                    </div>
                  </div>
                  <input type="hidden" name="transactionAmount" id="transactionAmount" value={totalPrice.toFixed(2)} />
                  <input type="hidden" name="description" id="description" value="Compra na Loja" />
                </form>
              </div>
            )}


            {showCardDetails && (
              <div className={`${styles.cardDetailsForm} ${styles.compactForm}`}>
                <h3>Detalhes do Cartão</h3>
                <form id="form-checkout">
                  {/* Número do Cartão */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Número do Cartão</label>
                      <div id="form-checkout__cardNumber" className={styles.cardInputContainer}></div>
                    </div>
                  </div>

                  {/* Nome no Cartão */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="form-checkout__cardholderName">Nome no Cartão</label>
                      <input
                        type="text"
                        id="form-checkout__cardholderName"
                        name="cardholderName"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        placeholder="Nome como aparece no cartão"
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {/* Data de Expiração e CVV */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Data de Validade</label>
                      <div id="form-checkout__expirationDate" className={styles.cardInputContainer}></div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Código de Segurança</label>
                      <div id="form-checkout__securityCode" className={styles.cardInputContainer}></div>
                    </div>
                  </div>

                  {/* Banco Emissor */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="form-checkout__issuer">Banco emissor</label>
                      <select
                        id="form-checkout__issuer"
                        name="issuer"
                        className={styles.input}
                      >
                        <option value="" disabled selected>Selecione o banco</option>
                      </select>
                    </div>
                  </div>

                  {/* Parcelas */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="form-checkout__installments">Parcelas</label>
                      <select
                        id="form-checkout__installments"
                        name="installments"
                        className={styles.input}
                      >
                        <option value="" disabled selected>Selecione as parcelas</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const installmentNumber = i + 1
                          const hasInterest = installmentNumber > 4
                          const totalWithInterest = hasInterest ? totalPrice * 1.05 : totalPrice
                          const installmentValue = (totalWithInterest / installmentNumber).toFixed(2)
                          return (
                            <option key={i} value={`${installmentNumber}`}>
                              {installmentNumber}x de R$ {installmentValue}
                              {!hasInterest ? " sem juros" : " com juros"}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Tipo de Documento */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="card-form-checkout__identificationType">Tipo de documento</label>
                      <select
                        id="card-form-checkout__identificationType"
                        name="identificationType"
                        className={styles.input}
                        onChange={e => setIdentificationType(e.target.value)}
                      >
                        <option value="" disabled selected>Selecione o tipo</option>
                        {identificationTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Número do Documento */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="card-form-checkout__identificationNumber">Número do documento</label>
                      <input
                        type="text"
                        id="card-form-checkout__identificationNumber"
                        name="identificationNumber"
                        value={identificationNumber}
                        onChange={handleIdentificationNumberChange}
                        placeholder={identificationType === "CNPJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                        maxLength={identificationType === "CNPJ" ? 18 : 14}
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {/* E-mail */}
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="card-form-checkout__email">E-mail</label>
                      <input
                        type="email"
                        id="card-form-checkout__email"
                        name="email"
                        placeholder="Seu e-mail"
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>

                  {/* Campos ocultos */}
                  <input type="hidden" id="transactionAmount" name="transactionAmount" value={totalPrice.toFixed(2)} />
                  <input type="hidden" id="description" name="description" value="Compra na Loja" />
                </form>
              </div>
            )}
          </div>

          {/* Coluna 3: Resumo do Pedido */}
          <div className={styles.orderSummary}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconWrapper}>
                <Truck size={20} />
              </div>
              <h2>Resumo do Pedido</h2>
            </div>

            <div className={styles.orderItems}>
              {cartItems.length > 0 ? (
                <div className={styles.itemsList}>
                  {cartItems.map((item, index) => {
                    const price = item.price || 0
                    const quantity = item.quantity || 1

                    return (
                      <div key={index} className={styles.orderItem}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>
                            {item.title || item.titulo || "Produto"} x{quantity}
                          </span>
                        </div>
                        <span className={styles.itemPrice}>R$ {(price * quantity).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className={styles.emptyCart}>Seu carrinho está vazio</p>
              )}
            </div>

            <div className={styles.orderSummaryDetails}>
              <div className={styles.summaryRow}>
                <span>
                  Subtotal ({cartItems.length} {cartItems.length === 1 ? "item" : "itens"})
                </span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Frete</span>
                <span>R$ {shippingCost.toFixed(2)}</span>
              </div>
              {selectedPayment !== "creditCard" && (
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              )}
              {selectedPayment === "creditCard" && (
                <>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total</span>
                    <span>
                      {Number(formData.installments) > 4
                        ? `R$ ${(totalPrice * 1.05).toFixed(2)}`
                        : `R$ ${totalPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.installmentRow}`}>
                    <span>Pagamento em {formData.installments}x</span>
                    <span>
                      {Number(formData.installments) > 4
                        ? `R$ ${((totalPrice * 1.05) / Number.parseInt(formData.installments)).toFixed(2)}/mês`
                        : `R$ ${(totalPrice / Number.parseInt(formData.installments)).toFixed(2)}/mês`}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className={styles.actionButtons}>
              <button type="button" className={styles.backButton} onClick={() => navigate("/carrinho")}>
                <ArrowLeft size={16} />
                Voltar
              </button>

              <button
                type="submit"
                className={`${styles.checkoutButton} ${!selectedPayment || !isAddressComplete ? styles.disabledButton : ""}`}
                disabled={!selectedPayment || !isAddressComplete || loadingPix || processingCard}
                onClick={async (event) => {
                  if (selectedPayment === "pix") {
                    setLoadingPix(true);
                    await criarPagamentoPix();
                    setLoadingPix(false);
                  } else if (selectedPayment === "creditCard") {
                    await handleCreditCardSubmit(event);
                  }
                }}
              >
                {loadingPix ? "Processando..." :
                  (selectedPayment === "creditCard" && token) ? "Pagamento em processamento..." :
                    "Finalizar Compra"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <PixQrCodeModal
        show={showPixModal}
        onClose={() => setShowPixModal(false)}
        qrCodeImage={qrCodeBase64}
        qrCodeText={qrCode}
      />
      <Footer />
      {modalMessage && (
        <MessageModal
          icon={
            modalType === "error"
              ? <img src={errorIcon} alt="Erro" style={{ width: 48, height: 48 }} />
              : <img src={successIcon} alt="Sucesso" style={{ width: 48, height: 48 }} />
          }
          message={modalMessage}
          onClose={() => setModalMessage("")}
        />
      )}

      {showSuccessModal && (
        <MessageModal
          title="Compra Concluída"
          message="Pagamento efetuado com sucesso! 
          Obrigado por sua compra!"
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/");
          }}
          showCloseButton={true}
          customButton={
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/pedidos");
              }}
              className={styles.successButton}
            >
              Ver pedidos
            </button>
          }
        />
      )}
    </div>

  )
}

export default Checkout
