import axios from 'axios';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'default-secret-key';
const API_URL = 'https://cafeconnect-u9rh.onrender.com';

const encryptData = (data: string) => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

const decryptData = (encryptedData: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            throw new Error(`Erro: ${error.response.data.message || 'Erro ao fazer a requisição'}`);
        } else if (error.request) {
            throw new Error('Erro: Nenhuma resposta recebida do servidor');
        } else {
            throw new Error(`Erro: ${error.message}`);
        }
    } else {
        throw new Error('Erro desconhecido');
    }
};

export const login = async (email: string, senha: string) => {
    try {
        const encryptedEmail = encryptData(email);
        const encryptedSenha = encryptData(senha);
        const response = await axios.post(`${API_URL}/auth/login`, { email: encryptedEmail, senha: encryptedSenha });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const registro = async (
    email: string,
    nome: string,
    senha: string,
    cpf: string,
    telefone: string,
    confirmarSenha: string,
    cep: string,
    rua: string,
    estado: string,
    cidade: string,
    bairro: string,
    numero: string,
    complemento?: string
) => {
    try {
        const encryptedData = {
            email: email,
            nome: nome,
            senha: encryptData(senha),
            cpf: encryptData(cpf),
            telefone: encryptData(telefone),
            confirmarSenha: encryptData(confirmarSenha),
            endereco: {
                cep: encryptData(cep),
                rua: encryptData(rua),
                estado: encryptData(estado),
                cidade: encryptData(cidade),
                bairro: encryptData(bairro),
                numero: encryptData(numero),
                complemento: complemento ? encryptData(complemento) : ''
            }
        };

        const response = await axios.post(`${API_URL}/auth/register`, encryptedData);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getinfoUsuario = async (userId: string) => {
    try {
        // Recupere o token do localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado. Faça login novamente.');
        }

        const response = await axios.get(`${API_URL}/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const usuario = response.data.usuario;

        return {
            email: usuario.email,
            telefone: usuario.telefone,
            nome: decryptData(usuario.nome),
            endereco: {
                ...usuario.endereco,    
                cep: decryptData(usuario.endereco.cep),
                rua: decryptData(usuario.endereco.rua),
                estado: decryptData(usuario.endereco.estado),
                cidade: decryptData(usuario.endereco.cidade),
                bairro: decryptData(usuario.endereco.bairro),
                numero: decryptData(usuario.endereco.numero),
                complemento: usuario.complemento ? decryptData(usuario.complemento) : '',
            },
            senha: usuario.senha,
        };
    } catch (error) {
        handleError(error);
    }
};

export const alterarInformacoes = async (
    dadosAtualizados: Partial<{
        email: string;
        nome: string;
        senha: string;
        cpf: string;
        telefone: string;
        confirmarSenha: string;
        endereco?: {
            rua: string;
            numero: string;
            complemento?: string;
            bairro: string;
            cidade: string;
            estado: string;
            cep: string;
        };
    }>
) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado. Faça login novamente.');
        }

        // Criptografa os campos enviados
        const encryptedData: any = {};
        if (dadosAtualizados.email) encryptedData.email = dadosAtualizados.email;
        if (dadosAtualizados.nome) encryptedData.nome = dadosAtualizados.nome;
        if (dadosAtualizados.senha) encryptedData.senha = encryptData(dadosAtualizados.senha);
        if (dadosAtualizados.cpf) encryptedData.cpf = encryptData(dadosAtualizados.cpf);
        if (dadosAtualizados.telefone) encryptedData.telefone = encryptData(dadosAtualizados.telefone);
        if (dadosAtualizados.confirmarSenha) encryptedData.confirmarSenha = encryptData(dadosAtualizados.confirmarSenha);

        if (dadosAtualizados.endereco) {
            encryptedData.endereco = {
                rua: encryptData(dadosAtualizados.endereco.rua),
                numero: encryptData(dadosAtualizados.endereco.numero),
                complemento: dadosAtualizados.endereco.complemento ? encryptData(dadosAtualizados.endereco.complemento) : '',
                bairro: encryptData(dadosAtualizados.endereco.bairro),
                cidade: encryptData(dadosAtualizados.endereco.cidade),
                estado: encryptData(dadosAtualizados.endereco.estado),
                cep: encryptData(dadosAtualizados.endereco.cep),
            };
        }

        const response = await axios.put(`${API_URL}/auth/user`, encryptedData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        handleError(error);
    }
};