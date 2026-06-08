import React, { useMemo, useState } from "react";

const COR_BIM = "#A10D4F";
const COR_BIM_ESCURO = "#6D0035";
const COR_CLARO = "#FCE4EC";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled = false, className = "" }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`rounded-2xl px-4 py-3 font-bold transition ${disabled ? "cursor-not-allowed opacity-40" : "hover:opacity-90"} ${className}`}
    >
      {children}
    </button>
  );
}

function TextoFormatado({ texto, className = "" }) {
  const partes = String(texto || "").split(/(\*\*[^*]+\*\*)/g);
  return (
    <div className={`whitespace-pre-line leading-7 ${className}`}>
      {partes.map((parte, index) => {
        if (parte.startsWith("**") && parte.endsWith("**")) {
          return (
            <mark key={index} className="rounded bg-yellow-100 px-1 font-black text-slate-900">
              {parte.slice(2, -2)}
            </mark>
          );
        }
        return <React.Fragment key={index}>{parte}</React.Fragment>;
      })}
    </div>
  );
}

const horariosTurno = {
  Manhã: "07:00 - 15:00",
  Tarde: "15:00 - 23:00",
  Noite: "23:00 - 07:00",
};

const turnos = ["Manhã", "Tarde", "Noite"];
const processosNoite = ["Geral", "Fecho IDW", "PCOMB", "Fecho ITM", "SIMO"];
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

const procedimentosPorTurno = {
  Manhã: [
    { hora: "07:00", descricao: "Receber passagem do turno da noite." },
    { hora: "07:15", descricao: "Validar canais ATM/POS, monitorização e alertas." },
    { hora: "08:00", descricao: "Executar validações de fechos, ficheiros e relatórios da manhã." },
    { hora: "14:30", descricao: "Preparar passagem para o turno da tarde." },
  ],
  Tarde: [
    { hora: "15:00", descricao: "Receber passagem do turno da manhã." },
    { hora: "17:50", descricao: "Executar SBMJOB CMD(CALL PGM(EODTIMPG01)) JOB(EODTIM)." },
    { hora: "18:00", descricao: "Executar ITM Settlement e balancear ficheiros com F11." },
    { hora: "20:15", descricao: "Executar ITM Repost." },
    { hora: "22:30", descricao: "Preparar passagem para o turno da noite." },
  ],
  Noite: [
    { hora: "23:00", descricao: "Receber passagem do turno da tarde e validar pendências." },
    { hora: "06:30", descricao: "Preparar relatório final e entregar passagem ao turno da manhã." },
  ],
};

const procedimentosNoitePorProcesso = {
  Geral: procedimentosPorTurno.Noite,
  "Fecho IDW": [
    { hora: "23:15", descricao: "**Fecho IDW**\nValidar relatórios e processos IDW disponíveis para acompanhamento nocturno." },
    { hora: "23:30", descricao: "Confirmar execução/estado do fecho IDW e registar pendências." },
    { hora: "00:00", descricao: "Validar relatórios PGL/IDW e evidenciar no relatório de turno." },
  ],
  PCOMB: [
    { hora: "00:30", descricao: "**PCOMB**\nMonitorar arranque do PCOMB e confirmar jobs esperados." },
    { hora: "01:00", descricao: "Acompanhar evolução do PCOMB, MSGW, locks ou falhas." },
    { hora: "02:30", descricao: "Confirmar conclusão/estado do PCOMB e registar evidência." },
  ],
  "Fecho ITM": [
    { hora: "23:45", descricao: "**Fecho ITM**\nValidar execução do fecho ITM e processos dependentes." },
    { hora: "01:30", descricao: "Confirmar ITM Repost/After Repost e integração posterior." },
  ],
  SIMO: [
    { hora: "01:00", descricao: "**SIMO**\nAcompanhar transacções SIMO após integração/repost." },
    { hora: "03:00", descricao: "Registar timeouts, anomalias ou pendências SIMO." },
  ],
};

const checklistPorTurno = {
  Manhã: [
    ["Sala de Máquinas", "Registar temperatura e humidade da SEDE AS400", "Início/Fim"],
    ["Fechos / BD", "Validar Ark_GL comparando com a Query", "Até 08:00"],
    ["Batch / PCOMB", "Validar PCOMB PRD", "Até 08:00"],
    ["Passagem de Turno", "Entregar relatório ao turno da tarde", "14:30 - 15:00"],
  ],
  Tarde: [
    ["Sala de Máquinas", "Registar temperatura e humidade da SEDE AS400", "Inicial / Final"],
    ["FINANCA", "Validar FINANCA", "19:00"],
    ["PCOMB", "Executar PCOMB DSV", "21:00"],
    ["Passagem de Turno", "Entregar relatório ao turno da noite", "22:30 - 23:00"],
  ],
  Noite: [
    ["Sala de Máquinas", "Registar temperatura e humidade da SEDE AS400", "Inicial / Final"],
    ["ATM / POS", "Validar se as transacções ATM e POS estão a ser aprovadas", "Noite"],
    ["Batch", "Acompanhar processamento nocturno", "Madrugada"],
    ["Passagem de Turno", "Entregar relatório ao turno da manhã", "06:30 - 07:00"],
  ],
};

const permissoes = {
  Operador: { checklist: true, incidentes: true, configurar: false, validar: false, admin: false },
  Supervisor: { checklist: true, incidentes: true, configurar: true, validar: true, admin: false },
  Auditoria: { checklist: false, incidentes: false, configurar: false, validar: false, admin: false },
  Administrador: { checklist: true, incidentes: true, configurar: true, validar: true, admin: true },
};

