"use strict";

angular.module("ng.fva", ['ui.router', 'ui.mask'])

//Controller definido em fva-form que faz o roteamento entre um novo questionário ou exibir um questionário já respondido
.controller('rootController', ['$scope', '$rootScope', '$state', 'fvaQuestions', function($scope, $rootScope, $state, fvaQuestions){
    
    if(MapasCulturais.hasOwnProperty('respondido')){
        $scope.$root.respostas = angular.fromJson(MapasCulturais.respondido);
        $scope.respostas = fvaQuestions;
        
        $state.go('revisao');
    }
    else{
        $state.go('index');
    }
}])

.controller('indexCtrl', ['$scope', '$state', function($scope, $state){
    $scope.beginFva = function(){
        $state.go('termo-compromisso');
    }
}])

.controller('termoCompromissoCtrl', ['$scope', '$state', 'fvaQuestions', function ($scope, $state, fvaQuestions) {
    $scope.condicao = fvaQuestions.termosCompromisso;
    $scope.displayAlertaTermoCompromisso = false;
    
    $scope.validateTermos = function () {
        if ($scope.condicao.ciente) {
            $state.go('intro');
        }
        else {
            $scope.displayAlertaTermoCompromisso = true;
        }
    }
}])

.controller('introCtrl', ['$scope', '$state', 'fvaQuestions', 'questionValidatorService', function ($scope, $state, fvaQuestions, questionValidatorService) {
    $scope.dadosIntro = fvaQuestions.introducao;
    
    //Checa se não foi deixado resposta em branco e exibe a respectiva mensagem de alerta
    function validateIntro() {
        var isValid = false;

        //faz a validação de acordo com as informações que estão sendo exibidas na tela
        if ($scope.dadosIntro.primeiraParticipacaoFVA.answer) {
            isValid = questionValidatorService.multiplaEscolha($scope.dadosIntro.questionarioNaoParticipou.motivos, $scope.dadosIntro.questionarioNaoParticipouOutros);
            $scope.displayFirstTimeSurveyWarning = !isValid;

            return isValid;
        }
        else {
            isValid = questionValidatorService.multiplaEscolha($scope.dadosIntro.questionarioJaParticipou.edicoes);
            $scope.displayNotFirstTimeSurveyWarning = !isValid;

            return isValid;
        }
    }

    $scope.nextPage = function() {
        if(validateIntro()){
            $state.go('responsavel');
        }
    };
}])

.controller('responsavelCtrl', ['$scope', '$state', 'fvaQuestions', 'questionValidatorService', function ($scope, $state, fvaQuestions, questionValidatorService) {
    $scope.dadosResponsavel = fvaQuestions.responsavel;
    var isNameValid, isTelValid, isEmailValid;

    function validateResponsavel() {
        isNameValid = $scope.dadosResponsavel.nome.answer === '' ? false : true;
        isTelValid = $scope.dadosResponsavel.telefone.answer === '' ? false : true;

        $scope.displayNameWarning = !isNameValid;
        $scope.displayTelWarning = !isTelValid;

        if(questionValidatorService.validateEmail($scope.dadosResponsavel.email.answer)){
            $scope.displayEmailWarning = false;
            isEmailValid = true;
        }else {
            $scope.displayEmailWarning = true;
            isEmailValid = false;
        }

        if (isNameValid && isTelValid && isEmailValid) {
            return true;
        }
        else{
            return false;
        }
    };
    
    $scope.nextPage = function() {
        if(validateResponsavel()){
            $state.go('visitacao');
        }
    };
}])

.controller('visitacaoCtrl', ['$scope', '$state', 'fvaQuestions', 'questionValidatorService', function ($scope, $state, fvaQuestions, questionValidatorService) {
    $scope.dadosVisitacao = fvaQuestions.visitacao;

    function validateVisitacao() {
        if ($scope.dadosVisitacao.realizaContagem.answer) {
            var isContagemValid = questionValidatorService.multiplaEscolha($scope.dadosVisitacao.tecnicaContagem, $scope.dadosVisitacao.tecnicaContagemOutros);
            $scope.displayTecnicaContagemWarning = !isContagemValid;
            var isTotalVisitasValid = $scope.dadosVisitacao.quantitativo.answer === null ? false : true;
            $scope.displayTotalVisitasWarning = !isTotalVisitasValid;
            
            if (isContagemValid && isTotalVisitasValid) {
                return true;
            }
        }
        //Se tentar passar a página sem marcar uma resposta de sim ou não, barra
        else if($scope.dadosVisitacao.realizaContagem.answer === null){
          return false;
        }
        else if($scope.dadosVisitacao.realizaContagem.answer === false){
          //nenhuma validação é necessária
          return true;
        }
    };

    $scope.nextPage = function(){
        if(validateVisitacao()) {
            $state.go('avaliacao');
        }
    };
}])

