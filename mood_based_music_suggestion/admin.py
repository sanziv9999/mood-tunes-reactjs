from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.apps import apps
from .models import CustomUser

# Custom User Admin configuration
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username',)}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )
    search_fields = ('email', 'username')
    ordering = ('email',)

# Register the CustomUser with its custom admin class
admin.site.register(CustomUser, CustomUserAdmin)

# Auto-register all other models
app_models = apps.get_app_config('mood_based_music_suggestion').get_models()

for model in app_models:
    try:
        # Skip CustomUser as it's already registered
        if model != CustomUser:
            admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        # Skip models that are already registered
        pass