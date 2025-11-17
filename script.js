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
    treino: null
};

// ============================================
// FUNÇÕES DE NAVEGAÇÃO
// ============================================

/**
 * Atualiza a barra de progresso e indicador de etapa
 */
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

/**
 * Exibe a seção desejada
 */
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
}

/**
 * Inicia o questionário
 */
function startQuiz() {
    showSection('stage1');
    updateProgress(1);
}

/**
 * Volta para home e reseta dados
 */
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
    userData.treino = null;
    
    document.querySelectorAll('input[type="number"]').forEach(el => el.value = '');
    document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    
    showSection('homeSection');
    updateProgress(0);
}

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

/**
 * Calcula o IMC do usuário
 */
function calculateIMC() {
    const alturaEl = document.getElementById('altura');
    const pesoEl = document.getElementById('peso');
    const altura = parseFloat(alturaEl?.value);
    const peso = parseFloat(pesoEl?.value);

    if (altura > 0 && peso > 0) {
        const imc = (peso / (altura / 100) ** 2).toFixed(1);
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

// Event listeners para cálculo de IMC
document.addEventListener('DOMContentLoaded', function() {
    const alturaInput = document.getElementById('altura');
    const pesoInput = document.getElementById('peso');
    
    if (alturaInput) alturaInput.addEventListener('change', calculateIMC);
    if (pesoInput) pesoInput.addEventListener('change', calculateIMC);
});

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

/**
 * Exibe mensagem de erro
 */
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

/**
 * Obtém valor selecionado de radio button
 */
function getSelectedValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || null;
}

// ============================================
// FUNÇÕES DE NAVEGAÇÃO ENTRE ETAPAS
// ============================================

/**
 * Avança para a próxima etapa
 */
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

/**
 * Volta para a etapa anterior
 */
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
// FUNÇÕES DE GERAÇÃO DE TREINO COM IA (GROQ)
// ============================================

/**
 * Gera o treino usando IA da Groq
 */
async function generateWorkout() {
    userData.experiencia = getSelectedValue('experiencia');
    userData.sexo = getSelectedValue('sexo');
    userData.local = getSelectedValue('local');

    if (!userData.experiencia || !userData.sexo || !userData.local) {
        showError(3, '⚠️ Por favor, selecione todas as opções!');
        return;
    }

    showError(3, '');
    showSection('resultSection');
    updateProgress(4);

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
// PROMPT DA IA
// ============================================

function construirPrompt() {
    return `Você é um especialista em treinamento físico e nutrição. Crie um plano de treino de 5 dias totalmente personalizado baseado nos dados abaixo:

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

INSTRUÇÕES:
Gere um treino detalhado com 5 dias (Segunda-feira a Sexta-feira). Para CADA dia forneça:
1. Nome do dia da semana
2. Foco principal do treino
3. Lista de 5-7 exercícios com:
   - Nome do exercício
   - Séries x repetições
   - Tempo de descanso
4. Tempo total estimado do treino
5. Uma dica importante

Adapte os exercícios:
- Ao nível de experiência (iniciante/intermediário/avançado)
- Ao local de treino (academia/casa)
- Às medidas corporais do usuário

FORMATO DE RESPOSTA (USE EXATAMENTE ESTE FORMATO):

SEGUNDA-FEIRA
Foco: [foco do treino]
1. [Nome do exercício] - [séries] x [repetições] - [descanso]
2. [Nome do exercício] - [séries] x [repetições] - [descanso]
3. [Nome do exercício] - [séries] x [repetições] - [descanso]
4. [Nome do exercício] - [séries] x [repetições] - [descanso]
5. [Nome do exercício] - [séries] x [repetições] - [descanso]
Tempo: [tempo total]
Dica: [dica importante]

TERÇA-FEIRA
Foco: [foco do treino]
...

Continue para os 5 dias da semana.`;
}

// ============================================
// EXIBE O TREINO GERADO (VERSÃO MELHORADA)
// ============================================

function displayWorkout(workoutText) {
    const container = document.getElementById('workoutContainer');
    if (!container) return;

    // Limpar container
    container.innerHTML = '';

    // LIMPEZA DO TEXTO DA API
    let cleanedText = workoutText
        .replace(/\*\*/g, '')           // Remove bold markdown
        .replace(/\*/g, '')             // Remove itálico
        .replace(/#{1,6}\s/g, '')       // Remove headers markdown
        .replace(/^\s*[-•]\s/gm, '')    // Remove bullets
        .trim();

    // Definição dos dias com emojis
    const diasConfig = [
        { nome: '🏋️ SEGUNDA-FEIRA', emoji: '💪', regex: /segunda[-\s]?feira/gi },
        { nome: '🔥 TERÇA-FEIRA', emoji: '🏃', regex: /terça[-\s]?feira/gi },
        { nome: '💪 QUARTA-FEIRA', emoji: '🔥', regex: /quarta[-\s]?feira/gi },
        { nome: '⚡ QUINTA-FEIRA', emoji: '💯', regex: /quinta[-\s]?feira/gi },
        { nome: '🎯 SEXTA-FEIRA', emoji: '⚡', regex: /sexta[-\s]?feira/gi }
    ];

    // Dividir texto por dias
    const lines = cleanedText.split('\n').filter(line => line.trim());
    let currentDayIndex = -1;
    let currentDayContent = [];
    const diasData = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Verificar se a linha é um dia da semana
        let isDayHeader = false;
        let matchedDayIndex = -1;
        
        diasConfig.forEach((diaConfig, idx) => {
            if (diaConfig.regex.test(line)) {
                isDayHeader = true;
                matchedDayIndex = idx;
            }
        });

        if (isDayHeader && matchedDayIndex >= 0) {
            // Salvar dia anterior se existir
            if (currentDayIndex >= 0 && currentDayContent.length > 0) {
                diasData.push({
                    config: diasConfig[currentDayIndex],
                    content: currentDayContent.join('\n')
                });
            }
            
            // Iniciar novo dia
            currentDayIndex = matchedDayIndex;
            currentDayContent = [];
        } else if (currentDayIndex >= 0 && line) {
            currentDayContent.push(line);
        }
    }

    // Salvar último dia
    if (currentDayIndex >= 0 && currentDayContent.length > 0) {
        diasData.push({
            config: diasConfig[currentDayIndex],
            content: currentDayContent.join('\n')
        });
    }

    // Renderizar dias encontrados
    if (diasData.length > 0) {
        diasData.forEach(dia => {
            const daySection = document.createElement('div');
            daySection.className = 'day-section';
            
            const dayTitle = document.createElement('div');
            dayTitle.className = 'day-title';
            dayTitle.textContent = dia.config.nome;
            daySection.appendChild(dayTitle);

            // Processar conteúdo do dia
            const contentLines = dia.content.split('\n').filter(l => l.trim());
            contentLines.forEach(contentLine => {
                const exerciseItem = document.createElement('div');
                exerciseItem.className = 'exercise-item';
                
                // Destaca números de séries e repetições
                let formattedLine = contentLine
                    .replace(/(\d+\s*x\s*\d+)/gi, '<strong style="color: #00ff88;">$1</strong>')
                    .replace(/(\d+\s*seg|\d+\s*min)/gi, '<strong style="color: #00d9ff;">$1</strong>');
                
                exerciseItem.innerHTML = formattedLine;
                daySection.appendChild(exerciseItem);
            });

            container.appendChild(daySection);
        });
    } else {
        // Fallback: exibir texto completo formatado
        const fullTextDiv = document.createElement('div');
        fullTextDiv.className = 'exercise-item';
        fullTextDiv.style.whiteSpace = 'pre-wrap';
        fullTextDiv.style.lineHeight = '1.8';
        fullTextDiv.textContent = cleanedText;
        container.appendChild(fullTextDiv);
    }
}

// ============================================
// HELPERS
// ============================================

/**
 * Escapa HTML para evitar injeção
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
