var iniciarRastreamento;
var pausarRastreamento;
var finalizarRastreamento;
var enviarTrilhasEstocadas;
var iniciarFinalizarRastreamento;
var countSubTrajetoria = 0;

document.addEventListener("deviceready", onDeviceReady, false);

var win = {};

win.dom = {};
win.dom.login = document.getElementById("login_inicial");
win.dom.coletaTrajetoria = document.getElementById("coleta_trajetoria");
win.dom.mapa = document.getElementById("mapa");
win.dom.tela_caes = document.getElementById("tela_caes");

win.open = function(el) {
    el.classList.add("open");
};

win.openLogin = function(el) {
    el.classList.add("openLogin");
};

win.closeLogin = function(el) {
    el.classList.remove("openLogin");
};

win.close = function(el) {
    el.classList.remove("open");
};

function onDeviceReady() {
    var dadosColetados = {};
	var caes = {};
    var registro = {};
	var watchID;
    var timeoutCount = 0;
    var coleta;
    var flightPath;
    nome_cao_tela = document.getElementById('nome_cao');

    if ( ((localStorage.getItem("id_cao") !== null)) && (localStorage.getItem("id_cao")))  {
        nome_cao_tela.innerHTML = localStorage.getItem("nome_cao");
        listarTrilhas();
        navigator.splashscreen.hide();
    } else {
        if ( ((localStorage.getItem("caes") !== null)) && (localStorage.getItem("caes")))  {
            listarCaes();
            win.openLogin( win.dom.tela_caes );
            navigator.splashscreen.hide();
        } else{
            win.openLogin( win.dom.login );
            navigator.splashscreen.hide();
        }
    }

    dadosColetados.trajetoria = [];
    
    var containerFinalizarIniciar = document.getElementById("botao02");
    var btFinalizarIniciar = containerFinalizarIniciar.querySelector("button");
    var spanIcone = btFinalizarIniciar.querySelector("span");
    var spanLabel = containerFinalizarIniciar.querySelector(":scope > span");
    
    function listarTrilhas(){
        if( localStorage.getItem("trilhas") == null )
            localStorage.setItem("trilhas", "[]");
        var listaTrajetorias = JSON.parse(localStorage.getItem("trilhas"));
        var lista = document.getElementById('in_main');
        lista.innerHTML = "";
        listaTrajetorias.forEach(function(val, key){
            valor = JSON.parse(val);
            var id_cao = localStorage.getItem("id_cao");
            if (valor.id_cao == id_cao) {
                var domTrajetoria = document.createElement("div");
                var domStatus = document.createElement("div");
                var domData = document.createElement("div");
                var domMensagem = document.createElement("div");

                if (valor.status){
                    domTrajetoria.className   = "in_trajetoria enviado";
                    domStatus.innerText       = "Status: Enviado";
                    domData.innerText         = "Data: " + valor.data;
                    domMensagem.innerText     = "Toque para visualizar no mapa";

                    domTrajetoria.dataset.key = valor.id_trajetoria;
                    domTrajetoria.appendChild(domStatus);
                    domTrajetoria.appendChild(domData);
                    domTrajetoria.appendChild(domMensagem);
                } else {
                    domTrajetoria.className   = "in_trajetoria pendente";
                    domStatus.innerText       = "Status: Pendente";
                    domData.innerText         = "Toque para sincronizar";
                    domTrajetoria.dataset.key = key;
                    domTrajetoria.appendChild(domStatus);
                    domTrajetoria.appendChild(domData);
                }
                
                lista.appendChild(domTrajetoria);
            }
        });
    }

    function listarCaes(){
        if( localStorage.getItem("caes") == null )
            localStorage.setItem("caes", "[]");
        var listaCaes = JSON.parse(localStorage.getItem("caes"));
        var lista = document.getElementById('tc_main');
        lista.innerHTML = "";
        listaCaes.forEach(function(val, key){
            valor = JSON.parse(val);
            var domCao = document.createElement("div");
            var domStatus = document.createElement("div");
            var domMensagem = document.createElement("div");
        
            domCao.className = "tc_lista_caes";
            //domStatus.innerText       = "Status: Enviado";
            domMensagem.innerText     = "Cão: " + valor.nome_cao;
            domCao.dataset.key = valor.id_cao;
            domCao.dataset.nome = valor.nome_cao;
            //domTrajetoria.appendChild(domStatus);
            domCao.appendChild(domMensagem);
        
            lista.appendChild(domCao);
        
        });
    }


    // Sucesso na coleta de trajetórias
    var callbackFn = function(location) {
        console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude + ';' + location.time + ';' + location.accuracy);
        
        dadosColetados.trajetoria[ countSubTrajetoria ].push({
            coordenada: location.latitude + ", " + location.longitude,
            tempo: location.time,
            precisao: location.accuracy
        });

        backgroundGeolocation.finish();
    };

    // Falha na coleta de trajetórias
    var failureFn = function(error) {
        console.log('BackgroundGeolocation error');
    };

    // Configurações da coleta de trajetórias
    backgroundGeolocation.configure(callbackFn, failureFn, {
        desiredAccuracy: 1000,
        stationaryRadius: 0,
        //debug: true,
        distanceFilter: 0,
        stopOnTerminate: true,
        startOnBoot: false,
        startForeground: true,
        interval: 5000,
        notificationTitle: 'Aplicativo de coleta rodando',
        notificationText: 'Coletando as trajetórias do passeio',
        notificationIconColor: '#43A047',
        fastestInterval:5000,
        activitiesInterval:5000,
        stopOnStillActivity: false
    });

    // Função para identificar alterações no gps (on, off)
    backgroundGeolocation.watchLocationMode(
        function (enabled) {
            if (enabled) {
                console.log("Serviço de localização está habilitado agora");
                // call backgroundGeolocation.start
                // only if user already has expressed intent to start service
            } else {
                console.log("Serviço de localização está desabilitado agora");
                if (window.confirm('A localização está desabilitada e é necessária para utilizar esta aplicação. Você gostaria de abrir as configurações de localização?')) {
                    backgroundGeolocation.showLocationSettings();
                }
            }
        },
        function (error) {
            console.log('Error watching location mode. Error:' + error);
        }
    );

    function salvarTrilha(newData) {
        if( localStorage.getItem("trilhas") == null )
            localStorage.setItem("trilhas", "[]");
        var dataTxt = localStorage.getItem("trilhas")  
        var dataJson = JSON.parse( dataTxt );
        dataJson.push( newData );
        localStorage.setItem( "trilhas", JSON.stringify( dataJson ) );
        listarTrilhas();
    } 

    function salvarCao(newData) {
        if( localStorage.getItem("caes") == null )
            localStorage.setItem("caes", "[]");
        var dataTxt = localStorage.getItem("caes")  
        var dataJson = JSON.parse( dataTxt );

        // Verifica se o cão já está salvo
        var existe = false;
        dataJson.forEach(function(val, key){
            valor = JSON.parse(val);
            novoValor = JSON.parse(newData);
            if (valor.id_cao == novoValor.id_cao) {
                existe = true;
            }
        });

        if (!existe){
            dataJson.push( newData );
            localStorage.setItem( "caes", JSON.stringify( dataJson ) );
        }
    } 

    iniciarFinalizarRastreamento = function() {
        var bt = btFinalizarIniciar;
        bt.classList.toggle("btn_iniciar");
        bt.classList.toggle("btn_pausar");
        
        spanIcone.classList.toggle("fa-play");
        spanIcone.classList.toggle("fa-pause");
        
        if (bt.classList.contains("btn_iniciar")) {
            spanLabel.innerText = "Retomar";
            pausarRastreamento();
        } else {
            spanLabel.innerText = "Pausar";
            iniciarRastreamento();
        }
    }
    
	iniciarRastreamento = function() {
        // Inicia a coleta da trajetórias
        backgroundGeolocation.start(
            function (error) {
                if (error.code === 2) {
                    if (window.confirm('Acesso a localização não foi autorizado. Você gostaria de abrir as configurações do app?')) {
                        backgroundGeolocation.showAppSettings();
                    }
                } else {
                    window.alert('Erro ao iniciar: ' + error.message);  
                }
            }
        );
	}
    
    pausarRastreamento = function() {
        //Pausa a coleta da trajetória
        console.log("------------- PAUSE ---------------");
    	backgroundGeolocation.stop();
	}

	finalizarRastreamento = function() {
        if (btFinalizarIniciar.classList.contains("btn_pausar")) {
            iniciarFinalizarRastreamento();
        }
        spanLabel.innerText = "Iniciar";

        // Remover array vazio
        for (i=dadosColetados.trajetoria.length-1; i>=0; i--){
            if (!dadosColetados.trajetoria[i].length){
                dadosColetados.trajetoria.splice(i, 1);
           }
        }

        // Testar se sobrou algo
        if (!dadosColetados.trajetoria.length){
            win.close( win.dom.coletaTrajetoria );
        } else {
            dadosColetados['status'] = 0;
            dadosColetados['id_cao'] = localStorage.getItem("id_cao");
            //dadosColetados['id_dispositivo'] = device.uuid;
            dadosColetados['id_dispositivo'] = localStorage.getItem("id_dispositivo");
            // transfomar o array de objetos em string no formato JSON
            var dadosJson = JSON.stringify(dadosColetados);
            // salvar a string criada usando localStorage
            localStorage.setItem ("trilha-txt", dadosJson);
            enviarTrilhasEstocadas(dadosJson);
        }
    }

    enviarTrilhasEstocadas = function(trajetoriaTxt) {
        var networkState = navigator.connection.type;
        if (networkState !== Connection.NONE) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://54.201.29.21:8080/receivedata", false);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.addEventListener("error", function(){
                navigator.notification.alert(
                    "Erro na conexão com o servidor",
                    function(){},
                    "Ocorreu um erro",
                    "Ok"
                );
                salvarTrilha(localStorage.getItem("trilha-txt"));
                win.close( win.dom.coletaTrajetoria );
            });
            xhr.addEventListener("load", function(){
                var response = JSON.parse(xhr.responseText);
                if (!response.error) {
                    navigator.notification.alert(
                        "Seu passeio foi salvo",
                        function(){},
                        "Passeio Salvo",
                        "Ok"
                    );
                    dayName = new Array ("domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado");
                    monName = new Array ("janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro");
                    now = new Date;
                    registro['status'] = 1;
                    
                    registro['id_cao'] = localStorage.getItem ("id_cao");

                    registro['data'] = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + " - " +  dayName[now.getDay()] + ", " + now.getDate() + " de " + monName [now.getMonth()] + " de " + now.getFullYear();
                    registro['id_trajetoria'] = response.id_trajetoria;
                    var dadosJson = JSON.stringify(registro);
                    salvarTrilha(dadosJson);
                    // Limpando as variáveis e voltando para a tela inicial
                    countSubTrajetoria = 0;
                    dadosColetados.trajetoria = [];
                    localStorage.setItem ("trilha-txt", "");
                    win.close( win.dom.coletaTrajetoria );
                } else {
                    navigator.notification.alert(
                        ("Ocorreu um erro e seu passeio será salva no celular. Erro: " + response.message),
                        function(){},
                        "Erro",
                        "Ok"
                    );
                    salvarTrilha(localStorage.getItem("trilha-txt"));
                    win.close( win.dom.coletaTrajetoria );
                }
            }, false);
            xhr.send( trajetoriaTxt );
        } else {
            navigator.notification.alert(
                "Seu celular não possui conexão com a internet. Por enquanto a trajetoria será salva em seu celular",
                function(){},
                "Sem conexão",
                "Ok"
            );
            salvarTrilha(localStorage.getItem("trilha-txt"));
            win.close( win.dom.coletaTrajetoria );
        }
    }

    function mostrarTrajetorias() {
        navigator.notification.alert(
            JSON.stringify(dadosColetados),
            function(){},
            "Suas Trajetórias",
            "Ok"
        );
    }
    
    function iniciarPasseio(){
        backgroundGeolocation.isLocationEnabled(function (enabled) {
            if (enabled) {
                iniciarFinalizarRastreamento();
                win.open(win.dom.coletaTrajetoria);
            } else {
                if (window.confirm('A localização está desabilitada e é necessária para utilizar esta aplicação. Você gostaria de abrir as configurações de localização?')) {
                    backgroundGeolocation.showLocationSettings();
                }
            }
        });
    }
}

