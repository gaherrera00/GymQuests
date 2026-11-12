# GymQuest APK (build gratuito na nuvem)

Não precisa instalar Android Studio. O GitHub compila o APK para você.

1. Crie conta grátis em github.com e um repositório novo (pode ser privado).
2. Envie TODO o conteúdo desta pasta (inclusive a pasta oculta `.github`).
   Pelo site: "Add file > Upload files" e arraste tudo.
   Se a pasta `.github` não subir, use "Add file > Create new file", nome `.github/workflows/apk.yml`, e cole o conteúdo do arquivo.
3. Abra a aba **Actions**. O build roda sozinho (3 a 6 min). Se não rodar: Actions > Build APK > Run workflow.
4. Ao terminar, abra a execução e baixe **GymQuest-apk** (zip com `app-debug.apk`).
5. No celular: abra o APK e permita "instalar apps desconhecidos" para o navegador/arquivos.

Dados ficam no app. Desinstalar apaga tudo: faça backup em Perfil > "Baixar backup JSON".
Para atualizar: troque www/index.html no repositório; o build roda de novo.
