// Task and Project schema definitions

export const VALID_STATUSES = ['pending', 'in_progress', 'blocked', 'review', 'done', 'completed'];
export const VALID_AUTONOMY_LEVELS = ['propose', 'draft', 'execute'];

export const TASK_SCHEMA = {
  title: { required: true, type: 'string' },
  description: { required: true, type: 'string' },
  assignee: { required: true, type: 'string' },
  status: { required: true, type: 'enum', values: VALID_STATUSES },
  created: { required: true, type: 'date' },
  due: { required: false, type: 'date' },
  autonomy: { required: true, type: 'enum', values: VALID_AUTONOMY_LEVELS },
  spend: { required: true, type: 'number' },
  artifacts: { required: true, type: 'array' }
};

export const PROJECT_SCHEMA = {
  title: { required: true, type: 'string' },
  description: { required: true, type: 'string' },
  status: { required: true, type: 'enum', values: VALID_STATUSES },
  priority: { required: false, type: 'number' },
  created: { required: true, type: 'date' },
  due: { required: false, type: 'date' },
  owner: { required: true, type: 'string' },
  default_autonomy: { required: false, type: 'enum', values: VALID_AUTONOMY_LEVELS },
  budget: { required: false, type: 'number' },
  spent: { required: false, type: 'number' }
};

export function validateTaskFrontmatter(frontmatter) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(TASK_SCHEMA)) {
    // Check if required field exists (including 0 as valid)
    if (rules.required && frontmatter[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
    
    // Validate enum values if field exists
    if (frontmatter[field] !== undefined && frontmatter[field] !== null) {
      if (rules.type === 'enum' && !rules.values.includes(frontmatter[field])) {
        errors.push(`Invalid ${field}: '${frontmatter[field]}'. Valid values: ${rules.values.join(', ')}`);
      }
    }
  }
  
  return errors;
}

export function validateProjectFrontmatter(frontmatter) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(PROJECT_SCHEMA)) {
    if (rules.required && !frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
    
    if (frontmatter[field]) {
      if (rules.type === 'enum' && !rules.values.includes(frontmatter[field])) {
        errors.push(`Invalid ${field}: '${frontmatter[field]}'. Valid values: ${rules.values.join(', ')}`);
      }
    }
  }
  
  return errors;
}
