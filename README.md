# FVA
Plugin para museus adicionarem o Formulário de Visitação Anual
Ao instalar o plugin, terá disponível a aba **FVA**
na página do espaço do museu.

## Ativação

Para ativar este plugin, clone o repositório em 'src/protected/application/plugins' com o comando:
`git clone --depth=1 https://github.com/medialab-ufg/museus-fva.git Fva`

entre via terminal até a pasta onde foi clonado o repositório e rode o comando:
`npm install`
para instalar as dependências.

Feito isto, configure seu config.php:

```PHP

'plugins' => [
    //outros plugins instalados ...
    'Fva' =>['namespace'=>'Fva'],
],

```
## Desenvolvimento
O plugin contém testes unitários para os controllers do Angular. 
Na pasta do plugin execute o comando `npm test` para começar a rodar os testes.
