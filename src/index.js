const { response } = require("express");
const express = require("express"); //importando o express para o projeto
const { v4: uuidv4 } = require("uuid") //importando o uuid para o projeto

const app = express(); // alocando express a variável app

app.use(express.json()); //middleware para receber um JSON 

const customers = []; // array de usuarios para nosso banco (fake BDD)
/**
 * Dados da conta:
 * CPF  - string
 * name - string
 * id - uuid (universely unique identifier)
 * statement(extrato) - array  
 */

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

app.get("/statement/:cpf", (req,res) => {//utilizar o metodo GET para buscar extrato báncario do cliente
    const { cpf } = req.params;

    const customer = customers.find(customer => customer.cpf === cpf); // verifica se dentro do Array customers existe um customer com o CPF igual

    if(!customer) {
        return res.status(400).json({error:"Customer not found"});
    }

    return res.json(customer.statement);
})

app.listen(3333); // porta onde vai rodar a API 