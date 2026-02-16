# PolicyBench

Can AI models accurately calculate tax and benefit outcomes without tools?

PolicyBench measures how well frontier AI models estimate US tax/benefit values for specific households — both **without tools** (pure reasoning) and **with PolicyEngine tools** (API access to ground truth).

## Conditions

1. **AI alone**: Models estimate tax/benefit values using only their training knowledge
2. **AI with PolicyEngine**: Models use a PolicyEngine tool to compute exact answers

## Models tested

- Claude (Opus 4.6, Sonnet 4.5)
- GPT (4o, o3)
- Gemini 2.5 Pro

## Programs evaluated

Federal tax, EITC, CTC, SNAP, SSI, Medicaid eligibility, state income tax, net income, marginal tax rates, and more.

## Quick start

```bash
pip install -e ".[dev]"
pytest  # Run tests (mocked, no API calls)
```

## Full benchmark

```bash
# Generate ground truth from PolicyEngine-US
policybench ground-truth

# Run AI-alone evaluations
policybench eval-no-tools

# Run AI-with-tools evaluations
policybench eval-with-tools

# Analyze results
policybench analyze
```
