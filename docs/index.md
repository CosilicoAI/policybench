---
title: "PolicyBench: Can AI models calculate tax and benefit outcomes?"
---

# PolicyBench: Can AI models calculate tax and benefit outcomes?

**Max Ghenis** (Cosilico)

## Abstract

Large language models have absorbed vast quantities of information about tax codes, benefit programs, and policy rules, yet their ability to translate this knowledge into precise quantitative outputs remains untested. PolicyBench is a benchmark that evaluates whether frontier AI models can accurately calculate US tax and benefit outcomes for specific households. We test three frontier models --- GPT-5.2, Claude Sonnet 4.5, and Claude Opus 4.6 --- across 14 federal and state tax-and-benefit programs for 100 diverse household scenarios spanning 12 states, income levels from $0 to $500,000, and varying family compositions.

We evaluate models under two conditions: (1) AI alone, where models rely solely on their parametric knowledge to estimate policy outcomes, and (2) AI with PolicyEngine, where models have tool access to the PolicyEngine-US microsimulation engine. Without tools, models achieve low accuracy across programs, with particularly large errors on means-tested benefits and programs involving complex phase-outs. With PolicyEngine tool access, models achieve near-perfect accuracy, as the microsimulation engine handles the computational complexity that models cannot reliably perform from memory alone.

These findings demonstrate that domain-specific computational tools are essential for reliable AI-assisted policy analysis. The choice of tool matters more than the choice of model: even the most capable frontier models cannot substitute for rigorous microsimulation when precise household-level calculations are required.

```{tableofcontents}
```
