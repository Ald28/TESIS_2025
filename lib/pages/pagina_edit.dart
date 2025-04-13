import 'package:flutter/material.dart';
import 'package:frondend/classes/question.dart';
import 'package:frondend/services/api_service.dart';

class PaginaEdit extends StatefulWidget {
  const PaginaEdit({Key? key}) : super(key: key);

  @override
  State<PaginaEdit> createState() => _PaginaEditState();
}

class _PaginaEditState extends State<PaginaEdit> {
  List<Question> preguntas = [];
  int preguntaActual = 0;
  bool isLoading = true;
  bool respuestaSeleccionada = false;

  final int numeroDePreguntas = 4; // cambio de cantidad de preguntas

  @override
  void initState() {
    super.initState();
    _cargarPreguntas();
  }

  Future<void> _cargarPreguntas() async {
    List<int> cuestionarioIds = [1, 2, 3, 4];
    List<Question> todas = [];

    try {
      for (int id in cuestionarioIds) {
        List<Question> resultado = await ApiService.fetchQuestions(id);
        todas.addAll(resultado);
      }

      todas.shuffle(); 

      setState(() {
        preguntas = todas.take(numeroDePreguntas).toList();
        isLoading = false;
      });
    } catch (e) {
      print("❌ Error al cargar preguntas: $e");
      setState(() {
        isLoading = false;
      });
    }
  }

  void _seleccionarRespuesta() {
    setState(() {
      respuestaSeleccionada = true;
    });

    Future.delayed(const Duration(milliseconds: 500), () {
      if (preguntaActual < preguntas.length - 1) {
        setState(() {
          preguntaActual += 1;
          respuestaSeleccionada = false;
        });
      } else {
        _mostrarFinal();
      }
    });
  }

  void _mostrarFinal() {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (_) => AlertDialog(
      title: const Text("¡Gracias!"),
      content: const Text("Gracias por sus respuestas."),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.pop(context); 
          },
          child: const Text("Aceptar"),
        )
      ],
    ),
  );
}



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Responde"),
        automaticallyImplyLeading: false,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : preguntas.isEmpty
              ? const Center(child: Text("No hay preguntas disponibles."))
              : Column(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      child: LinearProgressIndicator(
                        value: (preguntaActual + 1) / preguntas.length,
                        color: Colors.blueAccent,
                        backgroundColor: Colors.grey[300],
                        minHeight: 12,
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        preguntas[preguntaActual].pregunta,
                        style: Theme.of(context).textTheme.headlineSmall,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    Flexible(
                      child: ListView.builder(
                        itemCount: preguntas[preguntaActual].respuestas.length,
                        itemBuilder: (_, i) {
                          final respuesta = preguntas[preguntaActual].respuestas[i];
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(color: Colors.green, width: 2),
                            ),
                            child: ListTile(
                              title: Text(respuesta.texto),
                              onTap: respuestaSeleccionada ? null : _seleccionarRespuesta,
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
    );
  }
}
