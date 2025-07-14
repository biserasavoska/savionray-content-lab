#!/usr/bin/env node

/**
 * API Security Audit Script
 * 
 * Comprehensive audit of all API routes for organization filtering and security vulnerabilities.
 * Identifies potential data leakage and security gaps in multi-tenant data isolation.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const API_ROUTES_DIR = 'src/app/api';
const SECURITY_PATTERNS = {
  // Required security patterns
  required: {
    authentication: /getServerSession|session/,
    organizationFilter: /organizationId|createOrgFilter|requireOrganizationContext/,
    authorization: /isAdmin|isCreative|isClient|role/,
  },
  
  // Security vulnerabilities to detect
  vulnerabilities: {
    noAuth: /export async function (GET|POST|PUT|DELETE|PATCH)/,
    noOrgFilter: /prisma\.\w+\.(findMany|findFirst|findUnique|count|update|delete)/,
    hardcodedIds: /organizationId.*=.*['"`][^'"`]+['"`]/,
    sqlInjection: /`.*\$\{.*\}`/,
    exposedQueries: /console\.log.*query|console\.log.*where/,
  },
  
  // Security best practices
  bestPractices: {
    errorHandling: /try.*catch|handleApiError/,
    inputValidation: /validateRequired|validateString|validateEmail/,
    logging: /logger\.(info|warn|error)/,
    pagination: /skip.*take|limit.*offset/,
  }
};

// Security audit results
const auditResults = {
  totalRoutes: 0,
  secureRoutes: 0,
  vulnerableRoutes: 0,
  missingAuth: 0,
  missingOrgFilter: 0,
  missingAuthorization: 0,
  details: []
};

/**
 * Analyze a single API route file
 */
function analyzeApiRoute(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const routePath = filePath.replace('src/app/api/', '').replace('.ts', '');
  
  const analysis = {
    file: fileName,
    route: routePath,
    hasAuthentication: false,
    hasOrganizationFilter: false,
    hasAuthorization: false,
    hasErrorHandling: false,
    hasInputValidation: false,
    hasLogging: false,
    hasPagination: false,
    vulnerabilities: [],
    recommendations: [],
    securityScore: 0
  };

  // Check for authentication
  if (SECURITY_PATTERNS.required.authentication.test(content)) {
    analysis.hasAuthentication = true;
  } else {
    analysis.vulnerabilities.push('Missing authentication check');
    analysis.recommendations.push('Add getServerSession() check');
  }

  // Check for organization filtering
  if (SECURITY_PATTERNS.required.organizationFilter.test(content)) {
    analysis.hasOrganizationFilter = true;
  } else {
    // Check if this is an admin route that might not need org filtering
    const isAdminRoute = routePath.includes('admin') || routePath.includes('system');
    if (!isAdminRoute) {
      analysis.vulnerabilities.push('Missing organization filtering');
      analysis.recommendations.push('Add organization context and filtering');
    }
  }

  // Check for authorization
  if (SECURITY_PATTERNS.required.authorization.test(content)) {
    analysis.hasAuthorization = true;
  } else {
    analysis.vulnerabilities.push('Missing role-based authorization');
    analysis.recommendations.push('Add role checks (isAdmin, isCreative, etc.)');
  }

  // Check for error handling
  if (SECURITY_PATTERNS.bestPractices.errorHandling.test(content)) {
    analysis.hasErrorHandling = true;
  } else {
    analysis.recommendations.push('Add try-catch error handling');
  }

  // Check for input validation
  if (SECURITY_PATTERNS.bestPractices.inputValidation.test(content)) {
    analysis.hasInputValidation = true;
  } else {
    analysis.recommendations.push('Add input validation');
  }

  // Check for logging
  if (SECURITY_PATTERNS.bestPractices.logging.test(content)) {
    analysis.hasLogging = true;
  } else {
    analysis.recommendations.push('Add structured logging');
  }

  // Check for pagination
  if (SECURITY_PATTERNS.bestPractices.pagination.test(content)) {
    analysis.hasPagination = true;
  } else {
    analysis.recommendations.push('Add pagination for list endpoints');
  }

  // Check for vulnerabilities
  if (SECURITY_PATTERNS.vulnerabilities.noAuth.test(content) && !analysis.hasAuthentication) {
    analysis.vulnerabilities.push('No authentication check found');
  }

  if (SECURITY_PATTERNS.vulnerabilities.noOrgFilter.test(content) && !analysis.hasOrganizationFilter) {
    const isAdminRoute = routePath.includes('admin') || routePath.includes('system');
    if (!isAdminRoute) {
      analysis.vulnerabilities.push('Database queries without organization filtering');
    }
  }

  if (SECURITY_PATTERNS.vulnerabilities.hardcodedIds.test(content)) {
    analysis.vulnerabilities.push('Potential hardcoded organization IDs');
  }

  if (SECURITY_PATTERNS.vulnerabilities.sqlInjection.test(content)) {
    analysis.vulnerabilities.push('Potential SQL injection vulnerability');
  }

  if (SECURITY_PATTERNS.vulnerabilities.exposedQueries.test(content)) {
    analysis.vulnerabilities.push('Query logging might expose sensitive data');
  }

  // Calculate security score
  let score = 0;
  if (analysis.hasAuthentication) score += 20;
  if (analysis.hasOrganizationFilter) score += 25;
  if (analysis.hasAuthorization) score += 20;
  if (analysis.hasErrorHandling) score += 10;
  if (analysis.hasInputValidation) score += 10;
  if (analysis.hasLogging) score += 10;
  if (analysis.hasPagination) score += 5;
  
  // Deduct points for vulnerabilities
  score -= analysis.vulnerabilities.length * 10;
  score = Math.max(0, score);
  
  analysis.securityScore = score;

  return analysis;
}

