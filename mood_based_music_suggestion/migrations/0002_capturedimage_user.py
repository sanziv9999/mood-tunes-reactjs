# Generated by Django 5.0.3 on 2025-03-29 13:30

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mood_based_music_suggestion', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='capturedimage',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
