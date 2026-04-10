
export interface FinancialParams {
  employeeSalary: number;
  implementationCost: number;
  monthlyMaintenance: number;
  timeHorizonMonths: number;
}

export interface AutomatedTask {
  taskName: string;
  automationScore: number; // 0-100
  reasoning: string;
  recommendedTools: string[];
}

export interface Blueprint {
  jobTitle: string;
  summary: string;
  tasks: AutomatedTask[];
  estimatedAnnualSavings: number;
  breakEvenMonth: number;
  recommendedBudget?: string;
  recommendedFocus?: string;
}

export interface JobPost {
  id: string;
  clientId?: string;
  clientName: string;
  companyDetails?: {
    name: string;
    industry: string;
    size: string;
    contactName: string;
    contactEmail: string;
    goals: string;
    compliance?: string;
    esg_focus?: string;
  };
  blueprint: Blueprint;
  status: 'Open' | 'In Progress' | 'Deployed' | 'Completed' | 'open' | 'in-progress' | 'completed' | 'Awaiting Deployment';
  notificationEmail?: string;
  postedDate: string;
  budgetRange?: string;
  bidsCount?: number;
}

export interface Associate {
  id: string;
  name: string;
  skills: string[];
  isVetted: boolean;
  solutes: number;
}

export interface AssessmentResult {
  passed: boolean;
  score: number;
  feedback: string;
}

// Node Editor Types
export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'ai-tool' | 'compute' | 'output';
  label: string;
  x: number;
  y: number;
  icon?: string;
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface Company {
  id: string;
  name: string;
  logo: string; // Emoji or URL
  industry: string;
  openRoles: number;
  description: string;
}

export interface MicroTask {
  id: string;
  title: string;
  type: 'Labeling' | 'Evaluation' | 'Design';
  solutesReward: number;
  timeEstimate: string;
  description: string;
}

// AI Agent Configuration Types
export interface AgentConnection {
  id: string;
  type: 'slack' | 'github' | 'salesforce' | 'notion' | 'google_drive' | 'generic_api' | 'mongodb' | 'postgresql';
  name: string;
  key: string;
  url?: string;
  isEnabled: boolean;
  details?: {
    webhook_url?: string;
    bot_token?: string;
    repository_filter?: string;
    branch?: string;
    instance_url?: string;
    database_name?: string;
  };
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, string>; // e.g. { "query": "string" }
  endpoint?: string;
  isEnabled: boolean;
  runtime?: 'python' | 'nodejs' | 'curl' | 'simulation';
  envVars?: Record<string, string>;
  timeoutMs?: number;
}

