import Link from 'next/link';

export const metadata = { title: 'Política de Privacidade' };

export default function PrivacyPolicy() {
  return (
    <div
      className="flex justify-center p-2"
      style={{ background: 'linear-gradient(to bottom, var(--gradient1), var(--gradient2))' }}
    >
      <div
        className="w-full max-w-4xl p-8 rounded-lg shadow-lg mx-auto"
        style={{
          background: 'var(--resultBg)',
          borderColor: 'var(--resultBorder)',
        }}
      >
        <h2
          className="text-2xl font-semibold mb-6 text-center"
          style={{ color: 'var(--text)' }}
        >
          Política de Privacidade
        </h2>
        <p className="text-sm italic mb-4" style={{ color: 'var(--modalText)' }}>
          Última atualização: 12 de Março de 2026
        </p>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
          Bem-vindo à Política de Privacidade do <strong>NephroSmart</strong>. Esta política explica como coletamos, usamos, armazenamos e protegemos os dados fornecidos por você ao usar nosso aplicativo e site{' '} 
          <a
            href="https://nefrosmartapp.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--text)' }}
          >
            nefrosmartapp.com.br
          </a>. 
          Nosso objetivo é ser transparente sobre nossas práticas de dados e garantir a conformidade com a Lei Geral de Proteção de Dados (LGPD) no Brasil e outras regulamentações aplicáveis.
          </p>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          1. Dados Coletados
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
          O NephroSmart coleta apenas o mínimo de informações necessárias para oferecer uma experiência funcional:
        </p>
        <ul className="list-disc pl-6 mb-4 text-base" style={{ color: 'var(--text)' }}>
          <li><strong>Dados de login</strong>: Quando você cria uma conta ou faz login no NephroSmart (aplicativo ou site), coletamos seu endereço de e-mail ou outro identificador fornecido pelo Firebase Authentication, um serviço seguro do Google. O Firebase é um serviço da Google LLC que atua como operador de dados, seguindo padrões internacionais de segurança e conformidade (incluindo GDPR e LGPD).
          O Firebase é um serviço da Google LLC que atua como operador de dados, seguindo padrões internacionais de segurança e conformidade (incluindo GDPR e LGPD).</li>
          <li><strong>Dados de uso e analytics</strong>: O NephroSmart utiliza ferramentas de análise (analytics), como serviços fornecidos pelo Google Firebase, para coletar dados anônimos de uso do aplicativo. Esses dados podem incluir informações como telas acessadas, tempo de uso, interações com funcionalidades, modelo do dispositivo, sistema operacional, versão do aplicativo e identificadores pseudonimizados ou anônimos do dispositivo. Esses dados não permitem a identificação direta do usuário e são utilizados exclusivamente para fins estatísticos e de melhoria contínua da experiência.</li>
          <li><strong>Dados sensíveis de saúde</strong>: O NephroSmart não coleta nem armazena dados sensíveis de saúde que permitam identificar o usuário.
            As informações inseridas para cálculos (como valores laboratoriais) são processadas localmente, sem qualquer vínculo com a identidade do usuário.
           O usuário é exclusivamente responsável pelos dados inseridos no aplicativo, devendo assegurar que não sejam incluídas informações que permitam identificar pacientes ou terceiros.
           O NephroSmart não possui acesso aos dados inseridos localmente no dispositivo do usuário.

          </li>
          <li><strong>Cookies e tecnologias semelhantes (nephrosmartapp.com.br)</strong>: O site nefrosmartapp.com.br pode utilizar cookies técnicos essenciais e tecnologias de análise estatística para manter o estado de login e melhorar a experiência do usuário. Esses cookies não coletam informações pessoais.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          2. Uso dos dados
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
          Os dados coletados são usados exclusivamente para:
        </p>
        <ul className="list-disc pl-6 mb-4 text-base" style={{ color: 'var(--text)' }}>
          <li>Autenticar sua conta no aplicativo e no site, permitindo o acesso às funcionalidades do NephroSmart.</li>
          <li>Armazenar temporariamente os valores de exames inseridos para cálculos como por exemplo de ajustes de dose, sem vinculá-los a você ou a terceiros.</li>
          <li>Analisar métricas de uso, desempenho e navegação por meio de ferramentas de analytics, com a finalidade exclusiva de aprimorar funcionalidades, corrigir falhas e melhorar a experiência do usuário.     </li>
          <li>Não utilizamos seus dados para fins publicitários, comerciais ou de envio de comunicações promocionais.</li>
          <li>O NephroSmart não realiza perfilhamento automatizado de usuários, decisões automatizadas com impacto jurídico, nem tratamento de dados para fins de marketing comportamental.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          3. Compartilhamento de dados
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
          Não compartilhamos seus dados com terceiros, exceto:
        </p>
        <ul className="list-disc pl-6 mb-4 text-base" style={{ color: 'var(--text)' }}>
          <li>Com o Google Firebase, para fins de autenticação, armazenamento seguro e análise estatística de uso (analytics).</li>
          <li>Quando exigido por lei ou para cumprir obrigações legais, como em resposta a ordens judiciais.</li>
          <li>O NephroSmart pode compartilhar dados apenas com operadores de dados devidamente contratados (como o Firebase), que atuam exclusivamente sob nossas instruções e em conformidade com esta Política e a LGPD.</li>
          <li>Os dados podem ser processados em servidores localizados fora do Brasil. A transferência internacional de dados ocorre com observância dos mecanismos legais previstos na LGPD, incluindo garantias contratuais apropriadas e conformidade com padrões internacionais de proteção de dados.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          4. Armazenamento e segurança
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
           Usamos o Firebase para proteger seus dados com criptografia e práticas de segurança padrão.
        </p>
        
        <ul className="list-disc pl-6 mb-4 text-base" style={{ color: 'var(--text)' }}>
          <li> <strong>Login</strong>: Os dados de autenticação (como e-mail) são gerenciados pelo Firebase Authentication, que utiliza criptografia robusta para proteger suas informações.</li>
          <li><strong>Valores de exames</strong>: Valores inseridos para cálculos são armazenados exclusivamente no dispositivo do usuário, não sendo enviados ou armazenados em servidores externos.</li>
          <li>Adotamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou uso indevido.</li> 
          <li>Os dados de login são mantidos enquanto sua conta estiver ativa. Caso a conta seja excluída, as informações são removidas do sistema em até 30 dias.</li> 
          <li> Caso o usuário não acesse o aplicativo por mais de 12 meses, os dados de login poderão ser removidos de forma automática, garantindo a segurança e minimização de armazenamento.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          4.1 Incidentes de Segurança
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
           Embora sejam adotadas medidas técnicas e organizacionais adequadas para proteção dos dados, nenhum sistema é completamente isento de riscos.
          <br /> Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares de dados, serão adotadas as medidas exigidas pela legislação aplicável, incluindo eventual comunicação às autoridades competentes, quando necessário.
        </p>
      

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          5. Seus direitos
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
          De acordo com a LGPD, você tem direitos sobre seus dados, incluindo:
        </p>
        <ul className="list-disc pl-6 mb-4 text-base" style={{ color: 'var(--text)' }}>
          <li>Confirmar a existência de tratamento de dados.</li>
          <li>Acessar, corrigir ou excluir seus dados de login.</li>
          <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários.</li>
          <li>Revogar consentimento, quando aplicável.</li>
          <li>Solicitar informações sobre como seus dados são tratados.</li>
        </ul>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
          Para exercer seus direitos, entre em contato conosco pelo e-mail nefrosmartapp@gmail.com.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          6. Cookies no site
        </h3>
          <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
                  O site <a
          href="https://nefrosmartapp.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--text)' }}>
          nefrosmartapp.com.br</a> pode utilizar cookies técnicos essenciais e tecnologias de análise estatística para manter a sessão ativa e compreender padrões gerais de navegação. Esses cookies não são utilizados para publicidade comportamental e não identificam diretamente o usuário.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          7. Alterações nesta política
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
         
          A versão mais atualizada desta Política estará sempre disponível em <a
            href="https://nefrosmartapp.com.br/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--text)' }}
          >
            nefrosmartapp.com.br/privacidade
          </a> e dentro do aplicativo NephroSmart, acessível no menu “Política de Privacidade”. O uso contínuo do aplicativo após a atualização constitui aceitação das novas condições. {'\n\n'}  
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          8. Controlador dos Dados
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
        O NephroSmart é um aplicativo independente desenvolvido e operado por Frederico Rodrigues da Cunha Pereira, registrado na plataforma Google Play Console como desenvolvedor independente.
          <br />O desenvolvedor atua como Controlador de Dados Pessoais, nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD), sendo responsável por determinar as finalidades e os meios de tratamento dos dados pessoais coletados.
          <br />Para quaisquer assuntos relacionados à proteção de dados, o usuário pode entrar em contato pelo e-mail:
          nefrosmartapp@gmail.com.</p>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          9. Contato
        </h3>
        <p className="text-base mb-4" style={{ color: 'var(--text)' }}>
          Para dúvidas, solicitações ou exercício de direitos relacionados à privacidade e proteção de dados, ou sugestões, o usuário pode entrar em contato pelo e-mail: nefrosmartapp@gmail.com. {'\n\n'} 
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: 'var(--resultTitle)' }}>
          10. Consentimento
        </h3>
        <div className="text-base mb-4" style={{ color: 'var(--text)' }}>
          Ao utilizar o site ou o aplicativo NephroSmart, o usuário declara que leu e concorda com esta Política de Privacidade. {'\n'}
          O tratamento de dados pessoais é realizado com fundamento nas bases legais previstas no artigo 7º da Lei nº 13.709/2018 (LGPD), incluindo:
          <ul className="list-disc pl-6 mb-4 text-base" style={{ color: 'var(--text)' }}>
          <li>Consentimento do titular;</li>
          <li>Execução de contrato;</li>
          <li>Cumprimento de obrigação legal ou regulatória;</li>
          <li>Legítimo interesse do controlador, quando aplicável.</li>
          </ul>
        </div>

         

        <div className="flex justify-center mt-8 pb-16">
          <Link
            href="/"
            className="px-4 py-2 rounded text-base text-center"
            style={{ background: 'var(--buttonPrimary)', color: 'var(--buttonText)' }}
          >
            Voltar à Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

