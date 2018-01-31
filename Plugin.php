<?php
namespace Fva;

use MapasCulturais\app;
use MapasCulturais\Entities;
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
        
        //Insere a aba FVA com o questionário no tema
        $app->hook('template(space.single.tabs):end', function() use($app){
            $spaceEntity = $app->view->controller->requestedEntity;
            
            if ($spaceEntity->canUser('@control'))
                $this->part('fva-tab');
        });

        $app->hook('template(space.single.tabs-content):end', function() use($app){
            $spaceEntity = $app->view->controller->requestedEntity;
            
            if ($spaceEntity->canUser('@control'))
                $this->part('fva-form');
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
        $ano = \date('Y');
        $currentFva = "fva$ano";
        
        return $currentFva;
    }

    
    public function register() {
        $registerCurrentFva = $this->getCurrentFva();

        $this->registerSpaceMetadata($registerCurrentFva, array(
            'label' => $registerCurrentFva
        ));
    }
}
