// Gera lib/tools/catalogo.json a partir do MedicalToolsScreen.tsx do app original.
// Uso: node scripts/gerar-catalogo.mjs "D:\caminho\MedicalToolsScreen.tsx"
// O catálogo é o INVENTÁRIO do app antigo (1 registro por ferramenta). O que já foi
// migrado fica em lib/tools/disponiveis.ts (editado à mão).
import { readFileSync, writeFileSync } from 'node:fs';

const origem = process.argv[2];
if (!origem) { console.error('Informe o caminho do MedicalToolsScreen.tsx'); process.exit(1); }
const src = readFileSync(origem, 'utf-8').replace(/\r/g, '');

const CATEGORIA = { drc: 'drc', 'eletrólitos': 'eletrolitos', hemodialise: 'hemodialise', emergencia: 'emergencia', escalas: 'diversos' };
// id 75 era um link quebrado (rota HiponatremiaFluxograma nunca registrada) e duplicava o id 40.
const IGNORAR_IDS = new Set(['75']);

const reEntrada = /\{\s*id:\s*'([^']+)',\s*category:\s*'([^']+)',\s*title:\s*'((?:[^'\\]|\\.)*)',\s*description:\s*'((?:[^'\\]|\\.)*)'/;
const unesc = (s) => s.replace(/\\'/g, "'");
const entradas = [];
for (const ln of src.split('\n')) {
  const m = reEntrada.exec(ln);
  if (m) entradas.push({ id: m[1], cat: m[2], titulo: unesc(m[3]), descricao: unesc(m[4]), oculta: ln.trim().startsWith('//') });
}

const rotas = Object.fromEntries([...src.matchAll(/case '((?:[^'\\]|\\.)*)':\s*navigation\.navigate\('([^']+)'\)/g)].map((m) => [unesc(m[1]), m[2]]));

const EDUCACIONAL = new Set(['HipocalcemiaScreen','HypokalemiaScreen','HipofosfatemiaScreen','HipomagnesemiaScreen','HipercalcemiaScreen','HyperkalemiaScreen','HiperfosfatemiaScreen','HipermagnesemiaScreen','HipernatremiaScreen','HiponatremiaScreen','InjuriaRenalAgudaScreen','ExogenousIntoxicationGuide','ChronicKidneyVaccineScreen','GeneralVaccineCalendarScreen','NefrolitiaseForm','FerramentasIgAScreen','DrugDilutionsScreen','RapidSequenceIntubationScreen']);
const ESCORE = new Set(['GlasgowCalculator','NIHStrokeScale','WellsScoreTVPScreen','ThromboprophylaxisScoreScreen','BresciaCiminoScreen','ReinScoreScreen','QSOFACalculator','SOFACalculator','CardiovascularRiskCalculator','CKDProgressionRiskCalculator','ADPKDClassification','TransplantAllocationScreen','FraturasClassification']);
const SENSIVEL = new Set(['Ajuste','ErythropoietinCalculator','HeparinDosageScreen','ParicalcitolCalculator','IronReplacementCalculator','BicarbonateReplacementCalculator','DoseConverterCalculator','RapidSequenceIntubationScreen','DrugDilutionsScreen','CorticoidesConversor','HypernatremiaCalculator','SodiumCorrectionCalculator','DesmameCalculator']);
const NUCLEO = new Set(['Ajuste','Clearance','CockcroftGaultCalculator','ClCrPediatricCalculator','CKDEPI2021CreatCysCalculator']);

const tipoDe = (r) =>
  r === 'Ajuste' ? 'calculadora-dados' : EDUCACIONAL.has(r) ? 'conteudo' : ESCORE.has(r) ? 'escore'
  : r === 'HyponatremiaFlowchartScreen' ? 'fluxograma' : r === 'Cid10' ? 'consulta' : 'calculadora';
const prioridadeDe = (r, t) =>
  NUCLEO.has(r) ? 'P1' : r === 'IMCCalculator' ? 'P1' : { calculadora: 'P2', conteudo: 'P3', consulta: 'P3', escore: 'P4', fluxograma: 'P4' }[t];

const slugify = (t) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const porTitulo = new Map();
for (const e of entradas) {
  if (IGNORAR_IDS.has(e.id)) continue;
  const rota = rotas[e.titulo];
  if (!rota) { console.error('SEM ROTA:', e.titulo); continue; }
  let f = porTitulo.get(e.titulo);
  if (!f) {
    const tipo = tipoDe(rota);
    f = { slug: slugify(e.titulo), titulo: e.titulo, descricao: e.descricao, categorias: [], tipo,
      sensibilidade: SENSIVEL.has(rota) ? 'alta' : 'normal', prioridade: prioridadeDe(rota, tipo), rotaLegada: rota, idsLegados: [] };
    if (e.oculta) f.oculta = true;
    porTitulo.set(e.titulo, f);
  }
  const cat = CATEGORIA[e.cat];
  if (!f.categorias.includes(cat)) f.categorias.push(cat);
  f.idsLegados.push(e.id);
}
const catalogo = [...porTitulo.values()];
const slugs = new Set();
for (const f of catalogo) { if (slugs.has(f.slug)) throw new Error('slug duplicado: ' + f.slug); slugs.add(f.slug); }

writeFileSync(new URL('../lib/tools/catalogo.json', import.meta.url), JSON.stringify(catalogo, null, 2) + '\n');
const ativas = catalogo.filter((f) => !f.oculta);
console.log(`catálogo: ${catalogo.length} ferramentas (${ativas.length} no menu, ${catalogo.length - ativas.length} ocultas)`);
console.log('por tipo:', Object.entries(catalogo.reduce((a, f) => ((a[f.tipo] = (a[f.tipo] || 0) + 1), a), {})).map(([k, v]) => `${k}=${v}`).join(' '));
