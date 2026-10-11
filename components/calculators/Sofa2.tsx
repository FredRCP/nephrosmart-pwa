'use client';

import { useState, type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { NOMES_SISTEMA, calcularSofa2, type DiureseSofa, type EntradaSofa, type Sistema, type UnidadeLab } from '@/lib/clinical/sofa2';
import { normalizarNumero } from '@/lib/clinical/numeros';
import CalculadoraLayout, { BotaoPrimario, BotaoSecundario, CartaoResultado } from '@/components/archetypes/CalculadoraLayout';
import AvisosCalculadora from '@/components/ui/AvisosCalculadora';
import Campo from '@/components/ui/Campo';
import Escolha from '@/components/ui/Escolha';
import Icone from '@/components/ui/Icone';
import Seletor from '@/components/ui/Seletor';
import { TituloInfo } from '@/components/ui/InfoDialog';

const VAZIO: EntradaSofa = {
  pao2: '', spo2: '', fio2: '', suporteAvancado: false, ecmoResp: false, plaquetas: '', bilirrubina: '', gcs: '', deliriumFarmaco: false, motorGrave: false,
  creatinina: '', diurese: '', emTrs: false, criteriosTrs: false, pam: '', noradrenalina: '', adrenalina: '', dopamina: '', outroVaso: false, suporteMecanico: false,
  semVasoativosPorLimite: false, unidade: 'mg/dL',
};

function Marcar({ rotulo, marcado, onChange }: { rotulo: string; marcado: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <label className="mb-2 flex items-start gap-3 rounded-xl px-3 py-2.5 text-base" style={{ backgroundColor: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text }}>
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 shrink-0" />
      <span>{rotulo}</span>
    </label>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <fieldset className="mt-5">
      <legend className="mb-2 px-1 text-lg font-bold" style={{ color: colors.resultText }}>{titulo}</legend>
      {children}
    </fieldset>
  );
}

/** SOFA-2 (Ranzani et al., JAMA 2025): 6 sistemas, 0 a 24 pontos. */
export default function Sofa2() {
  const { colors } = useTheme();
  const [e, setE] = useState<EntradaSofa>(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState('');
  const [cor, setCor] = useState(colors.resultText);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [detalhe, setDetalhe] = useState<string[]>([]);
  const erro = (c: string) => erros.includes(c);

  const mudar = <K extends keyof EntradaSofa>(k: K, v: EntradaSofa[K]) => { setE((x) => ({ ...x, [k]: v })); setErros((l) => l.filter((c) => c !== k)); setResultado(''); setDetalhe([]); };
  const num = (k: keyof EntradaSofa) => (t: string) => mudar(k, normalizarNumero(t) as never);
  const bool = (k: keyof EntradaSofa) => (v: boolean) => mudar(k, v as never);

  const calcular = () => {
    setTentativa((t) => t + 1);
    const r = calcularSofa2(e);
    if (!r.ok) { setErros(r.campos); setResultado(r.mensagem); setCor(colors.inputError); setAvisos([]); setDetalhe([]); return; }
    setErros([]); setResultado(r.texto); setCor(colors.resultText); setAvisos(r.avisos);
    setDetalhe((Object.keys(NOMES_SISTEMA) as Sistema[]).map((k) => `${NOMES_SISTEMA[k]}: ${r.sistemas[k].motivo}`));
  };
  const limpar = () => { setE(VAZIO); setErros([]); setResultado(''); setAvisos([]); setDetalhe([]); };
  const mg = e.unidade === 'mg/dL';

  return (
    <CalculadoraLayout titulo="SOFA-2" info={
      <>
        <TituloInfo>O que é</TituloInfo>
        <p>Atualização do escore SOFA (Ranzani et al., JAMA 2025), derivada e validada em 3,34 milhões de internações em UTI de 9 países. Soma de 6 sistemas (0 a 4 pontos), total de 0 a 24. Quanto maior, maior a disfunção orgânica.</p>
        <TituloInfo>Como usar</TituloInfo>
        <ul className="space-y-1">
          <li>• Use o PIOR valor de cada parâmetro nas últimas 24 h.</li>
          <li>• Dado ausente no 1º dia conta 0 (o app avisa); nos dias seguintes repete-se o último valor.</li>
          <li>• Sedado: use o último Glasgow antes da sedação (se desconhecido, 0).</li>
          <li>• Respiratório: a pontuação 3 e 4 exige suporte ventilatório avançado (cateter nasal de alto fluxo, CPAP, BiPAP, VNI, ventilação invasiva). Sem ele, o máximo é 2. SpO₂/FiO₂ só vale se não houver PaO₂ e com SpO₂ &lt; 98%. ECMO respiratória = 4.</li>
          <li>• Cardiovascular: noradrenalina + adrenalina somadas, em µg/kg/min de noradrenalina BASE (1 mg de base = 2 mg de bitartarato monoidratado). Conta só vasopressor em infusão contínua há ≥ 1 h.</li>
          <li>• Renal: terapia renal substitutiva conta 4 (inclusive crônica, nos dias sem sessão), exceto se for por indicação não renal.</li>
        </ul>
        <TituloInfo>Limites</TituloInfo>
        <ul className="space-y-1">
          <li>• Não há tabela oficial de mortalidade por faixa de pontuação no artigo, por isso o app não mostra uma.</li>
          <li>• O ponto de corte do Sepsis-3 (variação ≥ 2) foi definido com o SOFA original.</li>
          <li>• O AUROC para mortalidade em UTI no 1º dia foi 0,79 (SOFA-2) contra 0,77 (SOFA original).</li>
        </ul>
      </>
    }>
      <Escolha rotulo="Unidade de creatinina e bilirrubina" valor={e.unidade} onChange={(u: UnidadeLab) => mudar('unidade', u)}
        opcoes={[{ valor: 'mg/dL', texto: 'mg/dL' }, { valor: 'umol/L', texto: 'µmol/L' }]} />

      <Grupo titulo="Respiratório">
        <Campo icone="vial" placeholder="PaO₂ (mmHg)" inputMode="decimal" valor={e.pao2} erro={erro('pao2')} tentativa={tentativa} onChange={num('pao2')} />
        <Campo icone="vial" placeholder="SpO₂ (%) — só se não houver PaO₂" inputMode="decimal" valor={e.spo2} erro={erro('spo2')} tentativa={tentativa} onChange={num('spo2')} />
        <Campo icone="vial" placeholder="FiO₂ (%)" inputMode="decimal" valor={e.fio2} erro={erro('fio2')} tentativa={tentativa} onChange={num('fio2')} />
        <Marcar rotulo="Suporte ventilatório avançado (alto fluxo, CPAP, BiPAP, VNI ou ventilação invasiva)" marcado={e.suporteAvancado} onChange={bool('suporteAvancado')} />
        <Marcar rotulo="ECMO respiratória" marcado={e.ecmoResp} onChange={bool('ecmoResp')} />
      </Grupo>

      <Grupo titulo="Coagulação">
        <Campo icone="vial" placeholder="Plaquetas (×10³/µL)" inputMode="decimal" valor={e.plaquetas} erro={erro('plaquetas')} tentativa={tentativa} onChange={num('plaquetas')} />
      </Grupo>

      <Grupo titulo="Fígado">
        <Campo icone="vial" placeholder={`Bilirrubina total (${mg ? 'mg/dL' : 'µmol/L'})`} inputMode="decimal" valor={e.bilirrubina} erro={erro('bilirrubina')} tentativa={tentativa} onChange={num('bilirrubina')} />
      </Grupo>

      <Grupo titulo="Sistema nervoso central">
        <Campo icone="user-injured" placeholder="Glasgow (3 a 15)" inputMode="numeric" valor={e.gcs} erro={erro('gcs')} tentativa={tentativa} onChange={num('gcs')} />
        <Marcar rotulo="Em tratamento medicamentoso para delirium" marcado={e.deliriumFarmaco} onChange={bool('deliriumFarmaco')} />
        <Marcar rotulo="Resposta motora em extensão/ausente ou mioclonia generalizada" marcado={e.motorGrave} onChange={bool('motorGrave')} />
      </Grupo>

      <Grupo titulo="Renal">
        <Campo icone="vial" placeholder={`Creatinina (${mg ? 'mg/dL' : 'µmol/L'})`} inputMode="decimal" valor={e.creatinina} erro={erro('creatinina')} tentativa={tentativa} onChange={num('creatinina')} />
        <Seletor rotulo="Débito urinário" valor={e.diurese} onChange={(v) => mudar('diurese', v as DiureseSofa)}
          opcoes={[
            { valor: 'normal', texto: '≥ 0,5 mL/kg/h' },
            { valor: '6-12h', texto: '< 0,5 mL/kg/h por 6 a 12 h' },
            { valor: '12h', texto: '< 0,5 mL/kg/h por ≥ 12 h' },
            { valor: '24h', texto: '< 0,3 mL/kg/h por ≥ 24 h ou anúria ≥ 12 h' },
          ]} />
        <Marcar rotulo="Em terapia renal substitutiva (por indicação renal)" marcado={e.emTrs} onChange={bool('emTrs')} />
        <Marcar rotulo="Sem TRS, mas preenche critérios: creatinina > 1,2 mg/dL ou oligúria < 0,3 mL/kg/h por > 6 h, MAIS K ≥ 6,0 mmol/L ou pH ≤ 7,20 com HCO₃ ≤ 12" marcado={e.criteriosTrs} onChange={bool('criteriosTrs')} />
      </Grupo>

      <Grupo titulo="Cardiovascular">
        <Campo icone="heartbeat" placeholder="Pressão arterial média (mmHg)" inputMode="decimal" valor={e.pam} erro={erro('pam')} tentativa={tentativa} onChange={num('pam')} />
        <Campo icone="pills" placeholder="Noradrenalina base (µg/kg/min)" inputMode="decimal" valor={e.noradrenalina} erro={erro('noradrenalina')} tentativa={tentativa} onChange={num('noradrenalina')} />
        <Campo icone="pills" placeholder="Adrenalina (µg/kg/min)" inputMode="decimal" valor={e.adrenalina} erro={erro('adrenalina')} tentativa={tentativa} onChange={num('adrenalina')} />
        <Campo icone="pills" placeholder="Dopamina (µg/kg/min)" inputMode="decimal" valor={e.dopamina} erro={erro('dopamina')} tentativa={tentativa} onChange={num('dopamina')} />
        <Marcar rotulo="Outro vasopressor ou inotrópico (vasopressina, fenilefrina, dobutamina, milrinona...)" marcado={e.outroVaso} onChange={bool('outroVaso')} />
        <Marcar rotulo="Suporte circulatório mecânico (ECMO VA, balão intra-aórtico, dispositivo de assistência ventricular)" marcado={e.suporteMecanico} onChange={bool('suporteMecanico')} />
        <Marcar rotulo="Sem vasoativos por limite terapêutico (pontuar pela PAM)" marcado={e.semVasoativosPorLimite} onChange={bool('semVasoativosPorLimite')} />
      </Grupo>

      <div className="mt-5 flex gap-3">
        <BotaoPrimario onClick={calcular}>Calcular</BotaoPrimario>
        <BotaoSecundario onClick={limpar} aria-label="Limpar campos"><Icone nome="trash-alt" tamanho={20} cor={colors.buttonText} /></BotaoSecundario>
      </div>
      <AvisosCalculadora avisos={avisos} />
      {resultado && <CartaoResultado texto={resultado} cor={cor} />}
      {detalhe.length > 0 && (
        <ul data-testid="detalhe-sofa" className="mt-3 space-y-1 text-sm" style={{ color: colors.text }}>
          {detalhe.map((d) => <li key={d}>• {d}</li>)}
        </ul>
      )}
    </CalculadoraLayout>
  );
}
