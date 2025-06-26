import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../pages/navigation_screen.dart';
import '../pages/navigation_screen.dart';
import '../services/api_service.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'dart:convert';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  bool isLoading = false;

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email'],
    serverClientId: '381550545275-npvfm9sf70jomqsum8fm1dvde05j8qks.apps.googleusercontent.com',
  );

  Future<void> guardarTokenFCMEnBackend() async {
    final prefs = await SharedPreferences.getInstance();
    final usuarioId = prefs.getInt('usuario_id');
    print("🧾 Usuario ID guardado: $usuarioId");
    final token = await FirebaseMessaging.instance.getToken();

    if (usuarioId != null && token != null) {
      final response = await http.post(
        Uri.parse('https://tesis-2025.onrender.com/api/notificaciones/guardar-token-fcm'),///cambiar tambien
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'usuario_id': usuarioId,
          'token': token,
          'plataforma': 'android',
        }),
      );

      if (response.statusCode == 200) {
        print("Token FCM guardado correctamente");
      } else {
        print("Error al guardar token FCM: ${response.body}");
      }
    } else {
      print("usuario_id o token FCM nulo");
    }
  }

  Future<void> loginWithGoogle() async {
    setState(() => isLoading = true);
    

    try {
      await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

      await _googleSignIn.signOut(); 
      final GoogleSignInAccount? user = await _googleSignIn.signIn();

      if (user == null) {
        _showCustomSnackBar(
          title: "Cancelado",
          message: "Inicio de sesión cancelado",
          icon: Icons.cancel,
          color: Colors.orange,
        );
        setState(() => isLoading = false);
        return;
      }

      final GoogleSignInAuthentication auth = await user.authentication;

      final response = await http.post(
        Uri.parse('https://tesis-2025.onrender.com/auth/google/estudiante'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'credential': auth.idToken}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        final token = data['token'];

        final perfilResponse = await http.get(
          Uri.parse('https://tesis-2025.onrender.com/auth/perfil'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );

        if (perfilResponse.statusCode == 200) {
          final perfilData = json.decode(perfilResponse.body);
          final estudianteId = perfilData['estudiante']['estudiante_id'];
          final usuarioId = perfilData['estudiante']['usuario_id'];

          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', token);
          await prefs.setInt('estudiante_id', estudianteId);
          await prefs.setInt('usuario_id', usuarioId);

          await guardarTokenFCMEnBackend();

          final yaRespondio = await ApiService.verificarSiEstudianteYaRespondio(estudianteId);

          if (yaRespondio) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => const NavigationScreen(paginaInicial: 0),
              ),
            );
          } else {
            Navigator.pushReplacementNamed(context, '/quiz-page');
          }


        } else {
          _showCustomSnackBar(
            title: "Error",
            message: "No se pudo obtener el perfil del usuario",
            icon: Icons.error_outline,
            color: Colors.red,
          );
        }
      } else {
        _showCustomSnackBar(
          title: "Error",
          message: "No se pudo iniciar sesión: ${response.body}",
          icon: Icons.error_outline,
          color: Colors.red,
        );
      }
    } catch (error) {
      _showCustomSnackBar(
            title: "Error",
            message: "Algo salió mal: $error",
            icon: Icons.error,
            color: Colors.red,
          );

    }

    setState(() => isLoading = false);
  }
  
  void _showCustomSnackBar({
  required String title,
  required String message,
  required IconData icon,
  required Color color,
}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(
        children: [
          Icon(icon, color: Colors.white, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                Text(
                  message,
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      margin: const EdgeInsets.all(16),
      duration: const Duration(seconds: 3),
    ),
  );
}


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        color: const Color(0xFFB2EBF2),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/logologin2.png',
              height: 200,
            ),
            const SizedBox(height: 40),
            Stack(
              alignment: Alignment.center,
              children: [
                GestureDetector(
                  onTap: isLoading ? null : loginWithGoogle,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                          spreadRadius: 2,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/google_icon.png',
                          height: 20,
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'Continuar con Google',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (isLoading)
                  const CircularProgressIndicator(color: Colors.white),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
