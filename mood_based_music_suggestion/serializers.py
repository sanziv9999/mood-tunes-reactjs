from rest_framework import serializers
from .models import *
from django.contrib.auth.password_validation import validate_password
import logging

# Set up logging
logger = logging.getLogger(__name__)


class SuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suggestion
        fields = ['mood', 'music', 'activity', 'relaxation']

class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = ['id', 'name']

class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = ['id', 'name']

class MoodGenreSerializer(serializers.ModelSerializer):
    mood = MoodSerializer(read_only=True)
    mood_id = serializers.PrimaryKeyRelatedField(
        queryset=Mood.objects.all(),
        source='mood',
        write_only=True
    )
    genres = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )

    class Meta:
        model = MoodGenre
        fields = ['id', 'mood', 'mood_id', 'genres']

class CapturedImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = CapturedImage
        fields = ['id', 'image', 'mood', 'captured_at']
        extra_kwargs = {
            'image': {'required': False},
            'mood': {'required': False}
        }

    def update(self, instance, validated_data):
        logger.info(f"Validated data: {validated_data}")
        
        # Update mood if provided
        if 'mood' in validated_data:
            instance.mood = validated_data['mood']
        
        # Handle image update
        if 'image' in validated_data:
            # Delete old image if it exists
            if instance.image:
                instance.image.delete(save=False)
            
            # Set new image
            instance.image = validated_data['image']
        
        instance.save()
        logger.info(f"Saved instance with image: {instance.image}")
        return instance
    

class ActivitySuggestionSerializer(serializers.ModelSerializer):
    mood = MoodSerializer(read_only=True)
    mood_id = serializers.PrimaryKeyRelatedField(
        queryset=Mood.objects.all(),
        source='mood',
        write_only=True
    )
    suggestion = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )

    class Meta:
        model = ActivitySuggestion
        fields = ['id', 'mood', 'mood_id', 'suggestion']

class RelaxationActivitySerializer(serializers.ModelSerializer):
    mood = MoodSerializer(read_only=True)
    mood_id = serializers.PrimaryKeyRelatedField(
        queryset=Mood.objects.all(),
        source='mood',
        write_only=True
    )
    activity = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )

    class Meta:
        model = RelaxationActivity
        fields = ['id', 'mood', 'mood_id', 'activity']


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username')

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'password', 'confirm_password')

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords must match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', ''),
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)