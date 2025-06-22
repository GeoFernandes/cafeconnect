import styles from "./requisitoSenha.module.css"

const RequisitoSenhaModal = ({ isVisible, requirements }) => {
  if (!isVisible) return null

  return (
    <div className={styles.modal}>
      <ul>
        {requirements.map((req, index) => (
          <li key={index} className={req.isValid ? styles.valid : styles.invalid}>
            {req.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RequisitoSenhaModal
