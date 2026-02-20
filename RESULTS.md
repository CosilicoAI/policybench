# PolicyBench: preliminary results

> Can frontier AI models accurately calculate US tax and benefit outcomes?

**TL;DR: No — but they can with the right tools.**

## Setup

- **100 household scenarios** across 12 US states, varying income ($0–$500k), filing status, and family composition
- **14 tax/benefit programs** (federal income tax, EITC, CTC, SNAP, SSI, Medicaid, state taxes, and more)
- **3 frontier models**: GPT-5.2, Claude Sonnet 4.5, Claude Opus 4.6
- **2 conditions**: AI alone (parametric knowledge only) vs. AI with PolicyEngine tools
- **Ground truth**: PolicyEngine-US microsimulation (1,400 values)

## Headline results

### Without tools (AI alone)

| Model | MAE | MAPE | Within 10% |
|:------|----:|-----:|----------:|
| Claude Opus 4.6 | $1,551 | 44% | 74.5% |
| Claude Sonnet 4.5 | $2,751 | 90% | 66.1% |
| GPT-5.2 | $3,231 | 57% | 66.7% |

### With PolicyEngine tools

| Model | MAE | Within 10% |
|:------|----:|----------:|
| GPT-5.2 | $0 | 100.0% |

### By program (AI alone, all models averaged)

| Program | MAE | Within 10% |
|:--------|----:|----------:|
| Federal income tax | $4,328 | 40.9% |
| Income tax before refundable credits | $2,745 | 62.6% |
| EITC | $744 | 74.8% |
| CTC | $986 | 75.2% |
| Refundable credits | $998 | 61.5% |
| SNAP | $797 | 80.1% |
| SSI | $458 | 95.5% |
| State income tax | $955 | 58.7% |
| Household net income | $10,852 | 65.3% |
| Total benefits | $5,315 | 42.8% |
| Market income | $0 | 100.0% |

## Key takeaways

1. **Tools > models.** The weakest model with PolicyEngine (100% accuracy) vastly outperforms the strongest model without it (74.5%). The choice of computational tool matters more than the choice of frontier model.
2. **AI alone is unreliable for policy calculations.** Even the best model (Claude Opus) averages $1,551 error per calculation and gets only 3 in 4 answers within 10% of correct.
3. **Complex programs are hardest.** Income tax (40.9% within 10%), aggregate benefits (42.8%), and state taxes (58.7%) have the worst AI-alone accuracy — precisely the programs where getting it wrong matters most.
4. **With tools, accuracy is perfect.** GPT-5.2 with PolicyEngine achieves $0 MAE and 100% within-10% accuracy across all 1,400 scenario-program pairs tested so far.

## Status

- No-tools: 4000/4,200 predictions complete
- With-tools: 1400/4,200 predictions complete (remaining models in progress)
- Full results with all models and analysis charts coming soon

## Methodology

See the [full paper](docs/) and [benchmark code](policybench/) for complete methodology. Ground truth is computed via [PolicyEngine-US](https://github.com/PolicyEngine/policyengine-us). All predictions are cached and reproducible.

---
*[Cosilico](https://cosilico.ai) · [PolicyEngine](https://policyengine.org)*
