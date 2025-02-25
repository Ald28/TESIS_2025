import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verificarCodigo } from "../Api/api_psicologo";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const VerificarCodigo = ({ onClose }) => {
    const [formData, setFormData] = useState({
        email: "",
        numero_colegiatura: "",
        codigo: "",
    });
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await verificarCodigo(formData);
            Swal.fire({
                title: "Cuenta Activada",
                text: "Tu cuenta ha sido activada correctamente.",
                icon: "success",
                confirmButtonText: "Aceptar"
            }).then(() => {
                navigate("/");
            });
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: err.mensaje || "Código incorrecto. Intenta nuevamente.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
                <h2 className="text-center text-primary mb-4">Verificar Código</h2>
                <form onSubmit={handleSubmit}>
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
