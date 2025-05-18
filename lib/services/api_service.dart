import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:frondend/classes/question.dart';
import 'package:frondend/classes/quiz.dart';
import 'package:frondend/classes/psicologo.dart';
import 'package:frondend/classes/estudiante.dart';
import 'package:frondend/classes/disponibilidad.dart';
import 'package:frondend/classes/metodo_relajacion.dart';


class ApiService {
  static const String baseUrl = 'http://192.168.177.181:8080/api';

  /// Listar favoritos
static Future<List<MetodoRelajacion>> fetchFavoritos(int estudianteId) async {
  try {
    final response = await http.get(Uri.parse('$baseUrl/favorito/listar/$estudianteId'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<MetodoRelajacion>.from(
        data.map((json) => MetodoRelajacion.fromJson(json)),
      );
    } else {
      return [];
    }
  } catch (e) {
    print("Error al obtener favoritos: $e");
    return [];
  }
}


/// Agregar favorito
static Future<void> agregarFavorito(int estudianteId, int metodoId) async {
  await http.post(
    Uri.parse('$baseUrl/favorito/agregar'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({"estudiante_id": estudianteId, "metodo_id": metodoId}),
  );
}

/// Eliminar favorito
static Future<void> eliminarFavorito(int estudianteId, int metodoId) async {
  await http.delete(
    Uri.parse('$baseUrl/favorito/eliminar'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({"estudiante_id": estudianteId, "metodo_id": metodoId}),
  );
}

///cahtbot
static Future<String> enviarMensajeAlChatbot(String mensaje) async {
    final url = Uri.parse('http://192.168.177.181:8080/api/chat-estudiante');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'mensaje': mensaje}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['respuesta'];
      } else {
        throw Exception('Error del servidor: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('❌ Error al conectar con el chatbot: $e');
    }
  }



  ///perfil usuario:
  static Future<Estudiante?> fetchPerfilEstudiante(int usuarioId) async {
  try {
    final response = await http.get(Uri.parse('http://192.168.177.181:8080/auth/perfil?usuario_id=$usuarioId'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final estudiante = Estudiante.fromJson(data['datos'][0]);
      return estudiante;
    } else {
      print("Error al obtener perfil: ${response.statusCode}");
      return null;
    }
  } catch (e) {
    print("Excepción al obtener perfil: $e");
    return null;
  }
}

///canelar cita
static Future<void> cancelarCita({
  required int citaId,
  required int estudianteId,
  required String token,
}) async {
  final response = await http.put(
    Uri.parse('http://192.168.177.181:8080/auth/cancelar-cita'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'cita_id': citaId,
      'estudiante_id': estudianteId,
    }),
  );

  if (response.statusCode != 200) {
    throw Exception("Error al cancelar cita: ${response.body}");
  }
}
///finalizadas

static Future<List<Map<String, dynamic>>> fetchCitasFinalizadas(int estudianteId) async {
  final response = await http.get(
    Uri.parse('http://192.168.177.181:8080/auth/historial-canceladas/$estudianteId'),
  );

  if (response.statusCode == 200) {
    return List<Map<String, dynamic>>.from(jsonDecode(response.body));
  } else {
    throw Exception("❌ Error al obtener historial de citas");
  }
}

/// Obtener citas activas por token
static Future<List<Map<String, dynamic>>> fetchCitasActivas(String token) async {
  final response = await http.get(
    Uri.parse('http://192.168.177.181:8080/auth/citas-activas'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    print("📅 Citas activas:");
    for (var cita in data['citas']) {
      print("- ${cita['estado']} con ${cita['psicologo_nombre']} el ${cita['fecha_inicio']}");
    }
    return List<Map<String, dynamic>>.from(data['citas']);
  } else {
    throw Exception("❌ Error al obtener citas activas: ${response.body}");
  }
}
///horas ocupadas

static Future<List<Map<String, dynamic>>> fetchHorasOcupadas(int psicologoId, DateTime fecha, String token) async {
  final fechaStr = fecha.toIso8601String().substring(0, 10);
  final response = await http.get(
    Uri.parse('http://192.168.177.181:8080/auth/psicologo/horas-ocupadas/$psicologoId/$fechaStr'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return List<Map<String, dynamic>>.from(data['horas']);
  } else {
    throw Exception('Error al obtener las horas ocupadas');
  }
}


////disponibilidad  para citas
  static Future<List<Disponibilidad>> fetchDisponibilidad(int psicologoId) async {
  final response = await http.get(
    Uri.parse('http://192.168.177.181:8080/auth/disponibilidad/$psicologoId'),
  );

  if (response.statusCode == 200) {
    final decoded = jsonDecode(response.body);
    List<dynamic> data = decoded['disponibilidad']; 
    return data.map((d) => Disponibilidad.fromJson(d)).toList();
  } else {
    throw Exception('Error al obtener disponibilidad');
  }
}

static Future<void> crearCita({
  required DateTime fecha, 
  required String horaInicio,
  required String horaFin,
  required int psicologoId,
  required int estudianteId,
  required String token,
}) async {
  final response = await http.post(
    Uri.parse('http://192.168.177.181:8080/auth/cita'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: json.encode({
      'fecha': fecha.toIso8601String().substring(0, 10), 
      'hora_inicio': horaInicio, 
      'hora_fin': horaFin,
      'psicologo_id': psicologoId,
      'estudiante_id': estudianteId,
    }),
  );

  if (response.statusCode != 201) {
    throw Exception('❌ Error al crear la cita: ${response.body}');
  }
}

  //Listar psicologo parte superior

  static Future<List<Psicologo>> fetchPsicologos() async {
    try {
      final response = await http.get(Uri.parse('http://192.168.177.181:8080/auth/psicologo/listar-psicologo'));   ///esto tambien es una alternativa 
                                                                                                        /// ya que tengo mi base url con 1..../api
                                                                                                        /// pero este es con auth
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
  static Future<List<MetodoRelajacion>> fetchMetodosRecomendados() async {
  try {
    final response = await http.get(Uri.parse('$baseUrl/recomendados'));
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final data = body['metodos']; 
      return (data as List)
          .map((json) => MetodoRelajacion.fromJson(json))
          .toList();
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
}

static Future<List<MetodoRelajacion>> fetchMetodosPrivados(int estudianteId) async {
  try {
    final response = await http.get(Uri.parse('$baseUrl/privados/$estudianteId'));
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      final data = body['metodos']; // ✅ accede al array interno
      return (data as List)
          .map((json) => MetodoRelajacion.fromJson(json))
          .toList();
    } else {
      return [];
    }
  } catch (e) {
    return [];
  }
}

  /// Obtener preguntas por cuestionario 
    static Future<List<Question>> fetchAllQuestions() async {
    final response = await http.get(Uri.parse('$baseUrl/listar-preguntas-opciones'));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      // Asumiendo que el JSON tiene una clave 'preguntas'
      List<dynamic> rawQuestions = data['preguntas'];

      List<Question> questions = rawQuestions.map((json) {
        final q = Question.fromJson(json);

        if (json['opciones'] != null) {
          q.respuestas = List<Answer>.from(
            json['opciones'].map((opt) => Answer.fromJson(opt)),
          );
        }

        return q;
      }).toList();

      return questions;
    } else {
      throw Exception('Error al cargar preguntas: Código ${response.statusCode}');
    }
  }

  /// Enviar resultados del usuario (quiz completo)
  static Future<void> sendResults(Quiz quiz) async {
    try {
      List<Map<String, dynamic>> respuestas = quiz.questions.map((q) {
        final selectedAnswer = q.tipo == 'abierto'
            ? Answer(
                texto: q.selected ?? "",
                puntaje: 0,
                preguntaId: q.id,
              )
            : q.respuestas.firstWhere(
                (r) => r.texto == q.selected,
                orElse: () => Answer(texto: "", puntaje: 0, preguntaId: q.id),
              );

        return {
          "pregunta_id": q.id,
          "estudiante_id": 1,
          "opciones_id": q.tipo == 'abierto' ? null : selectedAnswer.preguntaId,
          "respuesta_texto": q.tipo == 'abierto' ? selectedAnswer.texto : null,
        };
      }).toList();

      final response = await http.post(
        Uri.parse('$baseUrl/resultado/resultado'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"respuestas": respuestas}),
      );

      if (response.statusCode != 201) {
        throw Exception('Error al enviar resultados');
      }
    } catch (e) {
      throw Exception("Error al enviar respuestas: $e");
    }
  }
  
  /// Iniciar sesión con Google
static Future<Map<String, dynamic>> loginConGoogle(String credential) async {
  final url = Uri.parse('http://192.168.177.181:8080/auth/google/estudiante');

  try {
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"credential": credential}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      return {"error": "Error en el login", "detalle": response.body};
    }
  } catch (error) {
    return {"error": "Error de conexión con el servidor", "detalle": error.toString()};
  }
}
/// Obtener perfil con token (si lo separas)
static Future<Map<String, dynamic>> obtenerPerfilConToken(String token) async {
  final url = Uri.parse('http://192.168.177.181:8080/auth/perfil');

  try {
    final response = await http.get(
      url,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return {"error": "Error al obtener perfil", "detalle": response.body};
    }
  } catch (error) {
    return {"error": "Error de conexión", "detalle": error.toString()};
  }
}
  
}
