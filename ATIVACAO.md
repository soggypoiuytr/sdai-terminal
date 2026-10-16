# Ativar o SDAI online / V219

O projeto está preparado, mas ainda não está publicado nem conectado entre computadores. A V218 offline continua disponível separadamente.

## Primeiro: criar o Firebase

1. Abra https://console.firebase.google.com/ com a sua conta Google.
2. Crie um projeto, por exemplo `sdai-aurality`, no plano Spark. Analytics não é necessário para esta aplicação.
3. Adicione um aplicativo Web pelo ícone `</>`. Copie o objeto `firebaseConfig` exibido. Essa é a configuração pública do aplicativo, não uma chave de serviço.
4. Em Authentication, habilite os provedores **Anônimo** e **E-mail/senha**.
5. Na lista de usuários de Authentication, crie a conta de mestre com o seu e-mail e uma senha definida por você. Copie o **UID** desse usuário. Não envie a sua senha para esta conversa nem coloque a senha nos arquivos do site.
6. Crie um **Realtime Database** e copie a URL completa do banco. Não use Firestore para esta configuração.

Para eu concluir a ligação, envie aqui:

- O objeto público `firebaseConfig` do aplicativo Web.
- A URL do Realtime Database, caso ela não esteja dentro do objeto.
- O UID da conta de mestre.

Não envie chave de conta de serviço, arquivo de credencial de administrador ou senha.

## Se quiser preencher os arquivos diretamente

Em `site/config.js`, substitua o conteúdo por:

```js
export const CONFIG = {
  firebase: {
    apiKey: "CONFIGURACAO_PUBLICA_DO_APP",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    databaseURL: "URL_COMPLETA_DO_REALTIME_DATABASE",
    projectId: "SEU_PROJETO",
    storageBucket: "VALOR_FORNECIDO_PELO_FIREBASE",
    messagingSenderId: "VALOR_FORNECIDO_PELO_FIREBASE",
    appId: "VALOR_FORNECIDO_PELO_FIREBASE"
  },
  masterUid: "UID_DA_SUA_CONTA_DE_MESTRE",
  defaultRoom: "osaka"
};
```

Use os valores exatos fornecidos pelo seu projeto. Não copie literalmente os textos de exemplo.

Em `firebase/database.rules.json`, substitua todas as ocorrências de `REPLACE_MASTER_UID` pelo mesmo UID do mestre. Cole o JSON na aba de regras do Realtime Database e publique.

As regras permitem aos jogadores autenticados anonimamente ler a sala, manter sua presença e operar apenas quando possuem o controle válido. Somente o UID cadastrado como mestre pode mudar as ordens, os comunicados e as configurações da sala. O painel do mestre não utiliza a chave pública do aplicativo como senha de autorização.

## Segundo: criar o repositório GitHub

A conta conectada nesta conversa foi identificada como `soggypoiuytr`.

1. Crie um repositório vazio chamado `sdai-terminal`: https://github.com/new . A publicação no GitHub Free normalmente utiliza repositório público.
2. Envie o conteúdo desta pasta mantendo a estrutura, inclusive `.github/workflows/pages.yml`. Não envie o ZIP como se ele fosse o site: é preciso extrair seus arquivos.
3. Em **Settings > Pages > Build and deployment**, selecione **GitHub Actions** como origem.
4. Execute a publicação pela aba Actions ou faça um novo push na branch `main`.
5. Quando o workflow terminar, o Pages fornecerá o endereço.

Os endereços esperados, se o repositório tiver esse nome, serão:

- Jogadores: `https://soggypoiuytr.github.io/sdai-terminal/?sala=osaka`
- Mestre: `https://soggypoiuytr.github.io/sdai-terminal/mestre/?sala=osaka`

São endereços esperados de configuração, não confirmação de publicação. O workflow precisa concluir com sucesso.

No Firebase Authentication, inclua `soggypoiuytr.github.io` nos domínios autorizados do seu projeto. Para testes locais, inclua também `localhost` se não estiver cadastrado.

## Se preferir usar o Codex que está no seu PC

Você já tem uma sessão local capaz de trabalhar com seus arquivos. Pode fornecer este pacote e pedir:

> Extraia o pacote SDAI online preservando toda a estrutura. Execute npm test. Configure o repositório soggypoiuytr/sdai-terminal na branch main e envie o conteúdo, incluindo o workflow .github/workflows/pages.yml. Configure GitHub Pages para publicação por GitHub Actions, sem publicar as senhas ou credenciais de contas nos arquivos. Use apenas a configuração pública do Firebase e o UID de mestre que eu fornecer. Aguarde a publicação terminar e devolva os links dos jogadores e do mestre.

A configuração exige autenticação na sua conta GitHub. A senha de mestre é digitada apenas no login do painel, não na configuração pública.

## Teste antes da sessão

1. Abra o mestre e duas abas de jogadores com o mesmo código de sala.
2. Escolha personagens diferentes e tente assumir controle nas duas abas: somente uma deve operar.
3. Abra uma ficha, troque de setor e digite `STATUS CONT`; confira a outra aba.
4. Digite `VIGIA OFFLINE CONT` e informe a senha de cinco números. A outra aba deve mostrar apenas caracteres mascarados, nunca os números.
5. Confira a mudança de câmeras e sensores nos dois terminais.
6. Envie um comunicado pelo mestre e consulte Rede Interna nos jogadores.
7. Acione ALERTA e depois BLOQUEIO. Confirme que os jogadores deixam de operar. Revalide o acesso.
8. Transfira o controle pelo mestre e confira que o operador anterior fica somente como espectador.
9. Feche a aba do operador e confirme a liberação do controle. O prazo de renovação é de até 45 segundos caso a limpeza da desconexão não chegue primeiro.
10. Recarregue uma aba e confira que o estado da sala foi preservado. Ao final dos testes, use Reiniciar Sessão no mestre.

## O que foi verificado nesta entrega

Passaram os testes automatizados de concorrência do controle, autorização de espectadores, mensagens, alertas, bloqueio, transferência, expiração, snapshots sem senha, integração do estado com a interface e integridade de todos os arquivos de mídia.

Ainda faltam a configuração do seu projeto, a publicação e o teste de ponta a ponta contra o Firebase real. Não foi possível fazer inspeção visual em navegador neste ambiente.
