const express = require("express");
const https = require('https');
const fs = require('fs')
const crypto = require('crypto');
const { json } = require("express/lib/response");
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

function ETagCalc(resource){
    const hash = crypto.createHash('sha1').update(JSON.stringify(resource)).digest('hex');
    return `"${hash}"`
}

app.get('/:resource', (req, res) => {
    const resource = req.params.resource;

    if (!resultados[resource]){
        res.status(404).send('Recurso não encontrado');
        return;
    }
    const resourceData = resultados[resource];
    const etag = ETagCalc(resourceData);

    if(req.headers['if-none-match'] === etag){
        res.status(304).send();
    }else{
        res.setHeader('ETag', etag);
        res.json(resourceData)
    }
    });

server.listen(port, () => {
    console.log(`servidor HTTPS rodando em https://localhost:${port}`);
});
