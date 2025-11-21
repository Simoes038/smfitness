// ============================================
// CONFIGURAÇÃO DO TOKEN GROQ
// ============================================
const GROQ_API_KEY = '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';

// ============================================
// OBJETO DE DADOS DO USUÁRIO
// ============================================
const userData = {
    altura: null,
    peso: null,
    imc: null,
    medidas: {
        biceps: null,
        antebraco: null,
        peitoral: null,
        cintura: null,
        ombro: null,
        quadriceps: null,
        coxa: null,
        panturrilha: null,
        gluteos: null
    },
    experiencia: null,
    sexo: null,
    local: null,
    diasPorSemana: null,
    objetivo: null,
    treino: null
};

// ============================================
// FUNÇÕES DE NAVEGAÇÃO
// ============================================
function updateProgress(stage) {
    const percentages = [0, 25, 50, 75, 100];
    const idx = Math.max(0, Math.min(stage, percentages.length - 1));
    const fill = percentages[idx];
    const progressFillEl = document.getElementById('progressFill');
    if (progressFillEl) progressFillEl.style.width = fill + '%';
    
    const stages = ['Início', 'Dados Pessoais', 'Medidas Corporais', 'Seu Perfil', 'Resultado'];
    const stageIndicator = document.getElementById('stageIndicator');
    if (stageIndicator) stageIndicator.textContent = stages[stage] || '';
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
}

function startQuiz() {
    showSection('stage1');
    updateProgress(1);
}

function goHome() {
    userData.altura = null;
    userData.peso = null;
    userData.imc = null;
    userData.medidas = {
        biceps: null,
        antebraco: null,
        peitoral: null,
        cintura: null,
        ombro: null,
        quadriceps: null,
        coxa: null,
        panturrilha: null,
        gluteos: null
    };
    userData.experiencia = null;
    userData.sexo = null;
    userData.local = null;
    userData.diasPorSemana = null;
    userData.objetivo = null;
    userData.treino = null;
    
    document.querySelectorAll('input[type="number"]').forEach(el => el.value = '');
    document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    const sel = document.getElementById('diasSemana');
    if (sel) sel.value = '';

    showSection('homeSection');
    updateProgress(0);

    // limpar resultado também
    const container = document.getElementById('workoutContainer');
    if (container) container.innerHTML = '';
    const resultTitle = document.getElementById('resultTitle');
    if (resultTitle) resultTitle.textContent = 'Seu Plano de Treino';
}

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================
function calculateIMC() {
    const alturaEl = document.getElementById('altura');
    const pesoEl = document.getElementById('peso');
    const altura = parseFloat(alturaEl?.value);
    const peso = parseFloat(pesoEl?.value);

    if (altura > 0 && peso > 0) {
        const imc = +(peso / (altura / 100) ** 2).toFixed(1);
        userData.imc = imc;

        let classification = '';
        if (imc < 18.5) classification = 'Baixo Peso';
        else if (imc < 25) classification = 'Peso Normal';
        else if (imc < 30) classification = 'Sobrepeso';
        else classification = 'Obeso';

        const imcValue = document.getElementById('imcValue');
        const imcClass = document.getElementById('imcClass');
        const imcResult = document.getElementById('imcResult');

        if (imcValue) imcValue.textContent = imc;
        if (imcClass) imcClass.textContent = `Classificação: ${classification}`;
        if (imcResult) imcResult.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const alturaInput = document.getElementById('altura');
    const pesoInput = document.getElementById('peso');
    
    if (alturaInput) alturaInput.addEventListener('change', calculateIMC);
    if (pesoInput) pesoInput.addEventListener('change', calculateIMC);
});

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================
function showError(stageNum, message) {
    const errorEl = document.getElementById(`error${stageNum}`);
    if (!errorEl) return;
    if (message) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    } else {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }
}

function getSelectedValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || null;
}