/**
 * Recursively find all API route files
 */
function findApiRoutes(dir) {
  const routes = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'route.ts' || item === 'route.js') {
        routes.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return routes;
}

/**
 * Generate security recommendations
 */
function generateRecommendations() {
  const recommendations = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  // Analyze audit results
  if (auditResults.missingAuth > 0) {
    recommendations.critical.push(`Add authentication to ${auditResults.missingAuth} routes`);
  }

  if (auditResults.missingOrgFilter > 0) {
    recommendations.critical.push(`Add organization filtering to ${auditResults.missingOrgFilter} routes`);
  }

  if (auditResults.missingAuthorization > 0) {
    recommendations.high.push(`Add authorization checks to ${auditResults.missingAuthorization} routes`);
  }

  const avgScore = auditResults.details.reduce((sum, route) => sum + route.securityScore, 0) / auditResults.details.length;
  
  if (avgScore < 50) {
    recommendations.high.push('Overall security score is low - implement comprehensive security review');
  } else if (avgScore < 80) {
    recommendations.medium.push('Security score needs improvement - address identified vulnerabilities');
  }

  return recommendations;
}

/**
 * Run the complete API security audit
 */
async function runApiSecurityAudit() {
  console.log('🔒 Starting API Security Audit...\n');

  try {
    // Find all API routes
    const apiRoutes = findApiRoutes(API_ROUTES_DIR);
    auditResults.totalRoutes = apiRoutes.length;

    console.log(`📁 Found ${apiRoutes.length} API routes to audit\n`);

    // Analyze each route
    for (const routePath of apiRoutes) {
      const analysis = analyzeApiRoute(routePath);
      auditResults.details.push(analysis);

      // Update counters
      if (analysis.vulnerabilities.length === 0) {
        auditResults.secureRoutes++;
      } else {
        auditResults.vulnerableRoutes++;
      }

      if (!analysis.hasAuthentication) {
        auditResults.missingAuth++;
      }

      if (!analysis.hasOrganizationFilter) {
        auditResults.missingOrgFilter++;
      }

      if (!analysis.hasAuthorization) {
        auditResults.missingAuthorization++;
      }
    }

    // Generate recommendations
    const recommendations = generateRecommendations();

    // Print audit results
    console.log('📊 API Security Audit Results\n');
    console.log(`Total Routes: ${auditResults.totalRoutes}`);
    console.log(`Secure Routes: ${auditResults.secureRoutes}`);
    console.log(`Vulnerable Routes: ${auditResults.vulnerableRoutes}`);
    console.log(`Security Score: ${Math.round((auditResults.secureRoutes / auditResults.totalRoutes) * 100)}%\n`);

    console.log('🚨 Security Issues Found:');
    console.log(`  - Missing Authentication: ${auditResults.missingAuth}`);
    console.log(`  - Missing Organization Filtering: ${auditResults.missingOrgFilter}`);
    console.log(`  - Missing Authorization: ${auditResults.missingAuthorization}\n`);

    // Print detailed results
    console.log('📋 Detailed Route Analysis:\n');
    
    auditResults.details.forEach(route => {
      const status = route.vulnerabilities.length === 0 ? '✅' : '❌';
      const score = route.securityScore;
      const scoreColor = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
      
      console.log(`${status} ${route.route} (${scoreColor} ${score}%)`);
      
      if (route.vulnerabilities.length > 0) {
        route.vulnerabilities.forEach(vuln => {
          console.log(`   ⚠️  ${vuln}`);
        });
      }
      
      if (route.recommendations.length > 0) {
        route.recommendations.forEach(rec => {
          console.log(`   💡 ${rec}`);
        });
      }
      
      console.log('');
    });

    // Print recommendations
    console.log('🎯 Security Recommendations:\n');
    
    if (recommendations.critical.length > 0) {
      console.log('🔴 Critical:');
      recommendations.critical.forEach(rec => console.log(`   - ${rec}`));
      console.log('');
    }

    if (recommendations.high.length > 0) {
      console.log('🟠 High Priority:');
      recommendations.high.forEach(rec => console.log(`   - ${rec}`));
      console.log('');
    }

    if (recommendations.medium.length > 0) {
      console.log('🟡 Medium Priority:');
      recommendations.medium.forEach(rec => console.log(`   - ${rec}`));
      console.log('');
    }

    if (recommendations.low.length > 0) {
      console.log('🟢 Low Priority:');
      recommendations.low.forEach(rec => console.log(`   - ${rec}`));
      console.log('');
    }

    // Generate report file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRoutes: auditResults.totalRoutes,
        secureRoutes: auditResults.secureRoutes,
        vulnerableRoutes: auditResults.vulnerableRoutes,
        securityScore: Math.round((auditResults.secureRoutes / auditResults.totalRoutes) * 100),
        issues: {
          missingAuth: auditResults.missingAuth,
          missingOrgFilter: auditResults.missingOrgFilter,
          missingAuthorization: auditResults.missingAuthorization
        }
      },
      details: auditResults.details,
      recommendations
    };

    fs.writeFileSync('api-security-audit-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: api-security-audit-report.json');

    // Return results for testing
    return {
      success: true,
      results: auditResults,
      recommendations
    };

  } catch (error) {
    console.error('❌ API Security Audit Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the audit if called directly
if (require.main === module) {
  runApiSecurityAudit()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ API security audit completed successfully');
        process.exit(0);
      } else {
        console.log('\n❌ API security audit failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ API security audit error:', error);
      process.exit(1);
    });
}

module.exports = { runApiSecurityAudit, analyzeApiRoute }; 