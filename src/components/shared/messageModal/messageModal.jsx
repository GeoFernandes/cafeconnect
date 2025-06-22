import React from 'react';
import styles from './messageModal.module.css';

// eslint-disable-next-line react/prop-types
const MessageModal = ({ icon, message, onClose, customButton }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <span>{icon}</span>
                <div className={styles.messageContainer}>
                    <p>{message}</p>
                </div>
                {customButton && (
                    <div className={styles.customButtonContainer}>
                        {customButton}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageModal;