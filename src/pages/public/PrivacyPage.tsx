import { Link } from 'react-router-dom';
import { LegalList, LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout';
import { LEGAL } from '@/lib/legal';

export function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Política de Privacidade"
      subtitle={`Esta Política descreve como a ${LEGAL.controllerName} trata dados pessoais na plataforma ${LEGAL.platformName}, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD) e demais normas aplicáveis.`}
    >
      <LegalSection id="controlador" title="1. Controlador e encarregado (DPO)">
        <p>
          <strong>Controlador:</strong> {LEGAL.controllerName}
        </p>
        <p>
          <strong>Canal de privacidade / Encarregado (DPO):</strong>{' '}
          <a href={`mailto:${LEGAL.dpoEmail}`} className="font-medium text-primary hover:underline">
            {LEGAL.dpoEmail}
          </a>
        </p>
        <p>
          Para exercer direitos previstos na LGPD ou esclarecer dúvidas sobre esta Política, utilize
          o canal acima, identificando-se e descrevendo sua solicitação.
        </p>
      </LegalSection>

      <LegalSection title="2. Escopo e público">
        <p>Esta Política aplica-se ao tratamento de dados pessoais de:</p>
        <LegalList
          items={[
            'freelancers (pessoas físicas) que criam perfil e se candidatam a vagas;',
            'representantes de empresas que publicam vagas e gerenciam candidatos;',
            'visitantes da landing page e páginas públicas;',
            'administradores autorizados da plataforma.',
          ]}
        />
        <p>
          Não coletamos intencionalmente dados de menores de 18 anos. Se tomarmos conhecimento de
          cadastro indevido, adotaremos medidas para exclusão.
        </p>
      </LegalSection>

      <LegalSection title="3. Dados pessoais tratados">
        <p><strong>Dados de cadastro e conta</strong></p>
        <LegalList
          items={[
            'Freelancer: nome, e-mail, CPF, telefone (opcional), senha (armazenada de forma criptografada).',
            'Empresa: razão social/nome, e-mail, CNPJ, telefone (quando informado), senha (criptografada).',
            'Dados de sessão: tokens de autenticação (access e refresh token) e identificação básica do usuário logado.',
          ]}
        />
        <p><strong>Dados de perfil profissional (freelancer)</strong></p>
        <LegalList
          items={[
            'bio, avatar (upload de imagem), URL de currículo, stack tecnológica e níveis de habilidade;',
            'experiências profissionais (empresa, cargo, datas, descrição);',
            'itens de portfólio (título, URL, descrição, imagem opcional).',
          ]}
        />
        <p><strong>Dados de vagas e candidaturas</strong></p>
        <LegalList
          items={[
            'conteúdo de vagas publicadas (título, descrição, requisitos, prazos, tecnologias);',
            'candidaturas (carta de apresentação, currículo vinculado, status, datas);',
            'percentuais de compatibilidade (matching) calculados com base em tecnologias.',
          ]}
        />
        <p><strong>Outros dados</strong></p>
        <LegalList
          items={[
            'notificações internas (tipo, conteúdo, data de leitura);',
            'avaliações (nota, comentário, partes envolvidas, data);',
            'registros de recuperação de senha (códigos com hash, tentativas, expiração);',
            'logs de moderação administrativa e auditoria, quando aplicável;',
            'dados técnicos: endereço IP, data/hora de acesso, identificadores de dispositivo/navegador e registros de erro, para segurança e operação.',
          ]}
        />
        <p>
          <strong>Dados sensíveis:</strong> a plataforma não solicita, como regra, dados pessoais
          sensíveis nos termos do art. 5º, II, da LGPD (origem racial, saúde, biometria etc.). Não
          forneça tais informações em campos livres, salvo se estritamente necessário e com base
          legal adequada.
        </p>
      </LegalSection>

      <LegalSection title="4. Finalidades do tratamento">
        <LegalList
          items={[
            'cadastrar, autenticar e manter contas de usuários;',
            'permitir publicação de vagas, candidaturas e gestão do processo seletivo;',
            'calcular e exibir compatibilidade técnica entre perfis e vagas;',
            'enviar notificações sobre eventos relevantes (candidaturas, mudanças de status etc.);',
            'permitir avaliações mútuas após conclusão de vínculos;',
            'viabilizar recuperação de senha e suporte;',
            'moderar conteúdos, prevenir fraudes e garantir segurança da plataforma;',
            'cumprir obrigações legais e responder a solicitações de autoridades;',
            'melhorar usabilidade, desempenho e confiabilidade do serviço.',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Bases legais (art. 7º da LGPD)">
        <p>O tratamento apoia-se, conforme o caso, nas seguintes bases legais:</p>
        <LegalList
          items={[
            'execução de contrato ou procedimentos preliminares (art. 7º, V): cadastro, uso da plataforma, candidaturas e gestão de vagas;',
            'consentimento (art. 7º, I): aceite desta Política e dos Termos no cadastro; comunicações opcionais, quando houver;',
            'legítimo interesse (art. 7º, IX): segurança, prevenção a fraudes, melhoria do serviço e moderação, com balanceamento de direitos;',
            'cumprimento de obrigação legal ou regulatória (art. 7º, II): quando exigido por autoridade competente;',
            'exercício regular de direitos (art. 7º, VI): defesa em processos e preservação de evidências.',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Compartilhamento de dados">
        <p>Os dados podem ser compartilhados nas hipóteses abaixo:</p>
        <LegalList
          items={[
            'entre usuários da plataforma, conforme a funcionalidade: perfis públicos de candidatos para empresas; dados de contato após etapas do processo seletivo; avaliações recebidas;',
            'com prestadores de infraestrutura e tecnologia que operam o serviço, sob contratos e medidas de segurança compatíveis com a LGPD;',
            'com autoridades públicas, mediante requisição legal ou ordem judicial;',
            'em operações societárias (fusão, aquisição), com continuidade das proteções desta Política.',
          ]}
        />
        <p>
          <strong>Operadores e infraestrutura utilizados:</strong> hospedagem da API, banco de dados
          PostgreSQL, armazenamento de arquivos (avatars) e distribuição do frontend podem envolver
          provedores como Supabase, Render e Cloudflare, conforme a arquitetura de deploy. Esses
          parceiros tratam dados apenas para prestar o serviço contratado.
        </p>
        <p>
          <strong>Não vendemos</strong> dados pessoais a terceiros para fins de marketing
          independente.
        </p>
      </LegalSection>

      <LegalSection title="7. Transferência internacional">
        <p>
          Alguns provedores de infraestrutura podem processar dados em servidores localizados fora
          do Brasil. Nesses casos, adotamos salvaguardas previstas na LGPD (art. 33 e seguintes),
          como cláusulas contratuais e verificação de nível adequado de proteção, na medida
          aplicável.
        </p>
      </LegalSection>

      <LegalSection title="8. Armazenamento, retenção e eliminação">
        <LegalList
          items={[
            'Dados da conta e do perfil são mantidos enquanto a conta estiver ativa ou conforme necessário para a finalidade.',
            'Após encerramento da conta, dados podem ser conservados pelo prazo necessário para cumprimento legal, resolução de disputas, segurança e auditoria, sendo depois eliminados ou anonimizados quando possível.',
            'Registros de autenticação, recuperação de senha e logs de segurança são mantidos por prazos proporcionais à finalidade.',
            'Backups podem reter dados por período limitado adicional, com o mesmo nível de proteção.',
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Segurança da informação">
        <p>Adotamos medidas técnicas e administrativas proporcionais ao risco, incluindo:</p>
        <LegalList
          items={[
            'comunicação criptografada (HTTPS/TLS);',
            'hash de senhas e autenticação por tokens JWT com renovação controlada;',
            'controle de acesso por tipo de conta (freelancer, empresa, admin);',
            'validação de entrada, limitação de taxa (rate limit) em endpoints sensíveis;',
            'armazenamento de tokens de sessão no navegador (sessionStorage por padrão; localStorage apenas se o usuário marcar "Lembrar de mim") apenas no dispositivo do usuário.',
          ]}
        />
        <p>
          Nenhum sistema é absolutamente invulnerável. Em caso de incidente de segurança com risco
          relevante aos titulares, comunicaremos conforme exigido pela LGPD (art. 48) e pela ANPD,
          quando aplicável.
        </p>
      </LegalSection>

      <LegalSection title="10. Cookies e tecnologias similares">
        <p>
          A aplicação utiliza <strong>armazenamento local do navegador</strong> para manter sessão
          autenticada (tokens e dados básicos do usuário). Por padrão, a sessão fica em{' '}
          <strong>sessionStorage</strong> e encerra ao fechar o navegador. Se o usuário marcar
          &quot;Lembrar de mim&quot;, os dados são persistidos em <strong>localStorage</strong>.
          Não
          utilizamos, na versão atual, cookies de rastreamento publicitário de terceiros.
        </p>
        <p>
          Fontes externas (ex.: Google Fonts) podem registrar acesso técnico conforme suas próprias
          políticas. Você pode limpar o armazenamento local nas configurações do navegador, o que
          encerrará sua sessão na plataforma.
        </p>
      </LegalSection>

      <LegalSection title="11. Direitos do titular (art. 18 da LGPD)">
        <p>Você pode solicitar, mediante requisição ao canal de privacidade:</p>
        <LegalList
          items={[
            'confirmação da existência de tratamento;',
            'acesso aos dados;',
            'correção de dados incompletos, inexatos ou desatualizados;',
            'anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;',
            'portabilidade, observadas as normas da ANPD;',
            'eliminação dos dados tratados com base no consentimento, quando aplicável;',
            'informação sobre compartilhamentos e sobre a possibilidade de não consentir;',
            'revogação do consentimento, quando essa for a base legal;',
            'revisão de decisões automatizadas que afetem seus interesses, quando couber.',
          ]}
        />
        <p>
          Parte dos direitos pode ser exercida diretamente na plataforma (edição de perfil, alteração
          de senha, cancelamento de candidaturas). Para demais pedidos, envie e-mail para{' '}
          <a href={`mailto:${LEGAL.dpoEmail}`} className="font-medium text-primary hover:underline">
            {LEGAL.dpoEmail}
          </a>
          . Responderemos em prazo razoável, conforme a LGPD.
        </p>
        <p>
          Você também pode apresentar reclamação à{' '}
          <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> caso entenda que o
          tratamento viola a legislação.
        </p>
      </LegalSection>

      <LegalSection title="12. Decisões automatizadas e matching">
        <p>
          A plataforma calcula percentuais de compatibilidade entre vagas e perfis com base em
          tecnologias obrigatórias e desejáveis. Esse processamento é{' '}
          <strong>auxiliar à triagem</strong> e não produz efeito jurídico exclusivamente
          automatizado sobre contratações: a decisão final cabe à empresa contratante.
        </p>
        <p>
          Você pode solicitar informações sobre os critérios utilizados pelo canal de privacidade.
        </p>
      </LegalSection>

      <LegalSection title="13. Tratamento por administradores">
        <p>
          Usuários com perfil administrativo podem acessar listagens de usuários e vagas para
          moderação, bloqueio de contas e remoção de conteúdos inadequados. Essas ações são
          registradas quando aplicável e limitadas à finalidade de segurança e conformidade da
          plataforma.
        </p>
      </LegalSection>

      <LegalSection title="14. Responsabilidades dos usuários">
        <LegalList
          items={[
            'fornecer dados verdadeiros e mantê-los atualizados;',
            'não inserir dados pessoais de terceiros sem base legal;',
            'proteger credenciais de acesso;',
            'respeitar a privacidade de outros usuários ao utilizar informações obtidas na plataforma;',
            'não compartilhar dados obtidos na TASKIO para fins incompatíveis com esta Política.',
          ]}
        />
      </LegalSection>

      <LegalSection title="15. Alterações desta Política">
        <p>
          Esta Política pode ser atualizada para refletir mudanças legais, regulatórias ou
          funcionais. A data da última versão consta no topo da página. Alterações relevantes
          serão comunicadas por meios adequados. O uso continuado após a publicação da nova versão
          poderá exigir novo consentimento, quando necessário.
        </p>
      </LegalSection>

      <LegalSection title="16. Relação com os Termos de Uso">
        <p>
          Esta Política complementa os{' '}
          <Link to="/termos" className="font-medium text-primary hover:underline">
            Termos de Uso
          </Link>
          . Em caso de conflito sobre tratamento de dados pessoais, prevalecem as disposições mais
          protetivas ao titular, nos limites da lei.
        </p>
      </LegalSection>

      <LegalSection title="17. Contato">
        <p>
          <strong>Privacidade e LGPD:</strong>{' '}
          <a href={`mailto:${LEGAL.dpoEmail}`} className="font-medium text-primary hover:underline">
            {LEGAL.dpoEmail}
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
