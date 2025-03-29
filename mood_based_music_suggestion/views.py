from rest_framework import generics
from rest_framework.response import Response
from .models import Suggestion
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

class SuggestionDetail(generics.RetrieveAPIView):
    queryset = Suggestion.objects.all()
    serializer_class = SuggestionSerializer
    lookup_field = 'mood'

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

# Suggestion CRUD Views
class SuggestionListCreate(generics.ListCreateAPIView):
    queryset = Suggestion.objects.all()
    serializer_class = SuggestionSerializer
    # permission_classes = [IsAuthenticated]

class SuggestionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Suggestion.objects.all()
    serializer_class = SuggestionSerializer
    lookup_field = 'mood'
    # permission_classes = [IsAuthenticated]

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
    # permission_classes = [IsAuthenticated]

class CapturedImageRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = CapturedImage.objects.all()
    serializer_class = CapturedImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    authentication_classes = [TokenAuthentication]

    def perform_update(self, serializer):
        # Get the existing image instance
        instance = self.get_object()
        
        # Delete old image if a new one is being uploaded
        if 'image' in self.request.FILES and instance.image:
            instance.image.delete(save=False)
        
        # Save the updated instance
        serializer.save()

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