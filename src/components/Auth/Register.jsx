import React, { useState } from "react";
import { registroPsicologo } from "../Api/api_psicologo"; // Importa la función de la API
import VerificarCodigo from "./VerificarCodigo"; // Importa el modal de verificación
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

const Register = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        email: "",
        telefono: "",
        contraseña: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Validaciones básicas del formulario
    const validarFormulario = () => {
        if (!formData.nombre || !formData.apellido_paterno || !formData.apellido_materno ||
            !formData.email || !formData.telefono || !formData.contraseña) {
            setError("Todos los campos son obligatorios.");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("El correo electrónico no es válido.");
            return false;
        }
        if (formData.telefono.length < 9 || isNaN(Number(formData.telefono))) {
            setError("El teléfono debe contener al menos 9 dígitos numéricos.");
            return false;
        }
        if (formData.contraseña.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        try {
            const response = await registroPsicologo(formData);
            setSuccess("Registro exitoso. Verifica tu código.");
            setError("");
            setShowModal(true);
        } catch (err) {
            setError(err.message || "Error en el registro.");
        }
    };

    return (
        <div className="auth-container d-flex justify-content-center align-items-center vh-10">
            <div className="card shadow-lg p-4" style={{ maxWidth: "1000px", width: "100%" }}>
                <h2 className="text-center text-primary mb-4">Registro de Doctor</h2>
                <div className="row g-4">
                    <div className="col-md-6 d-flex justify-content-center align-items-center">
                        <img
                            src="/src/assets/images/doctor-register.jpg"
                            alt="Registro"
                            className="img-fluid rounded"
                            style={{ height: "500px", objectFit: "cover" }}
                        />
                    </div>
                    <div className="col-md-6">
                        <form onSubmit={handleSubmit}>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            <img
                                src="/src/assets/images/icon.png"
                                alt="Icono"
                                style={{
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginBottom: "10px",
                                }}
                            />
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Apellido Paterno</label>
                                    <input type="text" name="apellido_paterno" className="form-control" value={formData.apellido_paterno} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Apellido Materno</label>
                                    <input type="text" name="apellido_materno" className="form-control" value={formData.apellido_materno} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Teléfono</label>
                                    <input type="text" name="telefono" className="form-control" value={formData.telefono} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Contraseña</label>
                                    <input type="password" name="contraseña" className="form-control" value={formData.contraseña} onChange={handleChange} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 mt-4">Registrarse</button>
                            <div className="text-center mt-3">
                                <a href="/">Ingresar</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ maxHeight: "680px", width: "4000px" }}>
                            <div className="modal-header">
                                <h5 className="modal-title">Verificación de Código</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                marginTop: "-130px"
                            }}>
                                <VerificarCodigo />
                            </div>


                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Register;