function criarChecklist(turno) {
  return (checklistPorTurno[turno] || []).map(([categoria, tarefa, horario], index) => ({
    id: `${turno}-${index}`,
    categoria,
    tarefa,
    horario,
    feito: false,
    observacao: "",
  }));
}

function formatarTamanho(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export default function PrototipoRelatoriosGestaoTurnos() {
  const [operadores] = useState(operadoresBase);
  const [extraUsers, setExtraUsers] = useState(["Idricio Langa", "Auditoria Interna"]);
  const utilizadores = useMemo(() => [...operadores, ...extraUsers], [operadores, extraUsers]);
  const [perfis, setPerfis] = useState(() => {
    const base = {};
    operadoresBase.forEach((nome) => (base[nome] = "Operador"));
    base["Alexandre Macamo"] = "Administrador";
    base["Idricio Langa"] = "Supervisor";
    base["Auditoria Interna"] = "Auditoria";
    return base;
  });

  const [utilizadorLogado, setUtilizadorLogado] = useState("Alexandre Macamo");
  const [perfilActivo, setPerfilActivo] = useState("Administrador");
  const [paginaActiva, setPaginaActiva] = useState("Dashboard");
  const [turno, setTurno] = useState("Manhã");
  const [processoNoite, setProcessoNoite] = useState("Geral");
  const [operador1, setOperador1] = useState("Elton Nobre");
  const [operador2, setOperador2] = useState("Edmilson Nhacundela");
  const [checklist, setChecklist] = useState(criarChecklist("Manhã"));
  const [procedimentosFeitos, setProcedimentosFeitos] = useState({});
  const [mensagem, setMensagem] = useState("Modo preview: visual igual ao sistema final. Em produção, estes dados vêm da API C# + SQL Server.");
  const [apiStatus, setApiStatus] = useState("API C# ligada");
  const [observacoes, setObservacoes] = useState("");
  const [estadoRelatorio, setEstadoRelatorio] = useState("Rascunho");
  const [ficheirosRelatorio, setFicheirosRelatorio] = useState([]);
  const [novaChecklist, setNovaChecklist] = useState({ categoria: "", tarefa: "", horario: "" });
  const [novoProcedimento, setNovoProcedimento] = useState({ hora: "", descricao: "" });
  const [procedimentosCustom, setProcedimentosCustom] = useState({ Manhã: [], Tarde: [], Noite: [] });
  const [incidentes, setIncidentes] = useState([
    { id: "INC000066476", canal: "ATM/POS", descricao: "Elevado número de timeouts", estado: "Escalado" },
  ]);
  const [acessosDataCenter, setAcessosDataCenter] = useState([
    {
      id: "DC-001",
      visitante: "Técnico Fornecedor",
      empresa: "Fornecedor Externo",
      motivo: "Manutenção preventiva",
      autorizadoPor: "Idricio Langa",
      acompanhadoPor: "Alexandre Macamo",
      emailAutorizacao: "email_autorizacao.pdf",
      entrada: "09:30",
      saida: "",
      estado: "Dentro do Data Center",
    },
  ]);
  const [novoAcessoDC, setNovoAcessoDC] = useState({
    visitante: "",
    empresa: "",
    motivo: "",
    autorizadoPor: "",
    acompanhadoPor: "",
    emailAutorizacao: "",
    entrada: "",
    saida: "",
  });
  const [logs, setLogs] = useState([
    {
      id: "LOG-001",
      dataHora: "09:30",
      utilizador: "Alexandre Macamo",
      perfil: "Administrador",
      accao: "Registo Data Center",
      detalhe: "Acesso DC-001 registado com email de autorização.",
    },
  ]);

  const pode = permissoes[perfilActivo] || permissoes.Operador;
  const procedimentosBase = turno === "Noite" ? procedimentosNoitePorProcesso[processoNoite] || procedimentosNoitePorProcesso.Geral : procedimentosPorTurno[turno] || [];
  const procedimentos = [...procedimentosBase, ...(procedimentosCustom[turno] || [])];
  const progressoChecklist = Math.round((checklist.filter((x) => x.feito).length / Math.max(checklist.length, 1)) * 100);
  const progressoProcedimentos = Math.round((procedimentos.filter((_, index) => procedimentosFeitos[`${turno}-${processoNoite}-${index}`]).length / Math.max(procedimentos.length, 1)) * 100);

  function criarLog(accao, detalhe) {
    const novoLog = {
      id: `LOG-${String(logs.length + 1).padStart(3, "0")}`,
      dataHora: new Date().toLocaleString("pt-PT"),
      utilizador: utilizadorLogado,
      perfil: perfilActivo,
      accao,
      detalhe,
    };
    setLogs((prev) => [novoLog, ...prev]);
  }

  function entrarComo(nome) {
    const perfil = perfis[nome] || "Operador";
    setUtilizadorLogado(nome);
    setPerfilActivo(perfil);
    setMensagem(`${nome} entrou como ${perfil}.`);
    criarLog("Login", `${nome} entrou no sistema como ${perfil}.`);
  }

  function mudarTurno(novoTurno) {
    if (!pode.checklist) return setMensagem(`${perfilActivo}: sem permissão para alterar turno.`);
    setTurno(novoTurno);
    setChecklist(criarChecklist(novoTurno));
    setProcessoNoite("Geral");
    setMensagem(`Turno ${novoTurno} carregado.`);
    criarLog("Mudança de turno", `Turno alterado para ${novoTurno}.`);
  }

  function toggleChecklist(id) {
    if (!pode.checklist) return;
    const itemChecklist = checklist.find((x) => x.id === id);
    const novoEstado = !(itemChecklist && itemChecklist.feito);
    setChecklist((prev) => prev.map((item) => item.id === id ? { ...item, feito: !item.feito, observacao: !item.feito ? "OK" : "" } : item));
    if (itemChecklist) {
      criarLog(
        novoEstado ? "Checklist concluída" : "Checklist desmarcada",
        `${itemChecklist.categoria} - ${itemChecklist.tarefa} (${turno}) por ${utilizadorLogado}.`
      );
    }
  }

  function toggleProcedimento(index) {
    if (!pode.checklist) return;
    const chave = `${turno}-${processoNoite}-${index}`;
    const procedimento = procedimentos[index];
    const novoEstado = !procedimentosFeitos[chave];
    setProcedimentosFeitos((prev) => ({ ...prev, [chave]: !prev[chave] }));
    if (procedimento) {
      criarLog(
        novoEstado ? "Procedimento executado" : "Procedimento revertido",
        `${procedimento.hora} - ${procedimento.descricao.replace(/\*\*/g, "")} (${turno}/${processoNoite}).`
      );
    }
  }

  function adicionarProcedimento() {
    if (!pode.configurar) return setMensagem(`${perfilActivo}: sem permissão para adicionar procedimento.`);
    if (!novoProcedimento.hora.trim() || !novoProcedimento.descricao.trim()) return setMensagem("Preencha hora e descrição.");
    setProcedimentosCustom((prev) => ({
      ...prev,
      [turno]: [...(prev[turno] || []), { hora: novoProcedimento.hora, descricao: novoProcedimento.descricao }],
    }));
    setNovoProcedimento({ hora: "", descricao: "" });
    setMensagem("Procedimento adicionado.");
    criarLog("Novo procedimento", `Procedimento ${novoProcedimento.hora} adicionado ao turno ${turno}.`);
  }

  function adicionarChecklist() {
    if (!pode.configurar) return setMensagem(`${perfilActivo}: sem permissão para adicionar checklist.`);
    if (!novaChecklist.categoria.trim() || !novaChecklist.tarefa.trim() || !novaChecklist.horario.trim()) return setMensagem("Preencha categoria, actividade e horário da checklist.");
    setChecklist((prev) => [
      ...prev,
      {
        id: `custom-${turno}-${Date.now()}`,
        categoria: novaChecklist.categoria,
        tarefa: novaChecklist.tarefa,
        horario: novaChecklist.horario,
        feito: false,
        observacao: "",
      },
    ]);
    setNovaChecklist({ categoria: "", tarefa: "", horario: "" });
    setApiStatus("POST /api/checklist OK");
    setMensagem(`Preview produção: nova checklist gravada no SQL Server para o turno ${turno}.`);
    criarLog("Nova checklist", `Checklist adicionada: ${novaChecklist.categoria} - ${novaChecklist.tarefa}.`);
  }

  function submeterRelatorio() {
    if (!pode.checklist) return setMensagem(`${perfilActivo}: sem permissão para submeter relatório.`);
    setEstadoRelatorio("Submetido");
    setApiStatus("POST /api/relatorios/submeter OK");
    setMensagem("Preview produção: relatório submetido e gravado no SQL Server via API C#.");
    criarLog("Submissão de relatório", `Relatório do turno ${turno} submetido com ${ficheirosRelatorio.length} evidência(s).`);
  }

  function validarRelatorio() {
    if (!pode.validar) return setMensagem(`${perfilActivo}: sem permissão para validar relatório.`);
    setEstadoRelatorio("Validado");
    setMensagem("Relatório validado pelo supervisor.");
    criarLog("Validação de relatório", `Relatório do turno ${turno} validado por ${utilizadorLogado}.`);
  }

  function carregarFicheiros(e) {
    if (!pode.checklist) return setMensagem(`${perfilActivo}: sem permissão para anexar evidências.`);
    const lista = Array.from(e.target.files || []);
    if (lista.length === 0) return;
    const novos = lista.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      nome: file.name,
      tamanho: file.size,
      tipo: file.type || "Ficheiro",
    }));
    setFicheirosRelatorio((prev) => [...prev, ...novos]);
    setApiStatus("POST /api/upload OK");
    setMensagem(`${novos.length} evidência(s) anexada(s) ao relatório.`);
    criarLog("Upload evidência", `${novos.length} ficheiro(s) anexado(s) ao relatório do turno ${turno}.`);
    e.target.value = "";
  }

  function removerFicheiro(id) {
    setFicheirosRelatorio((prev) => prev.filter((f) => f.id !== id));
    setMensagem("Evidência removida da lista de anexos.");
    criarLog("Remoção de evidência", `Foi removida uma evidência do relatório do turno ${turno}.`);
  }

  function carregarEmailAutorizacaoDC(e) {
    const ficheiro = e.target.files && e.target.files[0];
    if (!ficheiro) return;
    setNovoAcessoDC((prev) => ({ ...prev, emailAutorizacao: ficheiro.name }));
    setMensagem(`Email de autorização anexado: ${ficheiro.name}`);
    criarLog("Upload email autorização", `Email de autorização anexado ao pedido de acesso ao Data Center: ${ficheiro.name}`);
    e.target.value = "";
  }

  function cadastrarUtilizador() {
    const nome = prompt("Nome do novo utilizador:");
    if (!nome) return;
    const perfil = prompt("Perfil: Operador, Supervisor, Auditoria ou Administrador", "Operador") || "Operador";
    setExtraUsers((prev) => [...prev, nome]);
    setPerfis((prev) => ({ ...prev, [nome]: perfil }));
    setMensagem(`${nome} cadastrado como ${perfil}.`);
    criarLog("Cadastro utilizador", `${nome} cadastrado como ${perfil}.`);
  }

  function adicionarIncidente() {
    if (!pode.incidentes) return;
    const id = prompt("Referência do incidente/WO:", "INC000000000");
    if (!id) return;
    const descricao = prompt("Descrição do incidente:", "Descrever ocorrência") || "Sem descrição";
    setIncidentes((prev) => [{ id, canal: "Operacional", descricao, estado: "Em acompanhamento" }, ...prev]);
    setApiStatus("POST /api/incidentes OK");
    setMensagem("Preview produção: incidente gravado no SQL Server via API C#.");
    criarLog("Registo de incidente", `Incidente ${id} registado: ${descricao}.`);
  }

  function registarEntradaDataCenter() {
    if (!pode.checklist) return setMensagem(`${perfilActivo}: sem permissão para registar acesso ao Data Center.`);
    if (!novoAcessoDC.visitante.trim() || !novoAcessoDC.motivo.trim() || !novoAcessoDC.autorizadoPor.trim() || !novoAcessoDC.acompanhadoPor.trim()) {
      return setMensagem("Preencha visitante, motivo, autorizado por e acompanhado por.");
    }
    const registo = {
      id: `DC-${String(acessosDataCenter.length + 1).padStart(3, "0")}`,
      visitante: novoAcessoDC.visitante,
      empresa: novoAcessoDC.empresa || "N/A",
      motivo: novoAcessoDC.motivo,
      autorizadoPor: novoAcessoDC.autorizadoPor,
      acompanhadoPor: novoAcessoDC.acompanhadoPor,
      emailAutorizacao: novoAcessoDC.emailAutorizacao || "Sem email anexado",
      entrada: novoAcessoDC.entrada || new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      saida: novoAcessoDC.saida,
      estado: novoAcessoDC.saida ? "Concluído" : "Dentro do Data Center",
    };
    setAcessosDataCenter((prev) => [registo, ...prev]);
    setNovoAcessoDC({ visitante: "", empresa: "", motivo: "", autorizadoPor: "", acompanhadoPor: "", emailAutorizacao: "", entrada: "", saida: "" });
    setApiStatus("POST /api/datacenter/acessos OK");
    setMensagem("Acesso ao Data Center registado com sucesso.");
    criarLog("Registo Data Center", `Acesso ${registo.id} registado para ${registo.visitante}. Autorizado por ${registo.autorizadoPor}. Email: ${registo.emailAutorizacao}.`);
  }

  function registarSaidaDataCenter(id) {
    const horaSaida = new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    setAcessosDataCenter((prev) => prev.map((item) => item.id === id ? { ...item, saida: horaSaida, estado: "Concluído" } : item));
    setMensagem("Saída do Data Center registada.");
    criarLog("Saída Data Center", `Foi registada a saída do acesso ${id}.`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-pink-50 to-slate-200 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-[36px] p-8 text-white shadow-2xl" style={{ background: `linear-gradient(135deg,${COR_BIM_ESCURO},${COR_BIM},#D81B60,#7B1FA2)` }}>
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-100">Departamento de Sistemas • Exploração</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Gestão de Turnos Operacionais</h1>
              <p className="mt-3 max-w-3xl text-pink-100">Turnos, procedimentos, checklists, incidentes, evidências, Data Center e validação do supervisor.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold">Frontend React</span>
                <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold">API C# ASP.NET Core</span>
                <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold">SQL Server</span>
              </div>
            </div>
            <div className="rounded-3xl bg-white/15 p-5 text-right">
              <p className="text-sm text-pink-100">Estado Produção</p>
              <h2 className="text-2xl font-black">{apiStatus}</h2>
              <p className="text-sm text-pink-100">Dados gravados no SQL Server</p>
            </div>
          </div>
        </header>

        {mensagem && (
          <div className="rounded-2xl border border-pink-300 bg-pink-50 p-4 text-sm font-bold shadow" style={{ color: COR_BIM }}>
            {mensagem}
          </div>
        )}

        <nav className="mb-2 flex flex-wrap gap-3">
          {["Dashboard", "Data Center", "Histórico", "Auditoria", "Relatórios", "Administração"].map((pagina) => (
            <button
              key={pagina}
              type="button"
              onClick={() => setPaginaActiva(pagina)}
              className={`rounded-full px-4 py-2 text-sm font-bold shadow ${paginaActiva === pagina ? "bg-pink-700 text-white" : "bg-white text-slate-700"}`}
            >
              {pagina}
            </button>
          ))}
        </nav>

        {paginaActiva === "Dashboard" && (
          <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">🔌 Dashboard Operacional</h2>
                <p className="text-sm text-slate-500">Em produção os botões chamam a API C# e gravam tudo no SQL Server.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-white p-4 shadow"><p className="text-xs text-slate-500">ATMs Monitoradas</p><h3 className="text-3xl font-black text-emerald-700">124</h3></div>
                <div className="rounded-2xl bg-white p-4 shadow"><p className="text-xs text-slate-500">Time-outs</p><h3 className="text-3xl font-black text-red-600">12</h3></div>
                <div className="rounded-2xl bg-white p-4 shadow"><p className="text-xs text-slate-500">Incidentes</p><h3 className="text-3xl font-black text-amber-600">{incidentes.length}</h3></div>
                <div className="rounded-2xl bg-white p-4 shadow"><p className="text-xs text-slate-500">Estado API</p><h3 className="text-sm font-black text-blue-700">ONLINE</h3></div>
              </div>
            </div>
          </Card>
        )}

        {paginaActiva === "Data Center" && (
          <Card className="border-slate-300 bg-gradient-to-r from-slate-50 to-white">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">🏢 Gestão de Acesso ao Data Center</h2>
                <p className="text-sm text-slate-500">Registo de entrada, autorização, upload do email, acompanhamento, motivo e saída.</p>
              </div>
              <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">Controlo DC</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-xl font-black">➕ Novo Acesso</h3>
                <input value={novoAcessoDC.visitante} onChange={(e) => setNovoAcessoDC({ ...novoAcessoDC, visitante: e.target.value })} placeholder="Nome da pessoa / visitante" className="mb-3 h-12 w-full rounded-2xl border px-4" />
                <input value={novoAcessoDC.empresa} onChange={(e) => setNovoAcessoDC({ ...novoAcessoDC, empresa: e.target.value })} placeholder="Empresa / Área" className="mb-3 h-12 w-full rounded-2xl border px-4" />
                <textarea value={novoAcessoDC.motivo} onChange={(e) => setNovoAcessoDC({ ...novoAcessoDC, motivo: e.target.value })} placeholder="Motivo do acesso" className="mb-3 h-24 w-full rounded-2xl border p-4" />
                <input value={novoAcessoDC.autorizadoPor} onChange={(e) => setNovoAcessoDC({ ...novoAcessoDC, autorizadoPor: e.target.value })} placeholder="Autorizado por" className="mb-3 h-12 w-full rounded-2xl border px-4" />

                <div className="mb-3 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-4">
                  <p className="mb-2 text-sm font-bold text-blue-800">📧 Upload do email de autorização</p>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-white p-4 text-center shadow-sm hover:bg-blue-50">
                    <span className="text-2xl">📤</span>
                    <b className="text-sm">Carregar email de autorização</b>
                    <span className="text-xs text-slate-500">PDF, MSG, EML, imagem ou print do email</span>
                    <input type="file" onChange={carregarEmailAutorizacaoDC} className="hidden" accept=".pdf,.msg,.eml,.png,.jpg,.jpeg,.doc,.docx" />
                  </label>
                  {novoAcessoDC.emailAutorizacao && <div className="mt-2 rounded-xl bg-white p-2 text-xs font-bold text-blue-700">✓ {novoAcessoDC.emailAutorizacao}</div>}
                </div>

                <input value={novoAcessoDC.acompanhadoPor} onChange={(e) => setNovoAcessoDC({ ...novoAcessoDC, acompanhadoPor: e.target.value })} placeholder="Acompanhado por" className="mb-3 h-12 w-full rounded-2xl border px-4" />
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={novoAcessoDC.entrada} onChange={(e) => setNovoAcessoDC({ ...novoAcessoDC, entrada: e.target.value })} placeholder="Hora entrada" className="h-12 rounded-2xl border px-4" />
                  <input value={novoAcessoDC.saida} onChange={(e) => setNovoAcessoDC({ ...novoAcessoDC, saida: e.target.value })} placeholder="Hora saída" className="h-12 rounded-2xl border px-4" />
                </div>
                <Button onClick={registarEntradaDataCenter} className="mt-4 w-full bg-slate-900 text-white">Registar Acesso</Button>
              </div>

              <div className="rounded-3xl border bg-white p-5 shadow-sm lg:col-span-2">
                <h3 className="mb-3 text-xl font-black">📋 Acessos Registados</h3>
                <div className="overflow-x-auto rounded-2xl border">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-3">Ref.</th>
                        <th className="p-3">Visitante</th>
                        <th className="p-3">Motivo</th>
                        <th className="p-3">Autorizado</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Acompanhado</th>
                        <th className="p-3">Entrada</th>
                        <th className="p-3">Saída</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Acção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acessosDataCenter.map((a) => (
                        <tr key={a.id} className="border-t">
                          <td className="p-3 font-bold">{a.id}</td>
                          <td className="p-3"><b>{a.visitante}</b><br /><span className="text-xs text-slate-500">{a.empresa}</span></td>
                          <td className="p-3">{a.motivo}</td>
                          <td className="p-3">{a.autorizadoPor}</td>
                          <td className="p-3"><span className="text-xs font-semibold text-blue-700">{a.emailAutorizacao || "Sem email"}</span></td>
                          <td className="p-3">{a.acompanhadoPor}</td>
                          <td className="p-3">{a.entrada}</td>
                          <td className="p-3">{a.saida || "—"}</td>
                          <td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${a.estado === "Concluído" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{a.estado}</span></td>
                          <td className="p-3">{!a.saida && <button type="button" onClick={() => registarSaidaDataCenter(a.id)} className="rounded-xl bg-pink-700 px-3 py-2 text-xs font-bold text-white">Registar Saída</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        )}

        {paginaActiva === "Histórico" && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-2xl font-black">📚 Histórico de Relatórios</h2>
            <p className="mt-1 text-sm text-slate-500">Pesquisa por data, turno, operador e estado.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <input className="rounded-2xl border px-4 py-3" placeholder="Data" />
              <select className="rounded-2xl border px-4 py-3"><option>Todos os turnos</option><option>Manhã</option><option>Tarde</option><option>Noite</option></select>
              <select className="rounded-2xl border px-4 py-3"><option>Todos estados</option><option>Rascunho</option><option>Submetido</option><option>Validado</option></select>
              <Button className="bg-blue-700 text-white" onClick={() => setMensagem("Preview: pesquisa GET /api/relatorios executada.")}>Pesquisar</Button>
            </div>
            <div className="mt-4 rounded-2xl border bg-white p-4 text-sm"><b>RT-2026-0509-001</b> • Noite • PCOMB • Submetido • Operadores: {operador1} / {operador2}</div>
          </Card>
        )}

        {paginaActiva === "Auditoria" && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-white">
            <h2 className="text-2xl font-black">🛡️ Auditoria / Logs</h2>
            <p className="mt-1 text-sm text-slate-500">Consulta de logs, alterações, uploads, checklists, validações, acessos ao Data Center e incidentes.</p>
            <div className="mt-4 overflow-x-auto rounded-2xl border bg-white">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr><th className="p-3">Data/Hora</th><th className="p-3">Utilizador</th><th className="p-3">Perfil</th><th className="p-3">Acção</th><th className="p-3">Detalhe</th></tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t">
                      <td className="p-3">{log.dataHora}</td>
                      <td className="p-3 font-bold">{log.utilizador}</td>
                      <td className="p-3">{log.perfil}</td>
                      <td className="p-3"><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">{log.accao}</span></td>
                      <td className="p-3">{log.detalhe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {paginaActiva === "Relatórios" && (
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
            <h2 className="text-2xl font-black">📄 Exportação de Relatórios</h2>
            <p className="mt-1 text-sm text-slate-500">Exportar PDF, Excel e imprimir relatório do turno.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button className="bg-pink-700 text-white" onClick={() => setMensagem("Preview: PDF gerado a partir do relatório do turno.")}>Exportar PDF</Button>
              <Button className="bg-emerald-700 text-white" onClick={() => setMensagem("Preview: Excel gerado a partir do relatório do turno.")}>Exportar Excel</Button>
              <Button className="bg-slate-800 text-white" onClick={() => setMensagem("Preview: impressão enviada.")}>Imprimir</Button>
            </div>
          </Card>
        )}

        {paginaActiva === "Administração" && pode.admin && (
          <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-white">
            <h2 className="text-2xl font-black">⚙️ Administração do Sistema</h2>
            <p className="mt-1 text-sm text-slate-500">Gestão de utilizadores, perfis, permissões, procedimentos e checklists base.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={cadastrarUtilizador} className="bg-pink-700 text-white">Cadastrar Utilizador</Button>
              <Button onClick={() => setMensagem("Preview: abrir gestão de perfis.")} className="bg-white text-slate-900">Gerir Perfis</Button>
              <Button onClick={() => setMensagem("Preview: abrir parâmetros do sistema.")} className="bg-white text-slate-900">Parâmetros</Button>
            </div>
          </Card>
        )}

        {paginaActiva === "Administração" && !pode.admin && (
          <Card className="border-amber-200 bg-amber-50">
            <h2 className="text-xl font-black">Acesso restrito</h2>
            <p className="text-sm text-slate-600">Apenas Administrador pode aceder à Administração.</p>
          </Card>
        )}

        <div className="grid gap-5 md:grid-cols-5">
          <Card className="bg-gradient-to-br from-[#A10D4F] to-[#6D0035] text-white"><p className="text-sm opacity-80">Utilizador</p><h3 className="mt-1 text-2xl font-black">{utilizadorLogado}</h3><p className="text-sm opacity-80">{perfilActivo}</p></Card>
          <Card className="bg-gradient-to-br from-white to-pink-50"><p className="text-sm font-semibold text-slate-500">Turno</p><h3 className="mt-1 text-3xl font-black" style={{ color: COR_BIM }}>{turno}</h3><p className="text-sm text-slate-500">{horariosTurno[turno]}</p></Card>
          <Card className="bg-gradient-to-br from-white to-pink-50"><p className="text-sm font-semibold text-slate-500">Processo Noite</p><h3 className="mt-1 text-2xl font-black" style={{ color: COR_BIM }}>{turno === "Noite" ? processoNoite : "N/A"}</h3><p className="text-sm text-slate-500">IDW • PCOMB • ITM • SIMO</p></Card>
          <Card className="bg-gradient-to-br from-white to-emerald-50"><p className="text-sm font-semibold text-slate-500">Checklist</p><h3 className="mt-1 text-3xl font-black text-emerald-700">{progressoChecklist}%</h3><p className="text-sm text-slate-500">Actividades concluídas</p></Card>
          <Card className="bg-gradient-to-br from-white to-blue-50"><p className="text-sm font-semibold text-slate-500">Procedimentos</p><h3 className="mt-1 text-3xl font-black text-blue-700">{progressoProcedimentos}%</h3><p className="text-sm text-slate-500">Execução do turno</p></Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-3 md:items-end">
            <div className="md:col-span-2"><h2 className="text-2xl font-black">👤 Identificação do Utilizador</h2><p className="text-sm text-slate-500">No sistema real será login com username e senha. O perfil vem da tabela Usuarios/Perfis.</p></div>
            <div><label className="mb-2 block text-sm font-semibold">Meu nome / Login simulado</label><select value={utilizadorLogado} onChange={(e) => entrarComo(e.target.value)} className="h-12 w-full rounded-2xl border bg-white px-4">{utilizadores.map((nome) => <option key={nome}>{nome}</option>)}</select></div>
          </div>
          <div className="mt-4 rounded-2xl p-4 text-sm font-bold text-white" style={{ backgroundColor: COR_BIM }}>Perfil activo: {perfilActivo}</div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-2xl font-black">👥 Operadores do Turno</h2>
            <p className="mb-4 text-sm text-slate-500">Seleccione os operadores que estiveram neste turno.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <select disabled={perfilActivo === "Auditoria"} value={operador1} onChange={(e) => setOperador1(e.target.value)} className="h-12 rounded-2xl border bg-white px-4 disabled:bg-slate-100">{operadores.map((nome) => <option key={nome}>{nome}</option>)}</select>
              <select disabled={perfilActivo === "Auditoria"} value={operador2} onChange={(e) => setOperador2(e.target.value)} className="h-12 rounded-2xl border bg-white px-4 disabled:bg-slate-100"><option value="">Sem segundo operador</option>{operadores.map((nome) => <option key={nome}>{nome}</option>)}</select>
            </div>
            <div className="mt-4 rounded-2xl p-3 text-sm font-semibold" style={{ color: COR_BIM, backgroundColor: COR_CLARO }}>Operadores: {[operador1, operador2].filter(Boolean).join(" / ")}</div>
          </Card>

          <Card>
            <h2 className="text-2xl font-black">🕒 Turno Operacional</h2>
            <p className="mb-4 text-sm text-slate-500">Ao seleccionar Noite, escolha também o processo principal.</p>
            <div className="grid gap-4 md:grid-cols-3">
              {turnos.map((nome) => {
                const activo = turno === nome;
                return <button key={nome} type="button" onClick={() => mudarTurno(nome)} className={`rounded-3xl border p-5 text-left transition ${activo ? "scale-[1.02] text-white shadow-xl" : "bg-white hover:bg-pink-50"}`} style={{ backgroundColor: activo ? COR_BIM : "white" }}><h3 className="font-bold">{nome}</h3><p className={`text-sm ${activo ? "text-pink-100" : "text-slate-500"}`}>{horariosTurno[nome]}</p></button>;
              })}
            </div>
            {turno === "Noite" && (
              <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-bold">Processo principal da noite</label>
                <select disabled={perfilActivo === "Auditoria"} value={processoNoite} onChange={(e) => { setProcessoNoite(e.target.value); setMensagem(`Processo da noite seleccionado: ${e.target.value}.`); }} className="h-12 w-full rounded-2xl border bg-white px-4 disabled:bg-slate-100">{processosNoite.map((nome) => <option key={nome}>{nome}</option>)}</select>
                <p className="mt-2 text-xs text-slate-500">Exemplo: Fecho IDW, PCOMB, ITM ou SIMO.</p>
              </div>
            )}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between"><div><h2 className="text-2xl font-black">📌 Procedimentos do Turno {turno}</h2><p className="text-sm text-slate-500">Marque cada procedimento à medida que for executado.</p></div><span className="rounded-full px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: COR_BIM }}>{progressoProcedimentos}%</span></div>
            <div className="space-y-3">
              {procedimentos.map((p, index) => {
                const chave = `${turno}-${processoNoite}-${index}`;
                const feito = Boolean(procedimentosFeitos[chave]);
                return (
                  <div key={chave} className={`flex gap-3 rounded-2xl border p-4 ${feito ? "border-emerald-200 bg-emerald-50" : "bg-slate-50"}`}>
                    <input type="checkbox" checked={feito} disabled={!pode.checklist} onChange={() => toggleProcedimento(index)} className="mt-1 h-5 w-5" style={{ accentColor: COR_BIM }} />
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: feito ? "#059669" : COR_BIM }}>{index + 1}</span>
                    <div className="flex-1"><span className="mb-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold" style={{ color: COR_BIM }}>⏰ {p.hora}</span><TextoFormatado texto={p.descricao} className={feito ? "font-semibold text-emerald-800 line-through" : "text-slate-700"} />{feito && <p className="mt-1 text-xs font-semibold text-emerald-700">✓ Procedimento executado</p>}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {pode.configurar ? (
            <Card>
              <h2 className="text-2xl font-black">➕ Adicionar Procedimento</h2>
              <p className="mb-3 text-sm text-slate-500">Use Enter para separar linhas e **texto** para destacar.</p>
              <input value={novoProcedimento.hora} onChange={(e) => setNovoProcedimento({ ...novoProcedimento, hora: e.target.value })} placeholder="Hora. Ex: 01:00" className="mb-3 h-12 w-full rounded-2xl border px-4" />
              <textarea value={novoProcedimento.descricao} onChange={(e) => setNovoProcedimento({ ...novoProcedimento, descricao: e.target.value })} placeholder="Descrição do procedimento" className="mb-3 h-36 w-full rounded-2xl border p-4" />
              <Button onClick={adicionarProcedimento} className="bg-pink-700 text-white">Adicionar</Button>
            </Card>
          ) : <Card><h2 className="text-xl font-bold">Modo Operador</h2><p className="text-sm text-slate-500">O operador apenas executa, marca e submete.</p></Card>}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="text-2xl font-black">✅ Checklist do Turno {turno}</h2><p className="text-sm text-slate-500">Progresso: {progressoChecklist}%</p></div></div>
            <div className="overflow-x-auto rounded-2xl border bg-white">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Feito</th><th className="p-4">Categoria</th><th className="p-4">Actividade</th><th className="p-4">Horário</th><th className="p-4">Obs.</th></tr></thead>
                <tbody>{checklist.map((item) => <tr key={item.id} className="border-t"><td className="p-4"><input type="checkbox" checked={item.feito} disabled={!pode.checklist} onChange={() => toggleChecklist(item.id)} className="h-5 w-5" style={{ accentColor: COR_BIM }} /></td><td className="p-4 font-medium">{item.categoria}</td><td className="p-4">{item.tarefa}</td><td className="p-4">{item.horario}</td><td className="p-4">{item.observacao}</td></tr>)}</tbody>
              </table>
            </div>
          </Card>

          {pode.configurar ? (
            <Card>
              <h2 className="text-2xl font-black">➕ Adicionar Checklist</h2>
              <p className="mb-3 text-sm text-slate-500">Adiciona uma nova actividade à checklist do turno seleccionado.</p>
              <input value={novaChecklist.categoria} onChange={(e) => setNovaChecklist({ ...novaChecklist, categoria: e.target.value })} placeholder="Categoria. Ex: PCOMB" className="mb-3 h-12 w-full rounded-2xl border px-4" />
              <input value={novaChecklist.tarefa} onChange={(e) => setNovaChecklist({ ...novaChecklist, tarefa: e.target.value })} placeholder="Actividade da checklist" className="mb-3 h-12 w-full rounded-2xl border px-4" />
              <input value={novaChecklist.horario} onChange={(e) => setNovaChecklist({ ...novaChecklist, horario: e.target.value })} placeholder="Horário. Ex: 02:30" className="mb-3 h-12 w-full rounded-2xl border px-4" />
              <Button onClick={adicionarChecklist} className="bg-pink-700 text-white">Adicionar Checklist</Button>
            </Card>
          ) : <Card><h2 className="text-xl font-bold">Checklist</h2><p className="text-sm text-slate-500">A criação fica apenas para Supervisor/Admin.</p></Card>}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div><div className="mb-3 flex gap-2"><input placeholder="Pesquisar WO / INC" className="h-10 flex-1 rounded-xl border px-3" /><Button className="bg-slate-800 text-white">Pesquisar</Button></div><h2 className="text-2xl font-black">🚨 Incidentes</h2><p className="text-sm text-slate-500">Registos do turno.</p></div>
              {pode.incidentes && <Button onClick={adicionarIncidente} className="bg-red-600 text-white">Novo Incidente</Button>}
            </div>
            <div className="space-y-3">{incidentes.map((inc) => <div key={inc.id} className="rounded-2xl border bg-slate-50 p-4"><b>{inc.id}</b><p>{inc.descricao}</p><span className="text-xs text-slate-500">{inc.canal} • {inc.estado}</span></div>)}</div>
          </Card>

          <Card>
            <h2 className="text-2xl font-black">📄 Relatório do Turno</h2>
            <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span>Turno</span><b>{turno}</b></div>
              <div className="flex justify-between"><span>Processo da Noite</span><b>{turno === "Noite" ? processoNoite : "N/A"}</b></div>
              <div className="flex justify-between"><span>Operadores</span><b>{[operador1, operador2].filter(Boolean).join(" / ")}</b></div>
              <div className="flex justify-between"><span>Checklist</span><b>{progressoChecklist}%</b></div>
              <div className="flex justify-between"><span>Procedimentos</span><b>{progressoProcedimentos}%</b></div>
              <div className="flex justify-between"><span>Estado do Relatório</span><b>{estadoRelatorio}</b></div>
            </div>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} disabled={!pode.checklist} placeholder="Observações do turno" className="mt-4 h-28 w-full rounded-2xl border p-4 disabled:bg-slate-100" />
            <div className="mt-4 rounded-3xl border-2 border-dashed border-pink-300 bg-pink-50/60 p-5">
              <h3 className="mb-2 text-lg font-black">📎 Upload Evidências / Relatório</h3>
              <p className="mb-3 text-sm text-slate-600">Anexe PDF, Excel, screenshots, relatórios SIMO ou evidências ATM/POS antes de submeter.</p>
              <label className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border bg-white p-6 text-center shadow-sm transition ${!pode.checklist ? "cursor-not-allowed opacity-50" : "hover:bg-pink-50"}`}>
                <span className="text-4xl">📤</span><b className="mt-2">Clique aqui para seleccionar ficheiros</b><span className="mt-1 text-xs text-slate-500">Pode seleccionar vários ficheiros ao mesmo tempo</span>
                <input type="file" multiple disabled={!pode.checklist} onChange={carregarFicheiros} className="hidden" accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.txt,.doc,.docx" />
              </label>
              {ficheirosRelatorio.length > 0 && <div className="mt-4 space-y-2"><p className="text-sm font-bold text-slate-700">Ficheiros anexados: {ficheirosRelatorio.length}</p>{ficheirosRelatorio.map((f) => <div key={f.id} className="flex items-center justify-between rounded-2xl border bg-white p-3 text-sm"><div><b>✓ {f.nome}</b><p className="text-xs text-slate-500">{f.tipo} • {formatarTamanho(f.tamanho)}</p></div><button type="button" onClick={() => removerFicheiro(f.id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Remover</button></div>)}</div>}
            </div>
            <div className="mt-4 flex flex-wrap gap-3"><Button onClick={submeterRelatorio} disabled={!pode.checklist} className="bg-pink-700 text-white">Submeter Relatório no SQL</Button>{pode.validar && <Button onClick={validarRelatorio} className="bg-emerald-600 text-white">Validar</Button>}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
