# CI/CD Configuration

This document explains the GitHub Actions workflows configured for the WOPR AI Chatbot project.

## Workflows Overview

### 1. Deploy Frontend (`deploy-frontend.yml`)

**Purpose**: Automatically build and deploy the Angular frontend to GitHub Pages.

**Triggers**:
- Push to `main` branch with changes in `frontend/**`
- Manual workflow dispatch

**Key Features**:
- ✅ **Always deploys** - No dependency on test results
- ✅ **Fast deployment** - Only builds and deploys, no testing overhead
- ✅ **Reliable** - Simple workflow with minimal failure points

**Jobs**:
1. **Build**: Compiles the Angular application with GitHub Pages configuration
2. **Deploy**: Deploys the built application to GitHub Pages

### 2. Test Frontend (`test-frontend.yml`)

**Purpose**: Run comprehensive tests without blocking deployment.

**Triggers**:
- Push to `main` branch with changes in `frontend/**`
- Pull requests to `main` branch
- Manual workflow dispatch

**Key Features**:
- ✅ **Non-blocking** - Uses `continue-on-error: true` to never fail the workflow
- ✅ **Comprehensive testing** - Runs both unit tests and E2E tests
- ✅ **Test reporting** - Uploads test results and generates summary reports
- ✅ **Independent** - Runs separately from deployment

**Jobs**:
1. **Test**: Runs unit tests (Karma/Jasmine) and E2E tests (Playwright)

## Configuration Details

### Non-blocking Test Strategy

The workflows are designed to ensure that **failed tests never prevent deployment**:

1. **Separate workflows**: Testing and deployment are completely independent
2. **Continue on error**: All test steps use `continue-on-error: true`
3. **No dependencies**: The deploy workflow doesn't depend on the test workflow

### Test Execution

**Unit Tests**:
- Framework: Karma + Jasmine
- Browser: Chrome Headless
- Coverage: Enabled in CI environment
- Failure handling: Continues to next step even if tests fail

**E2E Tests**:
- Framework: Playwright
- Browser: Chrome (Headless in CI)
- Application: Built and served for testing
- Failure handling: Continues and reports results even if tests fail

### Artifact Management

**Test Results**:
- Test coverage reports
- Playwright test results
- Screenshots and videos (on failure)
- Retention: 30 days

**Deployment Artifacts**:
- Built Angular application
- Optimized for GitHub Pages
- Base href configured for repository path

## Workflow Status

| Workflow | Purpose | Can Block Deployment | Test Results |
|----------|---------|---------------------|--------------|
| Deploy Frontend | Build & Deploy | ❌ Never | N/A |
| Test Frontend | Testing & QA | ❌ Never | ✅ Reported |

## Development Workflow

1. **Feature Development**:
   - Create feature branch
   - Develop and test locally
   - Create pull request

2. **Pull Request**:
   - Test workflow runs automatically
   - Reviews test results (if desired)
   - Merge when ready (regardless of test status)

3. **Deployment**:
   - Push/merge to `main` triggers deployment
   - Application deploys to GitHub Pages
   - Tests run independently and report results

## Local Testing

Before pushing, you can run tests locally:

```bash
# Unit tests
cd frontend/wopr-frontend
npm run test

# E2E tests
npm run build
npm start &
npm run test:e2e
```

## Emergency Deployment

If urgent deployment is needed:

1. **Manual Deploy**: Use workflow dispatch to trigger deployment manually
2. **Skip Tests**: Tests run independently, so they won't block emergency fixes
3. **Fast Turnaround**: Build and deploy typically complete in 2-3 minutes

## Monitoring

- Check workflow status in GitHub Actions tab
- Review test reports in workflow summaries
- Monitor deployment at: https://vincemic.github.io/wopr-ai-chatbot/

## Benefits

✅ **Reliable Deployments**: Tests can't block critical fixes  
✅ **Fast Feedback**: Quick deployment for urgent changes  
✅ **Quality Insights**: Test results still available for review  
✅ **Developer Productivity**: No waiting for flaky tests  
✅ **Flexibility**: Manual override always available  

This configuration ensures maximum uptime and deployment reliability while still providing valuable test feedback for code quality assurance.