// ============================================
// NAVEGAÇÃO ENTRE ETAPAS
// ============================================
function nextStage(currentStage) {
    if (currentStage === 1) {
        const altura = document.getElementById('altura')?.value;
        const peso = document.getElementById('peso')?.value;

        if (!altura || !peso) {
            showError(1, '⚠️ Por favor, preencha todos os campos!');
            return;
        }

        userData.altura = parseFloat(altura);
        userData.peso = parseFloat(peso);
        showError(1, '');
        showSection('stage2');
        updateProgress(2);
    } else if (currentStage === 2) {
        userData.medidas = {
            biceps: document.getElementById('biceps')?.value || null,
            antebraco: document.getElementById('antebraco')?.value || null,
            peitoral: document.getElementById('peitoral')?.value || null,
            cintura: document.getElementById('cintura')?.value || null,
            ombro: document.getElementById('ombro')?.value || null,
            quadriceps: document.getElementById('quadriceps')?.value || null,
            coxa: document.getElementById('coxa')?.value || null,
            panturrilha: document.getElementById('panturrilha')?.value || null,
            gluteos: document.getElementById('gluteos')?.value || null
        };
        showError(2, '');
        showSection('stage3');
        updateProgress(3);
    }
}

function previousStage(currentStage) {
    if (currentStage === 2) {
        showSection('stage1');
        updateProgress(1);
    } else if (currentStage === 3) {
        showSection('stage2');
        updateProgress(2);
    } else if (currentStage === 4) {
        showSection('stage3');
        updateProgress(3);
    }
}

// ============================================
// GERAÇÃO DO TREINO COM IA (GROQ)
// ============================================
async function generateWorkout() {
    userData.experiencia = getSelectedValue('experiencia');
    userData.sexo = getSelectedValue('sexo');
    userData.local = getSelectedValue('local');

    const diasSel = document.getElementById('diasSemana')?.value;
    userData.diasPorSemana = diasSel ? parseInt(diasSel, 10) : null;
    userData.objetivo = getSelectedValue('objetivo');

    if (!userData.experiencia || !userData.sexo || !userData.local || !userData.diasPorSemana || !userData.objetivo) {
        showError(3, '⚠️ Por favor, selecione todas as opções (experiência, sexo, local, dias por semana e objetivo)!');
        return;
    }

    showError(3, '');
    showSection('resultSection');
    updateProgress(4);

    const resultTitle = document.getElementById('resultTitle');
    if (resultTitle) {
        resultTitle.textContent = `Seu Plano de Treino - ${userData.diasPorSemana} dia(s) • ${userData.objetivo}`;
    }

    const loadingEl = document.getElementById('loading');
    const container = document.getElementById('workoutContainer');
    if (loadingEl) loadingEl.classList.add('show');
    if (container) container.innerHTML = '';

    const prompt = construirPrompt();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    { role: "system", content: "Você é um especialista em treinamento físico e nutrição. Responda em português de forma clara e estruturada." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Erro detalhado:', errorText);
            throw new Error(`Erro HTTP: ${res.status} - ${errorText}`);
        }

        const json = await res.json();
        if (loadingEl) loadingEl.classList.remove('show');

        let workoutText = '';
        if (json.choices && json.choices.length > 0) {
            workoutText = json.choices[0].message?.content || json.choices[0].text || '';
        } else if (json.generated_text) {
            workoutText = json.generated_text;
        } else if (typeof json === 'string') {
            workoutText = json;
        } else {
            workoutText = JSON.stringify(json, null, 2);
        }

        if (!workoutText || workoutText.trim() === '') {
            throw new Error('Resposta vazia ou inválida do modelo');
        }

        displayWorkout(workoutText);

    } catch (error) {
        console.error('Erro completo:', error);
        if (loadingEl) loadingEl.classList.remove('show');

        let errorMessage = error?.message || String(error);
        if (error.name === 'AbortError') {
            errorMessage = 'Tempo limite excedido (30s). Tente novamente.';
        }

        const containerEl = document.getElementById('workoutContainer');
        if (containerEl) {
            containerEl.innerHTML = `
                <div style="background: rgba(255, 71, 87, 0.1); color: #ff4757; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid rgba(255, 71, 87, 0.3);">
                    <p><strong>❌ Erro ao gerar o treino</strong></p>
                    <p style="font-size: 13px; margin-top: 15px;">Verifique:</p>
                    <ul style="font-size: 13px; text-align: left; display: inline-block; margin: 0; padding-left: 18px;">
                        <li>✓ Sua chave GROQ está correta</li>
                        <li>✓ Você tem conexão com a internet</li>
                        <li>✓ O modelo escolhido está disponível</li>
                        <li>✓ Sua cota de API não foi excedida</li>
                    </ul>
                    <p style="font-size: 12px; margin-top: 15px; color: #b0b0b0;"><strong>Detalhes:</strong> ${escapeHtml(errorMessage)}</p>
                </div>
            `;
        }
    }
}

