import {Router} from 'express';
const xlsx = require("xlsx");

const router = Router();

//variaveis para a organizacao da matriz com os dados do excel categories
var tabela_categories = [];
var inicio_arvore = 0; 
var aux = [];
var repetidos = [];
var acc=0;
var hereditariedade = 0;
var hereditariedade_string = '';

//variaveis para a organizacao da matriz com os dados do excel releases
var tabela_releases = [];
var aux2 = [];

//variaveis para a organizacao da matriz com os dados do json final
var json_final = [];

//abertura da planilha do excel com as categories
const excel_categories = xlsx.readFile('/home/felipenarimatsu/Desktop/processo_seletivo_PILab_2/src/rotas/excel/base_dados.xlsx');
const categories = excel_categories.Sheets["categories"];


//abertura da planilha do excel com os releases
const excel_releases = xlsx.readFile('/home/felipenarimatsu/Desktop/processo_seletivo_PILab_2/src/rotas/excel/base_dados.xlsx');
const releases = excel_releases.Sheets["releases"];


//dados do excel_categories para JSON (aux)
var json_categories = xlsx.utils.sheet_to_json(categories);

//dados do excel_releases para JSON (aux)
var json_releases= xlsx.utils.sheet_to_json(releases);

//for percorre o json aux dos releases para formar a matriz de dados
for(var i=0; i < Object.keys(json_releases).length; i++){
    var obj2 = JSON.parse(JSON.stringify(json_releases[i]));
    aux2.push(obj2.id);
    aux2.push(obj2.category_id);
    aux2.push(parseInt(obj2.value,10)*parseInt(obj2.amount,10));   
    tabela_releases[i] = aux2;
    aux2=[];
}

//for percorre o Json aux dos categories para formar a matriz de dados
for(var i=0; i < Object.keys(json_categories).length; i++){
    var obj = JSON.parse(JSON.stringify(json_categories[i]));
    
    //for que preenche e checa um vetor auxiliar com as repeticoes dos pais de cada item
    repetidos.push(obj.father);
    for(var y=0; y<repetidos.length ;y++){
        if(obj.father==repetidos[y]){
            acc++;
        }
    }
    aux.push(obj.id);
    aux.push(obj.name);
    aux.push(obj.father);
    aux.push(obj.initial_value);
    aux.push(acc);
    tabela_categories[i] = aux;
    
    //checa a hereditariedade 
    if(obj.father==0){//se a pai do item for 0, ele é a comeco da arvore de hereditariedade
        inicio_arvore++;
        hereditariedade = inicio_arvore;
        aux.push(hereditariedade);
        }
    else{//se o pai for != 0, o programa procura quantas vezes um item com o mesmo nome já foi chamado e anexa esse valor a hereditariedade do seu pai
        hereditariedade = tabela_categories[obj.father-1][5];
        hereditariedade_string = String(hereditariedade) + '.' + String(aux[4]);
        aux.push(hereditariedade_string);
        }
    //=============================================

    //zera variaveis auxiliares para a proxima iteracao 
    acc=0;
    aux = [];
    hereditariedade = 0;
    //=============================================
}

//for para distribuir os valores em cada item e para fazer a distribuicao dos valores de forma hereditaria
for(var x=0; x<tabela_releases.length ; x++){
    tabela_categories[tabela_releases[x][1]-1][3] = tabela_categories[tabela_releases[x][1]-1][3] + tabela_releases[x][2];
    var aux_index = tabela_categories[tabela_releases[x][1]][2];        //variavel auxiliar para a soma dos valores com hereditariedade
    while(tabela_categories[aux_index][2] != 0){   //se o pai nao for 0 o programa checa a hereditariedade para fazer a soma dos valores no item que contem os demais     
        tabela_categories[aux_index-1][3] = tabela_categories[aux_index-1][3] + tabela_releases[x][2];
        aux_index = tabela_categories[aux_index-1][2];
    }
}

//for que cria o JSON final para a resposta 
for(var i=0; i<tabela_categories.length ; i++){
    var hered = tabela_categories[i][5];
    var nome = tabela_categories[i][1];
    var valor = tabela_categories[i][3];
    let envio = { 
        hereditariedade: hered,
        nome: nome, 
        valor: valor
    };
    json_final[i]=envio;
}

router.get('/balanco',(req,res) => {
    res.send();
    console.log(json_final);
})

export default router;