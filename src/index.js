const { response, request } = require("express");
const express = require("express"); // importando o express para o projeto
const { v4: uuidv4 } = require("uuid") // importando o uuid para o projeto

const app = express(); // alocando express a variável app

app.use(express.json()); // middleware para receber um JSON 

const customers = []; // array de usuarios para nosso banco (fake BDD)

// Middleware 
function verifyIfExistsAccountCPF(req, res, next){
    const { cpf } = req.headers;

    const customer = customers.find(customer => customer.cpf === cpf); // verifica se dentro do Array customers existe um customer com o CPF igual

    if(!customer) {
        return res.status(400).json({error:"Customer not found"}); // verifica se o costumer existe 
    }

    req.customer = customer; // todos os middlewares que chamarem verifyIfExistsAccountCPF tem acesso ao request customer

    return next();

}

// Função para conseguir o balanço da conta 
function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => { // reduce transforma valores em um valor apenas
        if(operation.type === "credit") {
            return acc + operation.amount
        }else {
            return acc - operation.amount
        }
    }, 0) ;

    return balance
}

app.post("/account", (req, res) => { //utilizar o metódo POST para criar a conta (metódo utilizado para a criação de dados)
    const {cpf, name} = req.body; // request.body parametro que recebemos para inserção de dados 

    const customerAlredyExists = customers.some((customer) => customer.cpf === cpf); // fazer busca com o SOME para verificar se o customer CPF já é existente 
    
    if(customerAlredyExists) {
        return res.status(400).json({error:"Customer alredy exists!"}) // Mensagem de erro retornada se o CPF já for existente 
    } 

    customers.push({ //utilizar o metodo PUSH para inserir dados dentro de um Array 
        cpf,
        name,
        id: uuidv4(), // gerando iD's com o uuid ,
        statement: [],
    });
    
    return res.status(201).send()
}) 

//app.use(verifyIfExistsAccountCPF); forma de todas as rotas que vierem em diante utilizem o middleware 

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => { // utilizar o metodo GET para buscar extrato báncario do cliente

    const {customer} = req; // conseguindo acesso ao costumer
     return res.json(customer.statement);

})

app.post("/deposit",verifyIfExistsAccountCPF, (req, res) => { // utilizar o metodo POST para criar um depósito
    const {description, amount} = req.body; 

    const {customer} = req; // conseguindo acesso ao costumer 

    const statementOperation = { // Operação bancaria, com descrição, quantia, data e tipo (credito, débito)
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return res.status(201).send();
})

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
    const {amount} = req.body; // informação que vamos precisar inserir sendo desestruturadas
    const {customer} = req; // acesso ao costumer

    const balance = getBalance(customer.statement)

    if(amount > balance) { // validação no caso do valor do saque ser maior que a quantia disponivel na conta 
        return res.status(400).send("ERROR, Insufficient funds!")
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation)

    return res.status(201).send();
})

app.get("/statement/date", verifyIfExistsAccountCPF, (req, res) => { // novo statement agora listando extrado por data 
    const {customer} = req; // conseguindo acesso ao costumer
    const {date} = req.query; // conseguindo acesso a data 

    const dateFormat = new Date(date + " 00:00"); // mudando todos os horarios para 00:00 

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString()) 

    return res.json(statement);

})

app.put("/account", verifyIfExistsAccountCPF, (req, res) => { // metodo PUT para atualização do nome da conta 
    const {name} = req.body;
    const {customer} = req;

    customer.name = name;

    return res.status(201).send()
});

app.get("/account", verifyIfExistsAccountCPF, (req, res) => { // atualizando os dados da conta 
    const {customer} = req;

    return res.json(customer) 
})

app.listen(3333); // porta onde vai rodar a API 