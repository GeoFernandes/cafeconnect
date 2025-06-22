import React, { useState } from "react";
import styles from "./pixQrCodeModal.module.css";

const PixQrCodeModal = ({ show, onClose, qrCodeImage, qrCodeText }) => {
  const [showHash, setShowHash] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <h2>Pagamento via Pix</h2>
        <img
          src={`data:image/jpeg;base64,${qrCodeImage}`}
          alt="QR Code Pix"
          className={styles.qrCodeImage}
        />
        {!showHash ? (
          <div>
            <button
              className={styles.copyButton}
              onClick={() => setShowHash(true)}
            >
              Copia e Cola
            </button>
          </div>
        ) : (
          <div className={styles.copyPasteSection}>
            <input
              type="text"
              id="copiar"
              value={qrCodeText}
              readOnly
              className={styles.qrCodeText}
            />
            <button
              className={styles.copyButton}
              onClick={() => {
                navigator.clipboard.writeText(qrCodeText);
                setCopied(true);
                // O botão ficará desativado após copiar
              }}
              disabled={copied}
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PixQrCodeModal;