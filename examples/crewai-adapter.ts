/**
 * Example: Converting agents to CrewAI format
 * 
 * This example shows how to convert a content creation team
 * to CrewAI crew format for collaborative execution.
 */

import {
  type AgentConfig,
  type WorkflowConfig,
  mapAgentToCrewAgent,
  mapWorkflowToCrew,
} from '../src/index.js';

// Define content creation agents
const researcherAgent: AgentConfig = {
  id: 'researcher',
  name: 'Content Researcher',
  description: 'Expert at finding and validating information for content creation',
  provider: 'openai',
  model: 'gpt-4',
  systemPrompt: `You are a meticulous content researcher.
Your expertise:
- Finding accurate, up-to-date information
- Validating sources and fact-checking
- Identifying trending topics and angles
- Gathering supporting data and statistics`,
  parameters: {
    temperature: 0.3,
    maxTokens: 2000,
  },
  tools: [
    {
      id: 'web-search',
      name: 'search_tool',
      description: 'Search the web for information',
    },
    {
      id: 'scrape',
      name: 'scrape_tool',
      description: 'Scrape website content',
    },
  ],
  memory: {
    type: 'buffer',
    maxMessages: 15,
  },
};

const writerAgent: AgentConfig = {
  id: 'writer',
  name: 'Content Writer',
  description: 'Professional writer specializing in engaging, clear content',
  provider: 'anthropic',
  model: 'claude-3-opus',
  systemPrompt: `You are a skilled content writer.
Your strengths:
- Writing clear, engaging prose
- Adapting tone for different audiences
- Structuring content effectively
- Incorporating research naturally`,
  parameters: {
    temperature: 0.7,
    maxTokens: 3000,
  },
};

const editorAgent: AgentConfig = {
  id: 'editor',
  name: 'Content Editor',
  description: 'Detail-oriented editor ensuring quality and consistency',
  provider: 'openai',
  model: 'gpt-4',
  systemPrompt: `You are a thorough content editor.
Your focus:
- Grammar, spelling, and punctuation
- Consistency in style and tone
- Flow and readability
- Fact-checking and accuracy`,
  parameters: {
    temperature: 0.5,
    maxTokens: 2000,
  },
};

// Convert individual agents to CrewAI format
console.log('👥 Converting agents to CrewAI format...\n');

const crewResearcher = mapAgentToCrewAgent(researcherAgent, {
  verbose: true,
  enableMemory: true,
  enableCache: true,
});

console.log('CrewAI Researcher:');
console.log(JSON.stringify(crewResearcher, null, 2));
console.log('\n---\n');

// Define a content creation workflow
const contentWorkflow: WorkflowConfig = {
  id: 'content-crew',
  name: 'Content Creation Crew',
  description: 'Collaborative team for creating high-quality content',
  nodes: [
    {
      id: 'researcher',
      type: 'agent' as const,
      agent: researcherAgent,
    },
    {
      id: 'writer',
      type: 'agent' as const,
      agent: writerAgent,
    },
    {
      id: 'editor',
      type: 'agent' as const,
      agent: editorAgent,
    },
    {
      id: 'seo-optimizer',
      type: 'agent' as const,
      agent: {
        id: 'seo',
        name: 'SEO Specialist',
        description: 'Optimizes content for search engines',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        systemPrompt: 'Optimize content for SEO while maintaining quality and readability',
        parameters: {
          temperature: 0.4,
        },
        tools: [
          {
            id: 'keyword-tool',
            name: 'keyword_research',
            description: 'Research keywords and search intent',
          },
        ],
      },
    },
  ],
  connections: [
    { id: 'c1', sourceId: 'researcher', targetId: 'writer' },
    { id: 'c2', sourceId: 'writer', targetId: 'editor' },
    { id: 'c3', sourceId: 'editor', targetId: 'seo-optimizer' },
  ],
  variables: [
    {
      name: 'topic',
      type: 'string',
      description: 'Content topic',
      required: true,
    },
    {
      name: 'target_audience',
      type: 'string',
      description: 'Target audience for the content',
      required: true,
    },
    {
      name: 'word_count',
      type: 'number',
      description: 'Target word count',
      defaultValue: 1000,
    },
  ],
  tags: ['content', 'writing', 'collaboration'],
};

// Convert workflow to CrewAI crew
console.log('👥 Converting workflow to CrewAI crew...\n');
const crew = mapWorkflowToCrew(contentWorkflow, {
  process: 'sequential',
  verbose: true,
  enableMemory: true,
  enableCache: true,
  maxRpm: 15,
});

console.log('CrewAI Crew:');
console.log(JSON.stringify(crew, null, 2));
console.log('\n---\n');

console.log('✅ Conversion complete!');
console.log(`   - Crew: ${crew.name}`);
console.log(`   - Agents: ${crew.agents.length}`);
console.log(`   - Tasks: ${crew.tasks.length}`);
console.log(`   - Process: ${crew.process}`);
console.log('\n💡 Use this crew definition to execute with CrewAI.');
console.log('\nPseudo-code for execution:');
console.log(`
  from crewai import Agent, Task, Crew
  
  # Create agents
  agents = []
  for agent_config in crew['agents']:
      agent = Agent(
          role=agent_config['role'],
          goal=agent_config['goal'],
          backstory=agent_config['backstory'],
          tools=load_tools(agent_config['tools']),
          llm=create_llm(agent_config['llm']),
          verbose=agent_config['verbose'],
          memory=agent_config['memory']
      )
      agents.append(agent)
  
  # Create tasks
  tasks = []
  for task_config in crew['tasks']:
      task = Task(
          description=task_config['description'],
          expected_output=task_config['expectedOutput'],
          agent=get_agent_by_role(agents, task_config['agent']),
          tools=load_tools(task_config['tools']) if task_config.get('tools') else None
      )
      tasks.append(task)
  
  # Create and run crew
  my_crew = Crew(
      agents=agents,
      tasks=tasks,
      process=crew['process'],
      verbose=crew['verbose']
  )
  
  result = my_crew.kickoff(inputs={
      'topic': 'AI-Powered Developer Tools',
      'target_audience': 'Software Developers',
      'word_count': 1500
  })
  
  print(result)
`);
