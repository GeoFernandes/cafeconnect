import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [stock, setStock] = useState({
        '3 Corações Café Torrado E Moído Extraforte Pacote 500G': 10,
        'Café União Tradicional Torrado E Moído 500g': 5,
        'Café Melitta Tradicional Torrado E Moído 500g': 0,
        'Café Melitta Extraforte Torrado E Moído 500g': 8,
    });

    const addToCart = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.title === item.title);

        if (existingItem) {
            setCartItems(prevItems =>
                prevItems.map(cartItem =>
                    cartItem.title === item.title
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            );
        } else {
            setCartItems(prevItems => [...prevItems, { ...item, quantity: 1 }]);
        }

        setStock(prevStock => ({
            ...prevStock,
            [item.title]: prevStock[item.title] > 0 ? prevStock[item.title] - 1 : 0,
        }));
    };

    const updateCartItemQuantity = (produtoId, novaQuantidade) => {
        setCartItems(prev =>
          prev.map(item =>
            item.id === produtoId ? { ...item, quantity: novaQuantidade } : item
          )
        );
    };

    const calculateTotal = (shippingCost = 15.0) => {
        const subtotal = cartItems.reduce((total, item) => {
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
        return subtotal + shippingCost;
    };

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            setCartItems, 
            addToCart, 
            stock,
            calculateTotal,
            updateCartItemQuantity
        }}>
            {children}
        </CartContext.Provider>
    );
};