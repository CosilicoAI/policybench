---
title: Methodology
---

# Methodology

## Experimental design

PolicyBench evaluates frontier AI models on a single task: given a fully specified household and a named policy variable, produce the correct numerical value. We test each model under two conditions:

- **AI alone.** The model receives a natural language description of the household and must estimate the requested value using only its parametric knowledge. No tools, APIs, or reference materials are provided.
- **AI with PolicyEngine.** The model receives the same household description but also has access to a `calculate_policy` tool that invokes the PolicyEngine-US microsimulation engine. The model must formulate the correct API call (constructing the household JSON and specifying the variable) and return the result.

This design isolates two distinct capabilities: (1) the model's ability to perform policy calculations from memory, and (2) the model's ability to use a computational tool correctly when one is available.

## Models tested

We evaluate four frontier models from three providers, representing the state of the art as of early 2026:

| Model | Provider | Model ID |
|:------|:---------|:---------|
| GPT-5.2 | OpenAI | `gpt-5.2` |
| Claude Sonnet 4.5 | Anthropic | `claude-sonnet-4-5-20250929` |
| Claude Opus 4.6 | Anthropic | `claude-opus-4-6` |
| Gemini 3 Pro | Google | `gemini-3-pro-preview` |

For the AI-alone condition, models are prompted to return only a single numeric value, with explicit instructions to avoid dollar signs, commas, or explanatory text. For the tool-augmented condition, models are provided with the PolicyEngine tool schema and instructed to use it for computation.

## Programs evaluated

We evaluate 14 PolicyEngine-US variables spanning federal taxes, tax credits, means-tested benefits, state taxes, and aggregate household measures:

| Variable | Description | Category |
|:---------|:-----------|:---------|
| `income_tax` | Federal income tax liability | Federal tax |
| `income_tax_before_refundable_credits` | Federal tax before refundable credits | Federal tax |
| `eitc` | Earned Income Tax Credit | Credits |
| `ctc` | Child Tax Credit | Credits |
| `income_tax_refundable_credits` | Total refundable credits | Credits |
| `snap` | SNAP (food stamps) annual benefit | Benefits |
| `ssi` | Supplemental Security Income | Benefits |
| `free_school_meals` | Free school meal eligibility | Benefits |
| `is_medicaid_eligible` | Medicaid eligibility | Benefits |
| `household_state_income_tax` | State income tax liability | State tax |
| `household_net_income` | Net income after taxes and transfers | Aggregates |
| `household_benefits` | Total government benefits | Aggregates |
| `household_market_income` | Total market (pre-tax) income | Aggregates |
| `marginal_tax_rate` | Effective marginal tax rate | Rates |

These variables were chosen to span the major components of the US tax-and-benefit system and to test different types of computational challenges. Federal and state income tax require bracket calculations and interactions with deductions and exemptions. Tax credits involve phase-in and phase-out schedules that depend on earned income, number of children, and filing status. Means-tested benefits (SNAP, SSI) involve income and categorical eligibility tests, benefit reduction rates, and state-specific maximum allotments. Aggregate measures (net income, total benefits) require summing across programs. Marginal tax rates require computing the derivative of net income with respect to earnings, capturing the combined effect of all programs.

Binary variables (Medicaid eligibility, free school meals) are evaluated using classification accuracy rather than error metrics. The marginal tax rate is evaluated using absolute error rather than percentage error, since rates can be near zero.

## Household scenarios

We generate 100 household scenarios by sampling from the following distributions with a fixed random seed for reproducibility:

- **State**: Uniformly sampled from 12 states: CA, TX, NY, FL, IL, PA, OH, GA, NC, WA, MA, CO. These states represent geographic and policy diversity, including states with no income tax (TX, FL, WA), high-tax states (CA, NY, MA), and states across different regions.
- **Filing status**: Uniformly sampled from single, married filing jointly, and head of household.
- **Employment income**: Sampled from 19 discrete levels spanning $0 to $500,000. For joint filers, each spouse's income is drawn independently.
- **Number of children**: Uniformly sampled from 0 to 4. Each child's age is uniformly drawn from 0 to 17.
- **Adult ages**: Primary filer age uniformly drawn from 25 to 65. Spouse age (if applicable) drawn independently from the same range.

This sampling strategy produces a diverse set of households that exercises the full range of program rules, including phase-in regions (low income with children for EITC), phase-out regions (moderate income for CTC), benefit cliffs (SNAP gross income test), and high-income scenarios where most benefits are zero.

Each scenario is converted to a PolicyEngine-US household JSON object specifying people (with ages and employment income), tax units, SPM units, families, and households (with state codes). This same household object is used for both ground truth computation and the tool-augmented evaluation condition.

## Ground truth computation

Ground truth values are computed using PolicyEngine-US, an open-source microsimulation model that encodes federal and state tax law, benefit program rules, and their interactions for all 50 US states and DC. For each of the 100 scenarios and 14 variables, we run a PolicyEngine simulation for tax year 2025 and record the computed value. This produces 1,400 ground-truth data points.

PolicyEngine-US is the authoritative source: its calculations implement the actual statutory rules and have been validated against official tax calculators, benefit program documentation, and expert review. Any discrepancy between a model's output and the PolicyEngine value is treated as a model error, not a ground truth error.

## Evaluation metrics

We use three primary metrics, applied differently depending on the variable type:

**Mean absolute error (MAE)** measures the average magnitude of errors in dollar terms (or rate terms for marginal tax rates). For a set of $n$ predictions $\hat{y}_i$ against ground truth values $y_i$:

$$\text{MAE} = \frac{1}{n}\sum_{i=1}^{n}|\hat{y}_i - y_i|$$

**Mean absolute percentage error (MAPE)** measures relative error, excluding cases where the ground truth is zero (where percentage error is undefined):

$$\text{MAPE} = \frac{1}{|S|}\sum_{i \in S}\left|\frac{\hat{y}_i - y_i}{y_i}\right|, \quad S = \{i : y_i \neq 0\}$$

**Within-10% accuracy** measures the fraction of predictions that fall within 10% of the ground truth value. For zero ground truth values, we instead check whether the prediction is within $1 of zero:

$$\text{Acc}_{10\%} = \frac{1}{n}\sum_{i=1}^{n}\mathbf{1}\left[\frac{|\hat{y}_i - y_i|}{|y_i|} \leq 0.10\right]$$

For binary variables (Medicaid eligibility, free school meals), we report classification accuracy. For marginal tax rates, we report MAE and within-10% accuracy but not MAPE, since rates near zero make percentage error unstable.
