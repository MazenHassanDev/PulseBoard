from django.urls import path

from . import views

urlpatterns = [
    path('', views.campaign_list, name='campaign_list'),
    path('upload/', views.upload_campaign_csv, name='upload_campaign_csv'),
    path('<int:pk>/', views.campaign_detail, name='campaign_detail'),
    path('<int:pk>/explain/', views.campaign_explain, name='campaign_explain'),
]
