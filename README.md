# SDAI - terminais compartilhados / versão web V219

Versão web derivada do SDAI Terminal V218. O arquivo offline V218 foi preservado separadamente.

## Estado desta entrega

- Código dos jogadores, do mestre e da sincronização implementado.
- Conteúdo, 36 fichas, 8 setores e 111 arquivos de mídia preservados.
- Demonstração local entre abas disponível.
- Firebase ainda não configurado e site ainda não publicado. A configuração depende de um projeto Firebase e de um repositório GitHub da conta do proprietário.
- Testes de lógica, concorrência, adapter de interface, expressões das regras e integridade da mídia passaram. Os testes de regras simulam as expressões; não equivalem a uma execução no emulador nem a uma validação de ponta a ponta em um Firebase real.
- Não foi realizada inspeção visual em navegador neste ambiente.

## O que está incluído

- `site/index.html`: entrada dos jogadores, personagem e operador do terminal.
- `site/mestre/index.html`: painel do mestre com autenticação.
- `site/terminal.html`: interface SDAI original adaptada para a sessão compartilhada.
- `site/config.js`: configuração pública do Firebase a preencher.
- `firebase/database.rules.json`: regras do Realtime Database.
- `.github/workflows/pages.yml`: publicação do diretório `site` no GitHub Pages.
- `tests/`: testes executáveis sem instalar dependências.
- `docs/GUIA_MESTRE.md`: comandos e senhas do enigma, para o mestre.
- `ATIVACAO.md`: configuração e publicação passo a passo.

## Demonstração no computador

É preciso servir a pasta `site` por HTTP; abrir os HTMLs por `file://` não carrega os módulos da versão online.

Com Python instalado, na raiz deste pacote:

```sh
python -m http.server 8080 --directory site
```

Abra no mesmo navegador:

- Mestre: `http://localhost:8080/mestre/?sala=osaka&demo=1`
- Jogador 1: `http://localhost:8080/?sala=osaka&demo=1`
- Jogador 2: outra aba no mesmo endereço do jogador.

No modo de demonstração, clique em acessar a central sem fornecer credenciais. Ele usa armazenamento local, BroadcastChannel e travas do navegador. Funciona somente entre abas do mesmo navegador, perfil e endereço. Não sincroniza computadores diferentes.

## Uso durante a sessão online

1. O mestre acessa `/mestre/?sala=osaka`, entra com sua conta e cadastra os personagens.
2. Compartilha o endereço dos jogadores com o mesmo código de sala.
3. Cada participante informa nome e personagem.
4. Uma pessoa assume o controle. A aquisição usa uma transação para evitar dois operadores simultâneos.
5. Os demais acompanham abas, fichas, planta, relações, comandos, estado eletrônico e digitação. As senhas são transmitidas apenas como quantidade de caracteres mascarados.
6. O operador pode liberar ou passar o controle. Os espectadores podem pedi-lo. O mestre pode atribuir ou retirar a posse.
7. A conexão do operador renova a posse. Sem renovação, ela expira em até 45 segundos. A desconexão também registra limpeza no Firebase.
8. O mestre pode publicar/retirar comunicados, acionar NORMAL/ALERTA/BLOQUEIO e revalidar acesso.

O áudio é uma preferência local: cada participante pode silenciar sua própria página. As animações decorativas não têm sincronização quadro a quadro; os estados e a navegação são compartilhados. O tamanho da janela e o navegador de cada pessoa podem produzir diferenças no enquadramento da interface.

Na versão online, o estado de câmeras e sensores acompanha a sala e deixa de depender apenas da memória de uma aba. Recarregar um jogador não reinicia a sala. Para restaurar o estado inicial e limpar os comunicados, use Reiniciar Sessão no painel do mestre. Esse botão preserva as fichas e o elenco.

## Testes

Com Node.js instalado:

```sh
npm test
```

Não é necessário executar `npm install`. O site não exige etapa de build. O SDK Firebase é carregado como módulos oficiais pelo navegador quando a configuração online está preenchida; a demonstração local não carrega o SDK.

## Documentação das tecnologias

- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/database/web/read-and-write
- https://firebase.google.com/docs/database/web/offline-capabilities
- https://firebase.google.com/docs/database/security
- https://docs.github.com/en/pages/quickstart
