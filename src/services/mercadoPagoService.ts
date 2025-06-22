function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function criarOrderPix({
  totalAmount,
  externalReference,
  payerEmail,
  idempotencyKey,
  accessToken,
  expirationTime = "P3Y6M4DT12H30M5S"
}: {
  totalAmount: string,
  externalReference: string,
  payerEmail: string,
  idempotencyKey: string,
  accessToken: string,
  expirationTime: string
}) {
  const url = "https://api.mercadopago.com/v1/orders";
  const body = {
    type: "online",
    total_amount: totalAmount,
    external_reference: externalReference,
    processing_mode: "automatic",
    transactions: {
      payments: [
        {
          amount: totalAmount,
          payment_method: {
            id: "pix",
            type: "bank_transfer"
          },
          expiration_time: expirationTime
        }
      ]
    },
    payer: {
      email: payerEmail
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": idempotencyKey || generateUUIDv4()
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao criar order Pix");
  }

  return response.json();
}