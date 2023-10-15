const {banco} = require('../bancodedados/bancodedados');
let { contas, saques, depositos, transferencias } = require('../bancodedados/bancodedados')

let idConta = 1

const listarContas = (req, res)=>{
    const senha_banco = req.query.senha_banco;

    if (!senha_banco) {
        return res.status(400).json({mensagem:'senha não foi informada'})        
     }
 
     
     if (senha_banco !== banco.senha) {
         return res.status(401).json({mensagem:'A senha do banco informada é inválida!'})         
      };

    return res.json(contas);

};

const criarConta = (req, res)=>{
    
    const {nome, cpf, data_nascimento, telefone, email, senha} = req.body;
    
    let cpfUsuario = contas.find((conta)=>{
        return conta.usuario.cpf === cpf;
    });
    
    let emailUsuario = contas.find((conta)=>{
        return conta.usuario.email === email;
    });

    if (emailUsuario || cpfUsuario) {
        return res.status(400).json({mensagem:'Já existe uma conta com o cpf ou e-mail informado'})  
    }

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res.status(400).json({mensagem: `Prencha todos os Dados`}) 
    }

    let contaNova = {
        numero: ++idConta,
        saldo: 0,
        usuario: req.body
    }

    contas.push(contaNova);

   return res.status(201).json();
};

const atualizarDados = (req, res)=>{
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    
    
    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({mensagem: `Prencha todos os Dados`}) 
    };

    const indiceConta = contas.findIndex((conta)=>{
        return conta.numero === Number(req.params.numeroConta);
    });

    if (indiceConta === -1) {
        return res.status(400).json({mensagem: `Não existe essa conta`}) 
    };

    contas[indiceConta].usuario = req.body

    return res.status(202).json()

}

const excluirConta = (req, res)=>{

    const indiceContaExcluir = contas.findIndex((conta)=>{
        return conta.numero === Number(req.params.numeroConta);
    });

    if(indiceContaExcluir === -1){
        return res.status(400).json({mensagem: `Não existe essa conta`}) 
    };

    if(contas[indiceContaExcluir].saldo !== 0){
        return res.status(400).json({mensagem: `A conta só pode ser removida se o saldo for zero!`}) 
    };

    contas = contas.filter((conta)=>{
        return conta.numero !== Number(req.params.numeroConta)
    });

    return res.status(201).json();
};



const depositarEmConta = (req, res)=>{
    const { valor, numero_conta } = req.body;

    if (!valor || !numero_conta) {
        return res.status(400).json({mensagem: 'O número da conta e o valor são obrigatórios!'}) 
    };

    const encontraConta = contas.find((conta)=>{
        return conta.numero === numero_conta
    });

    if (!encontraConta) {
        return res.status(400).json({mensagem: 'Esse numero de conta não existe!'})
    }

    if (valor <= 0) {
        return res.status(400).json({mensagem: 'Valor não permitido'}) 
    }

    encontraConta.saldo += valor;
    
    const novoDeposito = {
        "data": new Date(),
        numero_conta,
        valor
    };

    depositos.push(novoDeposito);

    return res.status(201).json()
};


const sacarDaConta = (req, res)=>{
    const {numero_conta, valor, senha } = req.body;
    
    if (!valor || !numero_conta || !senha) {
        return res.status(400).json({mensagem: 'O número da conta, valor e senha são obrigatórios!'}) 
    };
    
    const encontraConta = contas.find((conta)=>{
        return conta.numero === numero_conta
    });
    
    if (!encontraConta) {
        return res.status(400).json({mensagem: 'Esse numero de conta não existe!'})
    };
    
    if (valor <= 0) {
        return res.status(400).json({mensagem: 'Valor não permitido'}) 
    }
    
    if(encontraConta.usuario.senha !== senha){
        return res.status(401).json({mensagem:'A senha informada é inválida!'})    
    }
    
    if ( valor >  encontraConta.saldo   ) {
        return res.status(400).json({mensagem:'Saldo insuficiente!'}) 
    }
   
    encontraConta.saldo -= valor;
    
    const novoSaque = {
        data: new Date(),
        numero_conta,
        valor
    };

    depositos.push(novoSaque);

    return res.status(201).json(saques)

}

const tranferirEntreContas = (req, res)=>{
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
    
    if (!numero_conta_destino || !numero_conta_origem || !valor || !senha) {
        return res.status(401).json({mensagem:'O numeros da conta de origem de destino , senha e o valor a ser tramferido são obrigatorios!'})
    };
    
    const contaOrigem = contas.find((conta)=>{
        return conta.numero == numero_conta_origem;
    });

    if (!contaOrigem) {
        return res.status(400).json({mensagem: `Numero de conta de Origem não existe `}) 
    };
    
    if ( valor >  contaOrigem.saldo   ) {
        return res.status(400).json({mensagem:'Saldo insuficiente!'}) 
    }
    
    const contaDestino = contas.find((conta)=>{
        return conta.numero == numero_conta_destino;
    });
    
    if (!contaDestino) {
        return res.status(400).json({mensagem: `Numero de conta de Destino não existe `}) 
    };
    
    if (senha != contaOrigem.usuario.senha) {
        return res.status(401).json({mensagem:'A senha informada é inválida!'})         
     };
     
     contaOrigem.saldo -= valor;
     contaDestino.saldo += valor

    const novatranferencia = {
        data:new Date(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }
    transferencias.push(novatranferencia)
    return res.status(201).json()
}



const saldoConta = (req, res)=>{
    const { numero_conta, senha} = req.query;
    console.log(numero_conta);
    if(!numero_conta || !senha){
        res.status(400).json({mensagem:'Numero de conta e senha são obrigatórios!'})
    }
    
    const numConta = contas.find((conta)=>{
        return conta.numero == numero_conta
    })
   
    if(numConta.numero !== numero_conta || numConta.usuario.senha != senha){
        return res.status(400).json({mensagem: `Conta bancária não encontada ou senha incorreta!`}) 
    }

    return res.status(200).json({saldo: numConta.saldo})
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        res.status(400).json({ mensagem: 'Número de conta e senha são obrigatórios!' })
    }

    const numConta = contas.find((conta) => {
        return conta.numero == numero_conta
    })

    if (numConta.numero !== numero_conta || numConta.usuario.senha != senha) {
        return res.status(400).json({ mensagem: "Conta bancária não encontrada ou senha incorreta!" })
    }

    const saqueConta = saques.filter((saque) => {
        return saque.numero_conta === numConta.numero
    });

    const depositosCont = depositos.filter((desposito) => {
        return desposito.numero_conta === numConta.numero
    });

    const transferenciaReceb = transferencias.filter((transferenciaReceb) => {
        return transferenciaReceb.numero_conta_destino === numConta.numero
    });

    const transferenciaEnvia = transferencias.filter((transferenciaEnv) => {
        return transferenciaEnv.numero_conta_origem === numConta.numero
    });

    return res.json({
        'saques': saqueConta,
        'depositos': depositosCont,
        'transferencias enviadas': transferenciaEnvia,
        'transferencias recebidas': transferenciaReceb
    });
}

module.exports = {
    listarContas,
    criarConta,
    atualizarDados,
    excluirConta,
    depositarEmConta,
    sacarDaConta,
    tranferirEntreContas,
    saldoConta,
    extrato
}