
const express = require('express');
//const { validarSenha } = require('./intermediarios');
const { listarContas, criarConta, atualizarDados, excluirConta, depositarEmConta, sacarDaConta, tranferirEntreContas, saldoConta, extrato } = require('./controladores/controlador');

const rotas = express();


//rotas.use(validarSenha);

rotas.get('/contas', listarContas);
rotas.post('/contas', criarConta);
rotas.put('/contas/:numeroConta', atualizarDados);
rotas.delete('/contas/:numeroConta', excluirConta);
rotas.post('/transacoes/depositar', depositarEmConta);
rotas.post('/transacoes/sacar', sacarDaConta );
rotas.post('/transacoes/transferir', tranferirEntreContas);
rotas.get('/contas/saldo', saldoConta );
rotas.get('/contas/extrato', extrato)
module.exports = rotas;