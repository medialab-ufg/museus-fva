# Plugin FVA
Plugin do Mapas Culturais para museus adicionarem o Formulário de Visitação Anual (FVA).

Após instalar corretamente, terá disponível a aba **FVA**
na página do espaço do museu.

## Ativação

Para ativar este plugin, clone o repositório em 'src/protected/application/plugins' com o comando:
`git clone --depth=1 https://github.com/medialab-ufg/museus-fva.git Fva`

entre via terminal até a pasta onde foi clonado o repositório e execute o comando:
`npm install`
para instalar as dependências do NodeJS. Portanto, é necessário ter instalado o [node js](https://nodejs.org/).

Feito isto, configure seu config.php:

```PHP

'plugins' => [
    //outros plugins instalados ...
    'Fva' =>['namespace'=>'Fva'],
],

```
## Instalação e Desenvolvimento

Este plugin contém dependências de bibliotecas PHP (instaladas via composer) e Javascript (instaladas via npm).

Uma das dependências do PHP é a lib ZipArchive - utilizada para geração de relatórios.
Portanto, certifique-se de que ela está instalada, antes de rodar os próximos comandos.

Em ambientes debian-like, é possível instalá-la com o comando:

```
sudo apt-get install php7.2-zip 

```
observando a versão correta da sua instalação do PHP.

Feito isso, conclua esta etapa instalando as dependências e fazer o build da aplicação em React, execute:

```
composer install
npm install
npm run-script build
```

O plugin contém também testes unitários para os controllers do Angular. 
Na pasta do plugin execute o comando `npm test` para começar a rodar os testes.
