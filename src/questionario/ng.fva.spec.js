describe('Testes de Controllers e Services do questionario FVA', function() {
    //injetando módulo e suas dependências
    beforeEach(function() {
        angular.mock.module('ng.fva');
        /* angular.mock.module(function($provide) {
            $provide.value('MapasCulturais', _mapasCulturais)
        }); */
      });

    var $controller;

    beforeEach(inject(function(_$controller_){
        $controller = _$controller_;
    }));

    describe('Testando introCtrl', function(){
        var $scope, controller, questionValidatorService;
        
        beforeEach(function() {
            $scope = {};
            controller = $controller('introCtrl', {$scope: $scope});
            inject(function(_questionValidatorService_){
                questionValidatorService = _questionValidatorService_;
            });
        });

        mockNaoParticipouFVA = {
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
        };

        mockNaoParticipouFVAOutros = {
            label: 'Outros',
            answer: false,
            text: ''
        };

        mockJaParticipouFVA = {
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
        };

        describe('Testa as opcoes de primeira participacao no FVA', function(){
            it('Tenta enviar as respostas em branco', function(){
                var valid = questionValidatorService.multiplaEscolha(mockNaoParticipouFVA.motivos, mockNaoParticipouFVAOutros);
                expect(valid).toBe(false);
            });

            it('Testa o envia com algumas opcoes marcadas', function(){
                mockNaoParticipouFVA.motivos.naosabia = true;
                mockNaoParticipouFVAOutros.answer = true;
                mockNaoParticipouFVAOutros.text = 'Jasmine rocks!';

                var valid = questionValidatorService.multiplaEscolha(mockNaoParticipouFVA.motivos, mockNaoParticipouFVAOutros);
                expect(valid).toBe(true);
            });
        });
        
        describe('Testa as opções de quando não é a primeira vez que participa do FVA', function(){
            it('Tenta enviar todas as respostas em branco', function(){
                var valid = questionValidatorService.multiplaEscolha(mockJaParticipouFVA.edicoes);
                expect(valid).toBe(false);
            });
    
            it('Marca algumas opcoes de ja participacao anterior no FVA e envia', function(){
                mockJaParticipouFVA.edicoes.ed2016.answer = true;
                var valid = questionValidatorService.multiplaEscolha(mockJaParticipouFVA.edicoes);
                expect(valid).toBe(true);
            });
        });
    });

    describe('Testando responsavelCtrl', function(){
        var $scope, controller, questionValidatorService;
        
        beforeEach(function() {
            $scope = {};
            controller = $controller('responsavelCtrl', {$scope: $scope});
            inject(function(_questionValidatorService_){
                questionValidatorService = _questionValidatorService_;
            });
        });

        describe('Testa se a validacao de email está correta', function(){
            it('preenche o email de forma incorreta, retorna false para erro', function(){
                $scope.dadosResponsavel.email.answer = 'medialabufg.gov.br';
                var valid = questionValidatorService.validateEmail($scope.dadosResponsavel.email.answer);
                expect(valid).toBe(false);
            });

            it('preenche o email de forma correta, retorna true para válido', function(){
                $scope.dadosResponsavel.email.answer = 'medialab@ufg.gov.br';
                var valid = questionValidatorService.validateEmail($scope.dadosResponsavel.email.answer);
                expect(valid).toBe(true);
            });
        });
    });

    describe('Testando avaliacaoCtrl', function() {

        var $scope, controller, questionValidatorService;
        
        var mockAnswers = {
            avaliacao: {
                midias: {
                    correspondencia: {
                        label: "Correspondência enviada pelo IBRAM",
                        answer: true
                    },
                    portal: {
                        label: "Portal do IBRAM",
                        answer: true
                    },
                    socialmedia: {
                        label: "Redes sociais do IBRAM",
                        answer: true
                    },
                    telefone: {
                        label: "Contato telefônico com o IBRAM",
                        answer: false
                    }
                }
            }
        };

        beforeEach(function() {
            $scope = {};
            controller = $controller('avaliacaoCtrl', {$scope: $scope});
            inject(function(_questionValidatorService_){
                questionValidatorService = _questionValidatorService_;
            });
        });

        describe('Testa o envio das respostas de multipla escolha de forma incorreta', function(){
            it('Se enviar sem preencher os campos de multipla escolha devera retornar false', function() {
                //spyOn(questionValidatorService, 'multiplaEscolha').and.callThrough();
                var result = questionValidatorService.multiplaEscolha($scope.dadosAvaliacao.midias, $scope.dadosAvaliacao.midiasOutros);
                expect(result).toBe(false);
           });
        });

        describe('Testa o envio das respostas de multipla escolha de forma correta', function(){
            it('Ao enviar contendo ao menos uma opcao marcado nos campos de múltipla escolha, retorna variável false para erro', function(){
                //spyOn(questionValidatorService, 'multiplaEscolha').and.callThrough();
                var result = questionValidatorService.multiplaEscolha(mockAnswers.avaliacao.midias, $scope.dadosAvaliacao.midiasOutros);
                expect(result).toBe(true);
            });
        });

        describe('Testa o envio do campo outros. Se este for marcado, nao pode estar em branco', function() {
            var mockOutros = {
                label: "Outros",
                answer: false,
                text: ''
            };

            beforeEach(function(){
                mockOutros.answer = false;
                mockOutros.text = '';
            });

            it('marca o campo outros e deixa em branco', function(){
                mockOutros.answer = true;
                var valid = questionValidatorService.multiplaEscolha(mockAnswers.avaliacao.midias, mockOutros);
                expect(valid).toBe(false);
            });

            it('marca o campo outros e o preenche', function(){
                mockOutros.answer = true;
                mockOutros.text = 'Jasmine Rocks!';
                var result = questionValidatorService.multiplaEscolha(mockAnswers.avaliacao.midias, mockOutros);
                expect(result).toBe(true);
            })
        });
    });
});
