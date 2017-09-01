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
        
        //Painel do Admin FVA
        /* $app->hook('panel.menu:after', function() use ($app){
            if(!$app->user->is('admin') && !$app->user->is('staff'))
            return;
            
            $a_class = $this->template == 'panel/fva-admin' ? 'active' : '';
            $url = $app->createUrl('panel', 'fva-admin');
            echo "<li><a class='$a_class' href='$url'><span class='icon icon-em-cartaz'></span>FVA</a></li>";
        }); */
        
        //Registra o js do painel admin
        /* $app->hook('mapasculturais.head', function() use($app){
            $app->view->enqueueScript('app', 'ng.fva-admin', 'js/ng.fva-admin.js');
            $app->view->jsObject['angularAppDependencies'][] = 'ng.fva-admin';

            $spaceEntity = $app->repo('SpaceMeta');
            $em = $app->getEm();
            $query = $em->createQuery('SELECT COUNT(s.id) FROM MapasCulturais\Entities\Space s');
            $count = $query->getSingleScalarResult(); */
            //\dump($count);
            //\dump($spaceEntity->findBy(array('key'=>'fva2017')));
            
       /*  }); */
        
        /* $app->hook('GET(panel.fva-admin)', function() use ($app) {
            $this->requireAuthentication();
            if(!$app->user->is('admin') && !$app->user->is('staff')){
                $app->pass();
            }
            

            $this->render('fva-admin');
        }); */
        
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
                
                $app->view->enqueueScript('app', 'angular-ui-mask', 'js/mask.js');
                $app->view->enqueueScript('app', 'angular-ui-router', 'js/angular-ui-router.min.js');
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
            
            $spaceMeta = new Entities\SpaceMeta;
            $fvaCorrente = $this->currentFva();
            
            $spaceMeta->key = 'fva2017';
            $spaceMeta->value = $fvaAnswersJson;
            $spaceMeta->owner = $spaceEntity;

            $app->em->persist($spaceMeta);
            $spaceMeta->save(true);
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
        
    }
}
