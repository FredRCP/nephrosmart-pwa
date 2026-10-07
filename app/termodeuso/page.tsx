import Link from 'next/link';

export const metadata = { title: 'Termos de Uso' };

export default function TermsOfUse() {
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
          Termos de Uso do NephroSmart
        </h2>

        <p className="text-sm italic mb-6 text-center" style={{ color: 'var(--modalText)' }}>
          Última atualização: 11 de Março de 2026
        </p>

        <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--text)' }}>
          Bem-vindo ao <strong>NephroSmart</strong>. Este documento estabelece as condições para o uso do nosso aplicativo e site{' '}    
          <a
            href="https://nefrosmartapp.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
            style={{ color: 'var(--text)' }}
          >
             nefrosmartapp.com.br
          </a>,
          Ao usar o NephroSmart, você concorda com os seguintes termos e condições. Leia atentamente antes de prosseguir.{' '}
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          1. Uso do NephroSmart
        </h3>
          <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
            - O NephroSmart é uma ferramenta de apoio educacional e de consulta técnica, destinada exclusivamente a médicos e profissionais de saúde legalmente habilitados.
          <br />
          - O aplicativo fornece calculadoras, tabelas, parâmetros clínicos, resumos de diretrizes e referências técnicas relacionadas à Medicina, com foco em Nefrologia, baseadas em literatura científica e diretrizes médicas amplamente reconhecidas.
          <br />
          - O NephroSmart não realiza diagnóstico, não prescreve tratamentos e não substitui o julgamento clínico profissional, a avaliação individual do paciente, nem protocolos institucionais.
          <br />
          - Qualquer informação relacionada a doses, ajustes terapêuticos ou condutas clínicas tem caráter exclusivamente educacional e de referência, cabendo exclusivamente ao profissional de saúde a decisão final sobre diagnóstico, prescrição e tratamento.
          <br />
          - O usuário é integralmente responsável por validar os dados inseridos, interpretar corretamente os resultados apresentados e verificar sua adequação ao contexto clínico antes de qualquer tomada de decisão.
          <br />
          - A maioria das telas e calculadoras do NephroSmart dispõe de um botão de informação (ícone "i") que, ao ser pressionado, abre um modal com detalhes adicionais, referências bibliográficas, limitações da fórmula e orientações importantes para interpretação correta do resultado. Recomenda-se sempre consultar essas informações complementares antes de utilizar os cálculos em contexto clínico.
          </p>

         

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          2. Natureza Educacional do Aplicativo
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
          O NephroSmart tem finalidade exclusivamente educacional e informativa. Seu conteúdo não constitui ato médico, prescrição ou recomendação personalizada, sendo destinado apenas como material de apoio técnico para profissionais de saúde legalmente habilitados.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          3. Requisitos para uso
        </h3>
          <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
          - O uso do NephroSmart é permitido apenas a maiores de 18 anos (ou idade legal em sua jurisdição) que sejam médicos ou profissionais de saúde legalmente habilitados.
          <br />
          - Para acessar todas as funcionalidades, é necessário criar uma conta usando o Firebase Authentication (via e-mail ou outro provedor compatível).
          <br />
          - O usuário é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
          <br />
          - Algumas funcionalidades são premium e podem incluir conteúdos adicionais, ferramentas avançadas e atualizações exclusivas, mediante assinatura paga.
          <br />
          - O NephroSmart deve ser usado apenas por médicos ou profissionais de saúde para fins educacionais ou de suporte clínico. É proibido usar o aplicativo para fins não médicos, modificar ou distribuir seu conteúdo sem permissão.
          </p>
          

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          4. Privacidade e Dados do Usuário
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
          - O NephroSmart utiliza autenticação via Firebase para gerenciar contas de usuário (e-mail e senha). Não coletamos ou armazenamos dados sensíveis de pacientes.
          <br />
          - O aplicativo poderá utilizar ferramentas de análise de uso (analytics), incluindo serviços integrados ao Firebase, para coletar dados técnicos e estatísticos como telas acessadas, tempo de uso, interações com funcionalidades, modelo do dispositivo, sistema operacional e versão do aplicativo. Esses dados são utilizados exclusivamente para melhoria contínua do desempenho, estabilidade e experiência do usuário, não sendo utilizados para publicidade ou marketing comportamental.
          <br />
          - O tratamento de dados é realizado conforme detalhado na Política de Privacidade, que integra estes Termos de Uso para todos os fins.        
          <br />
          - Para mais detalhes, consulte nossa{' '}
          <a
            href="https://nefrosmartapp.com.br/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
            style={{ color: 'var(--text)' }}
          >
            Política de Privacidade
          </a>.
        </p>           

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          5. Propriedade Intelectual
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
        - O NephroSmart, incluindo seu design, código, conteúdo e funcionalidades, é protegido por direitos autorais e pertence aos seus desenvolvedores ou licenciadores.
          <br />
          - O nome, o logotipo e a identidade visual do NephroSmart são protegidos por direitos autorais e não podem ser utilizados sem autorização prévia.
          <br />
          - Você pode usar o aplicativo e o site para fins pessoais e não comerciais. Não é permitido copiar, modificar, distribuir ou criar trabalhos derivados sem autorização.
          </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          6. Limitação de Responsabilidade
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
        - O NephroSmart é disponibilizado “no estado em que se encontra” e conforme disponibilidade, para fins exclusivamente educacionais e de consulta técnica, sem garantias expressas ou implícitas de qualquer natureza.
          <br />
          - Embora o conteúdo seja baseado em literatura científica e diretrizes médicas amplamente reconhecidas, podem ocorrer erros de digitação, imprecisões, falhas técnicas, inconsistências, omissões, desatualizações ou divergências interpretativas.
          <br />
          - O aplicativo não realiza diagnóstico, não prescreve tratamentos e não substitui avaliação clínica individualizada, exame físico, análise de exames complementares ou protocolos institucionais.
          <br />
          - As informações relativas a doses, ajustes terapêuticos, parâmetros laboratoriais e condutas clínicas devem ser sempre confirmadas pelo profissional de saúde responsável, considerando o contexto clínico específico de cada paciente.
          <br />
          - O uso do aplicativo é de inteira e exclusiva responsabilidade do usuário. O NephroSmart e seu desenvolvedor não se responsabilizam por decisões clínicas, diagnósticos, prescrições, condutas terapêuticas ou quaisquer danos diretos, indiretos, incidentais, consequenciais, lucros cessantes ou perdas de qualquer natureza decorrentes da utilização das informações fornecidas.
          <br />
          - Em qualquer hipótese, eventual responsabilidade do desenvolvedor ficará limitada ao valor total efetivamente pago pelo usuário pelo uso do aplicativo nos 12 (doze) meses anteriores ao evento que deu causa à eventual reclamação.
          <br />
          - O usuário reconhece que a prática médica envolve julgamento clínico individualizado e que nenhuma ferramenta digital substitui a responsabilidade profissional pessoal.
          </p>
     

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          7. Conduta do Usuário
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
          - Você concorda em usar o NephroSmart de forma legal e ética, sem tentar acessar, modificar ou interferir nos sistemas ou dados do aplicativo/site.
          <br />
          - Não insira informações falsas ou enganosas nos cálculos do aplicativo.
          </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          8. Alterações nos Termos
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
          - Podemos atualizar estes Termos de Uso para refletir mudanças no aplicativo, no site ou na legislação.
          <br />
          - Notificaremos você sobre alterações significativas por meio do aplicativo ou do site.
          <br />
          - A versão mais recente dos Termos de Uso estará sempre disponível em nefrosmartapp.com.br, e o uso contínuo do aplicativo após a atualização constitui aceitação das novas condições. 
          </p>

            
        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          9. Encerramento
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
        - Podemos suspender ou encerrar seu acesso ao NephroSmart se você violar estes Termos de Uso ou por qualquer outro motivo, a nosso critério.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          10. Contato
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
        - Se você tiver dúvidas sobre estes Termos de Uso, quiser fazer sugestões ou detectar algum erro no NephroSmart, entre em contato conosco em nefrosmartapp@gmail.com. {'\n\n'}
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          11. Cláusula de Jurisdição
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
            - Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
            Fica eleito o foro do domicílio do desenvolvedor para dirimir quaisquer controvérsias relacionadas a estes Termos, salvo disposição legal específica que determine foro diverso.{'\n\n'}
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          12. Informações do Desenvolvedor
        </h3>
        <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--text)' }}>
        - O NephroSmart é um aplicativo independente desenvolvido e disponibilizado sob a marca NephroSmart.
        <br />- O aplicativo é desenvolvido e operado por Frederico Rodrigues da Cunha Pereira, desenvolvedor independente registrado na plataforma Google Play Console.
        <br />- Para contato, dúvidas, comunicações legais ou relato de inconsistências, utilize:
        nefrosmartapp@gmail.com
        <br /> © 2026 NephroSmart. Todos os direitos reservados.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          13. Disponibilidade do Serviço
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
        - O NephroSmart poderá sofrer interrupções temporárias, instabilidades, falhas técnicas, manutenções programadas ou indisponibilidade parcial ou total, sem aviso prévio.
        <br />- O desenvolvedor não garante disponibilidade contínua, ininterrupta ou livre de erros do aplicativo, não sendo responsável por eventuais prejuízos decorrentes de indisponibilidade técnica.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          14. Assinaturas e Pagamentos (quando aplicável)
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
        - Algumas funcionalidades poderão ser disponibilizadas mediante assinatura paga, com renovação automática conforme as regras da plataforma de distribuição (Google Play).
          <br />- O cancelamento poderá ser realizado a qualquer momento pelo usuário diretamente na plataforma de pagamento utilizada.
          <br />- Eventuais políticas de reembolso seguirão as regras da Google Play ou da legislação aplicável.
         </p>

        <h3 className="text-xl font-semibold mt-8 mb-3" style={{ color: 'var(--resultTitle)' }}>
          15. Versões Beta e Atualizações
        </h3>
        <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--text)' }}>
        - O aplicativo poderá ser disponibilizado em versões beta, experimentais ou de teste, podendo conter funcionalidades incompletas, instabilidades ou erros.
            <br />- O usuário reconhece essa condição e concorda em utilizar o aplicativo ciente dessas limitações.
            <br />- O NephroSmart poderá ser atualizado periodicamente para inclusão de melhorias, correções, novos conteúdos ou adequações legais.
        </p>

        <div className="flex justify-center mt-10 pb-10">
          <Link
            href="/"
            className="px-6 py-4 rounded-lg text-lg font-medium shadow-md"
            style={{ background: 'var(--buttonPrimary)', color: 'var(--buttonText)' }}
          >
            Voltar à Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

