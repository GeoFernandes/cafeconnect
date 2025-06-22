import axios from "axios";

async function atualizarEstoqueProduto(id: string, novoEstoque: number, outrosDadosProduto: any) {
  try {
    await axios.put(
      `https://cafeconnect-u9rh.onrender.com/update-product/${id}`,
      {
        ...outrosDadosProduto,
        quantidadeEstoque: novoEstoque,
      }
    );
    // Sucesso!
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error);
  }
}

export async function buscarProdutoPorId(id: string) {
  console.log("Buscando produto com ID:", id);
  try {
    const response = await axios.get(`https://cafeconnect-u9rh.onrender.com/product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}