---
title: Discussion
---

# Discussion

## Where models fail

The AI-alone results reveal systematic patterns in model errors that reflect the underlying structure of US tax and benefit programs.

**Means-tested benefits are hardest.** Programs like SNAP and SSI involve multi-step eligibility determinations: gross income tests, net income tests, asset limits, categorical eligibility provisions, and benefit reduction rates that differ by household size and state. Models must not only know these rules but execute them in the correct order, applying the right thresholds for the specific household configuration. Even models that can recite SNAP eligibility rules struggle to correctly determine whether a family of four in California with $25,000 in income qualifies, and if so, for how much.

**Phase-outs and cliffs create discontinuities.** The EITC, CTC, and many state tax provisions have phase-in and phase-out schedules that create sharp nonlinearities in the relationship between income and the computed value. Models tend to produce smooth approximations where the true function is discontinuous. For example, a model might estimate a positive EITC for a household whose income is just above the phase-out threshold, producing an error of several thousand dollars at a single dollar of income difference.

**State-level variation adds complexity.** State income tax calculations require knowledge of state-specific bracket structures, deductions, credits, and their interactions with federal provisions. Models must effectively maintain 50 separate tax code implementations in their parameters. Errors are systematically larger for states with complex tax systems (California, New York) than for states with no income tax (Texas, Florida, Washington).

**Marginal tax rates are especially challenging.** Computing the marginal tax rate requires determining how a one-dollar increase in income changes tax liability and benefit amounts across all programs simultaneously. This involves understanding not just each program's rules but their interactions --- how additional income affects SNAP eligibility, EITC phase-out, and federal tax brackets concurrently. The resulting effective marginal tax rates can exceed 100% in some income ranges due to benefit cliffs, a phenomenon that models rarely capture.

**Income tax estimates are closer but still unreliable.** Federal income tax is the program where models perform best in the AI-alone condition, likely because tax bracket calculations are well-represented in training data and involve relatively straightforward arithmetic. However, even here, models make errors on the order of thousands of dollars for complex returns, particularly those involving interactions between the standard deduction, credits, and the alternative minimum tax.

## Why tool access works

The tool-augmented condition produces near-perfect accuracy because it shifts the computational burden from the model to the microsimulation engine. The model's role changes from "compute the answer" to "translate the question into the correct API call." This is a fundamentally easier task: the model must construct a valid household JSON object and specify the correct variable name, but it does not need to execute any tax or benefit calculations itself.

The residual errors in the tool-augmented condition fall into a few categories:

- **Malformed household JSON.** Occasionally, a model constructs a household object that is syntactically valid but semantically incorrect --- for example, placing a child in the wrong tax unit or omitting the state code.
- **Wrong variable name.** A model might request `federal_income_tax` instead of `income_tax`, or `snap_benefits` instead of `snap`.
- **Failure to invoke the tool.** In rare cases, a model attempts to answer from memory rather than using the available tool, particularly for variables it perceives as simple (like market income).

These errors are model-specific but small in aggregate. Importantly, they are addressable through better tool documentation, structured output schemas, or few-shot examples --- unlike the fundamental computational limitations exposed in the AI-alone condition.

## The tool matters more than the model

Perhaps the most striking finding is the relative magnitude of the two gaps: (1) the gap between models within each condition, and (2) the gap between conditions for each model. The between-model differences in the AI-alone condition are modest: all frontier models struggle with the same programs and make qualitatively similar errors. The between-condition difference, by contrast, is transformative: the worst model with tools outperforms the best model without tools by a wide margin.

This finding has a direct practical implication: investments in better computational tools yield larger returns than investments in better base models, at least for the specific task of policy calculation. An organization seeking accurate AI-assisted policy analysis should prioritize tool access over model selection.

## Implications for AI-assisted policy analysis

These results suggest a clear architecture for AI systems that provide policy analysis:

1. **Computation should be delegated to validated tools.** LLMs should not be trusted to perform tax and benefit calculations from memory, regardless of their general capability. Microsimulation engines like PolicyEngine exist precisely to handle this complexity and have been validated against statutory rules.

2. **Models add value as interfaces, not calculators.** The appropriate role for an LLM in policy analysis is to translate natural language questions into structured API calls, interpret results for non-technical users, and synthesize findings across multiple scenarios. These are tasks where models excel.

3. **Benchmarks should test tool-augmented performance.** Evaluating models on unaided policy computation may be informative for understanding model capabilities but is not predictive of real-world utility. Practical evaluations should measure the full system --- model plus tools --- since that is what users will interact with.

4. **Tool quality is a bottleneck.** If the tool matters more than the model, then the accuracy, coverage, and usability of the computational tool become the binding constraints on system performance. Expanding microsimulation coverage to more programs, states, and countries is likely to have a larger impact than improving model reasoning on policy questions.

## Limitations

Several limitations qualify these findings:

**Scope of programs.** PolicyBench evaluates 14 variables covering the major federal and state tax-and-benefit programs, but the US system includes hundreds of additional provisions (housing subsidies, healthcare premium tax credits, education credits, retirement savings incentives, and more). Model performance may differ on programs not included in this benchmark.

**Household complexity.** Our 100 scenarios vary across six dimensions (state, filing status, income, children, adult ages) but do not include many real-world complications: multiple income sources (self-employment, investment, retirement), itemized deductions, prior-year carryovers, mid-year moves, or non-standard family structures. More complex households may be even harder for models to evaluate correctly.

**Single tax year.** All evaluations use tax year 2025. Model performance may differ for historical years (where training data is more abundant) or future years (where models must extrapolate from known rules).

**Prompt sensitivity.** We use a single prompt template per condition. Model performance may be sensitive to prompt phrasing, particularly in the AI-alone condition where chain-of-thought prompting or structured reasoning might improve accuracy.

**Model versions.** AI model capabilities change rapidly. Results for specific model versions may not generalize to future releases, though the qualitative finding --- that models struggle with precise computation without tools --- is likely to persist.

## Future work

Several extensions of PolicyBench are planned or in progress:

**International coverage.** PolicyEngine supports the UK, Canadian, and other tax-benefit systems. Extending PolicyBench to multiple countries would test whether models' computational limitations are specific to US policy complexity or are more general.

**Specialized policy models.** Cosilico is developing AI models specifically trained for policy analysis, with fine-tuning on microsimulation inputs and outputs. PolicyBench provides a natural evaluation framework for measuring whether specialized training improves unaided performance.

**Dynamic scenarios.** Current scenarios are static household snapshots. Future versions could test models on reform scenarios (e.g., "What would this household's SNAP benefits be if the maximum allotment increased by 10%?"), which require understanding both baseline rules and the proposed change.

**Multi-turn evaluation.** Real-world policy analysis often involves iterative questioning: a user asks about one variable, then follows up about related variables or alternative scenarios. Evaluating models in multi-turn settings would better reflect actual use cases.
