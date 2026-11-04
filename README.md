# Primoris Academy

Plataforma de formação, CRM comercial e plano de carreira da Primoris.

- Front-end estático (HTML + JS modules), hospedado no GitHub Pages.
- Banco, login com Google e regras de acesso: Supabase (projeto `primoris-academy`, região São Paulo).
- As permissões são aplicadas no servidor por Row Level Security: consultor vê só a própria carteira, gestor vê a da equipe, administradores veem tudo.

## Configuração do login Google
1. Google Cloud Console → APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da Web.
2. URI de redirecionamento autorizado: `https://wgwhgcnbkwwrzaovsmij.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Sign In / Providers → Google: ative e cole o Client ID e o Client Secret.
4. Supabase → Authentication → URL Configuration: Site URL e Redirect URLs com o endereço do GitHub Pages.

O dono da plataforma (superadministrador) é definido na tabela `app_owners` (e-mail).
