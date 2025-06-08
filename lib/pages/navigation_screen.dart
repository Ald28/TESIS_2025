import 'package:flutter/material.dart';
import 'pagina_home.dart';
import 'pagina_user.dart';
import 'pagina_edit.dart';
import 'pagina_favorito.dart';
import 'pagina_chat.dart';
import 'detalle_psicologo_page.dart';
import 'detalle_metodo_page.dart';
import '../classes/psicologo.dart';
import '../classes/metodo_relajacion.dart';

class NavigationScreen extends StatefulWidget {
  final int paginaInicial;

  const NavigationScreen({super.key, this.paginaInicial = 0});

  @override
  _NavigationScreenState createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  late int _paginaActual;
  Psicologo? _psicologoSeleccionado;
  MetodoRelajacion? _metodoSeleccionado;
  late List<Widget> _paginas;


  @override
  void initState() {
    super.initState();
    _paginaActual = widget.paginaInicial;

    _paginas = [
      PaginaHome(
        onSeleccionarPsicologo: (psicologo) {
          setState(() {
            _psicologoSeleccionado = psicologo;
            if (_paginas.length == 5) {
              _paginas.add(PaginaDetallePsicologo(psicologo: psicologo));
            } else {
              _paginas[5] = PaginaDetallePsicologo(psicologo: psicologo);
            }
            _paginaActual = 5;
          });
        },
        onSeleccionarMetodo: (metodo) {
          setState(() {
            _metodoSeleccionado = metodo;
            if (_paginas.length == 5) {
              _paginas.add(const SizedBox());
              _paginas.add(PaginaDetalleMetodo(metodo: metodo));
            } else if (_paginas.length == 6) {
              _paginas.add(PaginaDetalleMetodo(metodo: metodo));
            } else if (_paginas.length == 7) {
              _paginas[6] = PaginaDetalleMetodo(metodo: metodo);
            }
            _paginaActual = 6;
          });
        },
      ),
      const PaginaChat(),
      const PaginaFavorito(),
      const PaginaEdit(),
      const PaginaUser(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: Colors.indigo,
          title: Row(
            children: [
              Image.asset(
                'assets/images/superior.png',
                height: 28,
              ),
              const SizedBox(width: 8),
            ],
          ),
        ),
        body: _paginas[_paginaActual],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _paginaActual > 4 ? 0 : _paginaActual,
          onTap: (index) {
            setState(() {
              _paginaActual = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home, size: 20), label: "Inicio"),
            BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline, size: 20), label: "Chat"),
            BottomNavigationBarItem(icon: Icon(Icons.favorite, size: 20), label: "Historial"),
            BottomNavigationBarItem(icon: Icon(Icons.edit, size: 20), label: "Notificaciones"),
            BottomNavigationBarItem(icon: Icon(Icons.supervised_user_circle, size: 20), label: "Usuario"),
          ],
        ),
      ),
    );
  }
}
