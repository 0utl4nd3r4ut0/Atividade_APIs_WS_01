const express = require("express");
const https = require('https');
const fs = require('fs')
const crypto = require('crypto');
const { json } = require("express/lib/response");
const port = 3000;
const NodeCache = require('node-cache')

var app = express();

const resultados = {
    pessoas: [{id:1, nome: "renan"}, {id:2, nome: "João"}, {id:3, nome: "Maria"}],
    carros: [{id:1, modelo: "Fusca"}, {id:2, modelo: "Gol"}, {id:3, modelo: "celta"}],
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

const cache = new NodeCache();

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
    const cachedETag = cache.get('cachedETag_' + resource);
    console.log(`${cachedETag}`)

    if(cachedETag && req.headers["if-none-match"] === cachedETag){
        res.status(304).send();
        console.log(`304 sended`)
    }else{
        cache.set('cachedETag_'+ resource, etag);

        res.setHeader('ETag', etag);
        res.json(resourceData);
        console.log(`${resource}`)
    }
    });

app.get('/:resource/:id', (req, res) => {
    const resource = req.params.resource;
    const id = parseInt(req.params.id);

    if (!resultados[resource]) {
        res.status(404).send('Recurso não encontrado');
        return;
    }

    const resourceData = resultados[resource].find(item => item.id === id);

    if (!resourceData) {
        res.status(404).send('ID não encontrado');
        return;
    }

    const etag = ETagCalc(resourceData);
    const cachedETag = cache.get('cachedETag_' + resource + id);

    if (cachedETag && req.headers["if-none-match"] === cachedETag) {
        res.status(304).send();
    } else {
        cache.set('cachedETag_' + resource + id, etag);

        res.setHeader('ETag', etag);
        res.json(resourceData);
    }
});

server.listen(port, () => {
    console.log(`servidor HTTPS rodando em https://localhost:${port}`);
});