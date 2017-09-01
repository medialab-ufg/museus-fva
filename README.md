# FVA
Plugin para museus adicionarem o Formulário de Visitação Anual
Ao instalar o plugin, terá disponível a aba **FVA**
na página do espaço do museu.

## Ativação

Para ativar este plugin, clone o repositório em 'src/protected/application/plugins' com o comando:
`git clone --depth=1 https://github.com/medialab-ufg/museus-fva.git Fva`

Feito isto, configure seu config.php:

```PHP

'plugins' => [
    //... other plugin you may have...
    'Fva' =>['namespace'=>'Fva'],
],

```
## Desenvolvimento
O plugin contém testes unitários para os controllers do Angular. Para rodá-los, é necessário instalar NodeJS 6+ (https://nodejs.org/en/download/).
Após feita a instalação, na pasta do plugin execute o comando `npm install` para instalar as dependencias e `npm test`
para começar a rodar os testes.