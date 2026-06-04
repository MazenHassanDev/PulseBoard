from rest_framework import serializers

from .models import Campaign


class CampaignSerializer(serializers.ModelSerializer):
    ctr = serializers.SerializerMethodField()
    cpc = serializers.SerializerMethodField()
    roas = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = (
            'id',
            'name',
            'platform',
            'spend',
            'impressions',
            'clicks',
            'conversions',
            'revenue',
            'created_at',
            'ctr',
            'cpc',
            'roas',
        )
        read_only_fields = ('id', 'created_at')

    def get_ctr(self, obj):
        if not obj.impressions:
            return 0
        return round((obj.clicks / obj.impressions) * 100, 2)

    def get_cpc(self, obj):
        if not obj.clicks:
            return 0
        return round(float(obj.spend) / obj.clicks, 2)

    def get_roas(self, obj):
        if not obj.spend:
            return 0
        return round(float(obj.revenue) / float(obj.spend), 2)
