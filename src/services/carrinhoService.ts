import axios from 'axios';

// Criação de uma instância do Axios com a URL base
const api = axios.create({
    baseURL: 'https://cafeconnect-u9rh.onrender.com/carrinho',
});

// Função utilitária para obter o token e configurar os cabeçalhos
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Token não encontrado');
    }
    return {
        Authorization: `Bearer ${token}`,
    };
};

/**
 * Busca os dados do carrinho do usuário autenticado.
 * @returns Os dados do carrinho.
 */
export const fetchCart = async () => {
    try {
        const response = await api.get('/', {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o carrinho:', error);
        throw error;
    }
};

/**
 * Adiciona um produto ao carrinho do usuário autenticado.
 * @param idProduto ID do produto a ser adicionado.
 * @param quantidade Quantidade do produto.
 * @returns Resposta da API.
 */
export const addProductToCart = async (idProduto: string, quantidade: number) => {
    try {
        const response = await api.post(
            '/adicionar',
            { idProduto, quantidade },
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error);
        throw error;
    }
};

/**
 * Remove um produto do carrinho do usuário autenticado.
 * @param idProduto ID do produto a ser removido.
 * @returns Resposta da API.
 */
export const removeProductFromCart = async (idProduto: string) => {
    try {
        const response = await api.delete('/remover', {
            headers: getAuthHeaders(),
            data: { idProduto }, // O corpo da requisição DELETE
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao remover produto do carrinho:', error);
        throw error;
    }
};

/**
 * Atualiza a quantidade de um produto no carrinho do usuário autenticado.
 * @param produtoId ID do produto a ser atualizado.
 * @param quantidade Nova quantidade do produto.
 * @returns Resposta da API.
 */
export const updateCartItemQuantityChange = async (itemsArray: {produtoId: string, quantidade: number}[], userId: string) => {
    try {
        const response = await api.put(
            `/atualizar/${userId}`,
             { itemsArray } ,
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar quantidade do produto no carrinho:', error);
        throw error;
    }
};