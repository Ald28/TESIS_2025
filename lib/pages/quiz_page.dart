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

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    try {
      List<Question> allQuestions = await ApiService.fetchAllQuestions();

      allQuestions = allQuestions.where((q) {
        return q.tipo == 'abierto' || q.respuestas.isNotEmpty;
      }).toList();

      allQuestions.shuffle();

      setState(() {
        quiz.questions.clear();
        quiz.questions.addAll(allQuestions.take(4));
        totalQuestions = quiz.questions.length;
      });
    } catch (e) {
      print(" Error al cargar preguntas: $e");
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFB2EBF2),
      appBar: AppBar(
        title: Text(quiz.name),
        backgroundColor: const Color(0xFFB2EBF2),
        elevation: 0,
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // Barra de progreso
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 30),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(15),
              child: LinearProgressIndicator(
                color: Colors.amber.shade900,
                value: totalQuestions > 0 ? progressIndex / totalQuestions : 0,
                minHeight: 20,
              ),
            ),
          ),
          // Pregunta y opciones
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 500),
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 25, vertical: 20),
              child: quiz.questions.isNotEmpty
                  ? Card(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            margin: const EdgeInsets.all(30),
                            child: Text(
                              quiz.questions[questionIndex].pregunta,
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                          ),
                          Flexible(
                            child: quiz.questions[questionIndex].tipo == 'abierto'
                                ? Padding(
                                    padding: const EdgeInsets.all(10),
                                    child: TextField(
                                      controller: _controller,
                                      decoration: const InputDecoration(
                                        labelText: 'Tu respuesta',
                                        border: OutlineInputBorder(),
                                      ),
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: quiz.questions[questionIndex].respuestas.length,
                                    itemBuilder: (_, index) {
                                      return Container(
                                        margin: const EdgeInsets.all(5),
                                        decoration: BoxDecoration(
                                          border: Border.all(color: Colors.green, width: 2),
                                          borderRadius: BorderRadius.circular(15),
                                        ),
                                        child: ListTile(
                                          shape: const RoundedRectangleBorder(
                                            borderRadius: BorderRadius.all(Radius.circular(15)),
                                          ),
                                          leading: Text('${index + 1}'),
                                          title: Text(quiz.questions[questionIndex].respuestas[index].texto),
                                          onTap: () {
                                            quiz.questions[questionIndex].selected =
                                                quiz.questions[questionIndex].respuestas[index].texto;
                                            _optionSelected(quiz.questions[questionIndex].respuestas[index]);
                                          },
                                        ),
                                      );
                                    },
                                  ),
                          ),
                        ],
                      ),
                    )
                  : const Center(child: CircularProgressIndicator()),
            ),
          ),
          TextButton(
            onPressed: () {
              final tipo = quiz.questions[questionIndex].tipo;
              if (tipo == 'abierto') {
                if (_controller.text.trim().isEmpty) return;

                final respuesta = Answer(
                  texto: _controller.text.trim(),
                  puntaje: 0,
                  preguntaId: quiz.questions[questionIndex].id,
                );
                quiz.questions[questionIndex].selected = _controller.text.trim();
                _controller.clear();
                _optionSelected(respuesta);
              } else {
                if (quiz.questions[questionIndex].selected == null) {
                  final respuesta = quiz.questions[questionIndex].respuestas[0];
                  quiz.questions[questionIndex].selected = respuesta.texto;
                  _optionSelected(respuesta);
                }
              }
            },
            child: Text('Siguiente', style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
