# Museu dos Sistemas Operacionais — Landing Page

Projeto reorganizado com estrutura exigida pelo exercício.

Estrutura do projeto:

```
/index.html
/css/style.css
/js/script.js
/img/hero.svg
/img/linux.svg
/img/windows.svg
/img/proprietario.svg
```

Como rodar localmente:

```bash
cd /home/will/Museu_ISO
python3 -m http.server 8000
# abra http://localhost:8000
```

Publicação no GitHub Pages:

1. Crie um repositório público no GitHub
2. Suba os arquivos organizados (branch `main`)
3. Ative GitHub Pages em `Settings → Pages` apontando para a branch `main` e `/ (root)`
4. Aguarde alguns minutos e abra o link fornecido pelo GitHub

Observações:
- O formulário usa `method="post"` e validação no JavaScript; para envio real é necessário um endpoint (backend) ou serviço de terceiros.
- Peça para eu gerar um ZIP do projeto ou configurar o deploy automaticamente.
