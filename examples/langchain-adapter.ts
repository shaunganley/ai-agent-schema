/**
 * Example: Converting agents to LangChain format
 * 
 * This example shows how to convert a research workflow
 * to LangChain/LangGraph format for execution.
 */

import {
  type AgentConfig,
  type WorkflowConfig,
  mapAgentToLangChain,
  mapWorkflowToLangGraph,
} from '../src/index.js';

// Define a research agent with tools
const researchAgent: AgentConfig = {
  id: 'research-agent',
  name: 'Research Analyst',
  description: 'Conducts in-depth research on various topics',
  provider: 'openai',
  model: 'gpt-4',
  systemPrompt: `You are an expert research analyst.
Your responsibilities:
- Conduct thorough research using available tools
- Synthesize information from multiple sources
- Provide well-structured, factual summaries
- Cite sources when possible`,
  parameters: {
    temperature: 0.3,
    maxTokens: 2000,
    topP: 0.9,
  },
  tools: [
    {
      id: 'web-search',
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          num_results: { type: 'number', default: 5 },
        },
        required: ['query'],
      },
    },
    {
      id: 'arxiv-search',
      name: 'arxiv_search',
      description: 'Search academic papers on arXiv',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
  ],
  memory: {
    type: 'summary',
    maxMessages: 20,
  },
};

// Convert agent to LangChain format
console.log('🦜 Converting agent to LangChain format...\n');
const lcAgent = mapAgentToLangChain(researchAgent, {
  verbose: true,
  maxIterations: 20,
  returnIntermediateSteps: true,
});

console.log('LangChain Agent:');
console.log(JSON.stringify(lcAgent, null, 2));
console.log('\n---\n');

// Define a research workflow
const researchWorkflow: WorkflowConfig = {
  id: 'research-workflow',
  name: 'Comprehensive Research Pipeline',
  description: 'Multi-agent research workflow with synthesis',
  nodes: [
    {
      id: 'start',
      type: 'trigger',
    },
    {
      id: 'topic-planner',
      type: 'agent',
      agent: {
        id: 'planner',
        name: 'Research Planner',
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: 'Break down the research topic into specific subtopics and questions',
        parameters: {
          temperature: 0.5,
        },
      },
    },
    {
      id: 'academic-researcher',
      type: 'agent',
      agent: {
        id: 'academic',
        name: 'Academic Researcher',
        provider: 'anthropic',
        model: 'claude-3-opus',
        systemPrompt: 'Focus on academic papers and scholarly sources',
        tools: [
          {
            id: 'arxiv',
            name: 'arxiv_search',
            description: 'Search arXiv for papers',
          },
        ],
      },
    },
    {
      id: 'web-researcher',
      type: 'agent',
      agent: researchAgent,
    },
    {
      id: 'synthesizer',
      type: 'agent',
      agent: {
        id: 'synthesizer',
        name: 'Research Synthesizer',
        provider: 'openai',
        model: 'gpt-4',
        systemPrompt: 'Synthesize research findings into a comprehensive report',
        parameters: {
          temperature: 0.7,
          maxTokens: 3000,
        },
        memory: {
          type: 'buffer',
          maxMessages: 50,
        },
      },
    },
    {
      id: 'end',
      type: 'end',
    },
  ],
  connections: [
    { id: 'c1', sourceId: 'start', targetId: 'topic-planner' },
    { id: 'c2', sourceId: 'topic-planner', targetId: 'academic-researcher' },
    { id: 'c3', sourceId: 'topic-planner', targetId: 'web-researcher' },
    { id: 'c4', sourceId: 'academic-researcher', targetId: 'synthesizer' },
    { id: 'c5', sourceId: 'web-researcher', targetId: 'synthesizer' },
    { id: 'c6', sourceId: 'synthesizer', targetId: 'end' },
  ],
  variables: [
    {
      name: 'research_topic',
      type: 'string',
      description: 'Main research topic',
      required: true,
    },
    {
      name: 'depth',
      type: 'string',
      description: 'Research depth: shallow, medium, or deep',
      defaultValue: 'medium',
    },
  ],
};

// Convert workflow to LangGraph format
console.log('🦜 Converting workflow to LangGraph format...\n');
const lgWorkflow = mapWorkflowToLangGraph(researchWorkflow, {
  verbose: true,
  maxIterations: 25,
});

console.log('LangGraph Workflow:');
console.log(JSON.stringify(lgWorkflow, null, 2));
console.log('\n---\n');

console.log('✅ Conversion complete!');
console.log(`   - Entry point: ${lgWorkflow.entryPoint}`);
console.log(`   - ${Object.keys(lgWorkflow.nodes).length} nodes defined`);
console.log(`   - ${lgWorkflow.edges.length} edges defined`);
console.log(`   - State schema: ${Object.keys(lgWorkflow.state.schema).length} variables`);
console.log('\n💡 Use this LangGraph definition to execute the workflow with LangChain.');
console.log('\nPseudo-code for execution:');
console.log(`
  import { StateGraph } from "@langchain/langgraph";
  
  const graph = new StateGraph({
    channels: lgWorkflow.state.schema
  });
  
  // Add nodes
  Object.entries(lgWorkflow.nodes).forEach(([id, node]) => {
    graph.addNode(id, createNodeFunction(node));
  });
  
  // Add edges
  lgWorkflow.edges.forEach(edge => {
    graph.addEdge(edge.source, edge.target);
  });
  
  const app = graph.compile();
  const result = await app.invoke({ research_topic: "AI Safety" });
`);
