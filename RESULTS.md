# PolicyBench: AI can't accurately calculate taxes and benefits — but tools fix that

> Can frontier AI models accurately calculate US tax and benefit outcomes?

**TL;DR: No — but with PolicyEngine tools, they achieve 100% accuracy.**

## Setup

- **100 household scenarios** across 12 US states, varying income ($0–$500k), filing status, and family composition
- **14 tax/benefit programs**: federal income tax, EITC, CTC, SNAP, SSI, Medicaid eligibility, state taxes, and more
- **3 frontier models**: GPT-5.2, Claude Sonnet 4.5, Claude Opus 4.6
- **2 conditions**: AI alone (parametric knowledge only) vs. AI with PolicyEngine tools
- **Ground truth**: PolicyEngine-US microsimulation (1,400 scenario-program pairs)
- **Total predictions**: 8,400 (4,200 per condition)

## Headline results

### Without tools (AI alone)

| Model | MAE | MAPE | Within 10% |
|:------|----:|-----:|----------:|
| Claude Opus 4.6 | $1,257 | 85% | 70.8% |
| Claude Sonnet 4.5 | $2,276 | 125% | 61.9% |
| GPT-5.2 | $2,578 | 78% | 62.1% |

### With PolicyEngine tools

| Model | MAE | MAPE | Within 10% |
|:------|----:|-----:|----------:|
| Claude Opus 4.6 | **$0** | **0%** | **100.0%** |
| Claude Sonnet 4.5 | **$0** | **0%** | **100.0%** |
| GPT-5.2 | **$0** | **0%** | **100.0%** |

### By program (AI alone, all models averaged)

| Program | MAE | MAPE | Within 10% |
|:--------|----:|-----:|----------:|
| Federal income tax | $4,234 | 54% | 41.0% |
| Income tax before credits | $2,683 | 39% | 62.7% |
| EITC | $727 | 298% | 75.3% |
| CTC | $1,028 | 174% | 74.3% |
| Refundable credits | $981 | 128% | 62.3% |
| SNAP | $769 | 55% | 80.7% |
| SSI | $436 | 100% | 95.7% |
| State income tax | $938 | 76% | 59.7% |
| Household net income | $10,586 | 14% | 66.0% |
| Total benefits | $5,228 | 117% | 43.7% |
| Market income | $0 | 0% | 100.0% |
| Marginal tax rate | $347 | N/A | 18.0% |

## Key takeaways

1. **Tools > models.** Every model with PolicyEngine (100% accuracy) vastly outperforms every model without it (62–71%). The choice of computational tool matters more than the choice of frontier model.

2. **AI alone is unreliable for policy calculations.** Even the best model (Claude Opus) averages $1,257 error per calculation and gets only 71% of answers within 10% of correct. The worst programs — income tax (41%), marginal tax rates (18%), and aggregate benefits (44%) — are precisely where accuracy matters most.

3. **With tools, accuracy is perfect.** All three frontier models achieve $0 MAE and 100% within-10% accuracy across all 4,200 with-tools predictions. The tool returns ground truth, and models faithfully report it.

4. **Marginal tax rates are nearly impossible without tools.** Only 18% of AI-alone predictions are within 10% of the correct marginal rate — essentially a coin flip. This makes AI-generated policy advice about work incentives unreliable without computational backing.

5. **The benchmark validates PolicyEngine's value proposition.** Any AI system that needs to answer questions about US taxes and benefits should use PolicyEngine rather than relying on parametric knowledge.

## Methodology

See the [full paper](docs/) and [benchmark code](policybench/) for complete methodology. Ground truth is computed via [PolicyEngine-US](https://github.com/PolicyEngine/policyengine-us). All API responses are cached for reproducibility.

---
*[Cosilico](https://cosilico.ai) · [PolicyEngine](https://policyengine.org)*
