from django.contrib.auth.models import User
from django.db import models


class Campaign(models.Model):
    PLATFORM_CHOICES = [
        ('google', 'Google'),
        ('meta', 'Meta'),
        ('instagram', 'Instagram'),
        ('tiktok', 'TikTok'),
        ('pinterest', 'Pinterest')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    name = models.CharField(max_length=255)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    spend = models.DecimalField(max_digits=12, decimal_places=2)
    impressions = models.IntegerField()
    clicks = models.IntegerField()
    conversions = models.IntegerField()
    revenue = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.platform})'