// ============================================
// PROMPT DA IA (ATUALIZADO PARA "Dia 1...Dia N")
// ============================================
function construirPrompt() {
    const dias = userData.diasPorSemana || 5;
    return `Você é um especialista em treinamento físico e nutrição. Crie um plano de treino de ${dias} dias totalmente personalizado baseado nos dados abaixo:

DADOS PESSOAIS:
- Altura: ${userData.altura}cm
- Peso: ${userData.peso}kg
- IMC: ${userData.imc}

MEDIDAS CORPORAIS (cm):
- Bíceps: ${userData.medidas.biceps}
- Antebraço: ${userData.medidas.antebraco}
- Peitoral: ${userData.medidas.peitoral}
- Cintura: ${userData.medidas.cintura}
- Ombro: ${userData.medidas.ombro}
- Quadríceps: ${userData.medidas.quadriceps}
- Coxa: ${userData.medidas.coxa}
- Panturrilha: ${userData.medidas.panturrilha}
- Glúteos: ${userData.medidas.gluteos}

PERFIL DO USUÁRIO:
- Nível de Experiência: ${userData.experiencia}
- Sexo: ${userData.sexo}
- Local de Treino: ${userData.local}
- Dias por semana: ${userData.diasPorSemana}
- Objetivo: ${userData.objetivo}

INSTRUÇÕES IMPORTANTES:
- GERE os dias **como "Dia 1", "Dia 2", ..., "Dia ${dias}"**. **NÃO** use nomes de dias da semana (Segunda, Terça, etc).
- Cada dia deve começar em sua própria linha com o título: "Dia X" (por exemplo: Dia 1).
- Para CADA dia forneça:
  1) Foco principal do treino
  2) Lista de 4 a 7 exercícios com: Nome do exercício - Séries x Repetições (ou tempo) - Tempo de descanso
  3) Tempo total estimado do treino
  4) Uma dica prática e curta
- Adapte os exercícios ao nível de experiência (Iniciante/Intermediário/Avançado), ao local de treino (Academia/Casa), ao objetivo do usuário e às medidas corporais fornecidas.
- Use linguagem clara e objetiva em português.

FORMATO DE RESPOSTA (USE EXATAMENTE ESTE FORMATO):
Dia 1
Foco: [foco do treino]
1. [Nome do exercício] - [séries] x [repetições] - [descanso]
2. ...
Tempo: [tempo total]
Dica: [dica curta]

Dia 2
Foco: [...]
...
Continue até o Dia ${dias}.`;
}

