#!/bin/bash
# Cleanup script for MetaPilot project
# This script removes irrelevant files outside the metapilot directory

# Files to remove (these are now redundant with our modular structure)
echo "Removing redundant files..."
rm -f app.py
rm -f app_fixed.py
rm -f usage.py
rm -f main.py

# Keep these files:
# - .env (configuration)
# - MetaPilot.pdf (documentation)
# - README.md (project documentation)
# - pyproject.toml (modern Python packaging)
# - requirements.txt (for backward compatibility)
# - research.ipynb (research notes)
# - run.py (entry point)
# - setup.py (Python packaging)
# - tests/ (test directory)
# - metapilot/ (main package)

echo "Cleanup complete!"
