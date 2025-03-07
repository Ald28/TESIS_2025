import { useEffect, useState } from "react";
import { preguntaPorCuestionario } from "../Api/api_pregunta";
import { obtenerOpcionesPorPregunta } from "../Api/api_opcion";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";

export default function Pregunta() {
    const { id: paramId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [preguntasConOpciones, setPreguntasConOpciones] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [opcionVisible, setOpcionVisible] = useState(null);

    const [cuestionarioId, setCuestionarioId] = useState(() => {
        return paramId || localStorage.getItem("cuestionario_id") || "";
    });

    const eliminarPregunta = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) {
            try {
                await eliminarPreguntaApi(id); //Falta agregar eliminar Pregunta por ID
                setPreguntasConOpciones(preguntasConOpciones.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error al eliminar la pregunta:", error);
                setMensaje("No se pudo eliminar la pregunta.");
            }
        }
    };

    useEffect(() => {
        if (paramId) {
            setCuestionarioId(paramId);
            localStorage.setItem("cuestionario_id", paramId);
        }
    }, [paramId]);

    useEffect(() => {
        const obtenerPreguntasConOpciones = async () => {
            try {
                setMensaje("");
                const preguntas = await preguntaPorCuestionario(cuestionarioId);

                // Obtener opciones para cada pregunta
                const preguntasOpciones = await Promise.all(
                    preguntas.map(async (pregunta) => {
                        const opciones = await obtenerOpcionesPorPregunta(pregunta.id);
                        return { ...pregunta, opciones };
                    })
                );

                setPreguntasConOpciones(preguntasOpciones);
            } catch (error) {
                console.error("Error al obtener preguntas y opciones:", error);
                setMensaje("No se pudieron cargar las preguntas y opciones.");
            }
        };

        if (cuestionarioId) {
            obtenerPreguntasConOpciones();
        }
    }, [cuestionarioId]);

    const toggleOpciones = (id) => {
        setOpcionVisible(opcionVisible === id ? null : id);
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary me-3">📋 Gestionar Preguntas y Opciones</h2>
                <button className="btn btn-outline-primary" onClick={() => navigate(`/admin/cuestionarios`)}>
                    ← Volver al Cuestionario
                </button>
            </div>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <Link
                        to={`/admin/cuestionario/${cuestionarioId}`}
                        className={`nav-link ${location.pathname === `/admin/cuestionario/${cuestionarioId}` ? "active" : ""}`}
                    >
                        Preguntas y Opciones
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/admin/preguntas"
                        className={`nav-link ${location.pathname === "/admin/preguntas" ? "active" : ""}`}
                    >
                        Preguntas
                    </Link>
                </li>
            </ul>

            {mensaje && <div className="alert alert-danger">{mensaje}</div>}

            {preguntasConOpciones.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th className="text-center">Pregunta</th>
                                <th className="text-center">Tipo</th>
                                <th className="text-center">Opciones</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {preguntasConOpciones.map((pregunta) => (
                                <tr key={pregunta.id}>
                                    <td className="text-start">{pregunta.txt_pregunta}</td>
                                    <td className="text-center">
                                        <span className="badge bg-secondary">{pregunta.tipo_pregunta}</span>
                                    </td>
                                    <td className="text-end">
                                        {opcionVisible === pregunta.id && pregunta.opciones.length > 0 ? (
                                            <ul className="list-unstyled mb-0">
                                                {pregunta.opciones.map((opcion) => (
                                                    <li key={opcion.id} className="d-flex justify-content-end align-items-center">
                                                        <span className="me-2">{opcion.txt_opcion}</span>
                                                        <span className="badge bg-info">{opcion.puntaje}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-muted">Opciones ocultas</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => toggleOpciones(pregunta.id)}
                                        >
                                            {opcionVisible === pregunta.id ? "Ocultar" : "Ver"}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => navigate(`/admin/preguntas/editar/${pregunta.id}`)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => eliminarPregunta(pregunta.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-muted">No hay preguntas disponibles.</p>
            )}

        </div>
    );
}
