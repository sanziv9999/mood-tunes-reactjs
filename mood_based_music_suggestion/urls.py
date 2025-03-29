# urls.py
from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # User
     path('signup/', SignupView.as_view(), name='signup'),
     path('login/', LoginView.as_view(), name='login'), 

     # Admin
     path('admin/login/', AdminLoginView.as_view(), name='admin-login'),



     # Moods
     path('moods/', MoodListCreate.as_view(), name='mood-list-create'),
     path('moods/<str:name>/', MoodRetrieveUpdateDestroy.as_view(), name='mood-detail'),

     # Mood Genres
     path('mood-genres/', MoodGenreListCreate.as_view(), name='mood-genre-list-create'),
     path('mood-genres/<int:pk>/', MoodGenreRetrieveUpdateDestroy.as_view(), name='mood-genre-detail'),

     # Captured Images
     path('captured-images/', CapturedImageListCreate.as_view(), name='captured-image-list-create'),
     path('captured-images/<int:pk>/', CapturedImageRetrieveUpdateDestroy.as_view(), name='captured-image-detail'),


    # ActivitySuggestion URLs
     path('activity-suggestions/', 
          ActivitySuggestionListCreate.as_view(), 
          name='activity-suggestion-list-create'),
     path('activity-suggestions/<int:pk>/', 
          ActivitySuggestionRetrieveUpdateDestroy.as_view(), 
          name='activity-suggestion-retrieve-update-destroy'),
    
    # RelaxationActivity URLs
     path('relaxation-activities/', 
          RelaxationActivityListCreate.as_view(), 
          name='relaxation-activity-list-create'),
     path('relaxation-activities/<int:pk>/', 
          RelaxationActivityRetrieveUpdateDestroy.as_view(), 
          name='relaxation-activity-retrieve-update-destroy'),

     path('users/', UserList.as_view(), name='user-list'),
     path('users/<int:pk>/', UserDetail.as_view(), name='user-detail'),

     path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
     path('dashboard/top-moods/', TopMoodsView.as_view(), name='top-moods'),
     path('dashboard/user-activity/', UserActivityView.as_view(), name='user-activity'),

]