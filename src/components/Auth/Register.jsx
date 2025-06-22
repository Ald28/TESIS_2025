import React, { useState } from "react";
import VerificarCodigo from "./VerificarCodigo";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
const loginImage = new URL("../../assets/images/doctor-register.jpg", import.meta.url).href;
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

    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validarFormulario = () => {
        if (!formData.nombre || !formData.apellido_paterno || !formData.apellido_materno ||
            !formData.email || !formData.telefono || !formData.contraseña) {
            Swal.fire({
                title: "Error",
                text: "Todos los campos son obligatorios.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            Swal.fire({
                title: "Error",
                text: "El correo electrónico no es válido.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
        if (formData.telefono.length < 9 || isNaN(Number(formData.telefono))) {
            Swal.fire({
                title: "Error",
                text: "El teléfono debe contener al menos 9 dígitos numéricos.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
        if (formData.contraseña.length < 6) {
            Swal.fire({
                title: "Error",
                text: "La contraseña debe tener al menos 6 caracteres.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        try {
            await registroPsicologo(formData);
            Swal.fire({
                title: "Registro Exitoso",
                text: "Verifica tu código en el correo.",
                icon: "success",
                confirmButtonText: "Aceptar"
            }).then(() => setShowModal(true));
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: err.message || "Error en el registro.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    };

    return (
        <div className="auth-container d-flex justify-content-center align-items-center" style={{ minHeight: "90vh", backgroundColor: "#ffffff" }}>
            <div className="card p-4" style={{ maxWidth: "900px", width: "100%", borderRadius: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
                <div className="row g-0">

                    <div className="col-md-5 d-none d-md-flex align-items-center justify-content-center p-3">
                        <img
                            src={loginImage}
                            alt="Registro"
                            style={{ maxWidth: "100%", height: "auto", borderRadius: "15px" }}
                        />
                    </div>

                    <div className="col-md-7 d-flex flex-column justify-content-center p-4">
                        <h2 className="text-center mb-4" style={{ color: "#6c63ff", fontWeight: "700" }}>Registro</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <input type="text" name="nombre" className="form-control" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="apellido_paterno" className="form-control" placeholder="Apellido Paterno" value={formData.apellido_paterno} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="apellido_materno" className="form-control" placeholder="Apellido Materno" value={formData.apellido_materno} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <input type="email" name="email" className="form-control" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <input type="text" name="telefono" className="form-control" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <input type="password" name="contraseña" className="form-control" placeholder="Contraseña" value={formData.contraseña} onChange={handleChange} required />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 mt-4" style={{ backgroundColor: "#6c63ff", border: "none" }}>
                                Registrarse
                            </button>

                            <div className="text-center mt-3">
                                ¿Ya tienes cuenta? <a href="/" style={{ color: "#6c63ff", fontWeight: "bold" }}>Inicia sesión</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ maxHeight: "680px", width: "100%" }}>
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
                                <VerificarCodigo onClose={() => setShowModal(false)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
