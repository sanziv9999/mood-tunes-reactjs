from rest_framework import generics
from rest_framework.response import Response

from rest_framework import status
from .serializers import *
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from rest_framework.permissions import BasePermission
from rest_framework import generics, permissions

class IsNotSuperuser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and not request.user.is_superuser

class IsSuperuser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser

User = get_user_model() 
import logging

# Set up logging
logger = logging.getLogger(__name__)

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info(f"Received POST request to admin/login with data: {request.data}")
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            logger.warning("Missing username or password in login request")
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username__iexact=username)
            logger.info(f"User details - ID: {user.id}, Username: {user.username}, "
                        f"Email: {user.email}, is_superuser: {user.is_superuser}, "
                        f"is_staff: {user.is_staff}, is_active: {user.is_active}")
        except User.DoesNotExist:
            logger.warning(f"User with username {username} not found")
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Explicitly authenticate using username
        authenticated_user = authenticate(request=request, username=user.username, password=password)

        if authenticated_user is not None:
            if authenticated_user.is_superuser:
                logger.info(f"Authentication successful for superuser {username}")
                login(request, authenticated_user)
                token, created = Token.objects.get_or_create(user=authenticated_user)
                return Response(
                    {
                        'message': 'Login successful',
                        'user': {
                            'id': user.id,
                            'email': user.email,
                            'username': user.username,
                            'is_superuser': user.is_superuser
                        },
                        'token': token.key
                    },
                    status=status.HTTP_200_OK
                )
            else:
                logger.warning(f"User {username} authenticated but not a superuser")
                return Response(
                    {'error': 'Only admin users can login here'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            logger.warning(f"Authentication failed for user {username}")
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )



class MoodListView(generics.ListAPIView):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        # Flatten the serialized data to a list of names
        return Response([item['name'] for item in serializer.data])

class MoodGenreListView(generics.ListAPIView):
    queryset = MoodGenre.objects.all()
    serializer_class = MoodGenreSerializer


class CapturedImageCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = CapturedImageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CapturedImageListView(generics.ListAPIView):
    queryset = CapturedImage.objects.all().order_by('-captured_at')  # Order by latest first
    serializer_class = CapturedImageSerializer



# Mood CRUD Views
class MoodListCreate(generics.ListCreateAPIView):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer
    authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

class MoodRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer
    lookup_field = 'name'
    # permission_classes = [IsAuthenticated]

# MoodGenre CRUD Views
class MoodGenreListCreate(generics.ListCreateAPIView):
    queryset = MoodGenre.objects.all()
    serializer_class = MoodGenreSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        mood_name = self.request.query_params.get('mood')
        if mood_name:
            queryset = queryset.filter(mood__name=mood_name)
        return queryset

class MoodGenreRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = MoodGenre.objects.all()
    serializer_class = MoodGenreSerializer
    # permission_classes = [IsAuthenticated]

# CapturedImage CRUD Views
class CapturedImageListCreate(generics.ListCreateAPIView):
    queryset = CapturedImage.objects.all().order_by('-captured_at')
    serializer_class = CapturedImageSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def get_queryset(self):
        queryset = CapturedImage.objects.all().order_by('-captured_at')
        
        # Get user_id from query parameters
        user_id = self.request.query_params.get('user')
        if user_id:
            try:
                queryset = queryset.filter(user=user_id)  # Filter by user foreign key
            except ValueError:
                # Handle case where user_id is not a valid integer
                pass
                
        return queryset

class CapturedImageRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = CapturedImage.objects.all()
    serializer_class = CapturedImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    # authentication_classes = [TokenAuthentication]
    authentication_classes = []
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.kwargs.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset.order_by('-captured_at')

    def perform_update(self, serializer):
        # Get the existing image instance
        instance = self.get_object()
        
        # Delete old image if a new one is being uploaded
        if 'image' in self.request.FILES and instance.image:
            instance.image.delete(save=False)
        
        # Save the updated instance
        serializer.save()

class UserCapturedImageList(generics.ListAPIView):
    serializer_class = CapturedImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = []
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return CapturedImage.objects.filter(user_id=user_id).order_by('-captured_at')

class MoodListCreate(generics.ListCreateAPIView):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer


class MoodRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer

    lookup_field = 'name'

class ActivitySuggestionListCreate(generics.ListCreateAPIView):
    queryset = ActivitySuggestion.objects.all()
    serializer_class = ActivitySuggestionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        mood_id = self.request.query_params.get('mood_id')
        if mood_id:
            queryset = queryset.filter(mood_id=mood_id)
        return queryset

class ActivitySuggestionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = ActivitySuggestion.objects.all()
    serializer_class = ActivitySuggestionSerializer

class RelaxationActivityListCreate(generics.ListCreateAPIView):
    queryset = RelaxationActivity.objects.all()
    serializer_class = RelaxationActivitySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        mood_id = self.request.query_params.get('mood_id')
        if mood_id:
            queryset = queryset.filter(mood_id=mood_id)
        return queryset

class RelaxationActivityRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = RelaxationActivity.objects.all()
    serializer_class = RelaxationActivitySerializer

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # This will call the create method in your serializer
            token, created = Token.objects.get_or_create(user=user)
            user_data = CustomUserSerializer(user).data
            return Response({
                'user': user_data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Authenticate using the custom user model
            user = authenticate(request, username=email, password=password)
            
            if user:
                # Check if user is a superuser
                if user.is_superuser:
                    logger.warning(f"Superuser {email} attempted to login via regular login")
                    return Response(
                        {'error': 'Admin users must use the admin login endpoint'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                token, created = Token.objects.get_or_create(user=user)
                user_data = CustomUserSerializer(user).data
                return Response({
                    'user': user_data,
                    'token': token.key
                }, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserList(generics.ListAPIView):
    queryset = CustomUser.objects.filter(is_staff=False)  # Exclude admin users
    serializer_class = UserSerializer
   

class UserDetail(generics.RetrieveUpdateAPIView):  # Allows GET, PUT, PATCH
    queryset = CustomUser.objects.filter(is_staff=False)
    serializer_class = UserSerializer

from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        time_range = request.query_params.get('range', 'week')
        
        # Calculate time delta based on range
        if time_range == 'day':
            delta = timedelta(days=1)
        elif time_range == 'week':
            delta = timedelta(weeks=1)
        elif time_range == 'month':
            delta = timedelta(days=30)
        elif time_range == 'year':
            delta = timedelta(days=365)
        else:
            delta = timedelta(weeks=1)
        
        now = timezone.now()
        start_date = now - delta
        
        # Get counts
        total_users = CustomUser.objects.filter(is_staff=False).count()
        total_moods = Mood.objects.count()
        total_images = CapturedImage.objects.count()
        total_activity_suggestions = ActivitySuggestion.objects.count()
        total_relaxation_activities = RelaxationActivity.objects.count()
        
        # Calculate changes
        prev_users = CustomUser.objects.filter(
            is_staff=False,
            date_joined__lt=start_date
        ).count()
        user_change_percent = ((total_users - prev_users) / prev_users * 100) if prev_users else 0
        
        prev_images = CapturedImage.objects.filter(
            captured_at__lt=start_date
        ).count()
        image_change_percent = ((total_images - prev_images) / prev_images * 100) if prev_images else 0
        
        return Response({
            'total_users': total_users,
            'total_moods': total_moods,
            'total_images': total_images,
            'total_activity_suggestions': total_activity_suggestions,
            'total_relaxation_activities': total_relaxation_activities,
            'user_change_percent': user_change_percent,
            'image_change_percent': image_change_percent
        })
class TopMoodsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 5))
        
        top_moods = CapturedImage.objects.values('mood') \
            .annotate(count=Count('mood')) \
            .order_by('-count')[:limit]
        
        return Response([
            {'name': mood['mood'], 'count': mood['count']}
            for mood in top_moods
        ])

class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 5))
        
        # Get recent image captures as activity
        recent_activity = CapturedImage.objects.select_related('user') \
            .order_by('-captured_at')[:limit]
        
        return Response([
            {
                'user': {
                    'username': img.user.username if img.user else 'Anonymous',
                    'avatar': None  # Add if you have user avatars
                },
                'action': 'Image captured',
                'mood': img.mood,
                'timestamp': img.captured_at
            }
            for img in recent_activity
        ])