import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:frondend/classes/question.dart';
import 'package:frondend/classes/quiz.dart';
import 'package:frondend/classes/psicologo.dart';
import 'package:frondend/classes/estudiante.dart';
import 'package:frondend/classes/disponibilidad.dart';
import 'package:frondend/classes/metodo_relajacion.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io';
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';
import 'package:frondend/classes/notificacion_model.dart';
import 'package:firebase_messaging/firebase_messaging.dart';




class ApiService {
  static const String baseUrl = 'http://192.168.177.181:8080';////cambiar qui para todo y tambien en el login buscar lo de pi


///notificaciones
static Future<List<Notificacion>> listarNotificacionesGuardadas() async {
  print("⏳ Iniciando llamada a listarNotificacionesGuardadas");

  final prefs = await SharedPreferences.getInstance();
  final usuarioId = prefs.getInt('usuario_id');
  final token = prefs.getString('token');

  if (usuarioId == null || token == null) {
    throw Exception("No se encontró usuario_id o token");
  }

  final response = await http.get(
    Uri.parse('$baseUrl/api/notificaciones/listar/$usuarioId'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    print("✅ Notificaciones recibidas: ${response.body}");

    final data = json.decode(response.body);
    final List<dynamic> lista = data['notificaciones'];
    return lista.map((n) => Notificacion.fromJson(n)).toList();
  } else {
    print("⚠️ Código: ${response.statusCode}");
  print("⚠️ Cuerpo: ${response.body}");
    throw Exception('Error al obtener notificaciones');
  }
}

static Future<void> eliminarNotificacion(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/api/notificaciones/eliminar/$id'));
    if (response.statusCode != 200) {
      throw Exception('Error al eliminar notificación');
    }
  }

Future<void> obtenerYGuardarFCMTokenDesdeStorage() async {
  final prefs = await SharedPreferences.getInstance();
  final usuarioId = prefs.getInt('usuario_id');
  final tokenJWT = prefs.getString('token');

  if (usuarioId == null || tokenJWT == null) {
    print(" No se encontró usuario_id o token en SharedPreferences");
    return;
  }

  String? tokenFCM = await FirebaseMessaging.instance.getToken();

  if (tokenFCM != null) {
    final response = await http.post(
      Uri.parse('$baseUrl/api/notificaciones/guardar-token-fcm'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $tokenJWT',
      },
      body: json.encode({
        'usuario_id': usuarioId,
        'token': tokenFCM,
        'plataforma': 'android',
      }),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      print("Token FCM guardado en backend");
    } else {
      print("Error al guardar token FCM: ${response.body}");
    }
  }
}


///cahtbot
static Future<String> enviarMensajeAlChatbot(String mensaje) async {
    final url = Uri.parse('$baseUrl/api/chat-estudiante');
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
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final url = '$baseUrl/auth/perfil?usuario_id=$usuarioId';

    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return Estudiante.fromJson(data['estudiante']);
    }

    return null;
  } catch (_) {
    return null;
  }
}
///editar perfil
static Future<bool> editarPerfilEstudiante({
  required String fechaNacimiento,
  required String carrera,
  required String ciclo,
  int? multimediaId, // ahora es opcional
}) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null || token.isEmpty) {
    print("❌ No se encontró token");
    return false;
}


    final Map<String, dynamic> body = {
      'fecha_nacimiento': fechaNacimiento,
      'carrera': carrera,
      'ciclo': ciclo,
    };

    if (multimediaId != null) {
      body['multimedia_id'] = multimediaId;
    }

    final response = await http.put(
  Uri.parse('$baseUrl/auth/editar-perfil'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode(body),
);

print("🧾 Código: ${response.statusCode}");
print("📥 Respuesta: ${response.body}");


    return response.statusCode == 200;
  } catch (e) {
    return false;
  }
}