window.addEventListener("load", carregaPagina, false);
window.addEventListener("resize", carregaPagina, false);
function carregaPagina(){
    var tela = window.innerHeight;
    var botao = document.getElementById('btn_finalizar').clientHeight;
    if ((botao * 100 / tela) > 19) {
        document.getElementById('btn_finalizar').style.fontSize = "10vh";
        document.getElementById('btn_iniciar').style.fontSize = "10vh";
        document.getElementById('botao01').style.fontSize = "4.7vh";
        document.getElementById('botao02').style.fontSize = "4.7vh";
    } else {
        document.getElementById('btn_finalizar').style.fontSize = "15vw";
        document.getElementById('btn_iniciar').style.fontSize = "15vw";
        document.getElementById('botao01').style.fontSize = "7vw";
        document.getElementById('botao02').style.fontSize = "7vw";
    }

 //---------------------------------
                    
    var btVoltar = document.getElementById("btn_voltar");
    btVoltar.addEventListener("click", function(){
        document.getElementById('btn_sair').style.display = 'block'
        win.close(win.dom.mapa);
        flightPath.setMap(null);
    });

    var btSair = document.getElementById("btn_sair");
    btSair.addEventListener("click", function(){
        localStorage.setItem ("id_cao", "");
        localStorage.setItem ("id_dispositivo", "");
        localStorage.setItem ("nome_cao", "")
        nome_cao_tela.innerHTML = "";
        document.getElementById('in_main').innerHTML = "";
        listarCaes();
        win.openLogin( win.dom.tela_caes );
    });

    var btAdicionar = document.getElementById("btn_adicionar");
    btAdicionar.addEventListener("click", function(){
        win.openLogin(win.dom.login);                        
        win.closeLogin(win.dom.tela_caes);                        
    });

    var btObservar = document.getElementById("btn_observar");
    btObservar.addEventListener("click", mostrarTrajetorias);

    var btIniciar = document.getElementById("btn_iniciar");
    btIniciar.addEventListener("click", iniciarFinalizarRastreamento);

    var btFinalizar = document.getElementById("btn_finalizar");
    btFinalizar.addEventListener("click", finalizarRastreamento);
    
    var btPasseio = document.getElementById("btn_passeio");
    btPasseio.addEventListener("click", iniciarPasseio);

    var coord_mapa = 0;
    var coord_array = [];

    var lista = document.getElementById('in_main');
    lista.addEventListener('click', function(e){ 
        var el = e.target.closest(".in_trajetoria.pendente");
        if (el) {
            var listaTrajetorias = JSON.parse(localStorage.getItem("trilhas"));
            var trajetoriaAtual = listaTrajetorias[el.dataset.key]
            listaTrajetorias.splice(el.dataset.key, 1);
            localStorage.setItem( "trilhas", JSON.stringify( listaTrajetorias ) );
            enviarTrilhasEstocadas(trajetoriaAtual);
        }


        var el = e.target.closest(".in_trajetoria.enviado");
        if (el) {
            var networkState = navigator.connection.type;
            if (networkState !== Connection.NONE) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "http://54.201.29.21:8080/getTrajetoria?id="+el.dataset.key, false);
                xhr.addEventListener("error", function(){
                    navigator.notification.alert(
                        "Erro na conexão com o servidor",
                        function(){},
                        "Ocorreu um erro",
                        "Ok"
                    );
                });
                xhr.addEventListener("load", function(){
                    var response = JSON.parse(xhr.responseText);
                    if (!response.error) {
                        coord_mapa = response.coordenada;
                        for (i=0; i<coord_mapa.length; i++){
                            coord_array.push(new google.maps.LatLng(coord_mapa[i].coordenada.x, coord_mapa[i].coordenada.y));        
                        }
                        initMap();
                        document.getElementById('btn_sair').style.display = 'none'
                        win.open( win.dom.mapa );
                    } else {
                        navigator.notification.alert(
                            ("Ocorreu um erro ao exibir a trajetória. Tente novamente mais tarde. Erro: " + response.message),
                            function(){},
                            "Erro",
                            "Ok" 
                        );
                    }
                }, false);
                xhr.send(null);
            } else {
                navigator.notification.alert(
                    "Não é possível visualizar o mapa sem acesso a internet",
                    function(){},
                    "Sem conexão",
                    "Ok"
                );
            }

        }
    });

    var listaCaes = document.getElementById('tc_main');
    listaCaes.addEventListener('click', function(e){ 
        var el = e.target.closest(".tc_lista_caes");
        if (el) {
            localStorage.setItem ("id_cao", el.dataset.key);
            localStorage.setItem ("id_dispositivo", device.uuid);
            localStorage.setItem ("nome_cao", el.dataset.nome);
            nome_cao_tela.innerHTML  = localStorage.getItem("nome_cao");
            listarTrilhas();
            win.closeLogin(win.dom.tela_caes);
        }
    });

    function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: {"lat":coord_mapa[0].coordenada.x,"lng":coord_mapa[0].coordenada.y}//,
            //mapTypeId: google.maps.MapTypeId.TERRAIN
            //mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // var marker = new google.maps.Marker({
        //   position: {"lat":coord_mapa[0].coordenada.x,"lng":coord_mapa[0].coordenada.y},
        //   title: 'Ponto inicial',
        //   map: map,
        //   icon: 'icon.png'
        // });

        var symbolOne = {
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: '#80ff80',
            fillColor: '#00cc00',
            fillOpacity: 2,
            scale: 7
        };

        var symbolTwo = {
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: '#ff8080',
            fillColor: '#ff4d4d',
            fillOpacity: 2,
            scale: 7
        };

        flightPath = new google.maps.Polyline({
            path: coord_array,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            icons: [
              {
                icon: symbolOne,
                offset: '0%'
              }, {
                icon: symbolTwo,
                offset: '100%'
              }
            ]
        });

        flightPath.setMap(map);
        //map.setCenter(point, 15);
    }

    // Script para realizar autenticação do usuário
    var dom = {};
    dom.form = document.querySelector("form");
    dom.input = dom.form.querySelector("input");
    dom.button = dom.form.querySelector("button");
    dom.form.addEventListener("submit", function(evt) {
        evt.preventDefault();
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://54.201.29.21:8080/login?id="+dom.input.value, false);
        xhr.addEventListener("load", function(){
            var response = JSON.parse(xhr.responseText);
            if (response.error == false) {
                dom.input.value = "";
                localStorage.setItem ("id_cao", response.id);
                localStorage.setItem ("id_dispositivo", device.uuid);
                localStorage.setItem ("nome_cao", response.socializador);
                nome_cao_tela.innerHTML  = localStorage.getItem("nome_cao");

                caes['id_cao'] = response.id;
                caes['nome_cao'] = response.socializador;

                var caesJson = JSON.stringify(caes);
                salvarCao(caesJson);
                listarTrilhas();
                win.closeLogin( win.dom.login );
            } else {
                navigator.notification.alert(
                    ("Erro: " + response.message), 
                    function(){}, 
                    "Código inválido",
                    "Ok"
                );
            }
        }, false);
        xhr.send(null);
    }, false);
}