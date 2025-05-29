import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PaginaChat extends StatefulWidget {
  const PaginaChat({super.key});

  @override
  State<PaginaChat> createState() => _PaginaChatState();
}

class _PaginaChatState extends State<PaginaChat> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<Map<String, dynamic>> mensajes = [];

  @override
  void initState() {
    super.initState();
  }

  Future<void> enviarMensaje() async {
    final texto = _controller.text;
    if (texto.trim().isEmpty) return;

    setState(() {
      mensajes.add({"texto": texto, "esUsuario": true});
      _controller.clear();
    });

    await Future.delayed(const Duration(milliseconds: 100));
    _scrollController.jumpTo(_scrollController.position.maxScrollExtent);

    try {
      final respuesta = await http.post(
        Uri.parse('http://192.168.177.181:8080/api/chat-estudiante'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"mensaje": texto}),
      );

      final data = jsonDecode(respuesta.body);
      setState(() {
        mensajes.add({"texto": data["respuesta"], "esUsuario": false});
      });

      await Future.delayed(const Duration(milliseconds: 100));
      _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
    } catch (e) {
      setState(() {
        mensajes.add({
          "texto": "❌ Error al conectar con el chatbot.",
          "esUsuario": false
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFF9F8FC),
      child: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: mensajes.length,
              padding: const EdgeInsets.only(top: 12),
              itemBuilder: (context, index) {
                final msg = mensajes[index];
                return Container(
                  alignment: msg["esUsuario"]
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: Container(
                    decoration: BoxDecoration(
                      color: msg["esUsuario"]
                          ? const Color(0xFFE0D7FF)
                          : const Color(0xFFE6E6E6),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    padding: const EdgeInsets.all(12),
                    child: Text(msg["texto"]),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 10),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(fontSize: 16),
                    decoration: InputDecoration(
                      hintText: "Escribe tu mensaje...",
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide:
                            const BorderSide(color: Colors.grey, width: 0.5),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide:
                            const BorderSide(color: Colors.purple, width: 1),
                      ),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.purple),
                  onPressed: enviarMensaje,
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