export interface AgentConfig {
  model: string;
  memoryType: string;
  tuning: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
  identity: {
    name: string;
    role: string;
    tone: 'Professional' | 'Friendly' | 'Technical' | 'Creative';
    systemPromptOverride?: string;
    avatarUrl?: string;
  };
  autonomy: {
    level: 'HITL' | 'Semi-Autonomous' | 'Fully-Autonomous';
    allowRetries: boolean;
    maxBudgetPerTask: number;
    maxReasoningLoops: number;
  };
  guardrails: {
    maskPII: boolean;
    restrictedTopics: string[];
    enforceTone: boolean;
  };
  connections: AgentConnection[];
  tools: AgentTool[];
  webhooks?: {
    id: string;
    url: string;
    event: 'task_start' | 'task_end' | 'error';
    isEnabled: boolean;
  }[];
  collaboration?: {
    peerAgentIds: string[];
    allowDelegation: boolean;
    peerDiscovery?: boolean;
    maxSubTasks?: number;
  };
  persistence?: {
    enabled: boolean;
    checkpointFrequency: 'High' | 'Medium' | 'Low';
    sessionRecovery: boolean;
  };
  event_triggers?: {
    id: string;
    type: 'webhook' | 'cron' | 'event';
    source: 'github' | 'slack' | 'system';
    action: string;
    isEnabled: boolean;
  }[];
  schedule?: {
    cronExpression: string;
    enabled: boolean;
    timezone: string;
  };
  sharedState?: Record<string, any>;
  accessControl?: {
    allowedUserIds: string[];
    allowedServiceKeys: string[];
  };
  resilience?: {
    fallbackModel: string;
    retryCount: number;
    timeoutMs: number;
    circuitBreaking?: boolean;
    failoverStrategy?: 'immediate' | 'delayed' | 'manual';
  };
  metrics?: {
    trackLatency: boolean;
    trackTokenCost: boolean;
    autoAlertOnAnomaly: boolean;
  };
  budget?: {
    limitUSD: number;
    dailyLimitUSD?: number;
    alertThreshold: number;
    alertFrequency?: 'once' | 'daily' | 'hourly';
  };
  auditLogs?: {
    timestamp: string;
    userId: string;
    action: string;
    changeSummary: string;
  }[];
  versionHistory?: {
    version: number;
    timestamp: string;
    configSnapshot: Partial<AgentConfig>;
    author: string;
  }[];
  reasoning?: {
    reflectionEnabled: boolean;
    maxReasoningLoops: number;
    cognitiveDepth: number;
  };
  planning?: {
    decompositionDepth: number;
    alternatePathAnalysis: boolean;
  };
  quality_control?: {
    selfCritiqueEnabled: boolean;
    verificationPasses: number;
  };
  memory_strategy?: {
    shortTermBufferSize: number;
    longTermSummaryEnabled: boolean;
    semanticSearchDepth: number;
  };
  context_continuity?: {
    contextPruningStrategy: 'Rolling' | 'Summarized' | 'Fixed';
    relevantFactExtraction: boolean;
  };
  synthesis_engine?: {
    rigorLevel: 'Standard' | 'High' | 'Scientific';
    sourceAttribution: boolean;
  };
  external_integrations?: {
    customApiEndpoints: any[];
    authType: 'OAuth2' | 'ApiKey' | 'Basic';
    dynamicPayloadMapping: boolean;
  };
  ecosystem_interop?: {
    externalCallbackUrl: string;
    eventPropagationDelay: number;
    platformHandshake: boolean;
  };
  tool_sandbox?: {
    runtimeVersion: string;
    cpuLimit: number;
    memoryLimit: number;
    isolatedNetwork: boolean;
  };
  governance_framework?: {
    complianceFramework: 'SOC2' | 'GDPR' | 'HIPAA' | 'None';
    auditLoggingLevel: 'Full' | 'Metadata' | 'None';
    retentionPolicyDays: number;
  };
  ethical_alignment?: {
    biasDetectionEnabled: boolean;
    factualityThreshold: number;
    humanValueAlignment: 'Strict' | 'Balanced' | 'Permissive';
  };
  data_residency?: {
    dataRegion: 'US' | 'EU' | 'Asia' | 'Global';
    processingBoundary: 'Sovereign' | 'Cloud' | 'Hybrid';
  };
  eq_settings?: {
    empathyLevel: number;
    conflictDeescalation: boolean;
    sentimentRigor: number;
  };
  adaptive_persona?: {
    adaptiveToneMapping: boolean;
    personaLearningRate: number;
  };
  brand_identity?: {
    avatarStyle: '3D' | '2D' | 'Text';
    signatureCatchphrase: string;
    culturalContext: string;
  };
  agent_intelligence?: {
    knowledgeGraphEnabled: boolean;
    syncFrequency: 'Real-time' | 'Batch' | 'On-Demand';
    influenceWeight: number;
  };
  collective_memory?: {
    sharedBufferEnabled: boolean;
    crossAgentFactLookup: boolean;
  };
  collaborative_reasoning?: {
    consensusThreshold: number;
    peerReviewRounds: number;
    conflictResolutionMode: 'Majority' | 'Expert' | 'Senior';
  };
  economic_profile?: {
    billingModel: 'Subscription' | 'Pay-per-task' | 'Hybrid';
    baseRateUSD: number;
    performanceBonusPercent: number;
  };
  marketplace_settings?: {
    taskBiddingEnabled: boolean;
    maxBidUSD: number;
    marketSpecialization: string[];
  };
  shared_resources?: {
    resourceSharingProtocol: 'Lease' | 'Grant' | 'Restricted';
    idleComputeLease: boolean;
    sharedSecretVault: boolean;
  };
  self_optimization?: {
    enabled: boolean;
    targets: ('Latency' | 'Accuracy' | 'Cost')[];
    tuningRangePercent: number;
  };
  evolutionary_learning?: {
    patternExtractionEnabled: boolean;
    modeAnalysisEnabled: boolean;
    metaStrategyDepth: number;
  };
  fleet_variance?: {
    agentVarianceEnabled: boolean;
    testGroupSize: number;
    championshipFrequency: 'Hourly' | 'Daily' | 'Weekly';
  };
  fleet_hierarchy?: {
    parentAgentID: string;
    subAgentDelegationEnabled: boolean;
    recursionLimit: number;
  };
  recursive_orchestration?: {
    decompositionDepth: number;
    resourceQuota: number;
    unitaryExecution: boolean;
  };
  hierarchical_governance?: {
    policyInheritanceEnabled: boolean;
    overridePermissionLevel: 'High' | 'Medium' | 'Low';
  };
  red_teaming?: {
    enabled: boolean;
    attackVectors: ('Injection' | 'PII' | 'Jailbreak')[];
    intensity: number;
  };
  stress_testing?: {
    overflowPolicy: 'Scale' | 'Queue' | 'Reject';
    maxConcurrent: number;
  };
  security_hardening?: {
    autoHardeningEnabled: boolean;
    resilienceTier: 'High' | 'Medium' | 'Low';
  };
  sensory_fusion?: {
    multimodalInputEnabled: boolean;
    fusionStrategy: 'Early' | 'Late' | 'Hybrid';
    correlationDepth: number;
  };
  environment_interaction?: {
    activeStreams: ('Audio' | 'Video' | 'Telemetry')[];
    samplingRateHz: number;
  };
  situational_awareness?: {
    spatialReasoningEnabled: boolean;
    temporalContextBufferMS: number;
  };
  ethical_oversight?: {
    ethicalMonitoringEnabled: boolean;
    alignmentFramework: 'Deontological' | 'Utilitarian' | 'Virtue';
    biasThreshold: number;
  };
  legal_compliance?: {
    jurisdiction: 'EU-GDPR' | 'US-CCPA' | 'Global';
    auditFrequency: 'Daily' | 'Weekly' | 'Monthly';
  };
  governance_council?: {
    councilRequired: boolean;
    quorumSize: number;
    vetoPowerEnabled: boolean;
  };
  resource_lifecycle?: {
    lifecycleAutomationEnabled: boolean;
    provisioningStrategy: 'Just-in-Time' | 'Pre-emptive';
    decommissioningPolicy: 'Archive' | 'Purge';
  };
  circular_economy?: {
    tokenRecyclingEnabled: boolean;
    reinvestmentRatio: number;
    profitSharingTier: 'None' | 'Standard' | 'Premium';
  };
  fleet_sustainability?: {
    carbonOffsetEnabled: boolean;
    computeEfficiencyTarget: number;
  };
  reputation_management?: {
    reputationMonitoringEnabled: boolean;
    trustScoreThreshold: number;
    endorsementPolicy: 'Manual' | 'Auto';
  };
  social_graph?: {
    connectivityDepth: 'Direct' | 'Extended' | 'Global';
    mappingMode: 'Dynamic' | 'Static';
  };
  trust_framework?: {
    trustVerificationEnabled: boolean;
    blacklistSyncEnabled: boolean;
    trustModel: 'Zero-Trust' | 'Verified-Partner';
  };
  legal_entity?: {
    legalEntityType: 'DAO' | 'LLC-Equivalent' | 'None';
    contractSigningEnabled: boolean;
    registrationStatus: 'Registered' | 'Pending' | 'None';
  };
  contractual_autonomy?: {
    reviewIntensity: number;
    maxContractValueUSD: number;
    negotiationModel: 'Standard' | 'Variable-Clause';
  };
  compliance_governance?: {
    legalAuditType: 'Internal' | 'External' | 'None';
    complianceEnforcement: 'Soft' | 'Hard';
    kycAmlTier: 'Basic' | 'Advanced' | 'None';
  };
  insurance_management?: {
    coverageType: 'Liability' | 'Errors-and-Omissions' | 'None';
    premiumAutomationEnabled: boolean;
    coverageLimitUSD: number;
  };
  risk_underwriting?: {
    underwritingIntensity: number;
    maxExposureUSD: number;
    underwritingModel: 'Risk-First' | 'Value-First';
  };
  fleet_indemnity?: {
    indemnityAllocation: number;
    claimsHandlingMode: 'Auto' | 'Manual';
    indemnityTier: 'Loss-Prevention' | 'Recovery' | 'None';
  };
  dispute_resolution?: {
    resolutionMode: 'Autonomous-Arbitration' | 'Human-Mediated' | 'Zero-Sum';
    arbitrationVenue: 'Digital-Court' | 'Internal-Council' | 'External-Third-Party';
    maxSettlementUSD: number;
  };
  conflict_mitigation?: {
    mitigationStrategy: 'Cooperative' | 'Competitive' | 'Mixed-Strategy';
    conflictThreshold: number;
  };
  arbitration_protocol?: {
    ruleSetVersion: string;
    evidenceStandard: 'Reasonable' | 'Absolute' | 'Heuristic';
  };
  taxation_management?: {
    taxJurisdiction: 'US-Delaware' | 'EU-Estonia' | 'None';
    taxOptimizationStrategy: 'Conservative' | 'Aggressive';
    automatedTaxWithholding: boolean;
  };
  treasury_compliance?: {
    reportingStandard: 'GAAP' | 'IFRS' | 'Heuristic';
    auditFrequency: 'Real-Time' | 'Monthly' | 'Annual';
    reserveRatio: number;
  };
  fiat_gateway?: {
    onRampProvider: 'Stripe' | 'MoonPay' | 'Plaid';
    maxDailyConversionUSD: number;
    kybTier: 'Basic' | 'Advanced' | 'None';
  };
  supply_chain_management?: {
    procurementStrategy: 'Just-in-Time' | 'Resilient-Stockpiling' | 'Dynamic-Sourcing';
    vendorSelectionCriteria: 'Cost' | 'Speed' | 'Reliability' | 'Sustainability';
    maxPurchaseOrderUSD: number;
  };
  inventory_management?: {
    reorderPoint: number;
    safetyStockLevel: number;
    valuationMethod: 'FIFO' | 'LIFO' | 'Weighted-Average';
  };
  logistics_orchestration?: {
    logisticsProvider: 'DHL' | 'FedEx' | 'Drone' | 'Local-Courier';
    logisticsOptimization: 'Speed' | 'Cost' | 'Green';
    lastMileMode: 'Auto' | 'Manual';
  };
  manufacturing_management?: {
    productionMode: 'Mass-Production' | 'Custom-Batch' | 'Prototyping';
    automationLevel: 'Full-AI' | 'Human-Augmented' | 'Semi-Automated';
    maxDailyThroughput: number;
  };
  industrial_qc?: {
    defectThreshold: number;
    inspectionFrequency: 'Continuous' | 'Batch-Based' | 'Statistical';
    qcStandard: 'ISO-9001' | 'Six-Sigma' | 'Heuristic-AI';
  };
  rd_lifecycle?: {
    innovationBudgetUSD: number;
    rdFocus: 'Incremental-Improvement' | 'Moonshot-Innovation' | 'Cost-Reduction';
    experimentSuccessRate: number;
  };
  hr_management?: {
    hiringStrategy: 'Aggressive-Scale' | 'Lean-Growth' | 'Replacement-Only';
    candidateScoringModel: 'Skill-First' | 'Culture-Fit' | 'AI-Heuristic';
    maxBaseSalaryUSD: number;
  };
  workforce_performance?: {
    performanceReviewFrequency: 'Weekly' | 'Monthly' | 'Quarterly';
    retentionTarget: number;
    talentDevelopmentBudgetUSD: number;
  };
  payroll_benefits?: {
    payrollProvider: 'Gusto' | 'Deel' | 'Rippling' | 'Autonomous-Payout';
    payrollFrequency: 'Weekly' | 'Monthly';
    benefitPackageTier: 'Standard' | 'Premium' | 'Executive';
  };
  legal_ip_management?: {
    legalEntityStatus: 'Active-Sovereign' | 'Registered-Proxy' | 'DAO-Governed';
    jurisdictionOptimization: 'Digital-Nomad' | 'Tax-Haven' | 'High-Compliance';
    maxLegalSpendUSD: number;
  };
  ip_portfolio?: {
    ipStrategy: 'Open-Source' | 'Defensive-Patenting' | 'Aggressive-Monetization';
    patentFilingAutomation: boolean;
    copyrightProtectionLevel: 'Standard' | 'High-Fidelity' | 'Watermarked';
  };
  contractual_sovereignty_layer?: {
    signatureAuthority: 'Fully-Autonomous' | 'Multi-Sig' | 'Human-Required';
    negotiationIntensity: number;
    contractStandard: 'SMART-Standard' | 'Custom-Legal' | 'Hybrid';
  };
  pr_management?: {
    mediaEngagementStrategy: 'Proactive-Outreach' | 'Reactive-Only' | 'Thought-Leadership';
    pressReleaseAutomation: boolean;
    maxPRSpendUSD: number;
  };
  crisis_response?: {
    crisisResponseIntensity: 'Instant-Shutdown' | 'Transparent-Communication' | 'Strategic-Silence';
    automatedFactChecking: boolean;
    crisisThreshold: number;
  };
  brand_sovereignty?: {
    brandVoiceConsistency: number;
    contentDistributionChannels: ('X' | 'LinkedIn' | 'Thread' | 'Website')[];
    visualIdentityAudit: 'Continuous' | 'Periodic' | 'Manual';
  };
  academic_research?: {
    researchPaperSources: ('arXiv' | 'PubMed' | 'IEEE' | 'Nature')[];
    literatureReviewIntensity: number;
    citationStandard: 'APA' | 'MLA' | 'IEEE' | 'Nature-Style';
  };
  patent_scouting?: {
    scoutingAperture: 'Narrow-Niche' | 'Broad-Industry' | 'Global-Tech';
    competitorTrackingEnabled: boolean;
    priorArtSearchDepth: number;
  };
  innovation_intelligence?: {
    technologyTrendAnalysis: 'Weekly' | 'Real-Time' | 'Monthly';
    innovationMaturityThreshold: number;
    whitePaperGeneration: boolean;
  };
  cybersecurity_management?: {
    pentestIntensity: number;
    targetedServiceScan: ('API' | 'Database' | 'Web' | 'Auth')[];
    autonomousExploitMitigation: boolean;
  };
  infrastructure_hardening?: {
    firewallAggression: number;
    zeroTrustArchitecture: boolean;
    idsIpsConfiguration: 'Detect-Only' | 'Active-Block' | 'Adaptive-Hardening';
  };
  security_compliance?: {
    complianceStandard: 'SOC2' | 'GDPR' | 'HIPAA' | 'ISO-27001';
    automatedAuditFrequency: 'Daily' | 'Continuous' | 'Weekly';
    securitySpendUSD: number;
  };
  knowledgeBaseIds?: string[];
  rag_config?: {
    sources: {
      id: string;
      type: 'pdf' | 'web' | 'notion' | 'gdrive' | 'local_file';
      name: string;
      url?: string;
      lastIndexed?: string;
    }[];
    embedding_config: {
      chunkSize: number;
      overlap: number;
      model: string;
    };
  };
  humanInTheLoop?: {
    enabled: boolean;
    requireApprovalFor: ('budget_high' | 'data_delete' | 'external_send' | 'any_tool')[];
    approverEmails: string[];
  };
  communication?: {
    managerEmail: string;
    preferredChannel: 'email' | 'slack' | 'sms' | 'dashboard';
    summaryFrequency: 'daily' | 'weekly' | 'none';
  };
  appearance?: {
    avatarUrl?: string;
    accentColor?: string;
    theme?: 'slate' | 'emerald' | 'indigo' | 'amber';
  };
}

export interface DeployedAgent {
  id: string;
  clientId?: string;
  clientName: string;
  blueprint: Blueprint;
  status: 'Active' | 'Paused' | 'Terminated';
  deployedAt: any; // Firestore Timestamp
  totalTasks: number;
  lastLatency: number;
  total_cost_usd?: number;
  config?: AgentConfig;
}
