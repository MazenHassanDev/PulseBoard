from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.core.cache import cache
from decouple import config

from .models import Campaign
from .serializers import CampaignSerializer

import anthropic
import pandas as pd

# Dashboard results are read on almost every page load but change rarely, so we
# cache the serialized list per user in Redis and bust it on any write.
DASHBOARD_CACHE_TTL = 60 * 5  # seconds


def dashboard_cache_key(user_id):
    return f'dashboard:{user_id}'


def invalidate_dashboard_cache(user_id):
    cache.delete(dashboard_cache_key(user_id))

BENCHMARKS = {
    'google':    {'ctr': 2.0, 'cpc': 2.50, 'roas': 2.5},
    'meta':      {'ctr': 0.9, 'cpc': 1.72, 'roas': 2.0},
    'instagram': {'ctr': 0.8, 'cpc': 1.50, 'roas': 1.8},
    'tiktok':    {'ctr': 1.0, 'cpc': 1.00, 'roas': 2.0},
    'pinterest': {'ctr': 0.5, 'cpc': 1.30, 'roas': 1.7},
}

# MANUAL UPLOAD

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def campaign_list(request):
    if request.method == 'GET':
        key = dashboard_cache_key(request.user.id)
        data = cache.get(key)
        if data is None:
            campaigns = Campaign.objects.filter(user=request.user)
            data = CampaignSerializer(campaigns, many=True).data
            cache.set(key, data, DASHBOARD_CACHE_TTL)
        return Response(data)

    serializer = CampaignSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save(user=request.user)
    invalidate_dashboard_cache(request.user.id)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# UPLOAD .csv FILE

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_campaign_csv(request):
    
    if not 'file' in request.FILES:
        return Response({'message': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
    user_file = request.FILES['file']
    if not user_file.name.endswith('.csv'):
        return Response({'message': 'File must be a .csv'}, status=status.HTTP_400_BAD_REQUEST)
    
    df = pd.read_csv(user_file)
    REQUIRED_COLUMNS = ['campaign_name', 'platform', 'spend', 'impressions', 'clicks', 'conversions', 'revenue']
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        return Response({'message': f'Missing columns: {missing}'}, status=status.HTTP_400_BAD_REQUEST)
    
    created_campaigns = []
    errors = []

    for index, row in df.iterrows():
        row_num = index + 2
        if row.isnull().any():
            errors.append({'row': row_num, 'campaign': row['campaign_name'], 'message': 'Missing or empty field.'})
            continue

        VALID_PLATFORMS = ['google', 'meta', 'instagram', 'tiktok', 'pinterest']
        platform = row['platform'].strip().lower()
        if platform not in VALID_PLATFORMS:
            errors.append({'row': row_num, 'message': f"Invalid plaform: {row['platform']}."})
            continue

        try:
            campaign = Campaign(
                user=request.user,
                name=row['campaign_name'].strip(),
                platform=platform,
                spend=float(row['spend']),
                impressions=int(row['impressions']),
                clicks=int(row['clicks']),
                conversions=int(row['conversions']),
                revenue=float(row['revenue']),
            )
            created_campaigns.append(campaign)
        except (ValueError, TypeError):
            errors.append({'row': row_num, 'message': 'Invalid value'})
            continue

    Campaign.objects.bulk_create(created_campaigns)
    if created_campaigns:
        invalidate_dashboard_cache(request.user.id)

    return Response({'imported': len(created_campaigns), 'skipped': len(errors), 'errors': errors}, status=status.HTTP_201_CREATED)



    


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def campaign_detail(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk, user=request.user)
    except Campaign.DoesNotExist:
        return Response(
            {'detail': 'Campaign not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == 'GET':
        serializer = CampaignSerializer(campaign)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = CampaignSerializer(campaign, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        invalidate_dashboard_cache(request.user.id)
        return Response(serializer.data)

    campaign.delete()
    invalidate_dashboard_cache(request.user.id)
    return Response(status=status.HTTP_204_NO_CONTENT)

# AI EXPLAINER

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def campaign_explain(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk, user=request.user)
    except Campaign.DoesNotExist:
        return Response(
            {'detail': 'Campaign not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    ctr = round((campaign.clicks / campaign.impressions) * 100, 2) if campaign.impressions else 0
    cpc = round(float(campaign.spend) / campaign.clicks, 2) if campaign.clicks else 0
    roas = round(float(campaign.revenue) / float(campaign.spend), 2) if campaign.spend else 0

    # Cache the explanation keyed on the campaign's actual numbers: identical
    # inputs reuse the cached text (no tokens, instant), and editing the campaign
    # changes the key so a fresh explanation is generated automatically.
    cache_key = (
        f'explain:{campaign.id}:{campaign.platform}:{campaign.spend}:'
        f'{campaign.impressions}:{campaign.clicks}:{campaign.conversions}:{campaign.revenue}'
    )
    cached = cache.get(cache_key)
    if cached is not None:
        return Response({'campaign': campaign.name, 'explanation': cached})

    benchmarks = BENCHMARKS.get(campaign.platform, {})

    prompt = f"""
        You are a digital marketing analyst reviewing campaign performance for a marketing agency.

        Industry benchmarks for {campaign.platform}:
        - CTR: {benchmarks.get('ctr')}%
        - CPC: ${benchmarks.get('cpc')}
        - ROAS: {benchmarks.get('roas')}x

        Campaign data:
        - Name: {campaign.name}
        - Platform: {campaign.platform}
        - Spend: ${campaign.spend}
        - Impressions: {campaign.impressions}
        - Clicks: {campaign.clicks}
        - Conversions: {campaign.conversions}
        - Revenue: ${campaign.revenue}
        - CTR: {ctr}%
        - CPC: ${cpc}
        - ROAS: {roas}x

        In 4-5 sentences, provide: an overall performance summary, the strongest metric and why, the weakest metric compared to the benchmarks, and one concrete actionable suggestion for improvement.
        """

    try:
        client = anthropic.Anthropic(api_key=str(config('ANTHROPIC_API_KEY', default='')))
        message = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=1000,
            messages=[{'role': 'user', 'content': prompt}],
        )
        explanation = message.content[0].text
    except Exception:
        return Response(
            {'detail': 'Failed to generate explanation.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Explanations are stable for given inputs; keep them around for a day.
    cache.set(cache_key, explanation, 60 * 60 * 24)

    return Response({
        'campaign': campaign.name,
        'explanation': explanation,
    })
