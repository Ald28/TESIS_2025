import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
    serverClientId:
        '381550545275-npvfm9sf70jomqsum8fm1dvde05j8qks.apps.googleusercontent.com',
  );

  Future<void> loginWithGoogle() async {
    setState(() => isLoading = true);

    try {
      // Cierra sesión antes de intentar iniciar nuevamente (fuerza el selector de cuentas)
      await _googleSignIn.signOut();

      final GoogleSignInAccount? user = await _googleSignIn.signIn();
      if (user == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Inicio de sesión cancelado')),
        );
        setState(() => isLoading = false);
        return;
      }

      final GoogleSignInAuthentication auth = await user.authentication;

      final response = await http.post(
        Uri.parse('http://192.168.1.102:8080/auth/google/estudiante'),////cambiar aqui
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'credential': auth.idToken}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        final token = data['token'];

        final perfilResponse = await http.get(
          Uri.parse('http://192.168.1.102:8080/auth/perfil'),////cambiar aqui segun la ip
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

          Navigator.pushReplacementNamed(context, '/quiz-page');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error al obtener perfil: ${perfilResponse.body}')),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error en login: ${response.body}')),
        );
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $error')),
      );
    }

    setState(() => isLoading = false);
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