.controller('avaliacaoCtrl', ['$scope', '$state', 'fvaQuestions', 'questionValidatorService', 'saveFvaQuestions', function ($scope, $state, fvaQuestions, questionValidatorService, saveFvaQuestions) {
    $scope.dadosAvaliacao = fvaQuestions.avaliacao;
    
    function validateAvaliacao() {
        var isValid = questionValidatorService.multiplaEscolha($scope.dadosAvaliacao.midias, $scope.dadosAvaliacao.midiasOutros);
        $scope.displayMidiaWarning = !isValid;
        
        return isValid;
    }
    
    $scope.nextPage = function(){
        if(validateAvaliacao()){
            $state.go('revisao');
        }
    }
}])

.controller('revisaoCtrl', ['$scope','$rootScope', 'fvaQuestions', 'saveFvaQuestions', function ($scope, $rootScope, fvaQuestions, saveFvaQuestions) {
    if($scope.$root.respostas){
        $scope.respostasFVA = $scope.$root.respostas;
        $scope.showReviewAlert = false;
    }
    else{
        $scope.respostasFVA = fvaQuestions;
        $scope.showReviewAlert = true;
    }

    $scope.enviarFVA = function(){
        saveFvaQuestions.save();
        $scope.showReviewAlert = false;
    }
}])

.config(['$stateProvider', function ($stateProvider) {
    var pluginTemplatePath = '/protected/application/plugins/Fva/src/questionario/partials';

    $stateProvider
        .state('index', {
            controller: 'indexCtrl',
            templateUrl: pluginTemplatePath + '/index.html',
            onEnter: function(){
                $(document).scrollTop(window.innerHeight/2)
            }
        })
        .state('termo-compromisso', {
            controller: 'termoCompromissoCtrl',
            templateUrl: pluginTemplatePath + '/termo-compromisso.html',
            onEnter: function(){
                $(document).scrollTop(window.innerHeight/2)
            }
        })
        .state('intro', {
            controller: 'introCtrl',
            templateUrl: pluginTemplatePath + '/intro.html',
            onEnter: function(){
                $(document).scrollTop(window.innerHeight/2)
            }
        })
        .state('responsavel', {
            controller: 'responsavelCtrl',
            templateUrl: pluginTemplatePath + '/responsavel.html',
            onEnter: function(){
                $(document).scrollTop(window.innerHeight/2)
            }
        })
        .state('visitacao', {
            controller: 'visitacaoCtrl',
            templateUrl: pluginTemplatePath + '/visitacao.html',
            onEnter: function(){
                $(document).scrollTop(window.innerHeight/2)
            }
        })
        .state('avaliacao', {
            controller: 'avaliacaoCtrl',
            templateUrl: pluginTemplatePath + '/avaliacao.html',
            onEnter: function(){
                $(document).scrollTop(window.innerHeight/2)
            }
        })
        .state('revisao', {
            controller: 'revisaoCtrl',
            templateUrl: pluginTemplatePath + '/revisao.html',
            onEnter: function(){
                $(document).scrollTop(window.innerHeight/2)
            }
        })
}])

.service('questionValidatorService', function () {
    //valida se pelo menos uma opçao da multipla escolha foi selecionado
    this.multiplaEscolha = function (questionario, outros) {
        var isValid = false;

        Object.keys(questionario).forEach(function(k) {
            if(questionario[k].answer === true) {
                isValid = true;
            }
        });

        //valida o campo 'Outros' que é opcional
        if(outros !== undefined) {
            if(outros.answer && outros.text.length == 0) {
                isValid = false;
            }
            else if(outros.answer && outros.text.length > 0) {
                isValid = true;
            }
        }

        return isValid;
    }

    //Se o campo outros estiver marcado mas não tiver texto, retorna true
    this.validaOutros = function (outros) {
        return outros.answer && outros.text.length == 0 ? true : false;
    }

    this.validateEmail = function (email) {
        var filter = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return filter.test(email);
    }
})

.service('saveFvaQuestions', ['$http', 'fvaQuestions', function($http, fvaQuestions){
    this.save = function(){
        $http.post(MapasCulturais.createUrl('space', 'fvaSave', [MapasCulturais.entity.id]), angular.toJson(fvaQuestions)).then(function successCallback(response){
            MapasCulturais.Messages.success('Formulário enviado com sucesso!');
        },
        function errorCallback(){
            MapasCulturais.Messages.error('Houve um erro no servidor. Tente enviar novamente dentro de alguns minutos.');
        });
    }
}])

