import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:frondend/classes/question.dart';
import 'package:frondend/classes/quiz.dart';
import 'package:frondend/classes/psicologo.dart';
import 'package:frondend/classes/metodo_relajacion.dart';


class ApiService {
  static const String baseUrl = 'http://192.168.177.181:8080/api';

  //psicologo parte superior  , esto se podri usar mas adelante si ahy una api listar

  static Future<List<Psicologo>> fetchPsicologos() async {
  try {
    final response = await http.get(Uri.parse('$baseUrl/psicologo/listar_psicologos'));

    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Psicologo.fromJson(json)).toList();
    } else {
      print("Error al obtener psicólogos: ${response.statusCode}");
      return [];
    }
  } catch (e) {
    print("Excepción al obtener psicólogos: $e");
    return [];
  }
}


 ///metodo relajacion
  static Future<List<MetodoRelajacion>> fetchMetodosRelajacion() async {
  try {
    final response = await http.get(Uri.parse('$baseUrl/metodos_relajacion/listar'));

    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => MetodoRelajacion.fromJson(json)).toList();
    } else {
      print("Error al obtener métodos: ${response.statusCode}");
      return [];
    }
  } catch (e) {
    print("Excepción al obtener métodos: $e");
    return [];
  }
}

  /// Obtener preguntas por cuestionario 
  static Future<List<Question>> fetchQuestions(int preguntaId) async {
  try {
    final response = await http.get(Uri.parse('$baseUrl/pregunta/pregunta/$preguntaId'));

    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body);

      print("🔹 API devolvió ${data.length} preguntas para el cuestionario $preguntaId");

      List<Question> questions = data.map((json) => Question.fromJson(json)).toList();

      for (var question in questions) {
        question.respuestas = await fetchAnswers(question.id);
        print("✅ Pregunta: ${question.pregunta} - Respuestas obtenidas: ${question.respuestas.length}");
      }

      return questions;
    } else {
      print("Error al cargar preguntas: Código ${response.statusCode}");
      return [];
    }
  } catch (e) {
    print(" Excepción al cargar preguntas: $e");
    return [];
  }
}



  /// Obtener opciones de respuesta por pregunta
  static Future<List<Answer>> fetchAnswers(int preguntaId) async {
  try {
    final response = await http.get(Uri.parse('$baseUrl/opcion/opciones/$preguntaId'));

    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body);

      print("🔹 API devolvió ${data.length} respuestas para pregunta $preguntaId");

      List<Answer> answers = data.map((json) => Answer.fromJson(json)).toList();

      if (answers.isEmpty) {
        print("No se encontraron respuestas para la pregunta ID: $preguntaId");
      }

      return answers;
    } else {
      print("Error al cargar respuestas para pregunta $preguntaId: ${response.statusCode}");
      return [];
    }
  } catch (e) {
    print(" Excepción al cargar respuestas para pregunta $preguntaId: $e");
    return [];
  }
}



  /// Enviar respuestas del usuario
  static Future<void> sendAnswers(List<Map<String, dynamic>> respuestas) async {
    final response = await http.post(
      Uri.parse('$baseUrl/respuesta/respuesta'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"respuestas": respuestas}),
    );

    if (response.statusCode != 201) {
      throw Exception('Error al enviar respuestas');
    }
  }

  /// Obtener resultado del estudiante
  static Future<Map<String, dynamic>> fetchResult(int estudianteId, int cuestionarioId) async {
    final response = await http.get(Uri.parse('$baseUrl/resultado/resultado/$estudianteId/$cuestionarioId'));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al obtener resultado');
    }
  }

  /// Enviar resultados del usuario (quiz completo)
  static Future<void> sendResults(Quiz quiz) async {
    try {
      List<Map<String, dynamic>> respuestas = quiz.questions.map((q) {
        final selectedAnswer = q.respuestas.firstWhere(
          (r) => r.texto == q.selected, 
          orElse: () => Answer(texto: "", puntaje: 0, preguntaId: 0),
        );

        return {
          "pregunta_id": q.id, //  Asegúrate de que el ID es correcto
          "estudiante_id": 1, //  Cambia esto con el ID real del estudiante
          "opciones_id": selectedAnswer.preguntaId, //  Si esto es null, hay un error en los datos
        };
      }).toList();

      print(" Enviando respuestas: ${jsonEncode({"respuestas": respuestas})}");

      final response = await http.post(
        Uri.parse('$baseUrl/resultado/resultado'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"respuestas": respuestas}),
      );

      print(" Código de respuesta: ${response.statusCode}");
      print(" Respuesta del servidor: ${response.body}");

      if (response.statusCode != 201) {
        throw Exception('Error al enviar resultados: ${response.body}');
      }
    } catch (e) {
      print(" Error en sendResults: $e");
    }
  }

  ///  Iniciar sesión
  static Future<Map<String, dynamic>> loginOrRegister(String email, String password, String dni) async {
  final url = Uri.parse('$baseUrl/estudiante/registro_estudiante');

  try {
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "contraseña": password, "dni": dni}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      return {"error": "Error en el registro", "detalle": response.body};
    }
  } catch (error) {
    return {"error": "Error de conexión con el servidor", "detalle": error.toString()};
  }
}
///login
static Future<Map<String, dynamic>> soloLogin(String email, String password) async {
  final url = Uri.parse('$baseUrl/estudiante/login');

  try {
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "contraseña": password}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return {"error": "Credenciales incorrectas", "detalle": response.body};
    }
  } catch (error) {
    return {"error": "Error de conexión", "detalle": error.toString()};
  }
}

  /// Verificar código de autenticación
  static Future<Map<String, dynamic>> verificarCodigo(String email, String codigo) async {
    final url = Uri.parse('$baseUrl/estudiante/verificar_codigo');

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email, "codigo": codigo}),
      );

      print("Código de estado: ${response.statusCode}");
      print("Respuesta del servidor: ${response.body}");

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
        return jsonResponse;
      } else {
        return {
          "error": "Error en la verificación",
          "detalle": response.body.isNotEmpty ? response.body : "Respuesta vacía"
        };
      }
    } catch (error) {
      return {"error": "Error de conexión con el servidor", "detalle": error.toString()};
    }
  }
  
}
