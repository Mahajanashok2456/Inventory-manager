#!/usr/bin/env python3
"""
Migration script to transfer data from SQLite to MySQL
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import mysql.connector
from django.core.management import execute_from_command_line
from django.db import connection

def create_mysql_database():
    """Create MySQL database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        conn = mysql.connector.connect(
            host=os.environ.get('DB_HOST', 'localhost'),
            user=os.environ.get('DB_USER', 'root'),
            password=os.environ.get('DB_PASSWORD', '2456'),
            port=int(os.environ.get('DB_PORT', '3306'))
        )
        cursor = conn.cursor()

        db_name = os.environ.get('DB_NAME', 'mahjans_store')

        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' created or already exists")

        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Error creating database: {err}")
        return False
    return True

def migrate_data():
    """Migrate Django models and data to MySQL"""
    try:
        # Create database first
        if not create_mysql_database():
            return False

        # Run Django migrations
        print("Running Django migrations...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        execute_from_command_line(['manage.py', 'migrate'])
        print("Django migrations completed successfully")

        return True

    except Exception as e:
        print(f"Migration failed: {e}")
        return False

def main():
    """Main migration function"""
    print("Starting SQLite to MySQL migration...")
    print("=" * 50)

    # Check if MySQL credentials are available
    required_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT']
    missing_vars = [var for var in required_vars if not os.environ.get(var)]

    if missing_vars:
        print("Missing environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nUsing default values from script...")
        # Set default environment variables
        os.environ.setdefault('DB_HOST', 'localhost')
        os.environ.setdefault('DB_USER', 'root')
        os.environ.setdefault('DB_PASSWORD', '2456')
        os.environ.setdefault('DB_NAME', 'mahjans_store')
        os.environ.setdefault('DB_PORT', '3306')

    # Perform migration
    if migrate_data():
        print("=" * 50)
        print("Migration completed successfully!")
        print("\nYour data has been transferred from SQLite to MySQL.")
        print("You can now use MySQL as your database backend.")
        return True
    else:
        print("=" * 50)
        print("Migration failed!")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)