///subir iamgen perfil del estudiante:
static Future<int?> subirImagen(File imagen) async {
  try {
    print('Iniciando subida de imagen...');
    
    final uri = Uri.parse('$baseUrl/api/multimedia/upload');
    final request = http.MultipartRequest('POST', uri);

    final mimeType = lookupMimeType(imagen.path) ?? 'image/jpeg';
    print(' Tipo MIME detectado: $mimeType');

    final fileStream = await http.MultipartFile.fromPath(
      'imagen',
      imagen.path,
      contentType: MediaType.parse(mimeType),
    );

    request.files.add(fileStream);
    print(' Archivo añadido a la solicitud.');

    final response = await request.send();
    print(' Solicitud enviada. Código de respuesta: ${response.statusCode}');

    if (response.statusCode == 200) {
      final respStr = await response.stream.bytesToString();
      print(' Respuesta recibida: $respStr');

      final data = jsonDecode(respStr);
      final id = data['multimedia_id'];
      print(' ID de la imagen subida: $id');
      return id;
    } else {
      print(' Error al subir imagen. Código de estado: ${response.statusCode}');
      final errorStr = await response.stream.bytesToString();
      print(' Mensaje de error: $errorStr');
      return null;
    }
  } catch (e) {
    print(' Excepción durante la subida de imagen: $e');
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
    Uri.parse('$baseUrl/auth/cancelar-cita'),
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
    Uri.parse('$baseUrl/auth/historial-canceladas/$estudianteId'),
  );

  if (response.statusCode == 200) {
    return List<Map<String, dynamic>>.from(jsonDecode(response.body));
  } else {
    throw Exception(" Error al obtener historial de citas");
  }
}

/// Obtener citas activas por token
static Future<List<Map<String, dynamic>>> fetchCitasActivas(String token) async {
  final response = await http.get(
    Uri.parse('$baseUrl/auth/citas-activas'),
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
    Uri.parse('$baseUrl/auth/psicologo/horas-ocupadas/$psicologoId/$fechaStr'),
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
    Uri.parse('$baseUrl/auth/disponibilidad/$psicologoId'),
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
    Uri.parse('$baseUrl/auth/cita'),
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
    throw Exception('❌Error al crear la cita: ${response.body}');
  }
}

  //Listar psicologo parte superior

  static Future<List<Psicologo>> fetchPsicologos() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/auth/psicologo/listar-psicologo'));   ///esto tambien es una alternativa 
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
    final response = await http.get(Uri.parse('$baseUrl/api/recomendados'));
    print("📦 Backend: ${response.body}");
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
    final response = await http.get(Uri.parse('$baseUrl/api/privados/$estudianteId'));
    print('🔍 DATA JSON: ${response.body}');
    print("📦 Parsed metodo: $json");

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

  /// Obtener preguntas por cuestionario 
    static Future<List<Question>> fetchAllQuestions() async {
    final response = await http.get(Uri.parse('$baseUrl/api/listar-preguntas-opciones'));

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

  ///enviar respeustas
  static Future<void> enviarRespuestaIndividual({
  required int preguntaId,
  required int estudianteId,
  int? opcionesId,
  String? respuestaTexto,
}) async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');

  final url = Uri.parse('$baseUrl/api/crear-respuesta');

  final response = await http.post(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'pregunta_id': preguntaId,
      'estudiante_id': estudianteId,
      'opciones_id': opcionesId,
      'respuesta_texto': respuestaTexto,
    }),
  );

  if (response.statusCode != 201) {
    throw Exception(' Error al enviar respuesta: ${response.body}');
  }
}



  /// Enviar resultados del usuario (quiz completo)
  static Future<void> sendResults(Quiz quiz) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final estudianteId = prefs.getInt('estudiante_id');

    if (estudianteId == null) {
      throw Exception("Estudiante no autenticado.");
    }

    List<Map<String, dynamic>> respuestas = quiz.questions.map((q) {
      final selectedAnswer = q.tipo == 'abierto'
          ? Answer(
              id: 0,
              texto: q.selected ?? "",
              puntaje: 0,
              preguntaId: q.id,
            )
          : q.respuestas.firstWhere(
              (r) => r.texto == q.selected,
              orElse: () => Answer(
                id: 0,
                texto: "",
                puntaje: 0,
                preguntaId: q.id,
              ),
            );

      return {
        "pregunta_id": q.id,
        "estudiante_id": estudianteId, 
        "opciones_id": q.tipo == 'abierto' ? null : selectedAnswer.id, 
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

  // Obtener todas las respuestas del estudiante
static Future<List<dynamic>> obtenerRespuestasEstudiante() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');

  final response = await http.get(
    Uri.parse('$baseUrl/api/respuestas'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['respuestas'];
  } else {
    throw Exception('Error al cargar respuestas: ${response.body}');
  }
}

  
  /// Iniciar sesión con Google
static Future<Map<String, dynamic>> loginConGoogle(String credential) async {
  final url = Uri.parse('$baseUrl/auth/google/estudiante');

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
  final url = Uri.parse('$baseUrl/auth/perfil');

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
