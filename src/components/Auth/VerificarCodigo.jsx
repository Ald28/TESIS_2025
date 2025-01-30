import React, { useState } from "react";
import { verificarCodigo } from "../Api/api_psicologo";
import "bootstrap/dist/css/bootstrap.min.css";

const VerificarCodigo = () => {
    const [formData, setFormData] = useState({
        email: "",
        numero_colegiatura: "",
        codigo: "",
    });

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        try {
            const response = await verificarCodigo(formData);
            setMensaje(response.mensaje || "Código verificado exitosamente.");
        } catch (err) {
            setError(err.mensaje || "Error en la verificación.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
                <h2 className="text-center text-primary mb-4">Verificar Código</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {mensaje && <div className="alert alert-success">{mensaje}</div>}
                    
                    <div className="mb-3">
                        <label className="form-label">Correo Electrónico</label>
                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Número de Colegiatura</label>
                        <input type="text" name="numero_colegiatura" className="form-control" value={formData.numero_colegiatura} onChange={handleChange} required />
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Código de Verificación</label>
                        <input type="text" name="codigo" className="form-control" value={formData.codigo} onChange={handleChange} required />
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-100">Verificar</button>
                </form>
            </div>
        </div>
    );
};

export default VerificarCodigo;
