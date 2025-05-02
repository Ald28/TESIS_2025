import 'package:flutter/material.dart';
import 'package:frondend/classes/question.dart';
import 'package:frondend/classes/quiz.dart';
import 'package:frondend/services/api_service.dart';
import 'package:frondend/pages/navigation_screen.dart';

class QuizPage extends StatefulWidget {
  const QuizPage({super.key});

  @override
  State<QuizPage> createState() => _QuizPageState();
}

class _QuizPageState extends State<QuizPage> {
  int totalQuestions = 4;
  int questionIndex = 0;
  int progressIndex = 0;
  Quiz quiz = Quiz(name: "Preguntas", questions: []);
  TextEditingController _controller = TextEditingController();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    try {
      setState(() {
        _isLoading = true;
      });
      
      List<Question> allQuestions = await ApiService.fetchAllQuestions();

      allQuestions = allQuestions.where((q) {
        return q.tipo == 'abierto' || q.respuestas.isNotEmpty;
      }).toList();

      allQuestions.shuffle();

      setState(() {
        quiz.questions.clear();
        quiz.questions.addAll(allQuestions.take(4));
        totalQuestions = quiz.questions.length;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print("Error al cargar preguntas: $e");
    }
  }

  void _optionSelected(Answer selected) {
    quiz.questions[questionIndex].selected = selected.texto;
    bool isCorrect = selected.puntaje > 0;

    if (isCorrect) {
      quiz.questions[questionIndex].correct = true;
      quiz.right += selected.puntaje;
    }

    progressIndex += 1;

    if (questionIndex < totalQuestions - 1) {
      setState(() {
        questionIndex += 1;
        _controller.clear();
      });
    } else {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) => const NavigationScreen(paginaInicial: 0),
        ),
        (route) => false,
      );
    }
  }
  
  void _nextQuestion() {
    final tipo = quiz.questions[questionIndex].tipo;
    if (tipo == 'abierto') {
      if (_controller.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Por favor, escribe tu respuesta'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 2),
          ),
        );
        return;
      }

      final respuesta = Answer(
        texto: _controller.text.trim(),
        puntaje: 0,
        preguntaId: quiz.questions[questionIndex].id,
      );
      quiz.questions[questionIndex].selected = _controller.text.trim();
      _optionSelected(respuesta);
    } else {
      if (quiz.questions[questionIndex].selected == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Por favor, selecciona una respuesta'),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Colores principales
    final Color backgroundColor = const Color(0xFFB2EBF2);
    final Color cardColor = Colors.white;
    final Color progressColor = const Color(0xFF00838F); // Color turquesa oscuro que combina con el fondo
    final Color accentColor = const Color(0xFF00ACC1); // Color de acento
    
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: Text(
          quiz.name,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        backgroundColor: backgroundColor,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : Column(
              children: [
                // Contador de preguntas
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: accentColor,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${questionIndex + 1}/$totalQuestions',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Barra de progreso
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 25),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: LinearProgressIndicator(
                      backgroundColor: Colors.grey.shade200,
                      color: progressColor,
                      value: totalQuestions > 0 ? progressIndex / totalQuestions : 0,
                      minHeight: 10,
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Contenido de la pregunta
                Expanded(
                  child: quiz.questions.isNotEmpty
                      ? Container(
                          margin: const EdgeInsets.symmetric(horizontal: 25),
                          decoration: BoxDecoration(
                            color: cardColor,
                            borderRadius: BorderRadius.circular(25),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(25),
                            child: Column(
                              children: [
                                // Área de la pregunta
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: accentColor.withOpacity(0.1),
                                    border: Border(
                                      bottom: BorderSide(
                                        color: Colors.grey.shade200,
                                        width: 1,
                                      ),
                                    ),
                                  ),
                                  child: Text(
                                    quiz.questions[questionIndex].pregunta,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                                
                                // Respuestas
                                Expanded(
                                  child: quiz.questions[questionIndex].tipo == 'abierto'
                                      ? Padding(
                                          padding: const EdgeInsets.all(20),
                                          child: Column(
                                            children: [
                                              TextField(
                                                controller: _controller,
                                                decoration: InputDecoration(
                                                  labelText: 'Tu respuesta',
                                                  border: OutlineInputBorder(
                                                    borderRadius: BorderRadius.circular(15),
                                                  ),
                                                  focusedBorder: OutlineInputBorder(
                                                    borderRadius: BorderRadius.circular(15),
                                                    borderSide: BorderSide(color: accentColor, width: 2),
                                                  ),
                                                  fillColor: Colors.grey.shade50,
                                                  filled: true,
                                                ),
                                                maxLines: 5,
                                              ),
                                            ],
                                          ),
                                        )
                                      : ListView.builder(
                                          padding: const EdgeInsets.symmetric(vertical: 10),
                                          itemCount: quiz.questions[questionIndex].respuestas.length,
                                          itemBuilder: (_, index) {
                                            final respuesta = quiz.questions[questionIndex].respuestas[index];
                                            final isSelected = quiz.questions[questionIndex].selected == respuesta.texto;
                                            
                                            return Container(
                                              margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 6),
                                              child: InkWell(
                                                onTap: () {
                                                  quiz.questions[questionIndex].selected = respuesta.texto;
                                                  _optionSelected(respuesta);
                                                },
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                                                  decoration: BoxDecoration(
                                                    color: isSelected ? accentColor.withOpacity(0.2) : Colors.white,
                                                    borderRadius: BorderRadius.circular(15),
                                                    border: Border.all(
                                                      color: isSelected ? accentColor : Colors.grey.shade300,
                                                      width: 2,
                                                    ),
                                                    boxShadow: isSelected
                                                        ? [
                                                            BoxShadow(
                                                              color: accentColor.withOpacity(0.2),
                                                              blurRadius: 8,
                                                              offset: const Offset(0, 2),
                                                            ),
                                                          ]
                                                        : null,
                                                  ),
                                                  child: Row(
                                                    children: [
                                                      Container(
                                                        width: 30,
                                                        height: 30,
                                                        decoration: BoxDecoration(
                                                          color: isSelected ? accentColor : Colors.grey.shade100,
                                                          shape: BoxShape.circle,
                                                        ),
                                                        child: Center(
                                                          child: Text(
                                                            '${index + 1}',
                                                            style: TextStyle(
                                                              fontWeight: FontWeight.bold,
                                                              color: isSelected ? Colors.white : Colors.black54,
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                      const SizedBox(width: 15),
                                                      Expanded(
                                                        child: Text(
                                                          respuesta.texto,
                                                          style: TextStyle(
                                                            fontSize: 16,
                                                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                                            color: isSelected ? accentColor : Colors.black87,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : const Center(
                          child: Text(
                            'No hay preguntas disponibles',
                            style: TextStyle(fontSize: 18),
                          ),
                        ),
                ),
                
                // Botón para continuar
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 25),
                  child: quiz.questions[questionIndex].tipo == 'abierto'
                      ? ElevatedButton(
                          onPressed: _nextQuestion,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: progressColor,
                            foregroundColor: Colors.white,
                            elevation: 3,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                            minimumSize: const Size(double.infinity, 55),
                          ),
                          child: const Text(
                            'Continuar',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        )
                      : const SizedBox.shrink(), 
                ),
              ],
            ),
    );
  }
}