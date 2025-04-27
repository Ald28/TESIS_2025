import React, { useState, useEffect } from 'react';
import { subirMetodoRelajacion } from '../Api/api_metodos';
import axios from 'axios';

const Metodos = () => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria_id, setCategoriaId] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [categorias, setCategorias] = useState([]);

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const psicologo_id = usuario?.psicologo_id;


    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/categorias/listar');
                setCategorias(response.data);
            } catch (error) {
                console.error('Error al cargar las categorías:', error);
                setMensaje('Error al cargar las categorías');
            }
        };

        obtenerCategorias();
    }, []);

    const manejarSubmit = async (e) => {
        e.preventDefault();

        if (!titulo || !descripcion || !psicologo_id || !categoria_id || !archivo) {
            setMensaje('Por favor, complete todos los campos.');
            return;
        }

        try {
            await subirMetodoRelajacion(titulo, descripcion, psicologo_id, categoria_id, archivo);
            setMensaje('Método de relajación subido con éxito.');

            setTitulo('');
            setDescripcion('');
            setCategoriaId('');
            setArchivo(null);
        } catch (error) {
            setMensaje('Error al subir el método de relajación.');
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Subir Método de Relajación</h2>

            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            <form onSubmit={manejarSubmit}>
                <div className="mb-3">
                    <label htmlFor="titulo" className="form-label">Título</label>
                    <input
                        type="text"
                        className="form-control"
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                        className="form-control"
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label htmlFor="categoria_id" className="form-label">Categoría</label>
                    <select
                        className="form-control"
                        id="categoria_id"
                        value={categoria_id}
                        onChange={(e) => setCategoriaId(e.target.value)}
                    >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="archivo" className="form-label">Archivo</label>
                    <input
                        type="file"
                        className="form-control"
                        id="archivo"
                        onChange={(e) => setArchivo(e.target.files[0])}
                    />
                </div>

                <button type="submit" className="btn btn-primary">Subir Método</button>
            </form>
        </div>
    );
};

export default Metodos;
