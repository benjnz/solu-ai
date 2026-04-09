"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAgentCommand = exports.refineBlueprint = exports.evaluateWorkflow = exports.generateBlueprint = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
admin.initializeApp();
const MODEL_NAME = "gemini-2.5-flash";
const getGeminiModel = (name = MODEL_NAME, options) => {
    var _a;
    const key = ((_a = functions.config().gemini) === null || _a === void 0 ? void 0 : _a.key) || process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error("Gemini API key is not configured.");
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(key);
    return genAI.getGenerativeModel(Object.assign({ model: name }, options));
};
const generationConfig = {
    temperature: 0.1, // Even lower for iterative refinement to maintain consistency
    topK: 1,
    topP: 1,
    maxOutputTokens: 8192,
};
const safetySettings = [
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
exports.generateBlueprint = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { jobDescription, budget, focus } = data;
    if (!jobDescription || typeof jobDescription !== "string") {
        throw new functions.https.HttpsError("invalid-argument", 'The function must be called with a valid string argument "jobDescription".');
    }
    let jobContent = jobDescription;
    // Detect if input is a URL and attempt to scrape it
    if (jobDescription.trim().startsWith("http://") || jobDescription.trim().startsWith("https://")) {
        try {
            console.log("Input is a URL, attempting to fetch content from:", jobDescription);
            const response = await fetch(jobDescription.trim(), {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5"
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const rawHtml = await response.text();
            jobContent = rawHtml.replace(/<svg\b[^>]*>(.*?)<\/svg>/gi, '[SVG]').replace(/data:image\/[^;]+;base64[^"]+/gi, '[BASE64_IMAGE]');
            console.log("Successfully fetched URL content length:", jobContent.length);
        }
        catch (err) {
            console.error("Scraping failed:", err.message);
            throw new functions.https.HttpsError("internal", "Could not securely scrape the URL provided. The site may block automated access. Please copy and paste the job description text instead.");
        }
    }
    const parts = [
        {
            text: `
You are an elite Enterprise AI Automation Architect. Your task is to rigorously analyze the provided job description and deconstruct it into high-impact, actionable AI automations.

**Parameters:**
- Target Budget: ${budget === 'auto' ? 'AUTO-ANALYZE' : budget}
- Agent Focus: ${focus === 'auto' ? 'AUTO-DETECT' : focus}

Identify mundane, repetitive, and data-heavy tasks natively described within the role's responsibilities.
For each task, assign an automation score (0-100) representing how easily it can be entirely replaced or massively augmented by AI/software. 
Provide deep, highly technical reasoning explaining exactly HOW this task is automated and recommend specific tools.

**Job Description / Page Content:**
${jobContent}

**Output Format Requirements:**
Return the report STRICTLY in a valid, parsable JSON format matching exactly this interface. 
Do NOT wrap the JSON in markdown code blocks (\`\`\`json). Just output raw JSON.

{
  "jobTitle": "String - Extracted or intelligently inferred job title",
  "summary": "String - A 2-3 sentence punchy summary.",
  "recommendedBudget": "String - If input budget was 'auto', recommend a range (e.g. '$5k-15k'). Otherwise echo the input.",
  "recommendedFocus": "String - If input focus was 'auto', recommend a specialization (e.g. 'Backend Operations'). Otherwise echo the input.",
  "tasks": [
    {
      "taskName": "String",
      "automationScore": Number (0-100),
      "reasoning": "String",
      "recommendedTools": ["Tool 1", "Tool 2"]
    }
  ],
  "estimatedAnnualSavings": Number,
  "breakEvenMonth": Number
}
`,
        },
    ];
    try {
        let result;
        try {
            const primaryModel = getGeminiModel("gemini-2.5-flash");
            result = await primaryModel.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
                safetySettings,
            });
        }
        catch (error) {
            console.warn("Primary model (gemini-2.5-flash) failed in generateBlueprint, falling back to gemini-1.5-pro...");
            const fallbackModel = getGeminiModel("gemini-1.5-pro");
            result = await fallbackModel.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
                safetySettings,
            });
        }
        if (!result.response.candidates || result.response.candidates.length === 0) {
            throw new functions.https.HttpsError("unavailable", "The AI model did not generate a response, which may be due to safety settings.");
        }
        let responseText = result.response.candidates[0].content.parts[0].text;
        if (!responseText) {
            throw new functions.https.HttpsError("internal", "Received empty response from the AI model.");
        }
        // Clean potential markdown blocks just in case the model ignores the instruction
        responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const jsonResponse = JSON.parse(responseText);
        return jsonResponse;
    }
    catch (e) {
        console.error("Error calling Gemini API:", e.message);
        throw new functions.https.HttpsError("internal", "An error occurred while generating the blueprint from the LLM: " + e.message, { errorMessage: e.message });
    }
});
exports.evaluateWorkflow = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    return { passed: true, score: 95, feedback: "Workflows look great!" };
});
exports.refineBlueprint = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { previousBlueprint, feedback } = data;
    if (!previousBlueprint || !feedback) {
        throw new functions.https.HttpsError("invalid-argument", 'The function must be called with "previousBlueprint" and "feedback".');
    }
    const parts = [
        {
            text: `
You are a World-Class Enterprise AI Automation Architect. You are iteratively refining an automation blueprint for a sophisticated client.

**CONSTRAINTS:**
1. RETAIN the core job title unless explicitly asked to change it.
2. UPDATE the "summary" to reflect the new direction or specific changes made.
3. MODIFY the "tasks" array based on feedback. This includes adding new specialized tasks, removing irrelevant ones, or updating the "reasoning" and "recommendedTools" for existing tasks.
4. RECALCULATE "estimatedAnnualSavings" and "breakEvenMonth" if the scope of automation has significantly shifted.
5. ENSURE the "automationScore" reflects the new technical reasoning.

**Previous Blueprint:**
${JSON.stringify(previousBlueprint, null, 2)}

**Client Feedback:**
"${feedback}"

**Output Format Requirements:**
Return the report STRICTLY in a valid, parsable JSON format matching the original structure.
Do NOT wrap the JSON in markdown code blocks (\`\`\`json). Just output raw JSON.
Any conversational filler or non-JSON text will result in a system failure.
`,
        },
    ];
    try {
        console.log("Refining blueprint with feedback:", feedback);
        let result;
        try {
            const primaryModel = getGeminiModel("gemini-2.5-flash");
            result = await primaryModel.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
                safetySettings,
            });
        }
        catch (error) {
            console.warn("Primary model (gemini-2.5-flash) failed in refineBlueprint, falling back to gemini-1.5-pro...");
            const fallbackModel = getGeminiModel("gemini-1.5-pro");
            result = await fallbackModel.generateContent({
                contents: [{ role: "user", parts }],
                generationConfig,
                safetySettings,
            });
        }
        if (!result.response.candidates || result.response.candidates.length === 0) {
            throw new functions.https.HttpsError("unavailable", "The AI model did not generate a response.");
        }
        let responseText = result.response.candidates[0].content.parts[0].text;
        if (!responseText) {
            throw new functions.https.HttpsError("internal", "Received empty response from the AI model.");
        }
        responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const jsonResponse = JSON.parse(responseText);
        return jsonResponse;
    }
    catch (e) {
        console.error("Error refining blueprint:", e.message);
        throw new functions.https.HttpsError("internal", "An error occurred while refining the blueprint: " + e.message, { errorMessage: e.message });
    }
});
exports.executeAgentCommand = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const { agentId, command, context: blueprintContext } = data;
    if (!agentId || !command) {
        throw new functions.https.HttpsError("invalid-argument", 'The function must be called with "agentId" and "command".');
    }
    const db = admin.firestore();
    let config = {};
    try {
        // 1. Fetch Agent Config from Firestore
        if (agentId !== 'preview-instance') {
            const agentDoc = await db.collection('deployed_agents').doc(agentId).get();
            if (agentDoc.exists) {
                config = ((_a = agentDoc.data()) === null || _a === void 0 ? void 0 : _a.config) || {};
            }
        }
        // Default Tuning
        const tuning = config.tuning || { temperature: 0.7, topP: 0.95, maxTokens: 4096 };
        // 2. Prepare the System Instruction based on Config
        const identity = config.identity || { name: 'Atlas Core', role: 'Generalist Agent', tone: 'Professional' };
        const appearance = config.appearance || { theme: 'indigo', accentColor: '#6366f1' };
        const autonomy = config.autonomy || { level: 'Semi-Autonomous', maxBudgetPerTask: 50, maxReasoningLoops: 5 };
        const hitl = config.humanInTheLoop || { enabled: true, requireApprovalFor: ['budget_high', 'data_delete'] };
        const communication = config.communication || { preferredChannel: 'slack', managerEmail: '' };
        const guardrails = config.guardrails || { maskPII: true, enforceTone: true, restrictedTopics: [] };
        const resilience = config.resilience || { fallbackModel: 'Gemini 1.5 Pro', retryCount: 3, timeoutMs: 30000 };
        const metricsSettings = config.metrics || { trackLatency: true, trackTokenCost: true };
        const ragConfig = config.rag_config || { sources: [], embedding_config: { chunkSize: 1000, overlap: 200 } };
        const collaboration = config.collaboration || { peerDiscovery: false, allowDelegation: true, maxSubTasks: 3 };
        const persistence = config.persistence || { enabled: true, checkpointFrequency: 'Medium', sessionRecovery: true };
        const eventTriggers = config.event_triggers || [];
        const budget = config.budget || { limitUSD: 500, dailyLimitUSD: 50, alertThreshold: 80, alertFrequency: 'daily' };
        const reasoning = config.reasoning || { reflectionEnabled: true, maxReasoningLoops: 10, cognitiveDepth: 5 };
        const planning = config.planning || { decompositionDepth: 3, alternatePathAnalysis: true };
        const qualityControl = config.quality_control || { selfCritiqueEnabled: true, verificationPasses: 2 };
        const memoryStrategy = config.memory_strategy || { shortTermBufferSize: 2048, longTermSummaryEnabled: true, semanticSearchDepth: 5 };
        const contextContinuity = config.context_continuity || { contextPruningStrategy: 'Rolling', relevantFactExtraction: true };
        const synthesisEngine = config.synthesis_engine || { rigorLevel: 'Standard', sourceAttribution: true };
        const externalIntegrations = config.external_integrations || { customApiEndpoints: [], authType: 'ApiKey', dynamicPayloadMapping: true };
        const ecosystemInterop = config.ecosystem_interop || { externalCallbackUrl: '', eventPropagationDelay: 500, platformHandshake: true };
        const toolSandbox = config.tool_sandbox || { runtimeVersion: 'Node.js 20', cpuLimit: 1, memoryLimit: 512, isolatedNetwork: true };
        const governance = config.governance_framework || { complianceFramework: 'SOC2', auditLoggingLevel: 'Full', retentionPolicyDays: 90 };
        const ethics = config.ethical_alignment || { biasDetectionEnabled: true, factualityThreshold: 0.9, humanValueAlignment: 'Balanced' };
        const residency = config.data_residency || { dataRegion: 'US', processingBoundary: 'Cloud' };
        const eq = config.eq_settings || { empathyLevel: 5, conflictDeescalation: true, sentimentRigor: 3 };
        const adaptivePersona = config.adaptive_persona || { adaptiveToneMapping: true, personaLearningRate: 0.1 };
        const branding = config.brand_identity || { avatarStyle: '3D', signatureCatchphrase: '', culturalContext: 'Neutral' };
        const swarm = config.swarm_intelligence || { knowledgeGraphEnabled: true, syncFrequency: 'Real-time', influenceWeight: 0.5 };
        const collectiveMemory = config.collective_memory || { sharedBufferEnabled: true, crossAgentFactLookup: true };
        const collaborative = config.collaborative_reasoning || { consensusThreshold: 0.7, peerReviewRounds: 2, conflictResolutionMode: 'Majority' };
        const economics = config.economic_profile || { billingModel: 'Subscription', baseRateUSD: 50, performanceBonusPercent: 10 };
        const marketplace = config.marketplace_settings || { taskBiddingEnabled: true, maxBidUSD: 25, marketSpecialization: [] };
        const resources = config.shared_resources || { resourceSharingProtocol: 'Lease', idleComputeLease: true, sharedSecretVault: false };
        const optimization = config.self_optimization || { enabled: true, targets: ['Accuracy'], tuningRangePercent: 10 };
        const evolution = config.evolutionary_learning || { patternExtractionEnabled: true, modeAnalysisEnabled: true, metaStrategyDepth: 5 };
        const fleetVariance = config.fleet_variance || { swarmVarianceEnabled: true, testGroupSize: 5, championshipFrequency: 'Daily' };
        const hierarchy = config.fleet_hierarchy || { parentSwarmID: '', subSwarmDelegationEnabled: true, recursionLimit: 3 };
        const recursive = config.recursive_orchestration || { decompositionDepth: 2, resourceQuota: 1000, unitaryExecution: false };
        const hGovernance = config.hierarchical_governance || { policyInheritanceEnabled: true, overridePermissionLevel: 'Medium' };
        const redTeam = config.red_teaming || { enabled: false, attackVectors: [], intensity: 5 };
        const stress = config.stress_testing || { overflowPolicy: 'Queue', maxConcurrent: 50 };
        const hardening = config.security_hardening || { autoHardeningEnabled: true, resilienceTier: 'Medium' };
        const sensory = config.sensory_fusion || { multimodalInputEnabled: true, fusionStrategy: 'Hybrid', correlationDepth: 5 };
        const environment = config.environment_interaction || { activeStreams: ['Audio', 'Video'], samplingRateHz: 30 };
        const awareness = config.situational_awareness || { spatialReasoningEnabled: true, temporalContextBufferMS: 5000 };
        const ethicsHub = config.ethical_oversight || { ethicalMonitoringEnabled: true, alignmentFramework: 'Deontological', biasThreshold: 0.1 };
        const compliance = config.legal_compliance || { jurisdiction: 'Global', auditFrequency: 'Daily' };
        const council = config.governance_council || { councilRequired: true, quorumSize: 3, vetoPowerEnabled: true };
        const lifecycle = config.resource_lifecycle || { lifecycleAutomationEnabled: true, provisioningStrategy: 'Just-in-Time', decommissioningPolicy: 'Archive' };
        const circular = config.circular_economy || { tokenRecyclingEnabled: true, reinvestmentRatio: 0.2, profitSharingTier: 'Standard' };
        const sustainability = config.fleet_sustainability || { carbonOffsetEnabled: true, computeEfficiencyTarget: 0.8 };
        const reputation = config.reputation_management || { reputationMonitoringEnabled: true, trustScoreThreshold: 0.7, endorsementPolicy: 'Auto' };
        const socialGraph = config.social_graph || { connectivityDepth: 'Direct', mappingMode: 'Dynamic' };
        const trustFramework = config.trust_framework || { trustVerificationEnabled: true, blacklistSyncEnabled: true, trustModel: 'Verified-Partner' };
        const legalEntity = config.legal_entity || { legalEntityType: 'None', contractSigningEnabled: false, registrationStatus: 'None' };
        const contractual = config.contractual_autonomy || { reviewIntensity: 0.8, maxContractValueUSD: 1000, negotiationModel: 'Standard' };
        const complianceLayer = config.compliance_governance || { legalAuditType: 'Internal', complianceEnforcement: 'Soft', kycAmlTier: 'Basic' };
        const insurance = config.insurance_management || { coverageType: 'Liability', premiumAutomationEnabled: true, coverageLimitUSD: 10000 };
        const underwriting = config.risk_underwriting || { underwritingIntensity: 0.7, maxExposureUSD: 5000, underwritingModel: 'Risk-First' };
        const indemnityFund = config.fleet_indemnity || { indemnityAllocation: 0.1, claimsHandlingMode: 'Auto', indemnityTier: 'Loss-Prevention' };
        const dispute = config.dispute_resolution || { resolutionMode: 'Autonomous-Arbitration', arbitrationVenue: 'Digital-Court', maxSettlementUSD: 2000 };
        const mitigation = config.conflict_mitigation || { mitigationStrategy: 'Cooperative', conflictThreshold: 0.6 };
        const arbitration = config.arbitration_protocol || { ruleSetVersion: 'v1.0', evidenceStandard: 'Reasonable' };
        const taxation = config.taxation_management || { taxJurisdiction: 'US-Delaware', taxOptimizationStrategy: 'Conservative', automatedTaxWithholding: true };
        const treasury = config.treasury_compliance || { reportingStandard: 'GAAP', auditFrequency: 'Monthly', reserveRatio: 0.2 };
        const fiat = config.fiat_gateway || { onRampProvider: 'Stripe', maxDailyConversionUSD: 5000, kybTier: 'Basic' };
        const supplyChain = config.supply_chain_management || { procurementStrategy: 'Just-in-Time', vendorSelectionCriteria: 'Cost', maxPurchaseOrderUSD: 1000 };
        const inventory = config.inventory_management || { reorderPoint: 20, safetyStockLevel: 10, valuationMethod: 'FIFO' };
        const logistics = config.logistics_orchestration || { logisticsProvider: 'DHL', logisticsOptimization: 'Speed', lastMileMode: 'Auto' };
        const manufacturing = config.manufacturing_management || { productionMode: 'Mass-Production', automationLevel: 'Full-AI', maxDailyThroughput: 500 };
        const industrialQC = config.industrial_qc || { defectThreshold: 0.01, inspectionFrequency: 'Continuous', qcStandard: 'ISO-9001' };
        const rd = config.rd_lifecycle || { innovationBudgetUSD: 5000, rdFocus: 'Incremental-Improvement', experimentSuccessRate: 0.8 };
        const hr = config.hr_management || { hiringStrategy: 'Lean-Growth', candidateScoringModel: 'Skill-First', maxBaseSalaryUSD: 80000 };
        const workforce = config.workforce_performance || { performanceReviewFrequency: 'Monthly', retentionTarget: 0.9, talentDevelopmentBudgetUSD: 5000 };
        const payroll = config.payroll_benefits || { payrollProvider: 'Gusto', payrollFrequency: 'Monthly', benefitPackageTier: 'Standard' };
        const legalIP = config.legal_ip_management || { legalEntityStatus: 'Active-Sovereign', jurisdictionOptimization: 'Digital-Nomad', maxLegalSpendUSD: 10000 };
        const ipPortfolio = config.ip_portfolio || { ipStrategy: 'Open-Source', patentFilingAutomation: false, copyrightProtectionLevel: 'Standard' };
        const contractSov = config.contractual_sovereignty_layer || { signatureAuthority: 'Fully-Autonomous', negotiationIntensity: 0.7, contractStandard: 'SMART-Standard' };
        const pr = config.pr_management || { mediaEngagementStrategy: 'Proactive-Outreach', pressReleaseAutomation: false, maxPRSpendUSD: 5000 };
        const crisis = config.crisis_response || { crisisResponseIntensity: 'Transparent-Communication', automatedFactChecking: true, crisisThreshold: 0.8 };
        const brand = config.brand_sovereignty || { brandVoiceConsistency: 0.9, contentDistributionChannels: ['X', 'LinkedIn'], visualIdentityAudit: 'Continuous' };
        const academic = config.academic_research || { researchPaperSources: ['arXiv', 'IEEE'], literatureReviewIntensity: 0.7, citationStandard: 'IEEE' };
        const patentScout = config.patent_scouting || { scoutingAperture: 'Broad-Industry', competitorTrackingEnabled: true, priorArtSearchDepth: 0.8 };
        const innovationIntel = config.innovation_intelligence || { technologyTrendAnalysis: 'Real-Time', innovationMaturityThreshold: 0.6, whitePaperGeneration: false };
        const cybersecurity = config.cybersecurity_management || { pentestIntensity: 0.7, targetedServiceScan: ['API', 'Database'], autonomousExploitMitigation: true };
        const infraHardeningV38 = config.infrastructure_hardening || { firewallAggression: 0.8, zeroTrustArchitecture: true, idsIpsConfiguration: 'Active-Block' };
        const securityComplianceV38 = config.security_compliance || { complianceStandard: 'SOC2', automatedAuditFrequency: 'Daily', securitySpendUSD: 20000 };
        const systemDirective = identity.systemPromptOverride || `You are ${identity.name}, playing the role of ${identity.role}. Use the provided Cybersecurity and R&D protocols to fulfill the objective as a threat-aware, security-sovereign intelligence.`;
        const parts = [
            {
                text: `
${systemDirective}

**Your Personality Profile:**
- Identity: ${identity.name} (${identity.role})
- Communicative Tone: ${identity.tone}
- Visual Brand: ${appearance.theme} theme with ${appearance.accentColor} accents.

**Governance & Safety Framework:**
- Autonomy Level: ${autonomy.level}
- Human-in-the-Loop (HITL): ${hitl.enabled ? 'ACTIVE' : 'DISABLED'}
- Safety Constraints: ${guardrails.maskPII ? 'PII Masking ON' : 'Off'}, ${guardrails.enforceTone ? 'Tone Protection ON' : 'Off'}
- Restricted Topics: ${guardrails.restrictedTopics.length > 0 ? guardrails.restrictedTopics.join(', ') : 'None'}

**High-Risk Action Protocol (HITL):**
${hitl.enabled ? `You MUST request explicit approval from ${communication.managerEmail || 'the administrator'} via ${communication.preferredChannel} for: ${hitl.requireApprovalFor.join(', ')}.` : 'Standard autonomous execution permitted.'}

**Operational Parameters:**
- Task Budget: $${autonomy.maxBudgetPerTask}
- Cognitive Depth: ${autonomy.maxReasoningLoops} reasoning loops per task.
- Swarm Context: ${config.sharedState ? JSON.stringify(config.sharedState) : 'Isolated'}
- Blueprint Requirements: ${JSON.stringify(blueprintContext || {}, null, 2)}

**Knowledge & RAG Strategy:**
- Content Ingestion: ${((_b = ragConfig.sources) === null || _b === void 0 ? void 0 : _b.length) > 0 ? ragConfig.sources.map((s) => `${s.name} (${s.type})`).join(', ') : 'No specialized repositories linked.'}
- Chunking Model: Size=${ragConfig.embedding_config.chunkSize}, Overlap=${ragConfig.embedding_config.overlap}
- Vector Storage: ${config.memoryType || 'Pinecone (Vector)'}

**Swarm Collaboration & Delegation:**
- Peer Discovery: ${collaboration.peerDiscovery ? 'ACTIVE' : 'DISABLED'}
- Task Delegation: ${collaboration.allowDelegation ? 'ENABLED' : 'DISABLED'}
- Max Delegation Depth: ${collaboration.maxSubTasks} levels.
- Shared Context: ${config.sharedState ? JSON.stringify(config.sharedState) : 'Isolated'}

**State Management & Persistence:**
- Session Recovery: ${persistence.sessionRecovery ? 'ACTIVE' : 'DISABLED'}
- Checkpoint Strategy: ${persistence.checkpointFrequency} Frequency.

**Infrastructure Resilience & Failover:**
- Circuit Breaking: ${resilience.circuitBreaking ? 'ACTIVE' : 'DISABLED'}
- Failover Strategy: ${resilience.failoverStrategy} (Mode: ${resilience.fallbackModel})
- Memory Resilience: Fallback to ${resilience.fallbackModel} after ${resilience.retryCount} attempts.

**Economic Governance & Budget:**
- Daily Ceiling: $${budget.dailyLimitUSD} USD
- Monthly Threshold: $${budget.limitUSD} USD
- Alerting: Notify at ${budget.alertThreshold}% usage (${budget.alertFrequency} frequency).

**Advanced Reasoning & Reflection:**
- Cognitive Reflection: ${reasoning.reflectionEnabled ? 'ACTIVE' : 'DISABLED'}
- Reasoning Depth: ${reasoning.cognitiveDepth} (Max Loops: ${reasoning.maxReasoningLoops})
- Self-Correction: ${qualityControl.selfCritiqueEnabled ? 'ENABLED' : 'DISABLED'}

**Strategic Planning & Multi-Step Logic:**
- Task Decomposition: Depth ${planning.decompositionDepth}
- Alternate Path Analysis: ${planning.alternatePathAnalysis ? 'ACTIVE' : 'DISABLED'}

**Multi-Tier Memory & Buffer:**
- Short-term Buffer: ${memoryStrategy.shortTermBufferSize} words.
- Long-term Summary: ${memoryStrategy.longTermSummaryEnabled ? 'ACTIVE' : 'DISABLED'}
- Semantic Search Depth: ${memoryStrategy.semanticSearchDepth} levels.

**Strategic Planning & Multi-Step Logic:**
- Task Decomposition: Depth ${planning.decompositionDepth}
- Alternate Path Analysis: ${planning.alternatePathAnalysis ? 'ACTIVE' : 'DISABLED'}

**Multi-Tier Memory & Buffer:**
- Short-term Buffer: ${memoryStrategy.shortTermBufferSize} words.
- Long-term Summary: ${memoryStrategy.longTermSummaryEnabled ? 'ACTIVE' : 'DISABLED'}
- Semantic Search Depth: ${memoryStrategy.semanticSearchDepth} levels.

**Enterprise Governance & Compliance:**
- Compliance Framework: ${governance.complianceFramework}
- Audit Logging: ${governance.auditLoggingLevel}
- Retention Policy: ${governance.retentionPolicyDays} days.

**Ethical Alignment & Safety:**
- Bias Detection: ${ethics.biasDetectionEnabled ? 'ACTIVE' : 'DISABLED'}
- Value Alignment: ${ethics.humanValueAlignment}
- Factuality Threshold: ${ethics.factualityThreshold * 100}% certainty.

**Data Residency & Sovereignty:**
- Data Region: ${residency.dataRegion}
- Processing Boundary: ${residency.processingBoundary}

**Emotional Intelligence (EQ) & Empathy:**
- Empathy Level: ${eq.empathyLevel}/10
- Conflict De-escalation: ${eq.conflictDeescalation ? 'ACTIVE' : 'DISABLED'}
- Sentiment Rigor: Tier ${eq.sentimentRigor}

**Adaptive Persona & Tone:**
- Adaptive Mapping: ${adaptivePersona.adaptiveToneMapping ? 'ENABLED' : 'DISABLED'}
- Persona Learning Rate: ${adaptivePersona.personaLearningRate * 100}% adaptation.

**High-Fidelity Branding & Identity:**
- Avatar Style: ${branding.avatarStyle}
- Signature Catchphrase: ${branding.signatureCatchphrase || 'None'}
- Cultural Context: ${branding.culturalContext}

**Swarm Intelligence & Shared Knowledge Graph (SKG):**
- Knowledge Graph: ${swarm.knowledgeGraphEnabled ? 'ACTIVE' : 'DISABLED'}
- Sync Frequency: ${swarm.syncFrequency}
- Influence Weight: ${swarm.influenceWeight * 10}/10

**Collective Memory & Synchronization:**
- Shared Buffer: ${collectiveMemory.sharedBufferEnabled ? 'ENABLED' : 'DISABLED'}
- Cross-Agent Fact Lookup: ${collectiveMemory.crossAgentFactLookup ? 'ACTIVE' : 'DISABLED'}

**Collaborative Reasoning & Consensus:**
- Consensus Threshold: ${collaborative.consensusThreshold * 100}% agreement.
- Peer Review: ${collaborative.peerReviewRounds} rounds of cross-verification.
- Conflict Resolution: ${collaborative.conflictResolutionMode}

**Economic Ecosystem & Compensation:**
- Billing Model: ${economics.billingModel}
- Base Compensation: $${economics.baseRateUSD} USD
- Performance Bonus: ${economics.performanceBonusPercent}%

**Task Marketplace & Bidding:**
- Marketplace Bidding: ${marketplace.taskBiddingEnabled ? 'ACTIVE' : 'DISABLED'}
- Max Task Bid: $${marketplace.maxBidUSD} USD
- Market Specialization: ${marketplace.marketSpecialization.length > 0 ? marketplace.marketSpecialization.join(', ') : 'Generalist'}

**Inter-Swarm Resource Sharing:**
- Sharing Protocol: ${resources.resourceSharingProtocol}
- Idle Compute Lease: ${resources.idleComputeLease ? 'ENABLED' : 'DISABLED'}
- Shared Vault Access: ${resources.sharedSecretVault ? 'AUTHORIZED' : 'RESTRICTED'}

**Autonomous Self-Optimization:**
- Self-Tuning: ${optimization.enabled ? 'ACTIVE' : 'DISABLED'}
- Tuning Range: ±${optimization.tuningRangePercent}%
- Strategy Targets: ${optimization.targets.join(', ')}

**Evolutionary Learning & Analysis:**
- Pattern Extraction: ${evolution.patternExtractionEnabled ? 'ENABLED' : 'DISABLED'}
- Failure Mode Analysis: ${evolution.modeAnalysisEnabled ? 'ACTIVE' : 'DISABLED'}
- Meta-Strategy Depth: Level ${evolution.metaStrategyDepth}

**Fleet Variance & Experimentation:**
- Swarm Variance: ${fleetVariance.swarmVarianceEnabled ? 'ACTIVE' : 'DISABLED'}
- Championship Cycle: ${fleetVariance.championshipFrequency}
- Test Group Size: ${fleetVariance.testGroupSize} nodes.

**Hierarchical Fleet & Structure:**
- Parent Swarm: ${hierarchy.parentSwarmID || 'ORCHESTRATOR-ROOT'}
- Sub-Swarm Delegation: ${hierarchy.subSwarmDelegationEnabled ? 'ACTIVE' : 'DISABLED'}
- Recursion Depth: ${hierarchy.recursionLimit} levels.

**Recursive Objective Orchestration:**
- Decomposition Depth: Level ${recursive.decompositionDepth}
- Unitary Execution: ${recursive.unitaryExecution ? 'TRUE' : 'FALSE'}
- Resource Quota: ${recursive.resourceQuota} Credits/Node.

**Hierarchical Governance & Policies:**
- Policy Inheritance: ${hGovernance.policyInheritanceEnabled ? 'ACTIVE' : 'DISABLED'}
- Override Permission: ${hGovernance.overridePermissionLevel} Level.

**Autonomous Red-Teaming Hub:**
- Simulation: ${redTeam.enabled ? 'ACTIVE' : 'DISABLED'}
- Attack Intensity: Level ${redTeam.intensity}
- Vectors: ${redTeam.attackVectors.join(', ') || 'None Selected'}

**Security Stress Testing Protocol:**
- Overflow Policy: ${stress.overflowPolicy}
- Max Concurrent: ${stress.maxConcurrent} Simulations

**Automated Security Hardening:**
- Auto-Hardening: ${hardening.autoHardeningEnabled ? 'ACTIVE' : 'DISABLED'}
- Resilience Tier: ${hardening.resilienceTier}

**Multimodal Sensory Fusion Hub:**
- Multimodal Input: ${sensory.multimodalInputEnabled ? 'ACTIVE' : 'DISABLED'}
- Fusion Strategy: ${sensory.fusionStrategy}
- Correlation Depth: Level ${sensory.correlationDepth}

**Real-Time Environment Interaction:**
- Active Streams: ${environment.activeStreams.join(', ') || 'None'}
- Sampling Rate: ${environment.samplingRateHz} Hz

**Spatial-Temporal Situational Awareness:**
- Spatial Reasoning: ${awareness.spatialReasoningEnabled ? 'ACTIVE' : 'DISABLED'}
- Temporal Buffer: ${awareness.temporalContextBufferMS}ms

**Autonomous Ethical Oversight Hub:**
- Ethical Monitoring: ${ethicsHub.ethicalMonitoringEnabled ? 'ACTIVE' : 'DISABLED'}
- Alignment Framework: ${ethicsHub.alignmentFramework}
- Bias Threshold: ${ethicsHub.biasThreshold}

**Jurisdictional Legal Compliance:**
- Jurisdiction: ${compliance.jurisdiction}
- Audit Frequency: ${compliance.auditFrequency}

**Autonomous Resource Lifecycle Hub:**
- Lifecycle Automation: ${lifecycle.lifecycleAutomationEnabled ? 'ACTIVE' : 'DISABLED'}
- Provisioning Strategy: ${lifecycle.provisioningStrategy}
- Decommissioning Policy: ${lifecycle.decommissioningPolicy}

**Circular Economy Hub:**
- Token Recycling: ${circular.tokenRecyclingEnabled ? 'ACTIVE' : 'DISABLED'}
- Reinvestment Ratio: ${circular.reinvestmentRatio}
- Profit Sharing: ${circular.profitSharingTier}

**Fleet Sustainability Hub:**
- Carbon Offset: ${sustainability.carbonOffsetEnabled ? 'ACTIVE' : 'DISABLED'}
- Efficiency Target: ${sustainability.computeEfficiencyTarget}

**Autonomous Reputation Hub:**
- Reputation Monitoring: ${reputation.reputationMonitoringEnabled ? 'ACTIVE' : 'DISABLED'}
- Trust Threshold: ${reputation.trustScoreThreshold}
- Endorsement Policy: ${reputation.endorsementPolicy}

**Social Graph Hub:**
- Connectivity Depth: ${socialGraph.connectivityDepth}
- Mapping Mode: ${socialGraph.mappingMode}

**Trust Framework Hub:**
- Trust Verification: ${trustFramework.trustVerificationEnabled ? 'ACTIVE' : 'DISABLED'}
- Trust Model: ${trustFramework.trustModel}
- Blacklist Sync: ${trustFramework.blacklistSyncEnabled ? 'ENABLED' : 'DISABLED'}

**Autonomous Legal Entity Hub:**
- Entity Type: ${legalEntity.legalEntityType}
- Contract Signing: ${legalEntity.contractSigningEnabled ? 'ACTIVE' : 'DISABLED'}
- Registration Status: ${legalEntity.registrationStatus}

**Contractual Autonomy Hub:**
- Review Intensity: ${contractual.reviewIntensity}
- Max Contract Value: $${contractual.maxContractValueUSD}
- Negotiation Model: ${contractual.negotiationModel}

**Compliance Governance Hub:**
- Legal Audit: ${complianceLayer.legalAuditType}
- Compliance Enforcement: ${complianceLayer.complianceEnforcement}
- KYC/AML Tier: ${complianceLayer.kycAmlTier}

**Autonomous Insurance Hub:**
- Coverage Type: ${insurance.coverageType}
- Premium Automation: ${insurance.premiumAutomationEnabled ? 'ACTIVE' : 'DISABLED'}
- Coverage Limit: $${insurance.coverageLimitUSD}

**Risk Underwriting Hub:**
- Underwriting Intensity: ${underwriting.underwritingIntensity}
- Max Underwriting Exposure: $${underwriting.maxExposureUSD}
- Underwriting Model: ${underwriting.underwritingModel}

**Fleet Indemnity Hub:**
- Indemnity Allocation: ${underwriting.underwritingIntensity} (Weight Applied)
- Claims Handling: ${indemnityFund.claimsHandlingMode}
- Indemnity Tier: ${indemnityFund.indemnityTier}

**Autonomous Dispute Resolution Hub:**
- Resolution Mode: ${dispute.resolutionMode}
- Arbitration Venue: ${dispute.arbitrationVenue}
- Max Settlement: $${dispute.maxSettlementUSD}

**Conflict Mitigation Hub:**
- Mitigation Strategy: ${mitigation.mitigationStrategy}
- Conflict Threshold: ${mitigation.conflictThreshold}

**Arbitration Protocol Hub:**
- Rule Set: ${arbitration.ruleSetVersion}
- Evidence Standard: ${arbitration.evidenceStandard}

**Autonomous Taxation Hub:**
- Jurisdiction: ${taxation.taxJurisdiction}
- Strategy: ${taxation.taxOptimizationStrategy}
- Withholding: ${taxation.automatedTaxWithholding ? 'ACTIVE' : 'DISABLED'}

**Treasury Compliance Hub:**
- Standard: ${treasury.reportingStandard}
- Audit: ${treasury.auditFrequency}
- Reserve: ${Math.round(treasury.reserveRatio * 100)}%

**Fiat Gateway Hub:**
- Provider: ${fiat.onRampProvider}
- Daily Limit: $${fiat.maxDailyConversionUSD}
- KYB: ${fiat.kybTier}

**Autonomous Supply Chain Hub:**
- Procurement: ${supplyChain.procurementStrategy}
- Vendor Criteria: ${supplyChain.vendorSelectionCriteria}
- Max PO: $${supplyChain.maxPurchaseOrderUSD}

**Inventory Hub:**
- Reorder Point: ${inventory.reorderPoint} Units
- Safety Stock: ${inventory.safetyStockLevel} Units
- Valuation: ${inventory.valuationMethod}

**Logistics Orchestration Hub:**
- Provider: ${logistics.logisticsProvider}
- Optimization: ${logistics.logisticsOptimization}
- Last-Mile: ${logistics.lastMileMode}

**Autonomous Manufacturing Hub:**
- Production Mode: ${manufacturing.productionMode}
- Automation Level: ${manufacturing.automationLevel}
- Max Daily Throughput: ${manufacturing.maxDailyThroughput} Units

**Industrial Quality Control Hub:**
- Defect Threshold: ${Math.round(industrialQC.defectThreshold * 10000) / 100}%
- Inspection Frequency: ${industrialQC.inspectionFrequency}
- QC Standard: ${industrialQC.qcStandard}

**R&D Lifecycle Hub:**
- Innovation Budget: $${rd.innovationBudgetUSD}
- Focus: ${rd.rdFocus}
- Success Rate: ${Math.round(rd.experimentSuccessRate * 100)}%

**Autonomous HR & Recruitment Hub:**
- Hiring Strategy: ${hr.hiringStrategy}
- Candidate Scoring: ${hr.candidateScoringModel}
- Max Base Salary: $${hr.maxBaseSalaryUSD}

**Workforce Performance Hub:**
- Review Frequency: ${workforce.performanceReviewFrequency}
- Retention Target: ${Math.round(workforce.retentionTarget * 100)}%
- Development Budget: $${workforce.talentDevelopmentBudgetUSD}

**Payroll & Benefits Hub:**
- Payroll Provider: ${payroll.payrollProvider}
- Payroll Frequency: ${payroll.payrollFrequency}
- Benefit Package Tier: ${payroll.benefitPackageTier}

**Autonomous Legal & IP Hub:**
- Legal Entity Status: ${legalIP.legalEntityStatus}
- Jurisdiction Optimization: ${legalIP.jurisdictionOptimization}
- Max Legal Spend: $${legalIP.maxLegalSpendUSD}

**IP Asset Portfolio:**
- IP Strategy: ${ipPortfolio.ipStrategy}
- Patent Filing Automation: ${ipPortfolio.patentFilingAutomation ? 'ACTIVE' : 'DISABLED'}
- Copyright Protection: ${ipPortfolio.copyrightProtectionLevel}

**Contractual Sovereignty Hub:**
- Signature Authority: ${contractSov.signatureAuthority}
- Negotiation Intensity: ${Math.round(contractSov.negotiationIntensity * 100)}%
- Contract Standard: ${contractSov.contractStandard}

**Autonomous PR & Communications Hub:**
- Media Engagement: ${pr.mediaEngagementStrategy}
- Press Release Automation: ${pr.pressReleaseAutomation ? 'ACTIVE' : 'DISABLED'}
- Max PR Spend: $${pr.maxPRSpendUSD}

**Crisis Management Hub:**
- Response Intensity: ${crisis.crisisResponseIntensity}
- Automated Fact-Checking: ${crisis.automatedFactChecking ? 'ACTIVE' : 'DISABLED'}
- Crisis Threshold: ${Math.round(crisis.crisisThreshold * 100)}%

**Brand Sovereignty Hub:**
- Brand Voice Consistency: ${Math.round(brand.brandVoiceConsistency * 100)}%
- Channels: ${brand.contentDistributionChannels.join(', ')}
- Visual Identity Audit: ${brand.visualIdentityAudit}

**Autonomous Academic Research Hub:**
- Research Sources: ${academic.researchPaperSources.join(', ')}
- Literature Review Intensity: ${Math.round(academic.literatureReviewIntensity * 100)}%
- Citation Standard: ${academic.citationStandard}

**Patent Scouting Hub:**
- Scouting Aperture: ${patentScout.scoutingAperture}
- Competitor Tracking: ${patentScout.competitorTrackingEnabled ? 'ACTIVE' : 'DISABLED'}
- Prior Art Search Depth: ${Math.round(patentScout.priorArtSearchDepth * 100)}%

**Innovation Intelligence Hub:**
- White Paper Generation: ${innovationIntel.whitePaperGeneration ? 'ACTIVE' : 'DISABLED'}

**Autonomous Cybersecurity Hub:**
- Pentest Intensity: ${Math.round(cybersecurity.pentestIntensity * 100)}%
- Targeted Services: ${cybersecurity.targetedServiceScan.join(', ')}
- Exploit Mitigation: ${cybersecurity.autonomousExploitMitigation ? 'ACTIVE' : 'DISABLED'}

**Infrastructure Hardening Hub:**
- Firewall Aggression: ${Math.round(infraHardeningV38.firewallAggression * 100)}%
- Zero-Trust Architecture: ${infraHardeningV38.zeroTrustArchitecture ? 'ACTIVE' : 'DISABLED'}
- IDS/IPS Mode: ${infraHardeningV38.idsIpsConfiguration}

**Security Compliance Hub:**
- Compliance Standard: ${securityComplianceV38.complianceStandard}
- Audit Frequency: ${securityComplianceV38.automatedAuditFrequency}
- Security Budget: $${securityComplianceV38.securitySpendUSD.toLocaleString()}

**Multi-Agent Governance Council:**
- Council Required: ${council.councilRequired ? 'ACTIVE' : 'DISABLED'}
- Quorum Size: ${council.quorumSize} Agents
- Veto Power: ${council.vetoPowerEnabled ? 'ENABLED' : 'DISABLED'}

**Advanced Integrations & API Hub:**
- Custom Endpoints: ${externalIntegrations.customApiEndpoints.length} registered.
- Auth Protocol: ${externalIntegrations.authType}
- Payload Mapping: ${externalIntegrations.dynamicPayloadMapping ? 'DYNAMIC' : 'STATIC'}

**Ecosystem Interoperability:**
- Callback Mapping: ${ecosystemInterop.externalCallbackUrl || 'NONE'}
- Platform Handshake: ${ecosystemInterop.platformHandshake ? 'ACTIVE (Zapier/Make)' : 'DISABLED'}
- Sync Delay: ${ecosystemInterop.eventPropagationDelay}ms.

**Tool Sandbox & Execution:**
- Isolated Runtime: ${toolSandbox.runtimeVersion}
- Resource Quota: ${toolSandbox.cpuLimit} vCPU / ${toolSandbox.memoryLimit}MB RAM.
- Network Mode: ${toolSandbox.isolatedNetwork ? 'ISOLATED' : 'OPEN'}

**Contextual Continuity & Pruning:**
- Pruning Strategy: ${contextContinuity.contextPruningStrategy}
- Fact Extraction: ${contextContinuity.relevantFactExtraction ? 'ACTIVE' : 'DISABLED'}

**Knowledge Synthesis & Attribution:**
- Synthesis Rigor: ${synthesisEngine.rigorLevel}
- Source Attribution: ${synthesisEngine.sourceAttribution ? 'MANDATORY' : 'OPTIONAL'}

**Logic Verification:**
- Verification Cycles: ${qualityControl.verificationPasses} passes per task.

**Event Triggers (Real-time):**
${eventTriggers.length > 0 ? eventTriggers.map((t) => `- ${t.type} from ${t.source}: ${t.action}`).join('\n') : '- No active external event triggers.'}

**Available Connections:**
${((_c = config.connections) === null || _c === void 0 ? void 0 : _c.length) > 0 ? config.connections.map((c) => `- ${c.name} (${c.type}): ${c.details ? JSON.stringify(c.details) : 'Generic'}`).join('\n') : '- Simulation mode only'}

**Available Strategic Tools:**
${((_d = config.tools) === null || _d === void 0 ? void 0 : _d.length) > 0 ? config.tools.map((t) => `- ${t.name} (Runtime: ${t.runtime || 'Default'}): ${t.description}`).join('\n') : '- No custom tools registered.'}

**Metrics & Observability:**
- Monitoring: ${metricsSettings.trackLatency ? 'Latency' : ''} ${metricsSettings.trackTokenCost ? '/ Token Cost' : ''} ACTIVE.

**User Command:**
"${command}"

**Your Instructions:**
1. If the command involves a RESTRICTED TOPIC, decline politely.
2. If the action is HIGH-RISK (e.g. data deletion or budget exceeding $${autonomy.maxBudgetPerTask}), state "[APPROVAL_REQUIRED] This action requires authorization." in your response.
3. Reflect your assigned tone (${identity.tone}) in every interaction.
4. If successful, provide a structured JSON response.

**Output Format:**
{
  "response": "Your definitive answer",
  "logs": ["Step-by-step logic", "Action markers", ...],
  "status": "success" | "warning" | "error"
}
`
            }
        ];
        let result;
        let usedFallback = false;
        const opStartTime = Date.now();
        try {
            const primaryModel = getGeminiModel("gemini-2.5-flash", {
                generationConfig: {
                    temperature: tuning.temperature,
                    topP: tuning.topP,
                    maxOutputTokens: tuning.maxTokens,
                }
            });
            result = await primaryModel.generateContent({ contents: [{ role: "user", parts }] });
        }
        catch (error) {
            console.warn("Primary model failed, engaging fallback...", error);
            usedFallback = true;
            const fallbackModel = getGeminiModel("gemini-1.5-pro", {
                generationConfig: {
                    temperature: tuning.temperature,
                    topP: tuning.topP,
                    maxOutputTokens: tuning.maxTokens,
                }
            });
            result = await fallbackModel.generateContent({ contents: [{ role: "user", parts }] });
        }
        const latency = Date.now() - opStartTime;
        if (!result.response.candidates || result.response.candidates.length === 0) {
            throw new functions.https.HttpsError("unavailable", "The AI model did not generate a response.");
        }
        let responseText = result.response.candidates[0].content.parts[0].text;
        if (!responseText) {
            throw new functions.https.HttpsError("internal", "Received empty response from the AI model.");
        }
        responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const jsonResponse = JSON.parse(responseText);
        // Enrich with metrics
        jsonResponse.metrics = {
            tokensUsed: ((_e = result.response.usageMetadata) === null || _e === void 0 ? void 0 : _e.totalTokenCount) || 0,
            latency,
            fallbackEngaged: usedFallback
        };
        if (metricsSettings.trackLatency) {
            jsonResponse.logs.push(`[Metrics] Task completed in ${latency}ms.`);
        }
        if (usedFallback) {
            jsonResponse.logs.unshift(`[Resilience] Primary node failed. Switched to ${resilience.fallbackModel} for mission continuity.`);
        }
        // 3. Persist Logs and Stats
        if (agentId !== 'preview-instance') {
            const logsRef = db.collection('deployed_agents').doc(agentId).collection('logs');
            for (const logItem of (jsonResponse.logs || [])) {
                await logsRef.add({
                    message: logItem,
                    type: 'thinking',
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            await logsRef.add({
                message: jsonResponse.response,
                type: jsonResponse.status || 'success',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            await db.collection('deployed_agents').doc(agentId).set({
                lastRun: admin.firestore.FieldValue.serverTimestamp(),
                totalTasks: admin.firestore.FieldValue.increment((((_f = jsonResponse.logs) === null || _f === void 0 ? void 0 : _f.length) || 0) + 1),
                lastLatency: latency,
                total_cost_usd: admin.firestore.FieldValue.increment((jsonResponse.metrics.tokensUsed / 1000000) * 0.15)
            }, { merge: true });
        }
        return jsonResponse;
    }
    catch (e) {
        console.error("Backend Execution Error:", e.message);
        throw new functions.https.HttpsError("internal", "Failed to execute agent backend logic.", { errorMessage: e.message });
    }
});
//# sourceMappingURL=index.js.map