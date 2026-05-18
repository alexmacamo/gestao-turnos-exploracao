
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

const COR_BIM = "#A10D4F";
const COR_BIM_2 = "#C2185B";
const COR_CLARO = "#FCE4EC";

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-xl ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

function Button({ children, onClick, disabled, className = "", style = {}, title = "" }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`rounded-2xl px-4 py-3 font-bold transition ${disabled ? "cursor-not-allowed opacity-40" : "hover:opacity-90"} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

const horariosTurno = {
  Manhã: "07:00 - 15:00",
  Tarde: "15:00 - 23:00",
  Noite: "23:00 - 07:00",
};

const turnos = [
  { nome: "Manhã", icon: "🌅" },
  { nome: "Tarde", icon: "🌇" },
  { nome: "Noite", icon: "🌙" },
];

const operadoresBase = [
  "Elton Nobre",
  "Edmilson Nhacundela",
  "Faize Pinto",
  "Joaquim Mabunda",
  "Milton Cossa",
  "Eugenio Machava",
  "Kemmy Aruma",
  "Melo Santos",
  "Joel Mandrasse",
  "Alexandre Macamo",
];

const checklistPorTurno = {
  Manhã: [
    ["Sala de Máquinas", "Registar temperatura e humidade da SEDE AS400", "Início/Fim"],
    ["Sala de Máquinas", "Registar temperatura e humidade da SEDE Comunicações", "Início/Fim"],
    ["Fechos / BD", "Validar Ark_GL comparando com a Query", "Até 08:00"],
    ["Fechos / BD", "Validar Ark_MR comparando com a Query", "Até 08:00"],
    ["Batch / PCOMB", "Validar PCOMB PRD", "Até 08:00"],
    ["Cartões", "Validar Visa Incoming / Outgoing", "Manhã"],
    ["Cartões", "Validar MasterCard Incoming / Outgoing", "12:00"],
    ["Monitorização", "Verificar actualização das telas nas TV’s", "07h-15h"],
    ["Passagem de Turno", "Entregar relatório ao turno da tarde", "14:30 - 15:00"],
  ],
  Tarde: [
    ["Sala de Máquinas", "Registar temperatura e humidade da SEDE AS400", "Inicial / Final"],
    ["Monitorização", "Validar se o SMSSHEL está activo", "15h-23h"],
    ["Relatórios / IDW", "Verificar relatórios PGL IDW", "15h-23h"],
    ["Relatórios / IDW", "Validar duplicados", "15h-23h"],
    ["Cheques", "Confirmar cheques", "15h-23h"],
    ["Mapas", "Verificar mapas PBIM, GBIM e MMF", "15h-23h"],
    ["Backup", "Validar execução do BACKUP_BQRY", "Até 17:00"],
    ["ATM / POS", "Validar se as transacções ATM e POS estão a ser aprovadas", "15h-23h"],
    ["VISA", "Executar OUTGOING VISA - processamento e envio", "Tarde"],
    ["MasterCard", "Executar MasterCard IPM Outgoing Process", "Tarde"],
    ["VSS", "Validar cadeia de VSS e contactar SIMO se necessário", "20:00"],
    ["FINANCA", "Validar FINANCA", "19:00"],
    ["PRE-BATCH", "Validar PRE-BATCH", "20:30"],
    ["PCOMB", "Executar PCOMB DSV", "21:00"],
    ["Passagem de Turno", "Entregar relatório ao turno da noite", "22:30 - 23:00"],
  ],
  Noite: [
    ["Sala de Máquinas", "Registar temperatura e humidade da SEDE AS400", "Inicial / Final"],
    ["ATM / POS", "Validar se as transações ATM e POS estão a ser aprovadas", "Noite"],
    ["ITM", "Executar FECHO DO ITM", "18:00"],
    ["ITM", "Executar ITM SETTLEMENT", "Noite"],
    ["Batch", "Executar COPY TO NIGHTS", "Noite"],
    ["Cartões", "Executar CREDIT CARD PRE-PROCESS", "Noite"],
    ["Cartões", "Executar CREDIT CARD DAILY PROCESS", "Noite"],
    ["GL", "Validar integração do GL e comparar totais", "Noite"],
    ["VISA", "Executar OUTGOING VISA - Processamento e Envio", "Noite"],
    ["MasterCard", "Executar MasterCard OUTGOING", "Noite"],
    ["FINANCA", "Validar FINANCA", "19:00"],
    ["PRE-BATCH", "Executar PRE-BATCH", "20:30"],
    ["PCOMB", "Monitorar PCOMB", "Madrugada"],
    ["ROF01", "Reiniciar ROF01", "Madrugada"],
    ["SIMO", "Acompanhar SIMO após ITM REPOST", "01h-04h"],
    ["Passagem de Turno", "Entregar relatório ao turno da manhã", "06:30 - 07:00"],
  ],
};

const permissoes = {
  Operador: { checklist: true, upload: true, incidentes: true, editarIncidente: true, eliminar: false, validar: false, admin: false, descricao: "Preenche checklist, faz upload, cria/edita incidentes e submete relatório." },
  Supervisor: { checklist: true, upload: true, incidentes: true, editarIncidente: true, eliminar: true, validar: true, admin: false, descricao: "Valida/rejeita relatórios, acompanha pendências e elimina incidentes." },
  Auditoria: { checklist: false, upload: false, incidentes: false, editarIncidente: false, eliminar: false, validar: false, admin: false, descricao: "Somente leitura: consulta relatórios, evidências, histórico e auditoria." },
  Administrador: { checklist: true, upload: true, incidentes: true, editarIncidente: true, eliminar: true, validar: true, admin: true, descricao: "Acesso total: utilizadores, permissões, relatórios, incidentes e auditoria." },
};

const perfilCor = {
  Operador: "#2563EB",
  Supervisor: "#059669",
  Auditoria: "#7C3AED",
  Administrador: "#DC2626",
};

const incidentesIniciais = [
  { id: "INC000066476", canal: "ATM/POS", hora: "14h40 - 17h00", descricao: "Elevado número de timeouts nas transacções", estado: "Escalado à SIMO" },
  { id: "WO0000167787", canal: "Batch", hora: "08h12 - 08h15", descricao: "Atraso na recepção de ficheiros diários", estado: "Em acompanhamento" },
];

const relatoriosIniciais = [
  { id: "RT-2026-0509-001", data: "09/05/2026", operadoresTurno: "Elton Nobre / Edmilson Nhacundela", turno: "Manhã", hora: horariosTurno.Manhã, progresso: 100, estado: "Validado", supervisor: "Idricio Langa", anexos: ["relatorio_manha.pdf"] },
  { id: "RT-2026-0508-003", data: "08/05/2026", operadoresTurno: "Edmilson Nhacundela / Kemmy Aruma", turno: "Noite", hora: horariosTurno.Noite, progresso: 75, estado: "Com Pendências", supervisor: "Pendente", anexos: [] },
  { id: "RT-2026-0508-002", data: "08/05/2026", operadoresTurno: "Faize Pinto / Milton Cossa", turno: "Tarde", hora: horariosTurno.Tarde, progresso: 88, estado: "Submetido", supervisor: "Aguardando", anexos: ["prints_monitoria.zip"] },
];

function criarTarefas(turno) {
  return (checklistPorTurno[turno] || []).map(([categoria, tarefa, horario], index) => ({
    id: `${turno}-${index + 1}`,
    categoria,
    tarefa,
    horario,
    feito: index < 3,
    observacao: index < 3 ? "OK" : "",
  }));
}

function estadoClasse(estado) {
  if (estado === "Validado") return "bg-emerald-100 text-emerald-700";
  if (estado === "Rejeitado" || estado === "Com Pendências") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
}

export default function PrototipoRelatoriosGestaoTurnos() {
  const [operadores, setOperadores] = useState(operadoresBase);
  const [utilizadoresExtra, setUtilizadoresExtra] = useState(["Idricio Langa", "Auditoria Interna"]);
  const utilizadoresSistema = useMemo(() => [...operadores, ...utilizadoresExtra], [operadores, utilizadoresExtra]);

  const [perfisUtilizadores, setPerfisUtilizadores] = useState(() => {
    const base = {};
    operadoresBase.forEach((op) => { base[op] = "Operador"; });
    base["Alexandre Macamo"] = "Administrador";
    base["Idricio Langa"] = "Supervisor";
    base["Auditoria Interna"] = "Auditoria";
    return base;
  });

  const [perfilActivo, setPerfilActivo] = useState("Administrador");
  const [utilizadorLogado, setUtilizadorLogado] = useState("Alexandre Macamo");
  const [utilizadorAAlterar, setUtilizadorAAlterar] = useState("Elton Nobre");
  const [novoPerfilUtilizador, setNovoPerfilUtilizador] = useState("Operador");
  const [novoUtilizador, setNovoUtilizador] = useState({ nome: "", contacto: "", email: "", perfil: "Operador" });

  const [turno, setTurno] = useState("Manhã");
  const [tarefas, setTarefas] = useState(criarTarefas("Manhã"));
  const [operador1, setOperador1] = useState("Elton Nobre");
  const [operador2, setOperador2] = useState("Edmilson Nhacundela");
  const [estadoRelatorio, setEstadoRelatorio] = useState("Rascunho");
  const [mensagem, setMensagem] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [comentarioSupervisor, setComentarioSupervisor] = useState("");
  const [ficheiros, setFicheiros] = useState([]);
  const [anexos, setAnexos] = useState([]);

  const [incidentes, setIncidentes] = useState(incidentesIniciais);
  const [modalIncidente, setModalIncidente] = useState(false);
  const [incidenteEditarId, setIncidenteEditarId] = useState(null);
  const [incidenteEliminar, setIncidenteEliminar] = useState(null);
  const [formIncidente, setFormIncidente] = useState({ referencia: "", canal: "ATM/POS", hora: "", descricao: "", estado: "Em acompanhamento" });

  const [relatorios, setRelatorios] = useState(relatoriosIniciais);
  const [pesquisa, setPesquisa] = useState("");
  const [relatorioAberto, setRelatorioAberto] = useState(null);

  const pode = permissoes[perfilActivo];
  const operadoresTurno = [operador1, operador2].filter(Boolean).join(" / ");
  const horario = horariosTurno[turno];
  const feitas = tarefas.filter((t) => t.feito).length;
  const progresso = Math.round((feitas / Math.max(tarefas.length, 1)) * 100);
  const pendentes = tarefas.filter((t) => !t.feito);

  const relatorioAtual = useMemo(() => ({
    id: "RT-2026-0509-001",
    data: "09/05/2026",
    turno,
    hora: horario,
    operadoresTurno,
    supervisor: "Idricio Langa",
    estado: estadoRelatorio,
    progresso,
    anexos,
    ficheiros,
    observacoes,
    justificativa,
    comentarioSupervisor,
    tarefas,
    incidentes: incidentes.length,
  }), [turno, horario, operadoresTurno, estadoRelatorio, progresso, anexos, ficheiros, observacoes, justificativa, comentarioSupervisor, tarefas, incidentes.length]);

  const relatoriosFiltrados = relatorios.filter((r) =>
    [r.id, r.data, r.operadoresTurno, r.turno, r.estado].join(" ").toLowerCase().includes(pesquisa.toLowerCase())
  );

  function entrarComo(nome) {
    const perfil = perfisUtilizadores[nome] || "Operador";
    setUtilizadorLogado(nome);
    setPerfilActivo(perfil);
    setMensagem(`${nome} entrou no sistema com perfil ${perfil}.`);
  }

  function seleccionarUtilizadorParaAlterar(nome) {
    const perfil = perfisUtilizadores[nome] || "Operador";
    setUtilizadorAAlterar(nome);
    setNovoPerfilUtilizador(perfil);
    setMensagem(`Utilizador seleccionado: ${nome}. Perfil actual: ${perfil}.`);
  }

  function gravarPermissao() {
    if (!pode.admin) {
      setMensagem("Apenas Administrador pode alterar permissões.");
      return;
    }
    setPerfisUtilizadores((prev) => ({ ...prev, [utilizadorAAlterar]: novoPerfilUtilizador }));
    setMensagem(`Permissão actualizada: ${utilizadorAAlterar} agora é ${novoPerfilUtilizador}.`);
  }

  function cadastrarUtilizador() {
    if (!pode.admin) {
      setMensagem("Apenas Administrador pode cadastrar utilizadores.");
      return;
    }
    const nome = novoUtilizador.nome.trim();
    if (!nome) {
      setMensagem("Preencha o nome do utilizador.");
      return;
    }
    if (utilizadoresSistema.includes(nome)) {
      setMensagem("Este utilizador já existe.");
      return;
    }
    if (novoUtilizador.perfil === "Operador") setOperadores((prev) => [...prev, nome]);
    else setUtilizadoresExtra((prev) => [...prev, nome]);
    setPerfisUtilizadores((prev) => ({ ...prev, [nome]: novoUtilizador.perfil }));
    setMensagem(`Utilizador ${nome} cadastrado com perfil ${novoUtilizador.perfil}.`);
    setNovoUtilizador({ nome: "", contacto: "", email: "", perfil: "Operador" });
  }

  function mudarTurno(novoTurno) {
    if (!pode.checklist) {
      setMensagem(`${perfilActivo}: sem permissão para alterar turno.`);
      return;
    }
    setTurno(novoTurno);
    setTarefas(criarTarefas(novoTurno));
    setEstadoRelatorio("Rascunho");
    setMensagem(`Checklist do turno da ${novoTurno} carregada.`);
  }

  function toggleTarefa(id) {
    if (!pode.checklist) {
      setMensagem(`${perfilActivo}: sem permissão para alterar checklist.`);
      return;
    }
    setTarefas((prev) => prev.map((t) => t.id === id ? { ...t, feito: !t.feito, observacao: !t.feito ? "OK" : "" } : t));
  }

  function actualizarObservacao(id, valor) {
    if (!pode.checklist) return setMensagem(`${perfilActivo}: sem permissão para alterar observações.`);
    setTarefas((prev) => prev.map((t) => t.id === id ? { ...t, observacao: valor } : t));
  }

  function carregarAnexos(event) {
    if (!pode.upload) return setMensagem(`${perfilActivo}: sem permissão para upload.`);
    const novos = Array.from(event.target.files || []).map((file) => ({ nome: file.name, url: URL.createObjectURL(file), carregadoEm: new Date().toLocaleString("pt-MZ") }));
    setFicheiros((prev) => [...prev, ...novos]);
    setAnexos((prev) => [...prev, ...novos.map((f) => f.nome)]);
    if (novos.length) setMensagem(`${novos.length} ficheiro(s) carregado(s).`);
  }

  function removerAnexo(nome) {
    if (!pode.upload) return setMensagem(`${perfilActivo}: sem permissão para remover anexos.`);
    setFicheiros((prev) => prev.filter((f) => f.nome !== nome));
    setAnexos((prev) => prev.filter((a) => a !== nome));
  }

  function submeterRelatorio() {
    if (!pode.upload) return setMensagem(`${perfilActivo}: sem permissão para submeter.`);
    if (pendentes.length && !justificativa.trim()) return setMensagem("Existem pendências. Preencha a justificação antes de submeter.");
    const novo = { ...relatorioAtual, estado: "Submetido" };
    setEstadoRelatorio("Submetido");
    setRelatorios((prev) => prev.some((r) => r.id === novo.id) ? prev.map((r) => r.id === novo.id ? novo : r) : [novo, ...prev]);
    setMensagem("Relatório submetido ao supervisor Idricio Langa.");
  }

  function validarRelatorio() {
    if (!pode.validar) return setMensagem(`${perfilActivo}: sem permissão para validar.`);
    setEstadoRelatorio("Validado");
    setRelatorios((prev) => prev.map((r) => r.id === relatorioAtual.id ? { ...relatorioAtual, estado: "Validado" } : r));
    setMensagem("Relatório validado pelo supervisor.");
  }

  function rejeitarRelatorio() {
    if (!pode.validar) return setMensagem(`${perfilActivo}: sem permissão para rejeitar.`);
    setEstadoRelatorio("Rejeitado");
    setRelatorios((prev) => prev.map((r) => r.id === relatorioAtual.id ? { ...relatorioAtual, estado: "Rejeitado" } : r));
    setMensagem("Relatório rejeitado.");
  }

  function abrirNovoIncidente() {
    if (!pode.incidentes) return setMensagem(`${perfilActivo}: sem permissão para criar incidente.`);
    setIncidenteEditarId(null);
    setFormIncidente({ referencia: "", canal: "ATM/POS", hora: "", descricao: "", estado: "Em acompanhamento" });
    setModalIncidente(true);
  }

  function editarIncidente(inc) {
    if (!pode.editarIncidente) return setMensagem(`${perfilActivo}: sem permissão para editar incidente.`);
    setIncidenteEditarId(inc.id);
    setFormIncidente({ referencia: inc.id, canal: inc.canal, hora: inc.hora, descricao: inc.descricao, estado: inc.estado });
    setModalIncidente(true);
  }

  function gravarIncidente() {
    if (!pode.incidentes) return setMensagem(`${perfilActivo}: sem permissão para gravar incidente.`);
    if (!formIncidente.referencia || !formIncidente.hora || !formIncidente.descricao) return setMensagem("Preencha referência, hora e descrição do incidente.");
    const inc = { id: formIncidente.referencia, canal: formIncidente.canal, hora: formIncidente.hora, descricao: formIncidente.descricao, estado: formIncidente.estado };
    if (incidenteEditarId) {
      setIncidentes((prev) => prev.map((i) => i.id === incidenteEditarId ? inc : i));
      setMensagem(`Incidente ${inc.id} actualizado.`);
    } else {
      setIncidentes((prev) => [inc, ...prev]);
      setMensagem(`Incidente ${inc.id} registado.`);
    }
    setModalIncidente(false);
  }

  function confirmarEliminarIncidente() {
    if (!pode.eliminar) return setMensagem(`${perfilActivo}: sem permissão para eliminar incidente.`);
    if (!incidenteEliminar) return;
    setIncidentes((prev) => prev.filter((i) => i.id !== incidenteEliminar.id));
    setMensagem(`Incidente ${incidenteEliminar.id} eliminado.`);
    setIncidenteEliminar(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-pink-50 to-slate-200 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden flex flex-col gap-4 rounded-[32px] p-8 text-white shadow-2xl md:flex-row md:items-center md:justify-between" style={{ background: "linear-gradient(135deg,#A10D4F,#D81B60,#7B1FA2)" }}>
          <div>
            <p className="text-sm font-medium text-white">Departamento de Sistemas • Exploração</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">Gestão de Turnos Operacionais</h1>
            <p className="mt-2 text-pink-100">Monitorização • Checklist • Incidentes • Auditoria • Relatórios</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setRelatorioAberto(relatorioAtual)} className="bg-white text-slate-900">🖨️ Imprimir</Button>
            <Button onClick={() => setRelatorioAberto(relatorioAtual)} className="text-white" style={{ backgroundColor: COR_BIM_2 }}>👁️ Ver Relatório</Button>
          </div>
        </motion.div>

        {mensagem && <div className="rounded-2xl border border-[#E91E63] bg-[#FCE4EC] p-4 text-sm font-semibold" style={{ color: COR_BIM }}>{mensagem}</div>}

        <Card>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">🔐 Atribuição de Permissões</h2>
                <p className="text-sm text-slate-500">Entre como administrador para cadastrar utilizadores e atribuir perfis.</p>
              </div>
              <div className="grid w-full gap-3 md:w-[920px] md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Entrar como</label>
                  <select value={utilizadorLogado} onChange={(e) => entrarComo(e.target.value)} className="h-12 w-full rounded-2xl border bg-white px-4">
                    {utilizadoresSistema.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Utilizador a alterar</label>
                  <select value={utilizadorAAlterar} onChange={(e) => seleccionarUtilizadorParaAlterar(e.target.value)} className="h-12 w-full rounded-2xl border bg-white px-4">
                    {utilizadoresSistema.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Perfil atribuído</label>
                  <select value={novoPerfilUtilizador} disabled={!pode.admin} onChange={(e) => setNovoPerfilUtilizador(e.target.value)} className="h-12 w-full rounded-2xl border bg-white px-4 disabled:bg-slate-100 disabled:text-slate-400">
                    <option>Operador</option><option>Supervisor</option><option>Auditoria</option><option>Administrador</option>
                  </select>
                </div>
                <div className="flex items-end"><Button onClick={gravarPermissao} disabled={!pode.admin} className="w-full text-white" style={{ backgroundColor: COR_BIM }}>Gravar Permissão</Button></div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl p-4 text-sm text-white" style={{ backgroundColor: perfilCor[perfilActivo] }}><b>{perfilActivo}:</b> {pode.descricao}</div>
            <div className="mt-4 grid gap-3 md:grid-cols-6">
              {[
                ["Checklist", pode.checklist], ["Upload", pode.upload], ["Incidentes", pode.incidentes], ["Validação", pode.validar], ["Eliminar", pode.eliminar], ["Admin", pode.admin]
              ].map(([nome, ok]) => <span key={nome} className={`rounded-full px-3 py-2 text-center text-xs font-bold ${ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{nome}</span>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-2xl font-black">👤 Cadastro de Utilizadores</h2><p className="text-sm text-slate-500">Cadastrar novos operadores, supervisores, auditores ou administradores.</p></div>
              <span className="rounded-full bg-pink-100 px-3 py-2 text-xs font-bold" style={{ color: COR_BIM }}>Admin Only</span>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              <input value={novoUtilizador.nome} onChange={(e) => setNovoUtilizador({ ...novoUtilizador, nome: e.target.value })} disabled={!pode.admin} placeholder="Nome" className="h-12 rounded-2xl border px-4 disabled:bg-slate-100" />
              <input value={novoUtilizador.contacto} onChange={(e) => setNovoUtilizador({ ...novoUtilizador, contacto: e.target.value })} disabled={!pode.admin} placeholder="Contacto" className="h-12 rounded-2xl border px-4 disabled:bg-slate-100" />
              <input value={novoUtilizador.email} onChange={(e) => setNovoUtilizador({ ...novoUtilizador, email: e.target.value })} disabled={!pode.admin} placeholder="Email" className="h-12 rounded-2xl border px-4 disabled:bg-slate-100" />
              <select value={novoUtilizador.perfil} onChange={(e) => setNovoUtilizador({ ...novoUtilizador, perfil: e.target.value })} disabled={!pode.admin} className="h-12 rounded-2xl border px-4 disabled:bg-slate-100">
                <option>Operador</option><option>Supervisor</option><option>Auditoria</option><option>Administrador</option>
              </select>
              <Button onClick={cadastrarUtilizador} disabled={!pode.admin} className="text-white" style={{ backgroundColor: COR_BIM }}>Cadastrar</Button>
            </div>
          </CardContent>
        </Card>

        <Card><CardContent><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h2 className="text-xl font-bold">Operadores do Turno</h2><p className="text-sm text-slate-500">Seleccione os operadores que estiveram a trabalhar neste turno.</p></div><div className="grid w-full gap-4 md:w-[720px] md:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold">Operador 1</label><select disabled={!pode.checklist} value={operador1} onChange={(e) => setOperador1(e.target.value)} className="h-12 w-full rounded-2xl border bg-white px-4 disabled:bg-slate-100">{operadores.map((op) => <option key={op}>{op}</option>)}</select></div><div><label className="mb-2 block text-sm font-semibold">Operador 2</label><select disabled={!pode.checklist} value={operador2} onChange={(e) => setOperador2(e.target.value)} className="h-12 w-full rounded-2xl border bg-white px-4 disabled:bg-slate-100"><option value="">Sem segundo operador</option>{operadores.map((op) => <option key={op}>{op}</option>)}</select></div><div className="rounded-2xl bg-[#FCE4EC] p-3 text-sm font-semibold md:col-span-2" style={{ color: COR_BIM }}>Operadores no turno: {operadoresTurno || "—"}</div></div></div></CardContent></Card>

        <Card><CardContent><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h2 className="text-xl font-bold">Turno Operacional</h2><p className="text-sm text-slate-500">Seleccione o turno operacional que está a ser reportado.</p></div><div className="grid w-full gap-4 md:w-[720px] md:grid-cols-3">{turnos.map((t) => { const activo = turno === t.nome; return <button key={t.nome} onClick={() => mudarTurno(t.nome)} className={`rounded-2xl border p-4 text-left ${activo ? "text-white shadow-lg" : "bg-white"}`} style={{ backgroundColor: activo ? COR_BIM : "white", borderColor: activo ? COR_BIM : "#E2E8F0" }}><div className="flex items-center gap-3"><span className="text-2xl">{t.icon}</span><div><h3 className="font-bold">{t.nome}</h3><p className={`text-sm ${activo ? "text-pink-100" : "text-slate-500"}`}>{horariosTurno[t.nome]}</p></div></div></button>; })}</div></div></CardContent></Card>

        <div className="grid gap-5 md:grid-cols-4">
          <Card><CardContent><div className="mb-2 text-3xl">🕒</div><p className="text-sm text-slate-500">Turno Actual</p><h2 className="text-2xl font-bold">{turno}</h2><p className="text-sm text-slate-500">{horario}</p></CardContent></Card>
          <Card><CardContent><div className="mb-2 text-3xl">✅</div><p className="text-sm text-slate-500">Checklist</p><h2 className="text-2xl font-bold">{progresso}%</h2><p className="text-sm text-slate-500">{feitas}/{tarefas.length} concluídas</p></CardContent></Card>
          <Card><CardContent><div className="mb-2 text-3xl">⚠️</div><p className="text-sm text-slate-500">Pendências</p><h2 className="text-2xl font-bold">{pendentes.length}</h2><p className="text-sm text-slate-500">Necessitam justificação</p></CardContent></Card>
          <Card><CardContent><div className="mb-2 text-3xl">📊</div><p className="text-sm text-slate-500">Estado</p><h2 className="text-2xl font-bold">{estadoRelatorio}</h2><p className="text-sm text-slate-500">Supervisor: Idricio Langa</p></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2"><CardContent><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold">Checklist de Validação do Turno da {turno}</h2><p className="text-sm text-slate-500">Marque cada actividade da checklist específica do turno seleccionado.</p></div><span className={`rounded-full px-4 py-2 text-sm font-semibold ${progresso === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{progresso === 100 ? "Pronto para validar" : "Com pendências"}</span></div><div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Feito</th><th className="p-4">Categoria</th><th className="p-4">Actividade</th><th className="p-4">Horário</th><th className="p-4">Observação</th></tr></thead><tbody>{tarefas.map((item) => <tr key={item.id} className="border-t"><td className="p-4"><input type="checkbox" checked={item.feito} disabled={!pode.checklist} onChange={() => toggleTarefa(item.id)} className="h-5 w-5" style={{ accentColor: COR_BIM }} /></td><td className="p-4 font-medium">{item.categoria}</td><td className="p-4">{item.tarefa}</td><td className="p-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{item.horario}</span></td><td className="p-4"><input value={item.observacao} disabled={!pode.checklist} onChange={(e) => actualizarObservacao(item.id, e.target.value)} className="w-full rounded-xl border px-3 py-2 disabled:bg-slate-100" placeholder="OK / pendente" /></td></tr>)}</tbody></table></div></CardContent></Card>

          <Card><CardContent className="space-y-5"><div className="border-b pb-4"><p className="text-xs font-semibold uppercase text-slate-500">Departamento de Sistemas • Exploração</p><h2 className="text-2xl font-bold">Relatório do Turno da {turno}</h2></div><div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><div className="col-span-2 flex justify-between"><span>Operadores</span><b>{operadoresTurno}</b></div><div className="flex justify-between"><span>Turno</span><b>{turno}</b></div><div className="flex justify-between"><span>Estado</span><b>{estadoRelatorio}</b></div><div className="flex justify-between"><span>Supervisor</span><b>Idricio Langa</b></div><div className="flex justify-between"><span>Checklist</span><b>{progresso}%</b></div></div><textarea disabled={!pode.checklist} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações do turno" className="h-24 w-full rounded-2xl border p-3 disabled:bg-slate-100" /><textarea disabled={!pode.checklist} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Justificação de pendências" className="h-20 w-full rounded-2xl border p-3 disabled:bg-slate-100" /><div className="rounded-3xl border-2 border-dashed p-5" style={{ backgroundColor: COR_CLARO, borderColor: COR_BIM_2 }}><h3 className="text-lg font-bold">📤 Upload do Relatório</h3><label className="mt-3 flex cursor-pointer flex-col items-center rounded-2xl border bg-white p-5 text-center"><span className="text-3xl">📎</span><b>Clique aqui para carregar</b><input type="file" multiple disabled={!pode.upload} onChange={carregarAnexos} className="hidden" /></label>{ficheiros.map((f) => <div key={f.nome} className="mt-2 flex justify-between rounded-xl bg-white p-2"><span>📎 {f.nome}</span><button disabled={!pode.upload} onClick={() => removerAnexo(f.nome)} className="text-red-600 disabled:text-slate-400">Remover</button></div>)}</div><div className="rounded-2xl border bg-slate-50 p-4 text-sm"><div className="flex justify-between"><span>Actividades executadas</span><b>{feitas}</b></div><div className="flex justify-between"><span>Pendências</span><b>{pendentes.length}</b></div><div className="flex justify-between"><span>Incidentes</span><b>{incidentes.length}</b></div><div className="flex justify-between"><span>Anexos</span><b>{anexos.length}</b></div></div><div className="grid grid-cols-2 gap-3"><Button onClick={() => setMensagem(`${perfilActivo}: rascunho guardado.`)} disabled={!pode.upload} className="bg-white text-slate-900">Guardar</Button><Button onClick={submeterRelatorio} disabled={!pode.upload} className="text-white" style={{ backgroundColor: COR_BIM }}>Submeter</Button></div><Button onClick={() => setRelatorioAberto(relatorioAtual)} className="w-full text-white" style={{ backgroundColor: COR_BIM }}>👁️ Ver Relatório Final</Button></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardContent><div className="mb-5 flex items-center justify-between"><div><h2 className="text-2xl font-black">🚨 Incidentes Registados no Turno</h2><p className="text-sm text-slate-500">Eventos operacionais e escalamentos realizados durante o turno.</p></div><Button disabled={!pode.incidentes} onClick={abrirNovoIncidente} className="bg-red-600 text-white">Novo Incidente</Button></div><div className="space-y-4">{incidentes.map((inc) => <div key={inc.id} className="rounded-2xl border bg-slate-50 p-4"><div className="flex justify-between gap-4"><div><div className="flex gap-2"><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">{inc.id}</span><span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold">{inc.canal}</span></div><h3 className="mt-3 font-bold">{inc.descricao}</h3><p className="mt-1 text-sm text-slate-500">Janela de impacto: {inc.hora}</p></div><div className="flex flex-col items-end gap-2"><span className="h-fit rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">{inc.estado}</span><div className="flex gap-2"><button disabled={!pode.editarIncidente} onClick={() => editarIncidente(inc)} className="rounded-xl border bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:text-slate-400">Editar</button><button disabled={!pode.eliminar} onClick={() => setIncidenteEliminar(inc)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:bg-slate-300">Eliminar</button></div></div></div></div>)}</div></CardContent></Card>

          <Card><CardContent><h2 className="text-2xl font-black">👨‍💼 Validação do Supervisor</h2><p className="text-sm text-slate-500">Aprovação electrónica do relatório de turno.</p><div className="mt-5 rounded-2xl border bg-slate-50 p-4"><p className="text-sm text-slate-500">Supervisor Responsável</p><h3 className="text-lg font-bold">Idricio Langa</h3><div className="mt-3 rounded-xl bg-white p-3 text-sm border"><b>Perfil activo:</b> {perfilActivo}<br/><b>Nível:</b> {perfilActivo === "Administrador" ? "Acesso Total" : perfilActivo === "Supervisor" ? "Validação e Supervisão" : perfilActivo === "Auditoria" ? "Somente Leitura" : "Operacional"}</div></div><textarea disabled={!pode.validar} value={comentarioSupervisor} onChange={(e) => setComentarioSupervisor(e.target.value)} placeholder="Comentário do supervisor" className="mt-4 h-32 w-full rounded-2xl border p-3 disabled:bg-slate-100" /><div className="mt-4 grid grid-cols-2 gap-3"><Button onClick={validarRelatorio} disabled={!pode.validar} className="bg-emerald-500 text-white">✓ Validar</Button><Button onClick={rejeitarRelatorio} disabled={!pode.validar} className="bg-red-500 text-white">✕ Rejeitar</Button></div></CardContent></Card>
        </div>

        <Card><CardContent><div className="mb-5 flex items-center justify-between"><div><h2 className="text-2xl font-black">📚 Histórico de Relatórios</h2><p className="text-sm text-slate-500">Clique em Ver para abrir o relatório detalhado.</p></div><input value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Pesquisar..." className="h-11 rounded-2xl border px-4" /></div><div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Relatório</th><th className="p-4">Data</th><th className="p-4">Operador</th><th className="p-4">Turno</th><th className="p-4">Progresso</th><th className="p-4">Estado</th><th className="p-4">Acções</th></tr></thead><tbody>{relatoriosFiltrados.map((r) => <tr key={r.id} className="border-t"><td className="p-4 font-semibold">{r.id}</td><td className="p-4">{r.data}</td><td className="p-4">👤 {r.operadoresTurno}</td><td className="p-4">{r.turno}<br /><span className="text-xs text-slate-500">{r.hora}</span></td><td className="p-4"><div className="h-2 w-28 rounded-full bg-slate-200"><div className="h-2 rounded-full" style={{ width: `${r.progresso}%`, backgroundColor: COR_BIM }} /></div>{r.progresso}%</td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoClasse(r.estado)}`}>{r.estado}</span></td><td className="p-4"><Button onClick={() => setRelatorioAberto(r)} className="bg-white text-slate-900">📄 Ver</Button></td></tr>)}</tbody></table></div></CardContent></Card>
      </div>

      {incidenteEliminar && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-2xl font-bold">Eliminar Incidente</h2><p className="mt-3 text-sm text-slate-600">Tem certeza que pretende eliminar o incidente <b>{incidenteEliminar.id}</b>?</p><div className="mt-6 flex justify-end gap-3"><Button onClick={() => setIncidenteEliminar(null)} className="bg-white text-slate-900">Cancelar</Button><Button disabled={!pode.eliminar} onClick={confirmarEliminarIncidente} className="bg-red-600 text-white">Eliminar</Button></div></div></div>}

      {modalIncidente && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-2xl font-bold">{incidenteEditarId ? "Actualizar Incidente" : "Novo Incidente"}</h2><p className="text-sm text-slate-500">Registo operacional de incidente do turno.</p></div><button onClick={() => setModalIncidente(false)} className="rounded-xl border px-3 py-2">✕</button></div><div className="grid gap-4 md:grid-cols-2"><input value={formIncidente.referencia} onChange={(e) => setFormIncidente({ ...formIncidente, referencia: e.target.value })} placeholder="Referência INC/WO" className="h-12 rounded-2xl border px-4" /><select value={formIncidente.canal} onChange={(e) => setFormIncidente({ ...formIncidente, canal: e.target.value })} className="h-12 rounded-2xl border px-4"><option>ATM/POS</option><option>Batch</option><option>PCOMB</option><option>Cartões</option><option>SIMO</option><option>Mobile</option></select><input value={formIncidente.hora} onChange={(e) => setFormIncidente({ ...formIncidente, hora: e.target.value })} placeholder="14h40 - 17h00" className="h-12 rounded-2xl border px-4" /><select value={formIncidente.estado} onChange={(e) => setFormIncidente({ ...formIncidente, estado: e.target.value })} className="h-12 rounded-2xl border px-4"><option>Em acompanhamento</option><option>Escalado à SIMO</option><option>Resolvido</option><option>Pendente</option></select></div><textarea value={formIncidente.descricao} onChange={(e) => setFormIncidente({ ...formIncidente, descricao: e.target.value })} placeholder="Descrição do incidente" className="mt-4 h-32 w-full rounded-2xl border p-4" /><div className="mt-6 flex justify-end gap-3"><Button onClick={() => setModalIncidente(false)} className="bg-white text-slate-900">Cancelar</Button><Button onClick={gravarIncidente} className="text-white" style={{ backgroundColor: COR_BIM }}>{incidenteEditarId ? "Actualizar Incidente" : "Registar Incidente"}</Button></div></div></div>}

      {relatorioAberto && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"><div className="my-6 w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-6 flex justify-between border-b pb-4"><div><p className="text-sm font-bold uppercase text-slate-500">Departamento de Sistemas • Exploração</p><h2 className="text-3xl font-bold">Relatório Operacional do Turno</h2><p className="text-slate-500">{relatorioAberto.id}</p></div><Button onClick={() => setRelatorioAberto(null)} className="bg-white text-slate-900">Fechar</Button></div><div className="grid gap-4 md:grid-cols-4"><div className="rounded-2xl bg-slate-50 p-4 md:col-span-2"><p className="text-xs text-slate-500">Operadores</p><b>{relatorioAberto.operadoresTurno || "—"}</b></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Turno</p><b>{relatorioAberto.turno || "—"}</b></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Estado</p><b>{relatorioAberto.estado || "—"}</b></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Supervisor</p><b>{relatorioAberto.supervisor || "Idricio Langa"}</b></div></div><div className="mt-6 rounded-2xl border bg-[#FCE4EC] p-4"><h3 className="font-bold">Resumo Executivo</h3><p className="mt-2 text-sm">Checklist: {relatorioAberto.progresso || 0}% | Estado: {relatorioAberto.estado || "—"}</p></div></div></div>}
    </div>
  );
}
