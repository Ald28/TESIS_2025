import 'package:flutter/material.dart';

class PaginaChat extends StatelessWidget{
  const PaginaChat({Key? Key}) : super(key: Key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text("Mis citas (aun falta )", style: TextStyle(fontSize: 30),),
    );
  }
}