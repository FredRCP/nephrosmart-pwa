import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = { title: 'Política de Privacidade' };

const SITE = 'https://nephrosmart.vercel.app';
const EMAIL = 'nefrosmartapp@gmail.com';

const H = ({ children }: { children: ReactNode }) => (
  <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>{children}</h3>
);
const P = ({ children }: { children: ReactNode }) => (
  <p className="text-base mb-4" style={{ color: 'var(--text)' }}>{children}</p>
);
const UL = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc pl-6 mb-4 text-base" style={{ color: 'var(--text)' }}>{children}</ul>
);
const Site = () => (
  <a href={SITE} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--text)' }}>nephrosmart.vercel.app</a>
);

export default function PrivacyPolicy() {
  return (
    <div className="flex justify-center p-2" style={{ background: 'linear-gradient(to bottom, var(--gradient1), var(--gradient2))' }}>
      <div className="w-full max-w-4xl p-8 rounded-lg shadow-lg mx-auto" style={{ background: 'var(--resultBg)', borderColor: 'var(--resultBorder)' }}>
        <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--text)' }}>Política de Privacidade</h2>
        <p className="text-sm italic mb-4" style={{ color: 'var(--modalText)' }}>Última atualização: 12 de Outubro de 2026</p>
        <P>
          Esta política explica como o <strong>NephroSmart</strong> coleta, usa, armazena e protege dados pessoais. O NephroSmart é um aplicativo web instalável (PWA), disponível em <Site />, e não é distribuído em lojas de aplicativos.
          Nosso objetivo é ser transparente e cumprir a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).
        </P>

        <H>1. Dados coletados</H>
        <P>Coletamos apenas o mínimo necessário para o funcionamento do serviço:</P>
        <UL>
          <li><strong>Dados da conta</strong>: e-mail, senha (guardada de forma protegida pelo provedor de autenticação, nunca em texto aberto), nome (opcional) e o plano de acesso. A autenticação é feita pelo Supabase.</li>
          <li><strong>Aceite dos termos</strong>: ao criar a conta, registramos a versão dos Termos de Uso e da Política de Privacidade aceitas e a data e hora do aceite.</li>
          <li><strong>Dados de uso técnicos e anônimos</strong>: podemos registrar eventos como a ferramenta acessada, o tipo de plataforma (navegador, celular ou computador), a versão do aplicativo e um identificador aleatório da instalação. Esses registros não contêm e-mail, nome nem dados clínicos e servem apenas para medir o uso e corrigir falhas.</li>
          <li><strong>Dados de saúde</strong>: o NephroSmart não coleta nem armazena dados de pacientes. Os valores digitados nas calculadoras são processados no seu próprio navegador ou aparelho e não são enviados aos nossos servidores. O usuário é responsável por não inserir informações que identifiquem pacientes ou terceiros.</li>
          <li><strong>Armazenamento no seu aparelho</strong>: o aplicativo guarda localmente preferências (tema claro/escuro, ferramentas favoritas, confirmação de leitura dos termos) e arquivos para uso offline (cache do aplicativo). Você pode apagá-los nas configurações do navegador.</li>
        </UL>
        <P>Não utilizamos o Google Firebase nem o Google Analytics.</P>

        <H>2. Uso dos dados</H>
        <P>Os dados são usados exclusivamente para:</P>
        <UL>
          <li>Criar e autenticar sua conta e liberar as funcionalidades do seu plano.</li>
          <li>Comprovar o aceite dos Termos de Uso e desta Política.</li>
          <li>Responder a mensagens e solicitações enviadas ao nosso e-mail de contato.</li>
          <li>Medir o uso e melhorar a estabilidade e as funcionalidades, de forma anônima.</li>
        </UL>
        <P>Não vendemos dados, não os usamos para publicidade ou marketing e não fazemos perfilhamento nem decisões automatizadas sobre os usuários.</P>

        <H>3. Compartilhamento</H>
        <P>Não compartilhamos seus dados com terceiros, exceto com os provedores que operam a infraestrutura do serviço, sob nossas instruções:</P>
        <UL>
          <li><strong>Supabase</strong>: autenticação e banco de dados (conta, plano, aceite dos termos e registros de uso).</li>
          <li><strong>Vercel</strong>: hospedagem do site e do aplicativo, que pode registrar dados técnicos de acesso (como endereço IP) para segurança e funcionamento.</li>
          <li>Autoridades públicas, quando exigido por lei ou ordem judicial.</li>
        </UL>
        <P>Esses provedores podem processar dados em servidores fora do Brasil. A transferência internacional ocorre conforme os mecanismos previstos na LGPD, incluindo garantias contratuais adequadas.</P>

        <H>4. Armazenamento e segurança</H>
        <UL>
          <li>Os dados trafegam por conexão criptografada (HTTPS) e a senha é protegida pelo provedor de autenticação.</li>
          <li>O acesso aos dados da conta é restrito por regras de segurança do banco de dados: cada usuário acessa apenas os próprios dados.</li>
          <li>Os dados da conta são mantidos enquanto ela estiver ativa. Se você pedir a exclusão, os dados serão removidos em até 30 dias, ressalvadas obrigações legais.</li>
          <li>Os valores inseridos nas calculadoras ficam apenas no seu aparelho.</li>
        </UL>

        <H>4.1 Incidentes de segurança</H>
        <P>
          Nenhum sistema é completamente isento de riscos. Em caso de incidente que possa acarretar risco ou dano relevante aos titulares, adotaremos as medidas exigidas pela legislação, incluindo a comunicação à Autoridade Nacional de Proteção de Dados e aos titulares, quando necessário.
        </P>

        <H>5. Seus direitos</H>
        <P>De acordo com a LGPD, você pode:</P>
        <UL>
          <li>Confirmar se tratamos seus dados e acessá-los.</li>
          <li>Corrigir dados incompletos ou desatualizados.</li>
          <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários.</li>
          <li>Solicitar a exclusão da conta e dos dados, na página <Link href="/excluir-conta" className="underline">Excluir conta</Link>.</li>
          <li>Revogar o consentimento e pedir informações sobre o tratamento.</li>
        </UL>
        <P>Para exercer seus direitos, escreva para {EMAIL}.</P>

        <H>6. Cookies e armazenamento do navegador</H>
        <P>
          O site usa cookies e armazenamento local técnicos, necessários para manter a sessão de login, lembrar o tema e as preferências e permitir o uso offline. Não usamos cookies de publicidade nem de rastreamento entre sites.
        </P>

        <H>7. Alterações nesta política</H>
        <P>
          A versão atual está sempre disponível em <a href={`${SITE}/privacidade`} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--text)' }}>nephrosmart.vercel.app/privacidade</a> e no menu do aplicativo. Quando houver mudança relevante, pediremos um novo aceite. O uso continuado após a atualização indica concordância com as novas condições.
        </P>

        <H>8. Controlador dos dados</H>
        <P>
          O NephroSmart é desenvolvido e operado por Frederico Rodrigues da Cunha Pereira, desenvolvedor independente, que atua como Controlador de Dados Pessoais nos termos da LGPD. Contato para assuntos de proteção de dados: {EMAIL}.
        </P>

        <H>9. Contato</H>
        <P>Para dúvidas, solicitações, exercício de direitos ou sugestões: {EMAIL}.</P>

        <H>10. Consentimento e bases legais</H>
        <P>
          Ao criar uma conta, o usuário declara que leu e concorda com esta Política. O tratamento se apoia nas bases legais do art. 7º da LGPD, em especial:
        </P>
        <UL>
          <li>Consentimento do titular;</li>
          <li>Execução de contrato (acesso à conta e ao plano);</li>
          <li>Cumprimento de obrigação legal ou regulatória;</li>
          <li>Legítimo interesse, para segurança e medição anônima de uso.</li>
        </UL>

        <div className="flex justify-center mt-8 pb-16">
          <Link href="/" className="px-4 py-2 rounded text-base text-center" style={{ background: 'var(--buttonPrimary)', color: 'var(--buttonText)' }}>
            Voltar à Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
