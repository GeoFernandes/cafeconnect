import React from 'react';
import styles from './loadingModal.module.css';

const LoadingModal = () => {
    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.spinner}></div>
                <p>Carregando...</p>
            </div>
        </div>
    );
};

export default LoadingModal;