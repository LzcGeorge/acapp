# Generated by Django 3.2.8 on 2023-01-18 11:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='sex',
            field=models.URLField(blank=True, max_length=256),
        ),
    ]