import 'package:flutter/material.dart';
import 'pagina_home.dart';
import 'pagina_user.dart';
import 'pagina_edit.dart';
import 'pagina_favorito.dart';
import 'pagina_chat.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class NavigationScreen extends StatefulWidget {
  const NavigationScreen({Key? key}) : super(key: key);

  @override
  _NavigationScreenState createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  int _paginaActual = 0;

  List<Widget> _paginas = [
    PaginaHome(),
    PaginaChat(),
    PaginaFavorito(),
    PaginaEdit(),
    PaginaUser(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Mi Aplicación Flutter'),
        backgroundColor: Colors.indigo,
      ),
      body: _paginas[_paginaActual], // Muestra la página actual seleccionada
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _paginaActual,
        onTap: (index) {
          setState(() {
            _paginaActual = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home, size: 20), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline, size: 20), label: "Chat"),
          BottomNavigationBarItem(icon: Icon(Icons.favorite, size: 20), label: "Favorites"),
          BottomNavigationBarItem(icon: Icon(Icons.edit, size: 20), label: "Edit"),
          BottomNavigationBarItem(icon: Icon(Icons.supervised_user_circle, size: 20), label: "User"),
        ],
      ),
    );
  }
}