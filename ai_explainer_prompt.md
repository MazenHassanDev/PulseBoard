# Prompt: Write the AI Explainer View

Read CONTEXT.md before writing anything.

Write the AI explainer view for the campaigns app. Here are the exact requirements:

## View details
- Function-based view using @api_view(['GET']) and @permission_classes([IsAuthenticated])
- URL will be `/api/campaigns/<int:pk>/explain/`
- Fetch the campaign by pk, make sure it belongs to request.user, return 404 if not found

## Before building the prompt
- Compute CTR, CPC, ROAS from the campaign fields (same formulas as the serializer, handle division by zero)
- Use this benchmarks dict:
```python
BENCHMARKS = {
    'google':    {'ctr': 2.0, 'cpc': 2.50, 'roas': 2.5},
    'meta':      {'ctr': 0.9, 'cpc': 1.72, 'roas': 2.0},
    'instagram': {'ctr': 0.8, 'cpc': 1.50, 'roas': 1.8},
    'tiktok':    {'ctr': 1.0, 'cpc': 1.00, 'roas': 2.0},
    'pinterest': {'ctr': 0.5, 'cpc': 1.30, 'roas': 1.7},
}
```

## Prompt structure
Build the prompt with these four layers in order:
1. Role — you are a digital marketing analyst reviewing campaign performance for a marketing agency
2. Benchmarks — the industry averages for this specific platform
3. Campaign data — the actual campaign name, platform, spend, impressions, clicks, conversions, revenue, and the computed CTR, CPC, ROAS
4. Instruction — in 4-5 sentences, provide: an overall performance summary, the strongest metric and why, the weakest metric compared to benchmarks, and one concrete actionable suggestion for improvement

## Anthropic API call
- Use the `anthropic` package, load the API key from environment variables
- Model: `claude-sonnet-4-20250514`
- max_tokens: 1000
- Wrap the API call in a try/except, return 500 with an error message if it fails

## Response
Return:
```json
{
    "campaign": "campaign name",
    "explanation": "the LLM response text"
}
```

## Code style
- Function-based view, consistent with the rest of views.py
- No unnecessary complexity
- Load ANTHROPIC_API_KEY from environment variables using os.environ.get()

Do not write any frontend code, tests, or modify any other file except views.py and urls.py.