.factory('fvaQuestions', function () {
    return {
        termosCompromisso: {
            ciente: false
        },
        introducao: {
            primeiraParticipacaoFVA: {
                label: 'É a primeira vez que o Museu participa do levantamento do Formulário de Visitação Anual?',
                answer: null
            },
            questionarioNaoParticipou: {
                label: 'Indique o(s) motivo(s) para a NÃO participação nas edições anteriores',
                motivos: {
                    naosabia: {
                        label: 'Não sabíamos da iniciativa',
                        answer: false
                    },
                    prazo: {
                        label: 'Perdemos o prazo de participação',
                        answer: false
                    },
                    informacao: {
                        label: 'Não tínhamos as informações solicitadas',
                        answer: false
                    },
                    naorealizava: {
                        label: 'Não realizávamos a contagem',
                        answer: false
                    },
                    seminternet: {
                        label: 'Dificuldade de acesso à internet',
                        answer: false
                    }
                }
            },
            questionarioNaoParticipouOutros: {
                label: 'Outros',
                answer: false,
                text: ''
            },
            questionarioJaParticipou: {
                label: "Quais edições do FVA o Museu já participou?",
                edicoes: {
                    ed2014: {
                        label: 'FVA 2014 - aplicação ocorrida em 2015 referente à visitação anual ao Museu em 2014',
                        answer: false
                    },
                    ed2015: {
                        label: 'FVA 2015 - aplicação ocorrida em 2016 referente à visitação anual ao Museu em 2015',
                        answer: false
                    },
                    ed2016: {
                        label: 'FVA 2016 - aplicação ocorrida em 2017 referente à visitação anual ao Museu em 2016',
                        answer: false
                    }
                }
            }
        },
        responsavel: {
            nome: {
                label: 'Nome do RESPONSÁVEL pelo preenchimento do FVA 2017',
                answer: ''
            },
            telefone: {
                label: 'Telefone para contato com o RESPONSÁVEL pelo preenchimento do FVA 2017',
                answer: ''
            },
            email: {
                label: 'E-mail do RESPONSÁVEL pelo preenchimento do FVA 2017',
                answer: ''
            }
        },
        visitacao: {
            realizaContagem: {
                label: 'A Instituição realiza contagem de público (visitação/visita)?',
                answer: null
            },
            tecnicaContagem: {
                assinatura: {
                    label: 'Livro de assinatura',
                    answer: false
                },
                catraca: {
                    label: 'Roleta/Catraca',
                    answer: false
                },
                ingresso: {
                    label: 'Ingresso contabilizado',
                    answer: false
                },
                contador: {
                    label: 'Contador manual',
                    answer: false
                },
                sensor: {
                    label: 'Sensor eletrônico',
                    answer: false
                },
                formulario: {
                    label: 'Formulário',
                    answer: false
                },
                lista: {
                    label: 'Lista de presença em atividades do museu',
                    answer: false
                }
            },
            tecnicaContagemOutros: {
                label: 'Outros',
                answer: false,
                text: ''
            },
            quantitativo: {
                label: 'Quantitativo total de visitações/visitas no ano referência (2016)',
                answer: null
            },
            observacoes: {
                label: 'Observações sobre a visitação no ano de referência (2016)',
                answer: null
            }
        },
        avaliacao: {
            midias: {
                correspondencia: {
                    label: "Correspondência enviada pelo IBRAM",
                    answer: false
                },
                portal: {
                    label: "Portal do IBRAM",
                    answer: false
                },
                socialmedia: {
                    label: "Redes sociais do IBRAM",
                    answer: false
                },
                telefone: {
                    label: "Contato telefônico com o IBRAM",
                    answer: false
                },
                revista: {
                    label: "Revista",
                    answer: false
                },
                jornal: {
                    label: "Jornal",
                    answer: false
                },
                radio: {
                    label: "Rádio",
                    answer: false
                },
                televisao: {
                    label: "Televisão",
                    answer: false
                },
                cartaz: {
                    label: "Cartaz",
                    answer: false
                },
                folder: {
                    label: "Folder/Panfleto(flyer)",
                    answer: false
                },
                internet: {
                    label: "Internet",
                    answer: false
                },
                terceiros: {
                    label: "Terceiros(colegas de trabalho, amigos, etc)",
                    answer: false
                },
                redes: {
                    label: "Redes sociais(Instagram, Facebook, Twitter, Google+, Youtube, etc.)",
                    answer: false
                }
            },
            midiasOutros: {
                label: "Outros",
                answer: false,
                text: ''
            },
            opiniao: {
                label: "Gostaríamos de saber sua opinião sobre o nosso questionário. Registre neste espaço as informações faltantes que você considera" +
                "pertinentes e deixe também comentários/sugestões/críticas para aprimorarmos o Formulário de Visitação Anual em suas próximas edições",
                text: ''
            }
        }
    }
});