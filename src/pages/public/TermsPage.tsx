import { Link } from 'react-router-dom';
import { LegalList, LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout';
import { LEGAL } from '@/lib/legal';

export function TermsPage() {
  return (
    <LegalPageLayout
      title="Termos de Uso"
      subtitle={`Estes Termos regulam o acesso e a utilização da plataforma ${LEGAL.platformName}, disponibilizada por ${LEGAL.controllerName}, em conformidade com a legislação brasileira, inclusive a Lei nº 13.709/2018 (LGPD).`}
    >
      <LegalSection title="1. Aceitação e elegibilidade">
        <p>
          Ao criar conta, acessar ou utilizar a plataforma, você declara ter lido, compreendido e
          concordado com estes Termos e com a{' '}
          <Link to="/privacidade" className="font-medium text-primary hover:underline">
            Política de Privacidade
          </Link>
          . Se não concordar, não utilize o serviço.
        </p>
        <p>
          O uso é permitido a pessoas físicas maiores de 18 anos (freelancers) e pessoas jurídicas
          regularmente constituídas (empresas contratantes), com capacidade civil plena e dados
          cadastrais verdadeiros.
        </p>
      </LegalSection>

      <LegalSection title="2. Natureza do serviço">
        <p>
          A {LEGAL.platformName} é uma plataforma digital de <strong>intermediação</strong> entre
          empresas que publicam oportunidades de trabalho freelance e profissionais que buscam
          projetos compatíveis com seu perfil técnico.
        </p>
        <LegalList
          items={[
            'A plataforma não é empregadora, agência de recrutamento tradicional nem parte contratual das relações entre empresa e freelancer.',
            'Contratos, pagamentos, entregas e obrigações comerciais entre as partes ocorrem fora ou além do escopo mínimo da plataforma, salvo quando funcionalidades específicas forem disponibilizadas e aceitas.',
            'A plataforma oferece ferramentas de cadastro, publicação de vagas, candidaturas, matching por compatibilidade técnica, notificações, avaliações e moderação administrativa.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Tipos de conta e responsabilidades">
        <p>
          <strong>Freelancer:</strong> pode configurar perfil profissional (bio, telefone, stack
          técnica, experiências, portfólio e currículo), buscar vagas, candidatar-se, acompanhar
          candidaturas, receber notificações e avaliar empresas após conclusão do vínculo.
        </p>
        <p>
          <strong>Empresa:</strong> pode publicar e gerenciar vagas, analisar candidatos, alterar
          status de candidaturas, receber recomendações de compatibilidade e utilizar dashboards de
          acompanhamento.
        </p>
        <p>
          <strong>Administrador:</strong> perfil interno com permissões de moderação, bloqueio de
          contas e remoção de vagas inadequadas, conforme políticas de uso aceitável.
        </p>
        <p>Você é responsável por:</p>
        <LegalList
          items={[
            'manter credenciais de acesso em sigilo;',
            'fornecer informações verdadeiras, completas e atualizadas;',
            'cumprir a legislação aplicável ao seu perfil (incluindo obrigações fiscais e trabalhistas, quando couber);',
            'não utilizar a plataforma para fins ilícitos, discriminatórios, fraudulentos ou que violem direitos de terceiros.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Cadastro, autenticação e verificação">
        <LegalList
          items={[
            'O cadastro de freelancer exige nome, e-mail, CPF, senha e pode incluir telefone.',
            'O cadastro de empresa exige razão social/nome, e-mail, CNPJ e senha.',
            'O login pode ser realizado com e-mail, CPF (freelancer) ou CNPJ (empresa), conforme o tipo de conta.',
            'A senha deve atender aos critérios mínimos de segurança definidos pela plataforma.',
            'CPF e CNPJ são utilizados para diferenciação de perfis e redução de cadastros fraudulentos.',
            'A plataforma pode suspender ou encerrar contas com dados inconsistentes, suspeita de fraude ou violação destes Termos.',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Publicação de vagas (empresas)">
        <p>Apenas empresas autenticadas podem publicar vagas. Ao publicar, você declara que:</p>
        <LegalList
          items={[
            'possui legitimidade para representar a organização;',
            'as informações da vaga (título, descrição, requisitos, prazos e tecnologias) são verídicas e não enganosas;',
            'não publicará conteúdo ofensivo, discriminatório, ilegal ou que viole propriedade intelectual de terceiros.',
          ]}
        />
        <p>
          Vagas podem ter os status aberta, pausada, encerrada ou cancelada. Vagas pausadas,
          encerradas ou canceladas não aceitam novas candidaturas. A empresa responsável pela vaga
          pode gerenciar candidatos vinculados a ela.
        </p>
      </LegalSection>

      <LegalSection title="6. Candidaturas (freelancers)">
        <LegalList
          items={[
            'Apenas freelancers autenticados podem se candidatar.',
            'É necessário possuir currículo cadastrado no perfil para candidatar-se.',
            'Não é permitida candidatura duplicada à mesma vaga.',
            'Candidaturas não são permitidas em vagas pausadas, encerradas ou canceladas.',
            'O freelancer pode cancelar candidaturas nos status pendente ou em análise.',
            'A carta de apresentação e demais dados enviados devem refletir informações autênticas do perfil profissional.',
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Matching, recomendações e decisões">
        <p>
          A plataforma calcula percentuais de compatibilidade com base nas tecnologias exigidas pela
          vaga e na stack cadastrada no perfil do freelancer. Esses indicadores são{' '}
          <strong>auxiliares</strong> e não substituem a avaliação humana da empresa contratante.
        </p>
        <p>
          A {LEGAL.platformName} não garante contratação, volume de candidaturas, resultado de
          processos seletivos nem adequação absoluta entre perfis e projetos.
        </p>
      </LegalSection>

      <LegalSection title="8. Comunicação entre usuários">
        <p>
          Após etapas do processo seletivo, dados de contato profissional (como e-mail e telefone)
          podem ser exibidos para viabilizar a continuidade da negociação. A comunicação direta
          entre as partes deve observar boa-fé, confidencialidade quando aplicável e legislação
          vigente.
        </p>
        <p>
          Mensagens, contratos, pagamentos e entregas realizados fora da plataforma são de
          responsabilidade exclusiva dos usuários envolvidos.
        </p>
      </LegalSection>

      <LegalSection title="9. Avaliações e reputação">
        <LegalList
          items={[
            'A conclusão do projeto exige confirmação mútua: empresa e freelancer devem confirmar a finalização enquanto o vínculo estiver em andamento.',
            'O status concluído só é atingido quando ambas as partes confirmarem; somente então a vaga é encerrada e as avaliações são liberadas.',
            'Empresa e freelancer podem avaliar um ao outro após a conclusão formal do vínculo, com notas de 1 a 5 e comentário opcional.',
            'Avaliações devem ser honestas, relacionadas à experiência real e livres de conteúdo ofensivo ou difamatório.',
            'A plataforma pode remover avaliações que violem estas regras ou a legislação aplicável.',
          ]}
        />
      </LegalSection>

      <LegalSection title="10. Conteúdo do usuário e propriedade intelectual">
        <p>
          Você mantém a titularidade do conteúdo que publica (perfis, vagas, portfólio, textos e
          arquivos), concedendo à {LEGAL.platformName} licença não exclusiva, gratuita e limitada
          ao necessário para operar, exibir, indexar, recomendar e moderar o serviço.
        </p>
        <p>
          Marcas, layout, código, identidade visual e demais elementos da plataforma pertencem à{' '}
          {LEGAL.controllerName} ou a seus licenciadores, sendo vedada reprodução não autorizada.
        </p>
      </LegalSection>

      <LegalSection title="11. Moderação, suspensão e encerramento">
        <p>A plataforma pode, a seu critério e sem prejuízo de medidas legais:</p>
        <LegalList
          items={[
            'remover ou ocultar conteúdos que violem estes Termos;',
            'bloquear temporária ou permanentemente contas;',
            'restringir funcionalidades em caso de suspeita de abuso, fraude ou risco à segurança;',
            'encerrar contas inativas ou que permaneçam em violação após notificação, quando aplicável.',
          ]}
        />
        <p>
          Você pode solicitar encerramento da conta pelos canais de contato indicados na Política de
          Privacidade, observadas obrigações legais de retenção de dados.
        </p>
      </LegalSection>

      <LegalSection title="12. Disponibilidade, limitações e isenções">
        <LegalList
          items={[
            'O serviço é fornecido na modalidade “como está”, com esforços razoáveis de disponibilidade e segurança.',
            'Manutenções, atualizações e falhas de terceiros (hospedagem, internet, provedores) podem causar indisponibilidade temporária.',
            'Na extensão permitida pela lei, a plataforma não responde por lucros cessantes, perdas indiretas ou decisões de contratação tomadas com base em informações de perfis e vagas.',
            'Cada usuário é responsável por backups, versionamento e proteção de materiais trocados fora da plataforma.',
          ]}
        />
      </LegalSection>

      <LegalSection title="13. Proteção de dados pessoais (LGPD)">
        <p>
          O tratamento de dados pessoais realizado pela plataforma é descrito na{' '}
          <Link to="/privacidade" className="font-medium text-primary hover:underline">
            Política de Privacidade
          </Link>
          , que integra estes Termos para todos os fins. Ao utilizar o serviço, você também
          reconhece os direitos previstos no art. 18 da LGPD e os canais de exercício indicados na
          política.
        </p>
      </LegalSection>

      <LegalSection title="14. Alterações destes Termos">
        <p>
          Estes Termos podem ser atualizados para refletir mudanças legais, técnicas ou
          funcionais. Alterações relevantes serão comunicadas por meios razoáveis (por exemplo,
          aviso na plataforma ou por e-mail). O uso continuado após a vigência da nova versão
          constitui concordância, ressalvado o direito de encerrar a conta.
        </p>
      </LegalSection>

      <LegalSection title="15. Legislação aplicável e foro">
        <p>
          Estes Termos são regidos pelas leis da {LEGAL.jurisdiction}, em especial o Código de
          Defesa do Consumidor quando aplicável, o Marco Civil da Internet (Lei nº 12.965/2014) e a
          LGPD.
        </p>
        <p>
          Fica eleito o foro da comarca do domicílio do usuário consumidor, quando cabível, ou outro
          foro competente previsto em lei.
        </p>
      </LegalSection>

      <LegalSection title="16. Contato">
        <p>
          Dúvidas sobre estes Termos:{' '}
          <a href={`mailto:${LEGAL.contactEmail}`} className="font-medium text-primary hover:underline">
            {LEGAL.contactEmail}
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
