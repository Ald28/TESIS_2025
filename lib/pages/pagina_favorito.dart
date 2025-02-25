import 'package:flutter/material.dart';

class PaginaFavorito extends StatelessWidget{
  const PaginaFavorito({Key? Key}) : super(key: Key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text("favorito", style: TextStyle(fontSize: 30),),
    );
  }
}