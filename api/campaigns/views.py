from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Campaign
from .serializers import CampaignSerializer

import pandas as pd

# MANUAL UPLOAD

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def campaign_list(request):
    if request.method == 'GET':
        campaigns = Campaign.objects.filter(user=request.user)
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)

    serializer = CampaignSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save(user=request.user)
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
            errors.append({'row': row_num, 'message': 'Missing or empty field.'})
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
        return Response(serializer.data)

    campaign.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
