<?php
namespace Fva;

use MapasCulturais\app;
use MapasCulturais\Entities;

require_once "vendor/autoload.php";
/**
 *      Este plugin é responsável por gerar o formulário para preenchimento do FVA (Formulário de Visitação Anual).
 * A cada ano, o IBRAM aplica um novo questionário que deve ser preenchido pelos museus a fim de, principalmente, ter um controle
 * estatístico de visitações.
 *      O método getCurrentFva() mantém a informação de qual o ano corrente em que está sendo aplicado o
 * questionário no formato 'fva+ano de aplicação' e salva no banco como um metadado do tipo space-type. (Exemplo: 'fva2017->[json com as respostas]).
 */
class Plugin extends \MapasCulturais\Plugin {

    public function _init() {
        $app = App::i();

        // Fazer funcionar apenas no tema de museus:
        if (get_class($app->view) != 'MapasMuseus\Theme')
            return;

        $plugin = $this;

        //Grava a flag que FVA está disponível para ser respondido
        $app->hook('POST(panel.fvaOpenYear)', function() use($app, $plugin){
            $newFva = json_decode(file_get_contents('php://input'));

            $subsite = $app->getCurrentSubsite();
            $subsite->fvaOpen = $newFva;

            //Verifica se a entidade 'SubsiteMeta' já tem o array referente aos anos de aplicação do FVA
            if(!empty($newFva)){
                if($subsite->getMetadata('yearsAvailable')){
                    $yearsAvailable = json_decode($subsite->getMetadata('yearsAvailable'));

                    //Verifica se já existe o ano no array
                    if(!in_array($newFva, $yearsAvailable)){
                        $yearsAvailable[] = $newFva;
                    }

                }else{
                    $yearsAvailable[] = $newFva;
                }

                $subsite->yearsAvailable = json_encode($yearsAvailable);
            }

            $subsite->save(true);
        });

        //Se o FVA estiver aberto, retorna o ano
        $app->hook('GET(panel.fvaOpenYear)', function() use($app, $plugin){
            if($plugin->getCurrentFva() == '[]')
                echo null;
            else
                echo $plugin->getCurrentFvaYear();
        });

        //Retorna o último FVA realizado, caso não tenha nenhum FVA aberto
        $app->hook('GET(panel.lastFvaOpenYear)', function() use($app, $plugin){
            if(!$plugin->getCurrentFvaYear()){
                $fvas = json_decode($plugin->fvaYearsAvailable($app),true);
                echo $fvas[count($fvas)-1]['year'];
            }else{
                echo $plugin->getCurrentFvaYear();
            }
        });

        //Retorna array com FVAs realizados
        $app->hook('GET(panel.fvaYearsAvailable)', function() use($app, $plugin){
            echo $plugin->fvaYearsAvailable($app);
        });

        //Insere a aba FVA com o questionário no tema
        $app->hook('template(space.single.tabs):end', function() use($app, $plugin){
            $spaceEntity = $app->view->controller->requestedEntity;

            if ($spaceEntity->canUser('@control') && empty($plugin->getCurrentFva()))
                $this->part('fva-tab');
        });

        //Insere o form do FVA
        $app->hook('template(space.single.tabs-content):end', function() use($app,$plugin){
            $spaceEntity = $app->view->controller->requestedEntity;

            if ($spaceEntity->canUser('@control') && empty($plugin->getCurrentFva()))
                $this->part('fva-form',['fvaOpenYear' => $plugin->getCurrentFvaYear()]);
        });

        //Painel do Admin FVA
        $app->hook('panel.menu:after', function() use ($app){
            if(!$app->user->is('admin') && !$app->user->is('staff'))
            return;

            $url = $app->createUrl('panel', 'fva-admin');
            echo "<li><a href='$url'><span class='icon icon-em-cartaz'></span>FVA</a></li>";
        });

        //Hook que carrega o HTML gerado pelo build do ReactJS para o Admin
        $app->hook('GET(panel.fva-admin)', function() use ($app) {
            $this->requireAuthentication();

            if(!$app->user->is('admin') && !$app->user->is('staff')){
                $app->pass();
            }

            $this->render('fva-admin');
        });



        $app->hook('mapasculturais.head', function() use($app, $plugin){
            $spaceEntity = $app->view->controller->requestedEntity;

            /**
            * Checa se o questionário corrente já foi respondido. Caso sim, ele é adicionado na chave 'respondido' e depois é acessado
            * no javascript via objeto global MapasCulturais (MapasCulturais.respondido)
            */
            if($spaceEntity && $spaceEntity->getEntityType() == 'Space' && $spaceEntity->canUser('@control')){
                $questionarioRespondido = $plugin->checkCurrentFva($spaceEntity);

                if(!empty($questionarioRespondido)){
                    $app->view->jsObject['respondido'] = $questionarioRespondido;
                }

                $app->view->enqueueScript('app', 'angular-ui-mask', '../node_modules/angular-ui-mask/dist/mask.js');
                $app->view->enqueueScript('app', 'angular-ui-router', '../node_modules/@uirouter/angularjs/release/angular-ui-router.js');
                $app->view->enqueueScript('app', 'angular-input-masks', '../node_modules/angular-input-masks/releases/angular-input-masks-standalone.js');
                $app->view->enqueueScript('app', 'ng.fva', '../src/questionario/ng.fva.js');
                $app->view->enqueueStyle('app', 'fva.css', '../src/questionario/fva.questionario.css');

                $app->view->jsObject['angularAppDependencies'][] = 'ng.fva';
            }

            // Carrega JS do painel de Admin
            $controllerAtual = $app->view->getController();
            if(property_exists($controllerAtual, 'action') && $controllerAtual->action === 'fva-admin') {
                $app->view->enqueueScript('app', 'bundle', '/bundle.js');
            }


        });




        //Geração da planilha de museus que responderam FVA
        $app->hook('POST(panel.generate-xls)', function() use($app, $plugin) {
            $objPHPExcel = new \PHPExcel();

            // JSON dos museus a serem inclusos no relatório
            $museusRelatorio = json_decode(file_get_contents('php://input'));

            //Recupera um museu para verficar de qual ano são os dados
            $year = 0;
            foreach ($museusRelatorio[0] as $key => $value) {
                if (preg_match("/^fva([0-9]{4})$/", $key)){
                    $year = substr($key,3);
                    break;
                }else{
                    continue;
                }
            }


            // Propriedades do Documento
            $objPHPExcel->getProperties()->setCreator("IBRAM")
            ->setLastModifiedBy("IBRAM")
            ->setTitle("Relatório de Respostas do FVA $year")
            ->setSubject("Relatório de Respostas do FVA $year")
            ->setDescription("Relatório de Respostas do FVA $year")
            ->setKeywords("Relatório FVA $year")
            ->setCategory("Relatório $year");

            // Legenda das Colunas da Planilha
            $objPHPExcel->setActiveSheetIndex(0)
            ->setCellValue('A1', 'Museu')
            ->setCellValue('B1', 'Código Museu')
            ->setCellValue('C1', 'Responsavel')
            ->setCellValue('D1', 'Email Responsavel')
            ->setCellValue('E1', 'Telefone Responsavel')
            ->setCellValue('F1', 'Primeira Participação no FVA')
            ->setCellValue('G1', 'Motivos Por Não Participar das Edições Anteriores')
            ->setCellValue('H1', 'Outros Motivos Por Não Participar das Edições Anteriores')
            ->setCellValue('I1', 'A Instituição realiza contagem de público?')
            ->setCellValue('J1', 'Técnicas de Contagem Utilizadas')
            ->setCellValue('K1', 'Outras Técnicas de Contagem Utilizadas')
            ->setCellValue('L1', 'Justificativa Baixa Visitação')
            ->setCellValue('M1', 'Total de Visitações')
            ->setCellValue('N1', 'Observações Sobre Visitação')
            ->setCellValue('O1', 'Meios Pelos Quais Soube do FVA')
            ->setCellValue('P1', 'Outras Mídias FVA')
            ->setCellValue('Q1', 'Opinião Sobre o Questionário FVA');

            // Preenche a planilha com os dados
            $plugin->writeSheetLines($museusRelatorio, $objPHPExcel, $plugin, $year);

            // Nomeia a Planilha
            $objPHPExcel->getActiveSheet()->setTitle("Relatório FVA $year");

            // Seta a primeira planilha como a ativa
            $objPHPExcel->setActiveSheetIndex(0);

            // Headers a serem enviados na resposta (Excel2007)
            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename="01simple.xls"');
            header('Cache-Control: max-age=0');
            // Necessário para o IE9
            header('Cache-Control: max-age=1');

            header ('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Não expira
            header ('Last-Modified: '.gmdate('D, d M Y H:i:s').' GMT'); // sempre modificado
            header ('Cache-Control: cache, must-revalidate'); // HTTP/1.1
            header ('Pragma: public'); // HTTP/1.0

            $objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');

            //Salva a planilha no buffer de saída
            ob_start();
            $objWriter->save("php://output");
            $xlsData = ob_get_contents();
            ob_end_clean();

            $response =  array(
                'file' => "data:application/vnd.ms-excel;base64,".base64_encode($xlsData),
                'year' => $year
            );

            echo json_encode($response);
        });





        /**
         * Salva o JSON com as respostas
         */
        $app->hook('POST(space.fvaSave)', function () use($app, $plugin){
            $this->requireAuthentication();
            $spaceEntity = $app->view->controller->requestedEntity;

            if (!$spaceEntity->canUser('@control'))
                return false;

            $fvaAnswersJson = file_get_contents('php://input');
            $currentFva = $plugin->getCurrentFva();
            $spaceEntity->{$currentFva} = $fvaAnswersJson;
            $spaceEntity->save(true);
        });

        //Apaga o FVA do museu do id fornecido
        $app->hook('POST(panel.resetFVA)', function() use($app, $plugin){
            $this->requireAuthentication();

            $id = json_decode(file_get_contents('php://input'));
            $spaceEntity = $app->repo('Space')->find($id);
            $spaceFva = $spaceEntity->getMetadata($plugin->getCurrentFva(), true);
            $spaceFva->delete(true);
        });
    }

    /**
     * Verifica se o questionário atual já foi respondido
     * e o retorna, senão retorna false
     *
     * @param obj $spaceEntity
     * @return bool
     */
    private function checkCurrentFva($spaceEntity){
        $ano = \date('Y');
        $fvaCorrente = $this->getCurrentFva();

        if(array_key_exists($fvaCorrente, $spaceEntity->metadata)){
            return $spaceEntity->metadata[$fvaCorrente];
        }
        else{
            return false;
        }
    }

    /**
     * Get do Fva do ano corrente
     *
     * @return string
     */
    private function getCurrentFva(){
        $app = App::i();

        $subsite = $app->getCurrentSubsite();

        $fvaOpen = 'fva' . $subsite->getMetadata('fvaOpen');
        $currentFva = (empty($fvaOpen)) ? json_encode(array()) : $fvaOpen;

        return $currentFva;
    }

    private function getCurrentFvaYear(){
        return substr($this->getCurrentFva(),3);
    }

    public function register() {
        $app = App::i();

        //Registra todos os metadados de todos os FVAs realizados
        $fvas = json_decode($this->fvaYearsAvailable($app),true);
        foreach ($fvas as $key => $year) {
            $this->registerSpaceMetadata('fva'.$year['year'], array(
                'label'   => 'fva'.$year['year'],
                'private' => true
            ));
        }


        $metadata = [
            'MapasCulturais\Entities\Subsite' => [
                'fvaOpen' => [
                    'label'       => 'Formulário de Visitação Anual',
                    'private'     => true,
                    'validations' => [
                        'v::leapYear()' => 'O valor deve ser um ano com 4 dígitos'
                    ]
                ],
                'yearsAvailable' => [
                    'label'   => 'FVAs disponíveis de anos já realizados',
                    'private' => true
                ]
            ]
        ];

        foreach($metadata as $entity_class => $metas){
            foreach($metas as $key => $cfg){
                $def = new \MapasCulturais\Definitions\Metadata($key, $cfg);
                $app->registerMetadata($def, $entity_class);
            }
        }

    }

    /**
     * Escreve cada linha da exportação dos dados do FVA em planilha em suas respectivas colunas
     *
     * @param array $museus
     * @param obj $objPHPExcel
     * @param pointer $plugin
     * @return void
     */
    private function writeSheetLines($museus, $objPHPExcel, $plugin, $year) {
        $line = 2; //A primeira linha destina-se aos cabeçalhos das colunas

        foreach($museus as $m) {
            $fva = json_decode($m->{'fva' . $year});

            $objPHPExcel->setActiveSheetIndex(0)
                        ->setCellValue('A' . (string)$line, $m->name)
                        ->setCellValue('B' . (string)$line, $m->mus_cod)
                        ->setCellValue('C' . (string)$line, $fva->responsavel->nome->answer)
                        ->setCellValue('D' . (string)$line, $fva->responsavel->email->answer)
                        ->setCellValue('E' . (string)$line, $fva->responsavel->telefone->answer)
                        ->setCellValue('F' . (string)$line, $fva->introducao->primeiraParticipacaoFVA->answer === true ? 'Sim' : 'Não')
                        ->setCellValue('G' . (string)$line, $plugin->assertBlockAnswers($fva->introducao->questionarioNaoParticipou->motivos))
                        ->setCellValue('H' . (string)$line, $fva->introducao->questionarioNaoParticipouOutros->answer !== false ? $fva->introducao->questionarioNaoParticipouOutros->text : '')
                        ->setCellValue('I' . (string)$line, $fva->visitacao->realizaContagem === true ? 'Sim' : 'Não')
                        ->setCellValue('J' . (string)$line, $plugin->assertBlockAnswers($fva->visitacao->tecnicaContagem))
                        ->setCellValue('K' . (string)$line, $fva->visitacao->tecnicaContagemOutros->answer !== false ? $fva->visitacao->tecnicaContagemOutros->text : '')
                        ->setCellValue('L' . (string)$line, $fva->visitacao->justificativaBaixaVisitacao->answer !== null ? $fva->visitacao->justificativaBaixaVisitacao->answer : '')
                        ->setCellValue('M' . (string)$line, $fva->visitacao->quantitativo->answer !== null ? $fva->visitacao->quantitativo->answer : '')
                        ->setCellValue('N' . (string)$line, $fva->visitacao->observacoes->answer !== null ? $fva->visitacao->observacoes->answer : '')
                        ->setCellValue('O' . (string)$line, $plugin->assertBlockAnswers($fva->avaliacao->midias))
                        ->setCellValue('P' . (string)$line, $fva->avaliacao->midiasOutros->answer !== false ? $fva->avaliacao->midiasOutros->text : '')
                        ->setCellValue('Q' . (string)$line, $fva->avaliacao->opiniao->text !== null ? $fva->avaliacao->opiniao->text : '');


            $line++;
        }
    }

    /**
     * Analisa um bloco de questões da exportação da planilha. Se tiver sido marcado como 'true', retorna o label da questão
     * e grava na respectiva linha
     *
     * @param array $questionario
     * @return string
     */
    private function assertBlockAnswers($questionario) {
        $answers = array();

        foreach($questionario as $questao) {
            if($questao->answer !== false) {
                $answers[] = $questao->label;
            }
        }
        $return = implode(", ", $answers);
        return $return;
    }

    private function fvaYearsAvailable($app){
        if($yearsAvailable = $app->repo('SubsiteMeta')->findBy(array('key' => 'yearsAvailable'))){
            $yearsAvailable = json_decode($yearsAvailable[0]->value);

            $years = Array();
            foreach ($yearsAvailable as $key => $fva) {
                $years[] = array(
                    'year'  => $fva
                );
            }

            return json_encode($years);
        }

        return false;
    }



}
