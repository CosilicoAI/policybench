"""LiteLLM disk cache setup for PolicyBench."""

import litellm
from litellm.caching.caching import Cache

CACHE_DIR = ".policybench_cache"


def enable_cache():
    """Enable LiteLLM disk caching for reproducible, cost-efficient runs."""
    litellm.cache = Cache(type="disk", disk_cache_dir=CACHE_DIR)
