import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://192.168.177.181:8080/api/estudiante'; // URL base correcta

  // Método para iniciar sesión
  static Future<Map<String, dynamic>> login(String email, String password, String dni) async {
    final url = Uri.parse('$baseUrl/registro_estudiante');

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email, "contraseña": password, "dni": dni}),
      );

      print("Código de estado: ${response.statusCode}");
      print("Respuesta del servidor: ${response.body}");

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        return {"error": "Error en la autenticación", "detalle": response.body};
      }
    } catch (error) {
      return {"error": "Error de conexión con el servidor", "detalle": error.toString()};
    }
  }

  // Método para verificar código de autenticación
  static Future<Map<String, dynamic>> verificarCodigo(String email, String codigo) async {
  final url = Uri.parse('$baseUrl/verificar_codigo');

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
