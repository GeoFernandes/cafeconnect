import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/loginService';
import Footer from '../footer';
import NavbarComponent from '../navbar/navbar';
import LoadingModal from '../shared/loadingModal/loadingModal';
import styles from './login.module.css';
import { useAuth } from '../../authenticate/authContext';
import MessageModal from '../shared/messageModal/messageModal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login: loginContext } = useAuth();
    const navigate = useNavigate();

    const validateFields = () => {
        const errors = {};
        return errors;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setIsLoading(true);
        try {
            const data = await login(email, password);
            if (data?.token) {
                localStorage.setItem("token", data.token);
                loginContext(data.token);
                navigate('/produtos');
            } else {
                setError("Erro ao autenticar. Tente novamente.");
            }
        } catch (error) {
            setError('Nome de usuário ou senha incorretos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <NavbarComponent />
            <div className={styles.contentWrap}>
                <div className={styles.loginPage}>
                    <div className={styles.form}>
                        <div>
                            <h2 className={styles.welcomeMessage}>Seja Bem-vindo(a)!</h2>
                            <form className={styles.loginForm} onSubmit={handleLogin}>
                                <input
                                    type="email"
                                    placeholder="E-mail"
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {fieldErrors.email && <p className={styles.error}>{fieldErrors.email}</p>}
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {fieldErrors.password && <p className={styles.error}>{fieldErrors.password}</p>}
                                <p className={styles.forgotPassword}>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/recuperar-senha')}
                                        className={styles.forgotPasswordButton}
                                    >
                                        Esqueceu a senha?
                                    </button>
                                </p>
                                <button type="submit" className={styles.button}>Login</button>
                                <p className={styles.message}>
                                    Não tem uma conta? <button onClick={() => navigate('/cadastro')} className={styles.linkButton}>Cadastre-se</button>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
                <Footer />
                {isLoading && <LoadingModal />}
                {error && (
                    <MessageModal
                        message={error}
                        onClose={() => setError("")}
                    />
                )}
            </div>
        </div>
    );
};

export default Login;