// ============================================
// EXIBE O TREINO GERADO (VERSÃO ATUALIZADA PARA "Dia 1...")
// ============================================
function displayWorkout(workoutText) {
    const container = document.getElementById('workoutContainer');
    if (!container) return;

    container.innerHTML = '';

    // LIMPEZA DO TEXTO DA API
    let cleanedText = workoutText
        .replace(/\*\*/g, '')           // Remove bold markdown
        .replace(/\*/g, '')             // Remove itálico
        .replace(/#{1,6}\s/g, '')       // Remove headers markdown
        .replace(/^\s*[-•]\s/gm, '')    // Remove bullets
        .trim();

    // Normalizar quebras e remover múltiplas linhas vazias
    cleanedText = cleanedText.replace(/\r/g, '').replace(/\n{2,}/g, '\n\n');

    // Gerar configuração dinâmica de dias com regex que detecta "Dia X" (i de 1..N)
    const totalDias = userData.diasPorSemana || 5;
    const diasConfig = Array.from({ length: totalDias }, (_, i) => ({
        nome: `📅 DIA ${i + 1}`,
        regex: new RegExp(`\\bdia\\s*${i + 1}\\b`, 'i') // detecta "Dia 1", "dia1", "DIA 1"
    }));

    // Dividir por linhas e localizar títulos "Dia X"
    const lines = cleanedText.split('\n');
    let currentDayIndex = -1;
    let currentDayContent = [];
    const diasData = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // detectar se linha contém "Dia X"
        let matchedDay = -1;
        for (let j = 0; j < diasConfig.length; j++) {
            if (diasConfig[j].regex.test(line)) {
                matchedDay = j;
                break;
            }
        }

        if (matchedDay >= 0) {
            // salvar dia anterior
            if (currentDayIndex >= 0 && currentDayContent.length > 0) {
                diasData.push({
                    index: currentDayIndex,
                    content: currentDayContent.join('\n')
                });
            }
            currentDayIndex = matchedDay;
            currentDayContent = [];

            // se a linha tiver mais conteúdo depois do título (ex: "Dia 1 - Foco: Peito"), usar o restante
            const after = line.replace(diasConfig[matchedDay].regex, '').replace(/^[-:—\s]+/, '').trim();
            if (after) currentDayContent.push(after);
        } else if (currentDayIndex >= 0) {
            currentDayContent.push(line);
        }
    }

    // Salvar último dia
    if (currentDayIndex >= 0 && currentDayContent.length > 0) {
        diasData.push({
            index: currentDayIndex,
            content: currentDayContent.join('\n')
        });
    }

    // Se não encontrou nenhum "Dia X", tentar dividir heurísticamente por blocos (fallback)
    if (diasData.length === 0) {
        // procurar padrões como "Foco:" ou "Tempo:" que se repetem e dividir em N blocos aproximados
        const blocks = cleanedText.split(/\n(?=Foco:|\d+\.\s)/i).filter(b => b.trim());
        if (blocks.length > 1) {
            blocks.forEach((b, idx) => {
                if (idx < totalDias) {
                    diasData.push({ index: idx, content: b.trim() });
                }
            });
        } else {
            // fallback final: mostrar todo o texto
            const fullTextDiv = document.createElement('div');
            fullTextDiv.className = 'exercise-item';
            fullTextDiv.style.whiteSpace = 'pre-wrap';
            fullTextDiv.style.lineHeight = '1.8';
            fullTextDiv.textContent = cleanedText;
            container.appendChild(fullTextDiv);
            return;
        }
    }

    // Renderizar dias encontrados (ordenar por index)
    diasData.sort((a, b) => a.index - b.index);
    diasData.forEach(dia => {
        const daySection = document.createElement('div');
        daySection.className = 'day-section';
        daySection.style.marginBottom = '18px';
        daySection.style.padding = '14px';
        daySection.style.borderRadius = '10px';
        daySection.style.background = '#0f172a10';

        const dayTitle = document.createElement('div');
        dayTitle.className = 'day-title';
        dayTitle.style.fontWeight = '700';
        dayTitle.style.marginBottom = '10px';
        dayTitle.textContent = `📅 Dia ${dia.index + 1}`;
        daySection.appendChild(dayTitle);

        const contentLines = dia.content.split('\n').filter(l => l.trim());
        contentLines.forEach(contentLine => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'exercise-item';
            exerciseItem.style.marginBottom = '8px';
            exerciseItem.style.whiteSpace = 'pre-wrap';
            
            // Destaca séries x repetições e tempos (simples)
            let formattedLine = escapeHtml(contentLine)
                .replace(/(\d+\s*x\s*\d+)/gi, '<strong>$1</strong>')
                .replace(/(\d+\s*rep(?:etições)?|\d+\s*reps?|\d+\s*seg(?:undos)?|\d+\s*min(?:utos)?)/gi, '<strong>$1</strong>');
            
            exerciseItem.innerHTML = formattedLine;
            daySection.appendChild(exerciseItem);
        });

        container.appendChild(daySection);
    });
}

// ============================================
// HELPERS
// ============================================
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
