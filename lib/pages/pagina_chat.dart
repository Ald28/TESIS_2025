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
  bool _isTyping = false;

  // Color cian definido
  final Color cyanColor = Color(0xFF00AEEF);

  @override
  void initState() {
    super.initState();
    // Mensaje de bienvenida
    mensajes.add({
      "texto": "¡Hola! Soy PsicoBot, tu asistente de bienestar mental. ¿En qué puedo ayudarte hoy?",
      "esUsuario": false
    });
  }

  Future<void> enviarMensaje() async {
    final texto = _controller.text;
    if (texto.trim().isEmpty) return;

    setState(() {
      mensajes.add({"texto": texto, "esUsuario": true});
      _controller.clear();
      _isTyping = true;
    });

    await Future.delayed(const Duration(milliseconds: 100));
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );

    try {
      final respuesta = await http.post(
        Uri.parse('http://192.168.177.182:8080/api/chat-estudiante'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"mensaje": texto}),
      );

      final data = jsonDecode(respuesta.body);
      setState(() {
        mensajes.add({"texto": data["respuesta"], "esUsuario": false});
        _isTyping = false;
      });

      await Future.delayed(const Duration(milliseconds: 100));
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } catch (e) {
      setState(() {
        mensajes.add({
          "texto": "❌ Lo siento, no pude procesar tu mensaje. Inténtalo de nuevo.",
          "esUsuario": false
        });
        _isTyping = false;
      });
    }
  }

  Widget _buildTypingIndicator() {
    return Container(
      alignment: Alignment.centerLeft,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: cyanColor,
              ),
              child: const Icon(Icons.psychology, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 12),
            const Text(
              "PsicoBot está escribiendo...",
              style: TextStyle(
                color: Colors.grey,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FF),
      body: Column(
        children: [
          // Header del chatbot
          Container(
            decoration: BoxDecoration(
              color: cyanColor,
              boxShadow: [
                BoxShadow(
                  color: Color(0x20000000),
                  blurRadius: 10,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.psychology,
                        color: cyanColor,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "PsicoBot",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            "Tu asistente de bienestar mental",
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 12,
                      height: 12,
                      decoration: const BoxDecoration(
                        color: Color(0xFF4CAF50),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      "En línea",
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Chat messages
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: ListView.builder(
                controller: _scrollController,
                itemCount: mensajes.length + (_isTyping ? 1 : 0),
                itemBuilder: (context, index) {
                  if (_isTyping && index == mensajes.length) {
                    return _buildTypingIndicator();
                  }

                  final msg = mensajes[index];
                  final isUser = msg["esUsuario"] as bool;
                  
                  return Container(
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: Row(
                      mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (!isUser) ...[
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: cyanColor,
                            ),
                            child: const Icon(Icons.psychology, color: Colors.white, size: 16),
                          ),
                          const SizedBox(width: 8),
                        ],
                        Flexible(
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.75,
                            ),
                            decoration: BoxDecoration(
                              color: isUser 
                                  ? cyanColor
                                  : Colors.white,
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(20),
                                topRight: const Radius.circular(20),
                                bottomLeft: Radius.circular(isUser ? 20 : 4),
                                bottomRight: Radius.circular(isUser ? 4 : 20),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 5,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            child: Text(
                              msg["texto"],
                              style: TextStyle(
                                color: isUser ? Colors.white : Colors.black87,
                                fontSize: 16,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ),
                        if (isUser) ...[
                          const SizedBox(width: 8),
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: cyanColor,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.person, color: Colors.white, size: 16),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
            ),
          ),

          // Input area
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Color(0x10000000),
                  blurRadius: 10,
                  offset: Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8F9FF),
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(
                            color: const Color(0xFFE0E0E0),
                            width: 1,
                          ),
                        ),
                        child: TextField(
                          controller: _controller,
                          style: const TextStyle(fontSize: 16),
                          maxLines: null,
                          textInputAction: TextInputAction.send,
                          onSubmitted: (_) => enviarMensaje(),
                          decoration: const InputDecoration(
                            hintText: "Escribe tu mensaje...",
                            hintStyle: TextStyle(color: Colors.grey),
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: cyanColor,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.send_rounded, color: Colors.white),
                        onPressed: _isTyping ? null : enviarMensaje,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}