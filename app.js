const express = require("express");
const https = require('https');
const fs = require('fs')
const port = 3000;
var app = express();

const resultados = {
    pessoas: [{id:1, nome: "Marcelo"}, {id:2, nome: "João"}, {id:3, nome: "Maria"}],
    carros: [{id:1, modelo: "Fusca"}, {id:2, modelo: "Gol"}, {id:3, modelo: "Palio"}],
    animais: [{id:1, nome: "Cachorro"}, {id:2, nome: "Gato"}, {id:3, nome: "Papagaio"}]
  }

const permissons = {
    key: fs.readFileSync('.\\PEM\\chave.key'),
    cert: fs.readFileSync('.\\PEM\\Certificado.crt'),
}

const credentials = {
    key: permissons.key, 
    cert: permissons.cert
};
  
const server = https.createServer(credentials, app);

app.get('/:resource', (req, res) => {
    const resource = req.params.resource;

    if(resultados[resource]){
        res.json(resultados[resource]);
    }else{
        res.status(404).send('Recurso não encontrado!');
    }
    });

server.listen(port, () => {
    console.log(`servidor HTTPS rodando em https://localhost:${port}`);
});
