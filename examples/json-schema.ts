/**
 * Example: JSON Schema Generation
 * 
 * This example demonstrates how to generate JSON Schema for use with form builders
 * and validation tools.
 */

import { generateAgentJsonSchema, generateAgentJsonSchemaString } from '../src/index.js';

console.log('🔧 Generating JSON Schema for Agent Configuration...\n');

// Generate the JSON Schema object
const jsonSchema = generateAgentJsonSchema();

console.log('JSON Schema object generated successfully!');
console.log('Schema type:', jsonSchema.type);
console.log('Required fields:', jsonSchema.required);

// Generate a formatted JSON Schema string
const schemaString = generateAgentJsonSchemaString(2);

console.log('\n📄 Formatted JSON Schema:\n');
console.log(schemaString);

// This JSON Schema can be used with:
// - react-jsonschema-form
// - Formik with JSON Schema validation
// - Any JSON Schema validator
// - API documentation tools like Swagger/OpenAPI

console.log('\n✅ JSON Schema can now be used with form generators and validators!');

export { jsonSchema, schemaString };
