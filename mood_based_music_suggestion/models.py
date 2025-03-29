from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager

class Suggestion(models.Model):
    mood = models.CharField(max_length=20, unique=True)
    music = models.CharField(max_length=100)
    activity = models.CharField(max_length=100)
    relaxation = models.CharField(max_length=100)

    def __str__(self):
        return self.mood
    
class Mood(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class MoodGenre(models.Model):
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE, related_name='mood_genres')
    genres = models.JSONField()  # Store genres as a JSON list

    def __str__(self):
        return f"{self.mood.name}: {', '.join(self.genres)}"


class CapturedImage(models.Model):
    image = models.ImageField(upload_to='static/captured_images/', null=True, blank=True)
    mood = models.CharField(max_length=50)
    captured_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.mood} - {self.captured_at}"

    class Meta:
        verbose_name = "Captured Image"
        verbose_name_plural = "Captured Images"


class ActivitySuggestion(models.Model):
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE, related_name='activity_suggestions')
    suggestion = models.JSONField()  # Store as a list

    def __str__(self):
        return f"{self.mood.name}: {', '.join(self.suggestion)}"

class RelaxationActivity(models.Model):
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE, related_name='relaxation_activities')
    activity = models.JSONField()  # Store as a list

    def __str__(self):
        return f"{self.mood.name}: {', '.join(self.activity)}"
    
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
    

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email