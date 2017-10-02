<?php
namespace Fva;

use MapasCulturais\app;
use MapasCulturais\Entities;

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
        $app->hook('POST(space.fvaSave)', function () use($app){
            $this->requireAuthentication();
            $spaceEntity = $app->view->controller->requestedEntity;
            
            if (!$spaceEntity->canUser('@control'))
                return false;
            
            $fvaAnswersJson = file_get_contents('php://input');

            $spaceEntity->fva2017 = $fvaAnswersJson;
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
        $fvaCorrente = $this->currentFva();
        
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
    private function currentFva(){
        $ano = \date('Y');
        $currentFva = "fva$ano";
        
        return $currentFva;
    }

    public function register() {
        $this->registerSpaceMetadata('fva2017', array(
            'label' => 'fva2017'
        ));
    }
}
