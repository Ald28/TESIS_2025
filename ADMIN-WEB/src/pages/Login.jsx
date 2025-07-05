import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Container, Alert, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { login as loginAPI } from "../api/api_admin";
import { FaUserShield } from "react-icons/fa";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!correo || !contrasena) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        try {
            const data = await loginAPI(correo, contrasena);
            login(data.token);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Credenciales incorrectas o error de servidor.");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                backgroundColor: "#111827",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div className="d-flex justify-content-center align-items-center w-100" style={{ maxWidth: "420px" }}>
                <Card
                    style={{
                        width: "100%",
                        padding: "2rem",
                        border: "none",
                        borderRadius: "1rem",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                        backgroundColor: "#ffffff",
                    }}
                >
                    <div className="text-center mb-4">
                        <FaUserShield size={40} className="text-primary mb-2" />
                        <h3 className="fw-bold text-dark">Panel de Administrador</h3>
                        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                            Accede con tus credenciales
                        </p>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-dark">Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="correo"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-dark">Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100">
                            Ingresar
                        </Button>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default Login;